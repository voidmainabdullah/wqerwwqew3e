import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SharedFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  download_count: number;
  is_locked: boolean;
}

export default function CodePage() {
  const [shareCode, setShareCode] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<SharedFile | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeSubmit = async () => {
    if (!shareCode.trim()) {
      toast.error('Please enter a share code');
      return;
    }

    setIsLoading(true);
    try {
      // Find the file by share code directly from files table
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('id, original_name, file_size, file_type, storage_path, download_count, is_locked')
        .eq('share_code', shareCode.trim().toUpperCase())
        .single();

      if (fileError || !fileData) {
        toast.error('Invalid share code or file not found');
        return;
      }

      // Check if file is locked (password protected)
      if (fileData.is_locked && !password) {
        setRequiresPassword(true);
        toast.error('This file is password protected');
        return;
      }

      // Validate password if file is locked and password provided
      if (fileData.is_locked && password) {
        // Find the shared link to validate password
        const { data: sharedLink } = await supabase
          .from('shared_links')
          .select('password_hash, share_token')
          .eq('file_id', fileData.id)
          .not('password_hash', 'is', null)
          .maybeSingle();

        if (sharedLink?.password_hash) {
          const { data: isValidPassword } = await supabase.rpc('validate_share_password', {
            token: sharedLink.share_token,
            password: password
          });

          if (!isValidPassword) {
            toast.error('Incorrect password');
            return;
          }
        } else {
          // If no shared link with password found, but file is locked, deny access
          toast.error('This file requires a password but no password protection is configured');
          return;
        }
      }

      setFile(fileData);
      setRequiresPassword(false);
    } catch (error: any) {
      console.error('Code lookup error:', error);
      toast.error('Failed to retrieve file: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!file) return;

    try {
      const { data } = await supabase.storage
        .from('files')
        .createSignedUrl(file.storage_path, 60);
      
      if (data) {
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = file.original_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log the download
        await supabase
          .from('download_logs')
          .insert({
            file_id: file.id,
            download_method: 'code_share'
          });

        toast.success('File download started');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setShareCode('');
    setPassword('');
    setFile(null);
    setRequiresPassword(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Hash className="h-6 w-6" />
            Access File with Code
          </CardTitle>
          <CardDescription>
            Enter the share code to access your file
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!file ? (
            <>
              <div>
                <Label htmlFor="shareCode">Share Code</Label>
                <Input
                  id="shareCode"
                  placeholder="Enter 8-character code"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="font-mono tracking-wider text-center"
                />
              </div>

              {requiresPassword && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter file password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={handleCodeSubmit} 
                disabled={isLoading || !shareCode.trim()}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Access File'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{file.original_name}</h3>
                <p className="text-muted-foreground">
                  {formatFileSize(file.file_size)} • {file.download_count} downloads
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadFile} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  New Code
                </Button>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <Button variant="link" asChild className="text-sm">
              <a href="/">← Back to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}