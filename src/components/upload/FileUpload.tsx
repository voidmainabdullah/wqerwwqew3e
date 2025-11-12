// FileUpload.tsx
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { File, CheckCircle, Warning, CircleNotch } from 'phosphor-react';
interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  error?: string;
  id?: string; // DB id when inserted
  storagePath?: string; // path used in storage (for cleanup)
  startedAt?: number;
}
const UPLOAD_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes per file (mark stuck)

export const FileUpload: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Array<{
    id: string;
    name: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // A ref map to know which files were explicitly cancelled by user
  const cancelledRef = useRef<Record<number, boolean>>({});
  // A ref to store timeouts for each file, so they can be cleared
  const fileTimeoutsRef = useRef<Record<number, number>>({});
  useEffect(() => {
    if (user) fetchFolders();
    // clear timers on unmount
    return () => {
      Object.values(fileTimeoutsRef.current).forEach(t => clearTimeout(t));
    };
  }, [user]);
  const fetchFolders = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('folders').select('id, name').eq('user_id', user?.id).order('name', {
        ascending: true
      });
      if (error) throw error;
      setFolders(data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    disabled: isUploading
  });
  const removeFile = (index: number) => {
    // Remove and also clear timeout if present
    setUploadFiles(prev => {
      const removed = prev[index];
      if (fileTimeoutsRef.current[index]) {
        clearTimeout(fileTimeoutsRef.current[index]);
        delete fileTimeoutsRef.current[index];
      }
      // If the file was already uploaded to storage and has storagePath but not DB id,
      // attempt cleanup
      if (removed?.storagePath && removed.status === 'cancelled') {
        // best-effort cleanup
        supabase.storage.from('files').remove([removed.storagePath]).catch(() => {
          /* ignore cleanup errors */
        });
      }
      const next = prev.filter((_, i) => i !== index);
      // shift timeout refs indices: easiest approach is to rebuild map
      const newTimeouts: Record<number, number> = {};
      Object.entries(fileTimeoutsRef.current).forEach(([key, t]) => {
        const k = parseInt(key, 10);
        if (k < index) newTimeouts[k] = t;else if (k > index) newTimeouts[k - 1] = t;
      });
      fileTimeoutsRef.current = newTimeouts;
      // same for cancelledRef
      const newCancelled: Record<number, boolean> = {};
      Object.entries(cancelledRef.current).forEach(([key, v]) => {
        const k = parseInt(key, 10);
        if (k < index) newCancelled[k] = v;else if (k > index) newCancelled[k - 1] = v;
      });
      cancelledRef.current = newCancelled;
      return next;
    });
  };
  const totalProgress = useMemo(() => {
    if (uploadFiles.length === 0) return 0;
    const total = uploadFiles.reduce((sum, f) => sum + f.progress, 0);
    return Math.round(total / uploadFiles.length);
  }, [uploadFiles]);

  // Cancel an active upload (logical cancel). We mark cancelledRef and set status.
  const cancelFileUpload = async (index: number) => {
    setUploadFiles(prev => prev.map((f, idx) => idx === index ? {
      ...f,
      status: 'cancelled',
      progress: 0,
      error: undefined
    } : f));
    cancelledRef.current[index] = true;
    // Clear timeout for that file
    if (fileTimeoutsRef.current[index]) {
      clearTimeout(fileTimeoutsRef.current[index]);
      delete fileTimeoutsRef.current[index];
    }

    // If file already has storagePath (meaning upload likely completed on storage),
    // attempt to delete the object in storage to avoid orphan files.
    const file = uploadFiles[index];
    if (file?.storagePath) {
      try {
        await supabase.storage.from('files').remove([file.storagePath]);
      } catch (err) {
        // best-effort: if delete fails, ignore but log
        console.warn('Failed to delete cancelled storage file', err);
      }
    }
  };

  // Retry a file (only if status is error or cancelled)
  const retryFile = (index: number) => {
    setUploadFiles(prev => prev.map((f, idx) => idx === index ? {
      ...f,
      status: 'pending',
      progress: 0,
      error: undefined,
      storagePath: undefined
    } : f));
    // remove cancelled flag if any
    delete cancelledRef.current[index];
  };

  // internal helper: set per-file state immutably
  const updateFileAt = (index: number, patch: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map((f, i) => i === index ? {
      ...f,
      ...patch
    } : f));
  };

  // Main upload function
  const handleUploadFiles = async () => {
    if (!user || uploadFiles.length === 0) return;
    setIsUploading(true);
    try {
      // Collect sizes of files that are pending
      const pendingFiles = uploadFiles.map(f => f.file);
      const totalFileSize = pendingFiles.reduce((sum, file) => sum + file.size, 0);
      const {
        data: canUpload,
        error: quotaError
      } = await supabase.rpc('check_storage_quota', {
        p_user_id: user.id,
        p_file_size: totalFileSize
      });
      if (quotaError) throw quotaError;
      if (!canUpload) {
        const {
          data: profile
        } = await supabase.from('profiles').select('storage_used, storage_limit, subscription_tier').eq('id', user.id).maybeSingle();
        const formatFileSize = (bytes: number): string => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        toast({
          variant: 'destructive',
          title: 'Storage limit exceeded',
          description: `You've used ${formatFileSize(profile?.storage_used || 0)} of your ${formatFileSize(profile?.storage_limit || 0)} storage limit.`
        });
        setIsUploading(false);
        return;
      }

      // We'll iterate through the uploadFiles array at the moment of calling
      for (let i = 0; i < uploadFiles.length; i++) {
        // get updated file snapshot (in case user mutated list)
        const current = (await (async () => uploadFiles[i])()) as UploadFile | undefined;
        // we still read from stateful array because user might remove — so read from state
        const stateSnapshot = (() => {
          const s = uploadFiles; // closure (we'll also read latest from setUploadFiles where needed)
          return s;
        })();

        // However to be robust, read fresh state:
        let freshFile: UploadFile | undefined;
        setUploadFiles(prev => {
          freshFile = prev[i];
          return prev;
        });
        const fileItem = freshFile ?? uploadFiles[i];
        if (!fileItem) continue;

        // Skip files which are not pending (user may have removed/cancelled)
        if (fileItem.status !== 'pending') continue;

        // start upload
        updateFileAt(i, {
          status: 'uploading',
          progress: 5,
          startedAt: Date.now()
        });
        // set a timeout that marks it as stuck if takes too long
        if (fileTimeoutsRef.current[i]) {
          clearTimeout(fileTimeoutsRef.current[i]);
        }
        fileTimeoutsRef.current[i] = window.setTimeout(() => {
          // mark file as error and allow cancel
          updateFileAt(i, {
            status: 'error',
            error: 'Upload timed out. You can cancel.'
          });
        }, UPLOAD_TIMEOUT_MS);

        // Reset cancelled flag for this index
        delete cancelledRef.current[i];
        try {
          // Build storage path
          const fileExt = fileItem.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          // Keep track of storagePath so we can cleanup on cancel
          updateFileAt(i, {
            storagePath: fileName,
            progress: 10
          });

          // upload to supabase storage
          const {
            error: storageError
          } = await supabase.storage.from('files').upload(fileName, fileItem.file, {
            upsert: false
          });

          // If the file was cancelled by user while storage.upload was in-flight,
          // we try to delete the stored object (best-effort), mark cancelled in UI and skip DB insert.
          if (cancelledRef.current[i]) {
            // someone cancelled while uploading
            try {
              if (!storageError) {
                await supabase.storage.from('files').remove([fileName]);
              }
            } catch (e) {
              console.warn('Failed to cleanup after cancel', e);
            }
            updateFileAt(i, {
              status: 'cancelled',
              progress: 0,
              storagePath: undefined
            });
            // clear timeout
            if (fileTimeoutsRef.current[i]) {
              clearTimeout(fileTimeoutsRef.current[i]);
              delete fileTimeoutsRef.current[i];
            }
            continue;
          }
          if (storageError) throw storageError;

          // Storage succeeded — insert metadata to DB
          updateFileAt(i, {
            progress: 60
          });
          const {
            data: fileData,
            error: dbError
          } = await supabase.from('files').insert({
            user_id: user.id,
            original_name: fileItem.file.name,
            file_size: fileItem.file.size,
            file_type: fileItem.file.type || 'application/octet-stream',
            storage_path: fileName,
            folder_id: selectedFolderId
          }).select().single();
          if (dbError) {
            // If DB insert fails, attempt to delete the storage object so we don't leave orphan.
            try {
              await supabase.storage.from('files').remove([fileName]);
            } catch (cleanupErr) {
              console.warn('Cleanup after DB failure failed', cleanupErr);
            }
            throw dbError;
          }

          // If user cancelled after DB insert (rare), do cleanup
          if (cancelledRef.current[i]) {
            try {
              await supabase.storage.from('files').remove([fileName]);
              // also remove DB row
              if (fileData?.id) {
                await supabase.from('files').delete().eq('id', fileData.id);
              }
            } catch (cleanupErr) {
              console.warn('Cleanup after late cancel failed', cleanupErr);
            }
            updateFileAt(i, {
              status: 'cancelled',
              progress: 0,
              storagePath: undefined,
              id: undefined
            });
            if (fileTimeoutsRef.current[i]) {
              clearTimeout(fileTimeoutsRef.current[i]);
              delete fileTimeoutsRef.current[i];
            }
            continue;
          }

          // Success
          updateFileAt(i, {
            status: 'success',
            progress: 100,
            id: fileData?.id
          });
          if (fileTimeoutsRef.current[i]) {
            clearTimeout(fileTimeoutsRef.current[i]);
            delete fileTimeoutsRef.current[i];
          }
        } catch (error: any) {
          console.error('Upload error for file index', i, error);
          // If file was cancelled, we already handled; else set error
          if (!cancelledRef.current[i]) {
            updateFileAt(i, {
              status: 'error',
              error: error?.message || 'Upload failed',
              progress: 0
            });
          } else {
            updateFileAt(i, {
              status: 'cancelled',
              progress: 0
            });
          }
          if (fileTimeoutsRef.current[i]) {
            clearTimeout(fileTimeoutsRef.current[i]);
            delete fileTimeoutsRef.current[i];
          }
        }
      } // end for

      // After finishing the loop, compute summary from the latest state
      // We have to read latest uploadFiles state
      const finalSnapshot = [...uploadFiles];
      // But because setUploadFiles is async, get the current state from the hook by awaiting a microtask
      await new Promise(r => setTimeout(r, 10));
      // Now read again
      let latest: UploadFile[] = [];
      setUploadFiles(prev => {
        latest = prev;
        return prev;
      });

      // Final tallies
      const successCount = latest.filter(f => f.status === 'success').length;
      const errorCount = latest.filter(f => f.status === 'error').length;
      const cancelledCount = latest.filter(f => f.status === 'cancelled').length;
      if (successCount > 0) {
        toast({
          title: 'Upload complete',
          description: `Successfully uploaded ${successCount} file(s).`
        });
      }
      if (errorCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Some uploads failed',
          description: `${errorCount} file(s) failed. You can retry or cancel them.`
        });
      }
      if (cancelledCount > 0) {
        toast({
          title: 'Uploads cancelled',
          description: `${cancelledCount} file(s) were cancelled.`
        });
      }
    } catch (error: any) {
      console.error('Upload flow fatal error', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error?.message || 'An error occurred during upload.'
      });
    } finally {
      setIsUploading(false);
      // cleanup any remaining timers
      Object.values(fileTimeoutsRef.current).forEach(t => clearTimeout(t));
      fileTimeoutsRef.current = {};
      cancelledRef.current = {};
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const filteredFiles = uploadFiles.filter(f => f.file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button asChild variant="outline" className="font-heading icon-text bg-blue-800/30 border border-blue-600">
          <a href="/dashboard/files" className="flex items-center gap-2">
            <span className="material-icons md-18">folder</span>
            File Manager
            <span className="material-icons md-18">arrow_forward</span>
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2 backdrop-blur-md bg-inherit rounded-lg">
          <CardTitle className="font-heading">File Upload</CardTitle>
          <CardDescription className="font-body">
            Upload and manage your files. All file types are supported.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 backdrop-blur-6xl bg-transparent">
          {folders.length > 0 && <div>
              <label className="text-sm font-heading font-medium text-stone-400">
                Upload to folder (optional)
              </label>
              <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value || null)} disabled={isUploading} className="w-full p-2 border font-body bg-stone-900 rounded-xl mx-0 my-[5px]">
                <option value="">Root (No Folder)</option>
                {folders.map(folder => <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>)}
              </select>
            </div>}

          {/* Drop Zone */}
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-600 bg-blue-950/20 scale-[1.02]' : 'border-border hover:border-blue-600/50 hover:bg-blue-950/10'} ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}>
            <input {...getInputProps()} />
            <span className="material-icons md-48 mx-auto mb-2 text-muted-foreground">
              upload_file
            </span>
            <p className="font-heading text-foreground font-medium">
              Click to upload or drag and drop
            </p>
            <p className="font-body text-sm text-muted-foreground">
              Any file type is supported
            </p>
          </div>

          {uploadFiles.length > 0 && <div className="space-y-3">
              {/* Search */}
              <input type="text" placeholder="Search by file name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-blue-800/40 rounded-md bg-blue-950/20 text-sm text-white placeholder:text-neutral-400" />

              {/* Total Progress Bar (auto-hide) */}
              {isUploading && <div className="space-y-1">
                  <p className="text-xs font-body text-muted-foreground">
                    Total Progress: {totalProgress}%
                  </p>
                  <Progress value={totalProgress} className="h-2" style={{
              background: 'linear-gradient(to right, hsl(var(--functions-processing)), hsl(var(--functions-processing-glow)))'
            }} />
                </div>}

              {/* Files List Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-medium">Files to upload</h3>
                <Button onClick={handleUploadFiles} disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')} size="sm" className="bg-functions-upload hover:bg-functions-uploadGlow text-white shadow-lg transition-all duration-300">
                  {isUploading ? <>
                      <span className="material-icons md-18 animate-spin">refresh</span>
                      Uploading...
                    </> : <>
                      <span className="material-icons md-18">upload</span>
                      Upload All
                    </>}
                </Button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {filteredFiles.map((uploadFile, index) => <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-all duration-300 bg-background/50">
                    <div>
                      {uploadFile.status === 'pending' && <File className="h-4 w-4 text-muted-foreground" />}
                      {uploadFile.status === 'uploading' && <CircleNotch className="h-4 w-4 text-primary animate-spin" />}
                      {uploadFile.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                      {uploadFile.status === 'error' && <Warning className="h-4 w-4 text-destructive" />}
                      {uploadFile.status === 'cancelled' && <span className="text-xs font-heading text-muted-foreground">⨯</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading truncate">{uploadFile.file.name}</p>
                      <p className="text-xs font-body text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>

                      {/* Per-file progress */}
                      <div className="mt-1">
                        <Progress value={uploadFile.progress} className="h-1.5" />
                      </div>

                      {uploadFile.error && <p className="text-xs font-body text-functions-delete mt-1">
                          {uploadFile.error}
                        </p>}
                    </div>

                    <Badge variant={uploadFile.status === 'success' ? 'secondary' : uploadFile.status === 'error' ? 'destructive' : uploadFile.status === 'cancelled' ? 'outline' : 'outline'} className="capitalize text-xs font-heading">
                      {uploadFile.status}
                    </Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {uploadFile.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="hover:text-functions-delete">
                          <span className="material-icons md-18">close</span>
                        </Button>}

                      {uploadFile.status === 'uploading' && <>
                          <Button variant="ghost" size="sm" onClick={() => cancelFileUpload(index)} className="hover:text-functions-delete">
                            <span className="material-icons md-18">pause_circle</span>
                          </Button>
                        </>}

                      {(uploadFile.status === 'error' || uploadFile.status === 'cancelled') && <>
                          <Button variant="ghost" size="sm" onClick={() => retryFile(index)} className="hover:text-functions-delete">
                            <span className="material-icons md-18">replay</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="hover:text-functions-delete">
                            <span className="material-icons md-18">delete</span>
                          </Button>
                        </>}
                    </div>
                  </div>)}
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
};