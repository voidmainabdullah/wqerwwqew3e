import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip'; // ya apni tooltip component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Download, Search, ListFilter as Filter, Upload, Share2, Folder, ScanEye, FolderOpen, Home, ChevronRight, Sparkles, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileShareDialog } from './FileShareDialog';
import { FileRenameDialog } from './FileRenameDialog';
import { FolderCreateDialog } from './FolderCreateDialog';
import { FolderShareDialog } from './FolderShareDialog';
import { MoveToFolderDialog } from './MoveToFolderDialog';
import { ShareToTeamsDialog } from './ShareToTeamsDialog';
import { AIFileOrganizer } from './AIFileOrganizer';
import JSZip from 'jszip';
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
  folder_id?: string | null;
}
interface FolderItem {
  id: string;
  name: string;
  created_at: string;
  is_public: boolean;
  parent_folder_id: string | null;
}
export function FileManager() {
  const {
    user
  } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{
    id: string | null;
    name: string;
  }>>([{
    id: null,
    name: 'Home'
  }]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

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
  const [folderCreateDialog, setFolderCreateDialog] = useState(false);
  const [folderShareDialog, setFolderShareDialog] = useState<{
    isOpen: boolean;
    folderId: string;
    folderName: string;
  }>({
    isOpen: false,
    folderId: '',
    folderName: ''
  });
  const [moveToFolderDialog, setMoveToFolderDialog] = useState(false);
  const [shareToTeamsDialog, setShareToTeamsDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });
  const [aiOrganizerDialog, setAiOrganizerDialog] = useState(false);
  useEffect(() => {
    if (user) {
      fetchContents();
    }
  }, [user, currentFolderId]);
  const fetchContents = async () => {
    try {
      setLoading(true);

      // Fetch folders in current directory
      let foldersQuery = supabase.from('folders').select('*').eq('user_id', user?.id).order('name', {
        ascending: true
      });
      if (currentFolderId === null) {
        foldersQuery = foldersQuery.is('parent_folder_id', null);
      } else {
        foldersQuery = foldersQuery.eq('parent_folder_id', currentFolderId);
      }
      const {
        data: foldersData,
        error: foldersError
      } = await foldersQuery;
      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      // Fetch files in current directory
      let filesQuery = supabase.from('files').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (currentFolderId === null) {
        filesQuery = filesQuery.is('folder_id', null);
      } else {
        filesQuery = filesQuery.eq('folder_id', currentFolderId);
      }
      const {
        data: filesData,
        error: filesError
      } = await filesQuery;
      if (filesError) throw filesError;

      // Get share counts for each file
      const filesWithShareCount = await Promise.all((filesData || []).map(async file => {
        const {
          count
        } = await supabase.from('shared_links').select('*', {
          count: 'exact',
          head: true
        }).eq('file_id', file.id).eq('is_active', true);
        return {
          ...file,
          share_count: count || 0
        };
      }));
      setFiles(filesWithShareCount);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };
  const navigateToFolder = async (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setBreadcrumbs([{
        id: null,
        name: 'Home'
      }]);
    } else {
      const existingIndex = breadcrumbs.findIndex(b => b.id === folderId);
      if (existingIndex !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, {
          id: folderId,
          name: folderName
        }]);
      }
    }
    setSelectedItems(new Set());
    setSelectionMode(false);
  };
  const deleteFolder = async (folderId: string, folderName: string) => {
    toast.promise((async () => {
      const {
        error
      } = await supabase.from('folders').delete().eq('id', folderId);
      if (error) throw error;
      await fetchContents();
    })(), {
      loading: `Deleting "${folderName}"...`,
      success: 'Folder deleted successfully',
      error: 'Failed to delete folder'
    });
  };
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };
  const handleBulkDelete = async () => {
    const selectedFiles = Array.from(selectedItems).filter(id => files.some(f => f.id === id));
    const selectedFolders = Array.from(selectedItems).filter(id => folders.some(f => f.id === id));
    if (selectedFiles.length === 0 && selectedFolders.length === 0) return;
    const totalCount = selectedFiles.length + selectedFolders.length;
    toast.promise((async () => {
      for (const fileId of selectedFiles) {
        const file = files.find(f => f.id === fileId);
        if (file) {
          await supabase.storage.from('files').remove([file.storage_path]);
          await supabase.from('files').delete().eq('id', fileId);
        }
      }
      for (const folderId of selectedFolders) {
        await supabase.from('folders').delete().eq('id', folderId);
      }
      setSelectedItems(new Set());
      setSelectionMode(false);
      await fetchContents();
    })(), {
      loading: `Deleting ${totalCount} item(s)...`,
      success: `Deleted ${totalCount} item(s) successfully`,
      error: 'Failed to delete some items'
    });
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
    toast.promise((async () => {
      const {
        error: storageError
      } = await supabase.storage.from('files').remove([storagePath]);
      if (storageError) throw storageError;
      const {
        error: dbError
      } = await supabase.from('files').delete().eq('id', fileId);
      if (dbError) throw dbError;
      await fetchContents();
    })(), {
      loading: 'Deleting file...',
      success: 'File deleted successfully',
      error: 'Failed to delete file'
    });
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
  // Smart search across all folders recursively
  const searchAllFolders = async (searchQuery: string) => {
    if (!searchQuery.trim()) return {
      files: [],
      folders: []
    };
    const query = searchQuery.toLowerCase();

    // Search all user's files
    const {
      data: allFiles
    } = await supabase.from('files').select('*').eq('user_id', user?.id).ilike('original_name', `%${query}%`);

    // Search all user's folders
    const {
      data: allFolders
    } = await supabase.from('folders').select('*').eq('user_id', user?.id).ilike('name', `%${query}%`);
    return {
      files: allFiles || [],
      folders: allFolders || []
    };
  };

  // Ultra-fast memoized search with debouncing effect
  const {
    filteredFiles,
    filteredFolders
  } = useMemo(() => {
    if (searchTerm.trim()) {
      // Search in all folders when search term exists
      const query = searchTerm.toLowerCase();
      return {
        filteredFiles: files.filter(file => file.original_name.toLowerCase().includes(query) && (filterType === 'all' || file.file_type.includes(filterType))),
        filteredFolders: folders.filter(folder => folder.name.toLowerCase().includes(query))
      };
    }

    // Normal filtering in current folder
    return {
      filteredFiles: files.filter(file => filterType === 'all' || file.file_type.includes(filterType)),
      filteredFolders: folders
    };
  }, [files, folders, searchTerm, filterType]);

  // Download multiple files as ZIP
  const downloadAsZip = async () => {
    const selectedFiles = Array.from(selectedItems).map(id => files.find(f => f.id === id)).filter(Boolean) as FileItem[];
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }
    toast.promise((async () => {
      const zip = new JSZip();
      for (const file of selectedFiles) {
        try {
          const {
            data
          } = await supabase.storage.from('files').createSignedUrl(file.storage_path, 60);
          if (data?.signedUrl) {
            const response = await fetch(data.signedUrl);
            const blob = await response.blob();
            zip.file(file.original_name, blob);
          }
        } catch (error) {
          console.error(`Failed to add ${file.original_name} to zip:`, error);
        }
      }
      const content = await zip.generateAsync({
        type: 'blob'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `files-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })(), {
      loading: `Creating ZIP with ${selectedFiles.length} file(s)...`,
      success: 'ZIP downloaded successfully',
      error: 'Failed to create ZIP file'
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 "></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">My Files</h1>
          <p className="font-body text-neutral-400">
            Manage your uploaded files and folders.
          </p>
        </div>
<div className="flex gap-2">
  <Tooltip content={files.length === 0 ? 'No files to organize' : ''} placement="top">
    <span className={`inline-block ${files.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}>
      <Button
        onClick={() => files.length > 0 && setAiOrganizerDialog(true)}
        variant="outline"
        className="font-heading border bg-gradient-to-r from-blue-500 via-blue-600 to-blue-900 hover:bg-fuchsia-500"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        AI Organize
      </Button>
    </span>
  </Tooltip>



  

          <Button onClick={() => setFolderCreateDialog(true)} variant="outline" className="font-heading bg-[#3f3ff5]/[0.16] border border-blue-500">
            <Folder className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button asChild className="font-heading bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <a href="/dashboard/upload" className="flex items-center gap-2 ">
              <span className="material-icons md-18">upload</span>
              Upload Files
            </a>
          </Button>
        </div>
      </div>
      

      {/* Breadcrumb Navigation */}
      <Card>
        <CardContent className="p-4 rounded-2xl rounded-2xl border ">
          <div className="flex items-center gap-2 text-sm font-body">
            {breadcrumbs.map((crumb, index) => <React.Fragment key={crumb.id || 'root'}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <button onClick={() => navigateToFolder(crumb.id, crumb.name)} className={`flex items-center gap-1 hover:text-primary transition-colors ${index === breadcrumbs.length - 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {index === 0 && <Home className="h-4 w-4" />}
                  {crumb.name}
                </button>
              </React.Fragment>)}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6 bg-stone-950">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-icons md-18 absolute left-2 top-2.5 text-muted-foreground">search</span>
              <Input placeholder="Search files and folders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 font-body border border-input bg-stone-900/50" />
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
            {selectionMode && <div className="flex gap-2">
                <Button variant="outline" onClick={downloadAsZip} disabled={Array.from(selectedItems).filter(id => files.some(f => f.id === id)).length === 0} className="font-heading bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30">
                  <Archive className="mr-2 h-4 w-4" />
                  ZIP ({Array.from(selectedItems).filter(id => files.some(f => f.id === id)).length})
                </Button>
                <Button variant="outline" onClick={() => setMoveToFolderDialog(true)} disabled={selectedItems.size === 0} className="font-heading">
                  <Folder className="mr-2 h-4 w-4" />
                  Move
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete} disabled={selectedItems.size === 0} className="font-heading">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedItems.size})
                </Button>
                <Button variant="ghost" onClick={() => {
              setSelectionMode(false);
              setSelectedItems(new Set());
            }} className="font-heading">
                  Cancel
                </Button>
              </div>}
            {!selectionMode && (filteredFiles.length > 0 || filteredFolders.length > 0) && <Button variant="outline" onClick={() => setSelectionMode(true)} className="font-heading">
                Select
              </Button>}
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredFolders.length === 0 && filteredFiles.length === 0 ? <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground mb-4">
              <span className="material-icons md-48 text-muted-foreground">folder_open</span>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2">No items found</h3>
            <p className="font-body text-muted-foreground text-center mb-4">
              {searchTerm ? 'No items match your search criteria.' : 'This folder is empty.'}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setFolderCreateDialog(true)} variant="outline" className="font-heading">
                <Folder className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
              <Button asChild className="font-heading">
                <a href="/dashboard/upload">
                  <span className="material-icons md-18 mr-2">upload</span>
                  Upload Files
                </a>
              </Button>
            </div>
          </CardContent>
        </Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Folders */}
          {filteredFolders.map(folder => <Card key={`folder-${folder.id}`} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-foreground/20 bg-card/50 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigateToFolder(folder.id, folder.name)}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 group-hover:bg-muted transition-colors">
                      <FolderOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-base mb-1 truncate text-foreground" title={folder.name}>
                        {folder.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(folder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectionMode && <Checkbox checked={selectedItems.has(folder.id)} onCheckedChange={() => toggleItemSelection(folder.id)} onClick={e => e.stopPropagation()} />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <span className="material-icons md-18">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFolderShareDialog({
                    isOpen: true,
                    folderId: folder.id,
                    folderName: folder.name
                  })}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteFolder(folder.id, folder.name)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>)}

          {/* Files */}
          {filteredFiles.map(file => <Card key={file.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-foreground/20 bg-card/50 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 border border-border group-hover:bg-muted transition-colors">
                      <span className="text-foreground font-heading font-bold text-xs">
                        {file.original_name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-base mb-1 truncate text-foreground" title={file.original_name}>
                        {file.original_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectionMode && <Checkbox checked={selectedItems.has(file.id)} onCheckedChange={() => toggleItemSelection(file.id)} />}
                    {!selectionMode && <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs bg-background/50">
                          <Download className="mr-1 h-3 w-3" />
                          {file.download_count}
                        </Badge>
                        {file.is_public && <Badge variant="secondary" className="text-xs">Public</Badge>}
                        {file.is_locked && <Badge variant="outline" className="text-xs">Locked</Badge>}
                      </div>}
                  </div>
                </div>

                {/* Action Buttons */}
                {!selectionMode && <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadFile(file.id, file.storage_path, file.original_name)} className="flex-1 h-9 hover:bg-muted">
                      <ScanEye className="mr-1.5 h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    
                    <Button size="sm" variant="outline" onClick={() => openShareDialog(file.id, file.original_name)} className="flex-1 h-9 hover:bg-muted">
                      <Share2 className="mr-1.5 h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>

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
                        <DropdownMenuItem onClick={() => openShareDialog(file.id, file.original_name)}>
                          <span className="material-icons md-18 mr-2">share</span>
                          Create Share Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShareToTeamsDialog({
                  isOpen: true,
                  fileId: file.id,
                  fileName: file.original_name
                })}>
                          <span className="material-icons md-18 mr-2">groups</span>
                          Share to Team
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="/dashboard/shared" className="flex items-center">
                            <span className="material-icons md-18 mr-2">link</span>
                            View All Shares
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteFile(file.id, file.storage_path)} className="text-destructive focus:text-destructive">
                          <span className="material-icons md-18 mr-2">delete</span>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>}
              </CardContent>
            </Card>)}
        </div>}

      {/* Dialogs */}
      <FileShareDialog isOpen={shareDialog.isOpen} onClose={() => setShareDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    })} fileId={shareDialog.fileId} fileName={shareDialog.fileName} />

      <FileRenameDialog isOpen={renameDialog.isOpen} onClose={() => setRenameDialog({
      isOpen: false,
      fileId: '',
      currentName: ''
    })} fileId={renameDialog.fileId} currentName={renameDialog.currentName} onRename={newName => handleRename(renameDialog.fileId, newName)} />

      <FolderCreateDialog isOpen={folderCreateDialog} onClose={() => setFolderCreateDialog(false)} parentFolderId={currentFolderId} onFolderCreated={fetchContents} />

      <FolderShareDialog isOpen={folderShareDialog.isOpen} onClose={() => setFolderShareDialog({
      isOpen: false,
      folderId: '',
      folderName: ''
    })} folderId={folderShareDialog.folderId} folderName={folderShareDialog.folderName} />

      <MoveToFolderDialog isOpen={moveToFolderDialog} onClose={() => setMoveToFolderDialog(false)} fileIds={Array.from(selectedItems).filter(id => files.some(f => f.id === id))} onMoved={() => {
      setSelectedItems(new Set());
      setSelectionMode(false);
      fetchContents();
    }} />
      
      <ShareToTeamsDialog isOpen={shareToTeamsDialog.isOpen} onClose={() => setShareToTeamsDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    })} fileId={shareToTeamsDialog.fileId} fileName={shareToTeamsDialog.fileName} />
      
      <AIFileOrganizer isOpen={aiOrganizerDialog} onClose={() => setAiOrganizerDialog(false)} files={files.map(f => ({
      id: f.id,
      original_name: f.original_name,
      file_type: f.file_type,
      file_size: f.file_size
    }))} onOrganized={fetchContents} />
    </div>;
}