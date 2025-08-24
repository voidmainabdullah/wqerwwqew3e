import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload,
  File,
  X,
  CheckCircle,
  Warning,
  CircleNotch,
  ArrowRight
} from 'phosphor-react';

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (!user || uploadFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Check storage quota before upload
      const totalFileSize = uploadFiles.reduce((sum, file) => sum + file.file.size, 0);
      
      const { data: canUpload, error: quotaError } = await supabase.rpc('check_storage_quota', {
        p_user_id: user.id,
        p_file_size: totalFileSize
      });

      if (quotaError) throw quotaError;

      if (!canUpload) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used, storage_limit, subscription_tier')
          .eq('id', user.id)
          .single();

        const formatFileSize = (bytes: number): string => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        toast({
          variant: "destructive",
          title: "Storage limit exceeded",
          description: `You've used ${formatFileSize(profile?.storage_used || 0)} of your ${formatFileSize(profile?.storage_limit || 0)} storage limit. Upgrade to Pro for unlimited storage.`,
        });
        setIsUploading(false);
        return;
      }

      // Upload files one by one
      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        
        if (uploadFile.status !== 'pending') continue;

        try {
          // Update status to uploading
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'uploading' as const } : f
          ));

          // Create unique file path
          const fileExt = uploadFile.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          // Upload to Supabase Storage
          const { data: storageData, error: storageError } = await supabase.storage
            .from('files')
            .upload(fileName, uploadFile.file);

          if (storageError) throw storageError;

          // Save file metadata to database
          const { data: fileData, error: dbError } = await supabase
            .from('files')
            .insert({
              user_id: user.id,
              original_name: uploadFile.file.name,
              file_size: uploadFile.file.size,
              file_type: uploadFile.file.type || 'application/octet-stream',
              storage_path: fileName,
            })
            .select()
            .single();

          if (dbError) throw dbError;

          // Storage is automatically updated by database trigger
          // No need to manually update upload counts

          // Mark as success
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success' as const, progress: 100, id: fileData.id } : f
          ));

        } catch (error: any) {
          console.error('Upload error:', error);
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error' as const, 
              error: error.message || 'Upload failed' 
            } : f
          ));
        }
      }

      const successCount = uploadFiles.filter(f => f.status === 'success').length;
      if (successCount > 0) {
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${successCount} file(s).`,
        });
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
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

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return <CircleNotch className="h-4 w-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <Warning className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
          <p className="text-muted-foreground">
            Drag and drop files or click to select files to upload.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/dashboard/files" className="flex items-center gap-2">
            Go to My Files
            <ArrowRight size={16} />
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Upload files to share with others. All file types are supported.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 transform ${
              isDragActive 
                ? 'border-functions-upload bg-functions-upload/10 scale-[1.02] shadow-lg shadow-functions-uploadGlow/20' 
                : 'border-border hover:border-functions-upload/50 hover:bg-functions-upload/5'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors duration-300 ${
              isDragActive ? 'text-functions-upload animate-bounce-subtle' : 'text-muted-foreground'
            }`} />
            {isDragActive ? (
              <p className="text-functions-upload font-medium animate-pulse">Drop the files here...</p>
            ) : (
              <div className="animate-fade-in">
                <p className="text-foreground font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-muted-foreground text-sm">
                  Any file type is supported
                </p>
              </div>
            )}
          </div>

          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Files to upload</h3>
                <Button
                  onClick={handleUploadFiles}
                  disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')}
                  size="sm"
                  className="bg-functions-upload hover:bg-functions-uploadGlow text-white shadow-lg hover:shadow-functions-uploadGlow/30 transition-all duration-300 animate-bounce-subtle"
                >
                  {isUploading ? (
                    <>
                      <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                      <span className="animate-pulse">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {uploadFiles.map((uploadFile, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg transition-all duration-300 hover:shadow-md animate-fade-in" 
                       style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`transition-colors duration-300 ${
                      uploadFile.status === 'uploading' ? 'animate-glow text-functions-processing' :
                      uploadFile.status === 'success' ? 'text-functions-success' :
                      uploadFile.status === 'error' ? 'text-functions-delete' : ''
                    }`}>
                      {getStatusIcon(uploadFile.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-1 animate-pulse">
                          <Progress 
                            value={uploadFile.progress} 
                            className="h-2"
                            style={{
                              background: 'linear-gradient(to right, hsl(var(--functions-processing)), hsl(var(--functions-processing-glow)))'
                            }}
                          />
                        </div>
                      )}
                      
                      {uploadFile.error && (
                        <p className="text-xs text-functions-delete mt-1 animate-fade-in">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>

                    <Badge variant={
                      uploadFile.status === 'success' ? 'default' :
                      uploadFile.status === 'error' ? 'destructive' :
                      uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                    } className={`transition-all duration-300 ${
                      uploadFile.status === 'success' ? 'bg-functions-success hover:bg-functions-successGlow animate-bounce-subtle' :
                      uploadFile.status === 'uploading' ? 'bg-functions-processing animate-pulse' :
                      uploadFile.status === 'error' ? 'bg-functions-delete' : ''
                    }`}>
                      {uploadFile.status}
                    </Badge>

                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="hover:text-functions-delete hover:bg-functions-delete/10 transition-colors duration-300"
                      >
                        <X className="h-4 w-4" />
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