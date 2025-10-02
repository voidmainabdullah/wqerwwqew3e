import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FolderCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId?: string | null;
  onFolderCreated: () => void;
}

export function FolderCreateDialog({
  isOpen,
  onClose,
  parentFolderId,
  onFolderCreated,
}: FolderCreateDialogProps) {
  const { user } = useAuth();
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (!user || !folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: folderName.trim(),
          user_id: user.id,
          parent_folder_id: parentFolderId || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Folder created successfully');
      setFolderName('');
      onFolderCreated();
      onClose();
    } catch (error: any) {
      console.error('Create folder error:', error);
      toast.error(error.message || 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Folder</DialogTitle>
          <DialogDescription className="font-body">
            Enter a name for your new folder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="font-heading">
              Folder Name
            </Label>
            <Input
              id="folder-name"
              placeholder="My Folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleCreateFolder();
                }
              }}
              className="font-body"
              autoFocus
            />
          </div>
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
            onClick={handleCreateFolder}
            disabled={isLoading || !folderName.trim()}
            className="font-heading"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
