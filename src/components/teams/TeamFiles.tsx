import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Lock, Unlock, Trash2, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_locked: boolean;
  download_count: number;
  shared_by: string;
  shared_at: string;
  team_name: string;
  team_id: string;
  sharer_email: string;
  can_edit: boolean;
  can_download: boolean;
  is_admin: boolean;
}

interface Team {
  team_id: string;
  team_name: string;
  is_admin: boolean;
  role: string;
  permissions: any;
}

export const TeamFiles: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamFiles, setTeamFiles] = useState<TeamFile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchTeamFiles();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTeamFiles();
    }
  }, [selectedTeam]);

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('team-files-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_file_shares' }, () => {
        fetchTeamFiles();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
        fetchTeamFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTeams = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available for fetching teams');
        return;
      }

      console.log('Fetching teams for user:', user.id);

      const { data, error } = await supabase.rpc('get_user_teams', {
        p_user_id: user!.id
      });

      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error(`Failed to load teams: ${error.message}`);
      }

      console.log('Teams fetched successfully:', data?.length || 0);
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast({
        variant: "destructive",
        title: "Error loading teams",
        description: error.message || "Unable to load teams. Please refresh the page.",
      });
      setTeams([]);
    }
  };

  const fetchTeamFiles = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available for team files');
        return;
      }

      console.log('Fetching team files for user:', user.id, 'selected team:', selectedTeam);

      const { data, error } = await supabase.rpc('get_my_team_files', {
        p_user_id: user!.id
      });

      if (error) {
        console.error('Error fetching team files:', error);
        throw new Error(`Failed to load team files: ${error.message}`);
      }

      // Filter by selected team if not 'all'
      const teamFilesData = Array.isArray(data) ? data : [];
      let filteredFiles = teamFilesData;
      if (selectedTeam !== 'all') {
        filteredFiles = teamFilesData.filter(file => file.team_id === selectedTeam);
      }

      console.log('Team files filtered:', filteredFiles.length, 'total files:', teamFilesData.length);

      const mappedFiles = filteredFiles.map(file => ({
        id: file.file_id,
        original_name: file.file_name,
        file_size: file.file_size,
        file_type: file.file_type,
        created_at: file.created_at,
        is_locked: file.is_locked,
        download_count: file.download_count,
        shared_by: file.shared_by,
        shared_at: file.shared_at,
        team_name: file.team_name,
        team_id: file.team_id,
        sharer_email: file.sharer_email,
        can_edit: file.can_edit,
        can_download: file.can_download,
        is_admin: file.is_team_admin
      }));

      setTeamFiles(mappedFiles);
      console.log('Team files processed successfully:', mappedFiles.length);
    } catch (error: any) {
      console.error('Error fetching team files:', error);
      toast({
        variant: "destructive",
        title: "Error fetching team files",
        description: error.message || "Unable to load team files. Please refresh the page.",
      });
      setTeamFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      console.log('Downloading team file:', fileId, fileName);

      const { data, error } = await supabase.storage
        .from('files')
        .download(fileId);

      if (error) {
        console.error('Storage download error:', error);
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('File data not available');
      }

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
      const { error: logError } = await supabase
        .from('download_logs')
        .insert({
          file_id: fileId,
          download_method: 'team_download',
          downloader_user_agent: navigator.userAgent
        });

      if (logError) {
        console.warn('Failed to log team download:', logError);
        // Don't fail download for logging issues
      }

      console.log('Team file downloaded successfully:', fileName);
      toast({
        title: "Download started",
        description: `${fileName} is being downloaded`,
      });
    } catch (error: any) {
      console.error('Team file download failed:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Unable to download file. Please try again.",
      });
    }
  };

  const toggleFileLock = async (fileId: string, currentLockStatus: boolean) => {
    try {
      console.log('Toggling file lock:', fileId, !currentLockStatus);

      const { error } = await supabase
        .from('files')
        .update({ is_locked: !currentLockStatus })
        .eq('id', fileId);

      if (error) {
        console.error('Lock toggle error:', error);
        throw new Error(`Failed to update lock status: ${error.message}`);
      }

      console.log('File lock toggled successfully');
      toast({
        title: currentLockStatus ? "File unlocked" : "File locked",
        description: `File has been ${currentLockStatus ? 'unlocked' : 'locked'} successfully`,
      });

      fetchTeamFiles();
    } catch (error: any) {
      console.error('Lock toggle failed:', error);
      toast({
        variant: "destructive",
        title: "Error updating file",
        description: error.message || "Unable to change file lock status.",
      });
    }
  };

  const removeFileFromTeam = async (fileId: string, teamId: string, fileName: string) => {
    try {
      console.log('Removing file from team:', fileId, teamId);

      const { error } = await supabase
        .from('team_file_shares')
        .delete()
        .eq('file_id', fileId)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error removing file from team:', error);
        throw new Error(`Failed to remove file: ${error.message}`);
      }

      console.log('File removed from team successfully:', fileName);
      toast({
        title: "File removed from team",
        description: `${fileName} has been removed from the team`,
      });

      fetchTeamFiles();
    } catch (error: any) {
      console.error('Remove file from team failed:', error);
      toast({
        variant: "destructive",
        title: "Error removing file",
        description: error.message || "Unable to remove file from team. Please try again.",
      });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Files</h2>
          <p className="text-muted-foreground">Files shared within your teams</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.team_id} value={team.team_id}>
                {team.team_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {teamFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No team files</h3>
              <p className="text-muted-foreground">
                {selectedTeam === 'all' 
                  ? 'No files have been shared with your teams yet' 
                  : 'No files have been shared with this team yet'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teamFiles.map((file) => (
            <Card key={`${file.id}-${file.team_id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate">{file.original_name}</h3>
                        {file.is_locked && <Lock className="w-4 h-4 text-yellow-500" />}
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
                        onClick={() => downloadFile(file.id, file.original_name)}
                        className="hover:scale-105 transition-transform"
                        disabled={file.is_locked && !file.is_admin}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {file.is_admin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFileLock(file.id, file.is_locked)}
                          className="hover:scale-105 transition-transform"
                        >
                          {file.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                         onClick={() => {
                           // Remove file from team functionality
                           const confirmed = window.confirm(`Remove ${file.original_name} from team?`);
                           if (confirmed) {
                             // Implementation would go here
                             toast({
                               title: "Feature coming soon",
                               description: "File removal from teams will be available soon.",
                             });
                           }
                         }}
                          className="hover:bg-functions-delete/10 hover:text-functions-delete transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
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
};