import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Folder, FolderOpen } from 'lucide-react';

interface MoveToFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileIds: string[];
  onMoved: () => void;
}

interface FolderItem {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

export function MoveToFolderDialog({
  isOpen,
  onClose,
  fileIds,
  onMoved,
}: MoveToFolderDialogProps) {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchFolders();
    }
  }, [isOpen, user]);

  const fetchFolders = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from('folders')
        .select('id, name, parent_folder_id')
        .eq('user_id', user?.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error('Fetch folders error:', error);
      toast.error('Failed to load folders');
    } finally {
      setIsFetching(false);
    }
  };

  const handleMove = async () => {
    if (fileIds.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({ folder_id: selectedFolderId })
        .in('id', fileIds);

      if (error) throw error;

      toast.success(
        `Moved ${fileIds.length} file(s) ${
          selectedFolderId ? 'to folder' : 'to root'
        }`
      );
      onMoved();
      onClose();
    } catch (error: any) {
      console.error('Move error:', error);
      toast.error(error.message || 'Failed to move files');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Move to Folder</DialogTitle>
          <DialogDescription className="font-body">
            Select a destination folder for {fileIds.length} file(s)
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {/* Root option */}
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedFolderId === null
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="material-icons md-18">home</span>
                  <span className="font-body font-medium">Root (No Folder)</span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selectedFolderId === folder.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {selectedFolderId === folder.id ? (
                      <FolderOpen className="h-4 w-4 text-primary" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-body font-medium">{folder.name}</span>
                  </button>
                ))}

                {folders.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-icons md-48 text-muted-foreground mb-2">
                      folder_off
                    </span>
                    <p className="font-body text-muted-foreground text-sm">
                      No folders yet. Create one first!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="font-heading"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={isLoading || isFetching}
            className="font-heading"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
