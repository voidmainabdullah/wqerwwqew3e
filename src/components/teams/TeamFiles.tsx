import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Lock, LockOpen, Trash, Users, Calendar } from 'phosphor-react';
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
      const { data, error } = await supabase.rpc('get_user_teams', {
        p_user_id: user!.id
      });

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTeamFiles = async () => {
    try {
      let query = supabase
        .from('team_file_shares')
        .select(`
          id,
          shared_at,
          files!inner(
            id,
            original_name,
            file_size,
            file_type,
            created_at,
            is_locked,
            download_count,
            user_id
          ),
          teams!inner(
            id,
            name,
            admin_id
          ),
          profiles!team_file_shares_shared_by_fkey(
            email
          )
        `);

      if (selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      const { data, error } = await query;

      if (error) throw error;

      const filesWithTeamInfo = data?.map(item => {
        const userTeam = teams.find(t => t.team_id === item.teams.id);
        const permissions = userTeam?.permissions as any;
        return {
          id: item.files.id,
          original_name: item.files.original_name,
          file_size: item.files.file_size,
          file_type: item.files.file_type,
          created_at: item.files.created_at,
          is_locked: item.files.is_locked,
          download_count: item.files.download_count,
          shared_by: item.files.user_id,
          shared_at: item.shared_at,
          team_name: item.teams.name,
          team_id: item.teams.id,
          sharer_email: 'Team Member',
          can_edit: permissions?.can_edit || userTeam?.is_admin || false,
          can_download: permissions?.can_view || userTeam?.is_admin || false,
          is_admin: userTeam?.is_admin || item.teams.admin_id === user?.id || false
        };
      }) || [];

      setTeamFiles(filesWithTeamInfo);
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

      fetchTeamFiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating file",
        description: error.message,
      });
    }
  };

  const removeFileFromTeam = async (fileId: string, teamId: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from('team_file_shares')
        .delete()
        .eq('file_id', fileId)
        .eq('team_id', teamId);

      if (error) throw error;

      toast({
        title: "File removed from team",
        description: `${fileName} has been removed from the team`,
      });

      fetchTeamFiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing file",
        description: error.message,
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
      <div className="space-y-4 p-4 max-w-7xl mx-auto">
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Team Files</h2>
          <p className="text-sm md:text-base text-muted-foreground">Files shared within your teams</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm w-full sm:w-auto min-w-[150px]"
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
          <CardContent className="p-6 md:p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-base md:text-lg font-medium mb-2">No team files</h3>
              <p className="text-sm md:text-base text-muted-foreground px-4">
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
            <Card key={`${file.id}-${file.team_id}`} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm md:text-base font-medium truncate">{file.original_name}</h3>
                        {file.is_locked && <Lock className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <span className="whitespace-nowrap">{formatFileSize(file.file_size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{file.file_type.toUpperCase()}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                          <Download className="w-3 h-3" />
                          <span>{file.download_count}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {file.team_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Shared by {file.sharer_email}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(file.shared_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
                    {file.can_download && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file.id, file.original_name)}
                        className="hover:scale-105 transition-transform flex-shrink-0"
                        disabled={file.is_locked && !file.is_admin}
                      >
                        <Download className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    )}
                    
                    {file.is_admin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFileLock(file.id, file.is_locked)}
                          className="hover:scale-105 transition-transform flex-shrink-0"
                        >
                          {file.is_locked ? <LockOpen className="w-4 h-4 sm:mr-1" /> : <Lock className="w-4 h-4 sm:mr-1" />}
                          <span className="hidden sm:inline">{file.is_locked ? 'Unlock' : 'Lock'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFileFromTeam(file.id, file.team_id, file.original_name)}
                          className="hover:bg-functions-delete/10 hover:text-functions-delete transition-all flex-shrink-0"
                        >
                          <Trash className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Remove</span>
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