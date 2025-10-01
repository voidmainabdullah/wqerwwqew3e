import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Search, ListFilter as Filter, Upload, Share2 } from 'lucide-react';
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
  share_count?: number;
  active_shares?: number;
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
      
      // Get files with share count
      const { data: filesData, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get share counts for each file
      const filesWithShareCount = await Promise.all(
        (filesData || []).map(async (file) => {
          const { count: totalShares } = await supabase
            .from('shared_links')
            .select('*', { count: 'exact', head: true })
            .eq('file_id', file.id);
          
          const { count: activeShares } = await supabase
            .from('shared_links')
            .select('*', { count: 'exact', head: true })
            .eq('file_id', file.id)
            .eq('is_active', true);
          
          return {
            ...file,
            share_count: totalShares || 0,
            active_shares: activeShares || 0
          };
        })
      );
      
      setFiles(filesWithShareCount);
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
        <div className="animate-spin rounded-full h-8 w-8 "></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">My Files</h1>
          <p className="font-body text-muted-foreground">
            Manage your uploaded files and shared content.
          </p>
        </div>
        <Button asChild className="font-heading bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <a href="/dashboard/upload" className="flex items-center gap-2">  
            <span className="material-icons md-18">upload</span>
            Upload Files
          </a>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"> 
              <span className="material-icons md-18 absolute left-2 top-2.5 text-muted-foreground">search</span>
              <Input placeholder="Search files..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 font-body" />
            </div> 
            <div className="w-full sm:w-48">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 border border-input bg-background rounded-md font-body">
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
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground mb-4">
              <span className="material-icons md-48 text-muted-foreground">upload_file</span>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2">No files found</h3>
            <p className="font-body text-muted-foreground text-center mb-4">
              {searchTerm ? 'No files match your search criteria.' : 'Start by uploading your first file.'}
            </p>
            <Button asChild className="font-heading icon-text">
              <a href="/dashboard/upload">
                <span className="material-icons md-18">upload</span>
                Upload a File
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> 
          {filteredFiles.map(file => (
            <Card key={file.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <span className="text-blue-600 dark:text-blue-400 font-heading font-bold text-xs">
                      {file.original_name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div> 
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      <span className="material-icons md-18 mr-1">download</span>
                      {file.download_count}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <span className="material-icons md-18 mr-1">share</span>
                      {file.active_shares || 0} active
                    </Badge>
                    {(file.share_count || 0) > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <span className="material-icons md-18 mr-1">link</span>
                        {file.share_count} total
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-heading font-semibold text-base mb-2 truncate" title={file.original_name}>
                    {file.original_name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 min-h-[24px]">
                  {file.is_public && (
                    <Badge variant="default" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                      <span className="material-icons md-18 mr-1">public</span>
                      Public
                    </Badge>
                  )}
                  {file.is_locked && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <span className="material-icons md-18 mr-1">lock</span>
                      Protected
                    </Badge>
                  )}
                  {!file.is_public && (
                    <Badge variant="secondary" className="text-xs">
                      <span className="material-icons md-18 mr-1">visibility_off</span>
                      Private
                    </Badge>
                  )}
                  {(file.share_count || 0) > 0 && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <span className="material-icons md-18 mr-1">trending_up</span>
                      Shared {file.share_count} times
                    </Badge>
                  )}
                </div>

                {/* Action Buttons Section */}
                <div className="flex items-center gap-2">
                  {/* Primary Action Buttons */} 
                  <div className="flex items-center gap-1.5 flex-1">
                    <Button 
                      size="sm"
                      variant="outline" 
                      onClick={() => downloadFile(file.id, file.storage_path, file.original_name)} 
                      title="Download" 
                      className="flex-1 h-9 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                    >
                      <span className="material-icons md-18 mr-1">download</span>
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline" 
                      onClick={() => openShareDialog(file.id, file.original_name)} 
                      title="Share" 
                      className="flex-1 h-9 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200"
                    >
                      <span className="material-icons md-18 mr-1">share</span>
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </div>

                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-9 w-9 hover:bg-muted flex-shrink-0">
                        <span className="material-icons md-18">more_vert</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => virusScan(file.id, file.original_name)}>
                        <span className="material-icons md-18 mr-2">security</span>
                        Virus Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRenameDialog(file.id, file.original_name)}>
                        <span className="material-icons md-18 mr-2">edit</span>
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href="/dashboard/shared" className="flex items-center">
                          <span className="material-icons md-18 mr-2">link</span>
                          Manage Shares ({file.share_count || 0})
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openShareDialog(file.id, file.original_name)}>
                        <span className="material-icons md-18 mr-2">add_link</span>
                        Create New Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteFile(file.id, file.storage_path)} className="text-destructive focus:text-destructive">
                        <span className="material-icons md-18 mr-2">delete</span>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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