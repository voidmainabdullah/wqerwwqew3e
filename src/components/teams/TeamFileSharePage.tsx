import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  Trash, 
  File as FileIcon, 
  CloudArrowUp,
  User,
  Calendar
} from 'phosphor-react';

interface TeamFile {
  id: string;
  file_id: string;
  team_id: string;
  shared_by: string;
  shared_at: string;
  space_id: string | null;
  file: {
    original_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
  };
  sharer: {
    email: string;
    display_name: string | null;
  };
}

interface Team {
  id: string;
  name: string;
  admin_id: string;
}

interface TeamFileSharePageProps {
  team: Team;
}

export const TeamFileSharePage: React.FC<TeamFileSharePageProps> = ({ team }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isAdmin = team.admin_id === user?.id;

  useEffect(() => {
    fetchTeamFiles();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('team-files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_file_shares',
          filter: `team_id=eq.${team.id}`
        },
        () => {
          fetchTeamFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  const fetchTeamFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('team_file_shares')
        .select(`
          *,
          file:files(
            original_name,
            file_size,
            file_type,
            storage_path
          ),
          sharer:profiles!shared_by(
            email,
            display_name
          )
        `)
        .eq('team_id', team.id)
        .order('shared_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load files",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "Only team admins can upload files"
      });
      return;
    }

    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create file record
        const { data: fileRecord, error: fileError } = await supabase
          .from('files')
          .insert({
            user_id: user!.id,
            original_name: file.name,
            storage_path: fileName,
            file_size: file.size,
            file_type: file.type,
            is_public: false
          })
          .select()
          .single();

        if (fileError) throw fileError;

        // Share with team
        const { error: shareError } = await supabase
          .from('team_file_shares')
          .insert({
            file_id: fileRecord.id,
            team_id: team.id,
            shared_by: user!.id
          });

        if (shareError) throw shareError;

        toast({
          title: "File uploaded",
          description: `${file.name} uploaded successfully`
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message
        });
      }
    }
    
    setUploading(false);
    fetchTeamFiles();
  }, [isAdmin, user, team.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !isAdmin
  });

  const downloadFile = async (file: TeamFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your file is being downloaded"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message
      });
    }
  };

  const deleteFile = async (fileShareId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('team_file_shares')
        .delete()
        .eq('id', fileShareId);

      if (error) throw error;

      toast({
        title: "File removed",
        description: "File has been removed from team"
      });
      
      fetchTeamFiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: error.message
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{team.name} - Shared Files</h2>
          <p className="text-muted-foreground">{files.length} file{files.length !== 1 ? 's' : ''} shared</p>
        </div>
        {isAdmin && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Admin
          </Badge>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <CloudArrowUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Upload files to team'}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Drag & drop or click to select files'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {file.file.original_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{formatFileSize(file.file.file_size)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{file.sharer.display_name || file.sharer.email}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(file.shared_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {files.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {isAdmin ? 'Upload files to share with your team' : 'No files shared yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
