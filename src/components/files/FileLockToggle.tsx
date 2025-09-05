import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, Unlock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileLockToggleProps {
  fileId: string;
  fileName: string;
  isLocked: boolean;
  onToggle: (locked: boolean) => void;
}

export function FileLockToggle({ fileId, fileName, isLocked, onToggle }: FileLockToggleProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLock = async () => {
    if (!isLocked && !password.trim()) {
      toast.error('Password is required to lock the file');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_toggle_file_lock', {
        p_file_id: fileId,
        p_is_locked: !isLocked,
        p_password: !isLocked ? password : null
      });

      if (error) throw error;

      onToggle(data);
      setShowDialog(false);
      setPassword('');
      
      toast.success(`File ${data ? 'locked' : 'unlocked'} successfully`);
    } catch (error: any) {
      toast.error('Failed to toggle lock: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = () => {
    setShowDialog(true);
    setPassword('');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={openDialog}
        className="flex items-center gap-2"
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            Unlock
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            Lock
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLocked ? (
                <>
                  <Unlock className="h-5 w-5" />
                  Unlock File
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Lock File
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isLocked 
                ? `Remove password protection from "${fileName}"`
                : `Add password protection to "${fileName}"`
              }
            </DialogDescription>
          </DialogHeader>

          {!isLocked && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to lock file"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleLock}
              disabled={isLoading || (!isLocked && !password.trim())}
            >
              {isLoading ? 'Processing...' : (isLocked ? 'Unlock' : 'Lock')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}