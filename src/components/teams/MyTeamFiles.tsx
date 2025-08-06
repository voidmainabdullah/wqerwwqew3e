import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Lock, Unlock, Trash2, Users, Calendar, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TeamFileShare } from './TeamFileShare';

interface MyTeamFile {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_locked: boolean;
  download_count: number;
  team_id: string;
  team_name: string;
  shared_by: string;
  shared_at: string;
  sharer_email: string;
  can_download: boolean;
  can_edit: boolean;
  is_team_admin: boolean;
}

export const MyTeamFiles: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamFiles, setTeamFiles] = useState<MyTeamFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MyTeamFile | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTeamFiles();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('my-team-files-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_file_shares' }, () => {
        fetchMyTeamFiles();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
        fetchMyTeamFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMyTeamFiles = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_team_files', {
        p_user_id: user!.id
      });

      if (error) throw error;
      setTeamFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching team files:', error);
      toast({
        variant: "destructive",
        title: "Error fetching team files",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(`${fileId}`);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log download
      await supabase
        .from('download_logs')
        .insert({
          file_id: fileId,
          download_method: 'team_download',
          downloader_user_agent: navigator.userAgent
        });

      toast({
        title: "Download started",
        description: `${fileName} is being downloaded`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message,
      });
    }
  };

  const toggleFileLock = async (fileId: string, currentLockStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_locked: !currentLockStatus })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: currentLockStatus ? "File unlocked" : "File locked",
        description: `File has been ${currentLockStatus ? 'unlocked' : 'locked'} successfully`,
      });

      fetchMyTeamFiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating file",
        description: error.message,
      });
    }
  };

  const shareFileWithAnotherTeam = (file: MyTeamFile) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team Files</h1>
        <p className="text-muted-foreground">
          Files shared with you by your team members
        </p>
      </div>

      {teamFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No team files</h3>
              <p className="text-muted-foreground">
                No files have been shared with your teams yet
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teamFiles.map((file, index) => (
            <Card 
              key={`${file.file_id}-${file.team_id}`} 
              className="hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate">{file.file_name}</h3>
                        {file.is_locked && <Lock className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{file.file_type.toUpperCase()}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{file.download_count}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {file.team_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Shared by {file.sharer_email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(file.shared_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.can_download && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file.file_id, file.file_name)}
                        className="hover:bg-functions-download/10 hover:text-functions-download transition-all duration-300 hover:scale-105"
                        disabled={file.is_locked && !file.is_team_admin}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}

                    {file.can_edit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareFileWithAnotherTeam(file)}
                        className="hover:bg-functions-share/10 hover:text-functions-share transition-all duration-300 hover:scale-105"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {file.is_team_admin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFileLock(file.file_id, file.is_locked)}
                        className="hover:bg-warning/10 hover:text-warning transition-all duration-300 hover:scale-105"
                      >
                        {file.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team File Share Dialog */}
      <TeamFileShare 
        fileId={selectedFile?.file_id || ''} 
        fileName={selectedFile?.file_name || ''} 
        isOpen={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
      />
    </div>
  );
};