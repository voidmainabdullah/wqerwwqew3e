import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShareNetwork, File, Folder, Download, Calendar, User } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamFile {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_locked: boolean;
  download_count: number;
  team_name: string;
  sharer_email: string;
  can_download: boolean;
  can_edit: boolean;
}

interface TeamFileShareProps {
  teamId: string;
}

export function TeamFileShare({ teamId }: TeamFileShareProps) {
  const { user } = useAuth();
  const [teamFiles, setTeamFiles] = useState<TeamFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<string>('all');

  useEffect(() => {
    fetchTeamFiles();
  }, [teamId]);

  const fetchTeamFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_my_team_files', { p_user_id: user?.id });

      if (error) throw error;
      setTeamFiles(data || []);
    } catch (error) {
      console.error('Error fetching team files:', error);
      toast.error('Failed to load team files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const downloadFile = async (fileId: string) => {
    try {
      const { data: fileData } = await supabase
        .from('files')
        .select('storage_path, original_name')
        .eq('id', fileId)
        .single();

      if (!fileData) throw new Error('File not found');

      const { data, error } = await supabase.storage
        .from('files')
        .download(fileData.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Files</h2>
          <p className="text-muted-foreground">Files shared within your team</p>
        </div>
        <Select value={selectedSpace} onValueChange={setSelectedSpace}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Spaces</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {teamFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShareNetwork className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No shared files</h3>
            <p className="text-muted-foreground text-center">
              Files shared with your team will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teamFiles.map((file) => (
            <Card key={file.file_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <File className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{file.file_name}</p>
                        {file.is_locked && (
                          <Badge variant="outline" className="text-xs">Locked</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{file.sharer_email}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{file.download_count} downloads</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.can_download && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file.file_id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}