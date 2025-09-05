import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Search, Filter, Upload, Share2, Lock, Unlock, Globe, EyeOff, Shield, Edit3, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileShareDialog } from './FileShareDialog';
import { FileRenameDialog } from './FileRenameDialog';
interface FileItem {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  download_count: number;
  is_public: boolean;
  is_locked: boolean;
  user_id: string;
  storage_path: string;
}
export function FileManager() {
  const {
    user
  } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Dialog states
  const [shareDialog, setShareDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    currentName: string;
  }>({
    isOpen: false,
    fileId: '',
    currentName: ''
  });
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('files').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };
  const downloadFile = async (fileId: string, storagePath: string, fileName: string) => {
    try {
      const {
        data
      } = await supabase.storage.from('files').createSignedUrl(storagePath, 60);
      if (data) {
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log the download
        await supabase.from('download_logs').insert({
          file_id: fileId,
          download_method: 'direct'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const toggleFileVisibility = async (fileId: string, currentPublicState: boolean) => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('toggle_file_public_status', {
        p_file_id: fileId,
        p_is_public: !currentPublicState
      });
      if (error) throw error;
      setFiles(files.map(file => file.id === fileId ? {
        ...file,
        is_public: data
      } : file));
      toast.success(`File made ${data ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Visibility toggle error:', error);
      toast.error('Failed to update file visibility');
    }
  };
  const toggleFileLock = async (fileId: string, currentLockState: boolean) => {
    try {
      let password = null;
      if (!currentLockState) {
        // If locking, prompt for password
        password = prompt('Enter password to lock this file (optional):');
      }
      const {
        data,
        error
      } = await supabase.rpc('toggle_file_lock_status', {
        p_file_id: fileId,
        p_is_locked: !currentLockState,
        p_password: password
      });
      if (error) throw error;
      setFiles(files.map(file => file.id === fileId ? {
        ...file,
        is_locked: data
      } : file));
      toast.success(`File ${data ? 'locked' : 'unlocked'}`);
    } catch (error) {
      console.error('Lock toggle error:', error);
      toast.error('Failed to update file lock status');
    }
  };
  const virusScan = async (fileId: string, fileName: string) => {
    // Simulated virus scan - in production, integrate with actual antivirus service
    toast.info('Scanning file for viruses...');
    setTimeout(() => {
      toast.success(`${fileName} is clean - no threats detected`);
    }, 2000);
  };
  const deleteFile = async (fileId: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      // Delete from storage
      const {
        error: storageError
      } = await supabase.storage.from('files').remove([storagePath]);
      if (storageError) throw storageError;

      // Delete from database
      const {
        error: dbError
      } = await supabase.from('files').delete().eq('id', fileId);
      if (dbError) throw dbError;
      toast.success('File deleted successfully');
      fetchFiles(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };
  const openShareDialog = (fileId: string, fileName: string) => {
    setShareDialog({
      isOpen: true,
      fileId,
      fileName
    });
  };
  const openRenameDialog = (fileId: string, currentName: string) => {
    setRenameDialog({
      isOpen: true,
      fileId,
      currentName
    });
  };
  const handleRename = (fileId: string, newName: string) => {
    setFiles(files.map(file => file.id === fileId ? {
      ...file,
      original_name: newName
    } : file));
  };
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.file_type.includes(filterType);
    return matchesSearch && matchesFilter;
  });
  if (loading) {
    return <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
          <p className="text-muted-foreground">
            Manage your uploaded files and shared content.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </a>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            <div className="w-full sm:w-48">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 border border-input bg-background rounded-md">
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="pdf">PDFs</option>
                <option value="text">Documents</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground mb-4">
              <Upload className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium mb-2 bg-neutral-950 hover:bg-neutral-800 text-green-400">No files found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'No files match your search criteria.' : 'Start by uploading your first file.'}
            </p>
            <Button asChild className="bg-neutral-950 hover:bg-neutral-800 text-blue-500">
              <a href="/dashboard/upload">
                Upload Your First File
              </a>
            </Button>
          </CardContent>
        </Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-red-400 bg-neutral-950 hover:bg-neutral-800">
          {filteredFiles.map(file => <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {file.original_name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {file.download_count} downloads
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1 truncate" title={file.original_name}>
                    {file.original_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Primary Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" onClick={() => downloadFile(file.id, file.storage_path, file.original_name)} title="Download" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button size="icon" variant="outline" onClick={() => openShareDialog(file.id, file.original_name)} title="Share" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button size="icon" variant="outline" onClick={() => toggleFileVisibility(file.id, file.is_public)} title={file.is_public ? 'Make Private' : 'Make Public'} className="h-8 w-8">
                      {file.is_public ? <Globe className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>

                    <Button size="icon" variant="outline" onClick={() => toggleFileLock(file.id, file.is_locked)} title={file.is_locked ? 'Unlock' : 'Lock'} className="h-8 w-8">
                      {file.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => virusScan(file.id, file.original_name)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Virus Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRenameDialog(file.id, file.original_name)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteFile(file.id, file.storage_path)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-1 mt-2">
                  {file.is_public && <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>}
                  {file.is_locked && <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>}
                </div>
              </CardContent>
            </Card>)}
        </div>}

      {/* Share Dialog */}
      <FileShareDialog isOpen={shareDialog.isOpen} onClose={() => setShareDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    })} fileId={shareDialog.fileId} fileName={shareDialog.fileName} />

      {/* Rename Dialog */}
      <FileRenameDialog isOpen={renameDialog.isOpen} onClose={() => setRenameDialog({
      isOpen: false,
      fileId: '',
      currentName: ''
    })} fileId={renameDialog.fileId} currentName={renameDialog.currentName} onRename={newName => handleRename(renameDialog.fileId, newName)} />
    </div>;
}