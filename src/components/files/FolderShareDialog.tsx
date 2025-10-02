import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';

interface FolderShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
}

export function FolderShareDialog({
  isOpen,
  onClose,
  folderId,
  folderName,
}: FolderShareDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareCode, setShareCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generateShareCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_folder_share', {
        p_folder_id: folderId,
        p_link_type: 'code',
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setShareCode(data[0].share_code);
        toast.success('Share code generated successfully');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error(error.message || 'Failed to generate share code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    setShareCode('');
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Share Folder</DialogTitle>
          <DialogDescription className="font-body">
            Share "{folderName}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareCode ? (
            <div className="text-center py-8">
              <span className="material-icons md-48 text-muted-foreground mb-4">folder_shared</span>
              <p className="font-body text-muted-foreground mb-6">
                Generate a share code to allow others to access all files in this folder
              </p>
              <Button
                onClick={generateShareCode}
                disabled={isLoading}
                className="font-heading"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Share Code
              </Button>
            </div>
          ) : (
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-body text-muted-foreground mb-2">
                    Share this code:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-lg text-lg font-mono font-bold tracking-wider text-center">
                      {shareCode}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(shareCode)}
                      title="Copy code"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs font-body text-muted-foreground">
                    Share this code with others to give them access to all files in this folder.
                    They can access it at: <code className="font-mono">yoursite.com/code/{shareCode}</code>
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
