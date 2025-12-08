import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, FileText, User, Mail } from 'lucide-react';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ReceiveRequest {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export const ReceiveUploadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [receiveRequest, setReceiveRequest] = useState<ReceiveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    loadReceiveRequest();
  }, [token]);

  const loadReceiveRequest = async () => {
    if (!token) {
      navigate('/404');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('receive_requests')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          variant: 'destructive',
          title: 'Invalid Link',
          description: 'This receive link does not exist or has expired.',
        });
        navigate('/404');
        return;
      }

      setReceiveRequest(data);
    } catch (error: any) {
      console.error('Error loading receive request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load receive request.',
      });
      navigate('/404');
    } finally {
      setLoading(false);
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
    disabled: isUploading || uploadComplete,
  });

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!receiveRequest || uploadFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        if (uploadFile.status !== 'pending') continue;

        setUploadFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading', progress: 30 } : f))
        );

        try {
          const fileExt = uploadFile.file.name.split('.').pop();
          const fileName = `received/${receiveRequest.user_id}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

          // Upload to storage (anonymous upload to received folder)
          const { error: storageError } = await supabase.storage
            .from('files')
            .upload(fileName, uploadFile.file, { upsert: false });

          if (storageError) throw storageError;

          setUploadFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: 60 } : f))
          );

          // Use RPC function to create file record, link, and notification (bypasses RLS)
          const { data: fileId, error: rpcError } = await supabase.rpc('create_received_file', {
            p_receive_request_id: receiveRequest.id,
            p_original_name: uploadFile.file.name,
            p_file_size: uploadFile.file.size,
            p_file_type: uploadFile.file.type || 'application/octet-stream',
            p_storage_path: fileName,
            p_uploader_name: uploaderName || null,
            p_uploader_email: uploaderEmail || null,
          });

          if (rpcError) throw rpcError;

          setUploadFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: 80 } : f))
          );

          setUploadFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'success', progress: 100 } : f))
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
      if (successCount > 0) {
        setUploadComplete(true);
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${successCount} file(s)!`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Files Uploaded Successfully!</CardTitle>
              <CardDescription>
                Your files have been securely delivered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Thank you for sharing your files. The recipient will be notified.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Upload More Files
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        className="max-w-3xl mx-auto py-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{receiveRequest?.name}</CardTitle>
            {receiveRequest?.description && (
              <CardDescription className="text-base">
                {receiveRequest.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="uploaderName">Your Name (optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="uploaderName"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="Enter your name"
                    className="pl-9"
                    disabled={isUploading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="uploaderEmail">Your Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="uploaderEmail"
                    type="email"
                    value={uploaderEmail}
                    onChange={(e) => setUploaderEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-9"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Click or drag files to upload'}
              </p>
              <p className="text-sm text-muted-foreground">
                Any file type is supported
              </p>
            </div>

            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Files to upload ({uploadFiles.length})</h3>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || uploadFiles.every((f) => f.status !== 'pending')}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload All
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadFiles.map((uploadFile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                    >
                      <div>
                        {uploadFile.status === 'pending' && (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        {uploadFile.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                        )}
                        {uploadFile.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>

                        {uploadFile.status === 'uploading' && (
                          <Progress value={uploadFile.progress} className="h-1.5 mt-2" />
                        )}
                        {uploadFile.error && (
                          <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                        )}
                      </div>

                      {uploadFile.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Files will be securely uploaded and only accessible by the requester</p>
        </div>
      </motion.div>
    </div>
  );
};
