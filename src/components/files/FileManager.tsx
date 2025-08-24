import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { File, Download, ShareNetwork, Trash, Lock, LockOpen, Eye, EyeSlash, Copy, Envelope, Code, Users, ShieldCheck } from 'phosphor-react';

interface FileData {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_public: boolean;
  is_locked: boolean;
  download_count: number;
  download_limit: number | null;
  expires_at: string | null;
  share_code: string | null;
  created_at: string;
  updated_at: string;
}

interface ShareLinkData {
  id: string;
  share_token: string;
  link_type: string;
  download_count: number;
  download_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  recipient_email: string | null;
}

export const FileManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [sharedLinks, setSharedLinks] = useState<{ [fileId: string]: ShareLinkData[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email' | 'public' | 'code'>('public');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [downloadLimit, setDownloadLimit] = useState<string>('');
  const [expiryDays, setExpiryDays] = useState<string>('7');
  const [sharePassword, setSharePassword] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [virusScanning, setVirusScanning] = useState<{ [fileId: string]: boolean }>({});
  const [teamShareDialogOpen, setTeamShareDialogOpen] = useState(false);
  const [selectedTeamFile, setSelectedTeamFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('subscription_tier').eq('id', user?.id).single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.from('files').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) throw error;
      setFiles(data || []);
      const fileIds = data?.map(f => f.id) || [];
      if (fileIds.length > 0) {
        const { data: linksData } = await supabase.from('shared_links').select('*').in('file_id', fileIds);
        const linksByFile = (linksData || []).reduce((acc, link) => {
          if (!acc[link.file_id]) acc[link.file_id] = [];
          acc[link.file_id].push(link);
          return acc;
        }, {} as { [fileId: string]: ShareLinkData[] });
        setSharedLinks(linksByFile);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching files", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
        <p className="text-muted-foreground">Manage your uploaded files and sharing settings.</p>
      </div>
      {files.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-4">Start by uploading your first file.</p>
            <Button asChild>
              <a href="/dashboard/upload">Upload Files</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file, index) => (
            <Card key={file.id} className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <File className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{file.original_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span className="hidden sm:inline">{file.download_count} downloads</span>
                        <span className="hidden md:inline">Uploaded {formatDate(file.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        <Badge variant={file.is_public ? "default" : "secondary"} className="text-xs">
                          {file.is_public ? "Public" : "Private"}
                        </Badge>
                        {file.is_locked && <Badge variant="destructive" className="text-xs">Locked</Badge>}
                        {file.expires_at && new Date(file.expires_at) < new Date() && <Badge variant="destructive" className="text-xs">Expired</Badge>}
                        {file.share_code && <Badge variant="outline" className="text-xs">Code: {file.share_code}</Badge>}
                      </div>
                    </div>
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
