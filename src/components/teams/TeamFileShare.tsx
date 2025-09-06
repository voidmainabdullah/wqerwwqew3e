import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File, ShareNetwork, Download, Lock, LockOpen, Users, Calendar, User } from 'phosphor-react';
import { useToast } from '@/hooks/use-toast';
interface TeamFile {
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
interface UserFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_locked: boolean;
  created_at: string;
}
interface Team {
  id: string;
  name: string;
  is_admin: boolean;
  role: string;
  permissions: any;
}
const TeamFileShare: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [teamFiles, setTeamFiles] = useState<TeamFile[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch team files shared with user
      const {
        data: teamFilesData,
        error: teamFilesError
      } = await supabase.rpc('get_my_team_files', {
        p_user_id: user!.id
      });
      if (teamFilesError) throw teamFilesError;
      setTeamFiles(teamFilesData || []);

      // Fetch user's own files
      const {
        data: userFilesData,
        error: userFilesError
      } = await supabase.from('files').select('*').eq('user_id', user!.id).order('created_at', {
        ascending: false
      });
      if (userFilesError) throw userFilesError;
      setUserFiles(userFilesData || []);

      // Fetch user's teams
      const {
        data: teamsData,
        error: teamsError
      } = await supabase.rpc('get_user_teams', {
        p_user_id: user!.id
      });
      if (teamsError) throw teamsError;
      const mappedTeams = teamsData?.map(team => ({
        id: team.team_id,
        name: team.team_name,
        is_admin: team.is_admin,
        role: team.role,
        permissions: team.permissions
      })) || [];
      setTeams(mappedTeams);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const shareFileWithTeam = async () => {
    if (!selectedFile || !selectedTeam) {
      toast({
        variant: "destructive",
        title: "Selection required",
        description: "Please select both a file and a team"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('team_file_shares').insert({
        file_id: selectedFile.id,
        team_id: selectedTeam,
        shared_by: user!.id
      });
      if (error) throw error;
      toast({
        title: "File shared",
        description: `${selectedFile.original_name} has been shared with the team`
      });
      setShareDialogOpen(false);
      setSelectedFile(null);
      setSelectedTeam('');
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sharing file",
        description: error.message
      });
    }
  };
  const downloadFile = async (file: TeamFile | UserFile, storagePathOverride?: string) => {
    try {
      let storagePath: string;
      if ('storage_path' in file) {
        // UserFile
        storagePath = file.storage_path;
      } else {
        // TeamFile - we need to get the storage path
        const {
          data: fileData,
          error: fileError
        } = await supabase.from('files').select('storage_path').eq('id', file.file_id).single();
        if (fileError) throw fileError;
        storagePath = fileData.storage_path;
      }
      const {
        data,
        error
      } = await supabase.storage.from('files').download(storagePath);
      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'file_name' in file ? file.file_name : file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count
      const fileId = 'file_id' in file ? file.file_id : file.id;
      await supabase.from('files').update({
        download_count: ('download_count' in file ? file.download_count : 0) + 1
      }).eq('id', fileId);
      toast({
        title: "Download started",
        description: "Your file is downloading"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message
      });
    }
  };
  const toggleFileLock = async (fileId: string, currentLocked: boolean) => {
    try {
      const {
        error
      } = await supabase.from('files').update({
        is_locked: !currentLocked
      }).eq('id', fileId);
      if (error) throw error;
      toast({
        title: currentLocked ? "File unlocked" : "File locked",
        description: `File has been ${currentLocked ? 'unlocked' : 'locked'}`
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating file",
        description: error.message
      });
    }
  };
  if (loading) {
    return <div className="space-y-4 p-4 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>;
  }

  return <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Team Files</h1>
          <p className="text-sm md:text-base text-muted-foreground">Access and manage files shared within your teams</p>
        </div>
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover:scale-105 transition-transform w-full sm:w-auto">
              <ShareNetwork className="w-4 h-4 mr-2" />
              Share File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share File with Team</DialogTitle>
              <DialogDescription>
                Select a file and team to share with
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select File</label>
                <Select value={selectedFile?.id || ''} onValueChange={value => {
                const file = userFiles.find(f => f.id === value);
                setSelectedFile(file || null);
              }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a file to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {userFiles.map(file => <SelectItem key={file.id} value={file.id}>
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4" />
                          <span>{file.original_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.file_size)})
                          </span>
                        </div>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{team.name}</span>
                          <Badge variant={team.is_admin ? 'default' : 'secondary'} className="text-xs">
                            {team.is_admin ? 'Admin' : team.role}
                          </Badge>
                        </div>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={shareFileWithTeam} disabled={!selectedFile || !selectedTeam}>
                  Share File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Team Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Users className="w-5 h-5 mr-2" />
              Files Shared with Me ({teamFiles.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Files that have been shared with your teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamFiles.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg font-medium">No team files yet</p>
                <p className="text-xs md:text-sm px-4">Files shared with your teams will appear here</p>
              </div> : <div className="space-y-4">
                {teamFiles.map(file => <div key={file.file_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm md:text-base font-medium truncate">{file.file_name}</p>
                          {file.is_locked && <Lock className="w-4 h-4 text-destructive" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{file.sharer_email}</span>
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Users className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{file.team_name}</span>
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3" />
                            {new Date(file.shared_at).toLocaleDateString()}
                          </span>
                          <span className="whitespace-nowrap">{formatFileSize(file.file_size)}</span>
                          <span className="whitespace-nowrap">{file.download_count} downloads</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
                      {file.can_download && !file.is_locked && <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                          <Download className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>}
                      
                      {file.can_edit && <Button variant="outline" size="sm" onClick={() => toggleFileLock(file.file_id, file.is_locked)} className="text-red-400">
                          {file.is_locked ? <>
                              <LockOpen className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Unlock</span>
                            </> : <>
                              <Lock className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Lock</span>
                            </>}
                        </Button>}
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {/* My Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <File className="w-5 h-5 mr-2" />
              My Files ({userFiles.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Your uploaded files available for sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userFiles.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg font-medium">No files uploaded yet</p>
                <p className="text-xs md:text-sm px-4">Upload files to start sharing with teams</p>
              </div> : <div className="space-y-4">
                {userFiles.map(file => <div key={file.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm md:text-base font-medium truncate">{file.original_name}</p>
                          {file.is_locked && <Lock className="w-4 h-4 text-destructive" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <span className="whitespace-nowrap">{formatFileSize(file.file_size)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" onClick={() => downloadFile(file)} disabled={file.is_locked}>
                        <Download className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => {
                  setSelectedFile(file);
                  setShareDialogOpen(true);
                }} disabled={file.is_locked}>
                        <ShareNetwork className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => toggleFileLock(file.id, file.is_locked)}>
                        {file.is_locked ? <>
                            <LockOpen className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Unlock</span>
                          </> : <>
                            <Lock className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Lock</span>
                          </>}
                      </Button>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default TeamFileShare;