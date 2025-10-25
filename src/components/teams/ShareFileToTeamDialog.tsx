import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Folder, FolderOpen, File, Search, ChevronRight, Home, Loader2, Share } from 'lucide-react';

interface ShareFileToTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface FileItem {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  folder_id?: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  created_at: string;
  parent_folder_id: string | null;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export function ShareFileToTeamDialog({
  isOpen,
  onClose,
  teamId,
  teamName
}: ShareFileToTeamDialogProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Home' }]);

  useEffect(() => {
    if (isOpen && user) {
      fetchContents();
    }
  }, [isOpen, user, currentFolderId]);

  const fetchContents = async () => {
    try {
      setLoading(true);

      let foldersQuery = supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('name', { ascending: true });

      if (currentFolderId === null) {
        foldersQuery = foldersQuery.is('parent_folder_id', null);
      } else {
        foldersQuery = foldersQuery.eq('parent_folder_id', currentFolderId);
      }

      const { data: foldersData, error: foldersError } = await foldersQuery;
      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      let filesQuery = supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (currentFolderId === null) {
        filesQuery = filesQuery.is('folder_id', null);
      } else {
        filesQuery = filesQuery.eq('folder_id', currentFolderId);
      }

      const { data: filesData, error: filesError } = await filesQuery;
      if (filesError) throw filesError;
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Failed to load files and folders');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Home' }]);
    } else {
      const existingIndex = breadcrumbs.findIndex(b => b.id === folderId);
      if (existingIndex !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
      }
    }
    setSelectedItems(new Set());
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

  const toggleSelectAll = () => {
    if (selectedItems.size === files.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(files.map(f => f.id)));
    }
  };

  const handleShare = async () => {
    const selectedFiles = Array.from(selectedItems).filter(id =>
      files.some(f => f.id === id)
    );

    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to share');
      return;
    }

    setSharing(true);
    try {
      const sharePromises = selectedFiles.map(fileId =>
        supabase.from('team_file_shares').insert({
          file_id: fileId,
          team_id: teamId,
          shared_by: user?.id
        })
      );

      await Promise.all(sharePromises);

      toast.success(`Successfully shared ${selectedFiles.length} file(s) with ${teamName}`);
      setSelectedItems(new Set());
      onClose();
    } catch (error: any) {
      console.error('Error sharing files:', error);
      toast.error('Failed to share files: ' + error.message);
    } finally {
      setSharing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5 text-primary" />
            Share Files & Folders to {teamName}
          </DialogTitle>
          <DialogDescription>
            Select files and folders to share with your team
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id || 'root'}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <button
                  onClick={() => navigateToFolder(crumb.id, crumb.name)}
                  className={`flex items-center gap-1 hover:text-primary transition-colors ${
                    index === breadcrumbs.length - 1 ? 'font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {files.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.size === files.length && files.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All ({selectedItems.size} of {files.length} selected)
              </span>
            </div>
          )}

          <ScrollArea className="flex-1 -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No items match your search criteria.' : 'This folder is empty.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFolders.map((folder) => (
                  <div
                    key={`folder-${folder.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                    onClick={() => navigateToFolder(folder.id, folder.name)}
                  >
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Folder className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{folder.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(folder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Folder</Badge>
                  </div>
                ))}

                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(file.id);
                    }}
                  >
                    <Checkbox
                      checked={selectedItems.has(file.id)}
                      onCheckedChange={() => toggleItemSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <File className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate" title={file.original_name}>
                        {file.original_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sharing}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={sharing || selectedItems.size === 0}>
            {sharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              `Share ${selectedItems.size > 0 ? `(${selectedItems.size})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
