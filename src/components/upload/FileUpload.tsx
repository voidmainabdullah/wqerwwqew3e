import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  id?: string;
}

export const FileUpload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) fetchFolders();
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name', { ascending: true });
      if (error) throw error;
      setFolders(data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalProgress = useMemo(() => {
    if (uploadFiles.length === 0) return 0;
    const total = uploadFiles.reduce((sum, f) => sum + f.progress, 0);
    return Math.round(total / uploadFiles.length);
  }, [uploadFiles]);

  const handleUploadFiles = async () => {
    if (!user || uploadFiles.length === 0) return;
    setIsUploading(true);
    try {
      const totalFileSize = uploadFiles.reduce((sum, file) => sum + file.file.size, 0);
      const { data: canUpload, error: quotaError } = await supabase.rpc('check_storage_quota', {
        p_user_id: user.id,
        p_file_size: totalFileSize,
      });
      if (quotaError) throw quotaError;

      if (!canUpload) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used, storage_limit, subscription_tier')
          .eq('id', user.id)
          .maybeSingle();

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
          description: `You've used ${formatFileSize(
            profile?.storage_used || 0
          )} of your ${formatFileSize(profile?.storage_limit || 0)} storage limit.`,
        });
        setIsUploading(false);
        return;
      }

      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        if (uploadFile.status !== 'pending') continue;

        setUploadFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading', progress: 50 } : f))
        );

        try {
          const fileExt = uploadFile.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

          const { error: storageError } = await supabase.storage
            .from('files')
            .upload(fileName, uploadFile.file, {
              upsert: false,
            });
          if (storageError) throw storageError;

          const { data: fileData, error: dbError } = await supabase
            .from('files')
            .insert({
              user_id: user.id,
              original_name: uploadFile.file.name,
              file_size: uploadFile.file.size,
              file_type: uploadFile.file.type || 'application/octet-stream',
              storage_path: fileName,
              folder_id: selectedFolderId,
            })
            .select()
            .single();
          if (dbError) throw dbError;

          setUploadFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'success', progress: 100, id: fileData.id } : f
            )
          );
        } catch (error: any) {
          console.error('Upload error:', error);
          setUploadFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: 'error', error: error.message || 'Upload failed' }
                : f
            )
          );
        }
      }

      const successCount = uploadFiles.filter((f) => f.status === 'success').length;
      if (successCount > 0)
        toast({
          title: 'Upload complete',
          description: `Successfully uploaded ${successCount} file(s).`,
        });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = uploadFiles.filter((f) =>
    f.file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button
          asChild
          variant="outline"
          className="font-heading icon-text bg-blue-800/30 border border-blue-600"
        >
          <a href="/dashboard/files" className="flex items-center gap-2">
            <span className="material-icons md-18">folder</span>
            File Manager
            <span className="material-icons md-18">arrow_forward</span>
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading">File Upload</CardTitle>
          <CardDescription className="font-body">
            Upload and manage your files. All file types are supported.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {folders.length > 0 && (
            <div>
              <label className="text-sm font-heading font-medium">
                Upload to folder (optional)
              </label>
              <select
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full p-2 border border-input bg-background rounded-md font-body"
                disabled={isUploading}
              >
                <option value="">Root (No Folder)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-600 bg-blue-950/20 scale-[1.02]'
                : 'border-border hover:border-blue-600/50 hover:bg-blue-950/10'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
          >
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

          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-blue-800/40 rounded-md bg-blue-950/20 text-sm text-white placeholder:text-neutral-400"
              />

              {/* Total Progress Bar (auto-hide) */}
              {isUploading && (
                <div className="space-y-1">
                  <p className="text-xs font-body text-muted-foreground">
                    Total Progress: {totalProgress}%
                  </p>
                  <Progress
                    value={totalProgress}
                    className="h-2"
                    style={{
                      background:
                        'linear-gradient(to right, hsl(var(--functions-processing)), hsl(var(--functions-processing-glow)))',
                    }}
                  />
                </div>
              )}

              {/* Files List */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-medium">Files to upload</h3>
                <Button
                  onClick={handleUploadFiles}
                  disabled={isUploading || uploadFiles.every((f) => f.status !== 'pending')}
                  size="sm"
                  className="bg-functions-upload hover:bg-functions-uploadGlow text-white shadow-lg transition-all duration-300"
                >
                  {isUploading ? (
                    <>
                      <span className="material-icons md-18 animate-spin">refresh</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-icons md-18">upload</span>
                      Upload All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {filteredFiles.map((uploadFile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-all duration-300 bg-background/50"
                  >
                    <div>
                      {uploadFile.status === 'pending' && (
                        <File className="h-4 w-4 text-muted-foreground" />
                      )}
                      {uploadFile.status === 'uploading' && (
                        <CircleNotch className="h-4 w-4 text-primary animate-spin" />
                      )}
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {uploadFile.status === 'error' && (
                        <Warning className="h-4 w-4 text-destructive" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs font-body text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>

                      {uploadFile.status === 'uploading' && (
                        <div className="mt-1">
                          <Progress value={uploadFile.progress} className="h-1.5" />
                        </div>
                      )}
                      {uploadFile.error && (
                        <p className="text-xs font-body text-functions-delete mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant={
                        uploadFile.status === 'success'
                          ? 'secondary'
                          : uploadFile.status === 'error'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="capitalize text-xs font-heading"
                    >
                      {uploadFile.status}
                    </Badge>

                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="hover:text-functions-delete"
                      >
                        <span className="material-icons md-18">close</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
