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
      const totalFileSize = uploadFiles.reduce((sum, file) => sum + file.file.size, 0);
      const { data: canUpload, error: quotaError } = await supabase.rpc('check_storage_quota', {
        p_user_id: user.id,
        p_file_size: totalFileSize
      });

      if (quotaError) throw quotaError;

      if (!canUpload) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used, storage_limit')
          .eq('id', user.id)
          .single();

        const formatFileSize = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        toast({
          variant: "destructive",
          title: "Storage limit exceeded",
          description: `You've used ${formatFileSize(profile?.storage_used || 0)} of your ${formatFileSize(profile?.storage_limit || 0)} storage limit.`,
        });
        setIsUploading(false);
        return;
      }

      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        if (uploadFile.status !== 'pending') continue;

        try {
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'uploading' } : f
          ));

          const fileExt = uploadFile.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          const { error: storageError } = await supabase.storage
            .from('files')
            .upload(fileName, uploadFile.file);

          if (storageError) throw storageError;

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

          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success', progress: 100, id: fileData.id } : f
          ));

        } catch (error: any) {
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'error', error: error.message || 'Upload failed' } : f
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
      case 'pending': return <File className="h-4 w-4 text-muted-foreground" />;
      case 'uploading': return <CircleNotch className="h-4 w-4 text-primary animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <Warning className="h-4 w-4 text-red-500" />;
    }
  };
// src/components/sharing/CodeSharePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lock, FileText, Key, ArrowLeft } from 'phosphor-react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedIcon } from '@/components/ui/animated-icons';

export const CodeSharePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`console.log("Hello World");`);
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'snippet.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLock = () => {
    if (!password) {
      alert('Please set a password before locking');
      return;
    }
    setIsLocked(true);
  };

  const handleUnlock = () => {
    const entered = prompt('Enter password to unlock:');
    if (entered === password) {
      setIsLocked(false);
    } else {
      alert('Incorrect password!');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 to-black text-white flex flex-col">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm hover:text-blue-400 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-xl font-semibold">Code Share</h1>
        <div />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-6 grid md:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="flex flex-col">
          <textarea
            className="flex-1 w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLocked}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Download size={16} /> Download
            </button>

            {!isLocked ? (
              <button
                onClick={handleLock}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Lock size={16} /> Lock
              </button>
            ) : (
              <button
                onClick={handleUnlock}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Key size={16} /> Unlock
              </button>
            )}
          </div>

          {!isLocked && (
            <input
              type="password"
              placeholder="Set password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-3 w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          )}
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center bg-slate-900/40 border border-white/10 rounded-xl p-6 text-center">
          <AnimatedIcon />
          <p className="text-sm text-gray-400 mt-4">
            Share and protect your code snippets easily.
          </p>
        </div>
      </div>
    </div>
  );
};
