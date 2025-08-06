import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Lock, AlertCircle, FileText, Key } from 'lucide-react';

interface FileData {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_locked: boolean;
  share_code: string;
}

export const CodeSharePage: React.FC = () => {
  const { toast } = useToast();
  const [shareCode, setShareCode] = useState('');
  const [password, setPassword] = useState('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const fetchFileByCode = async () => {
    if (!shareCode.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a valid share code",
      });
      return;
    }

    if (shareCode.trim().length !== 8) {
      toast({
        variant: "destructive",
        title: "Invalid code format",
        description: "Share codes must be exactly 8 characters long",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for file with share code:', shareCode.trim().toUpperCase());

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('share_code', shareCode.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching file by code:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      if (!data) {
        console.log('No file found with share code:', shareCode.trim().toUpperCase());
        toast({
          variant: "destructive",
          title: "File not found",
          description: "No file found with this share code",
        });
        return;
      }

      // Check if file has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          variant: "destructive",
          title: "File expired",
          description: "This file has expired and is no longer available",
        });
        return;
      }

      // Check download limit
      if (data.download_limit && data.download_count >= data.download_limit) {
        toast({
          variant: "destructive",
          title: "Download limit reached",
          description: "This file has reached its download limit",
        });
        return;
      }

      setFileData(data);
      
      // Check if file is locked
      if (data.is_locked) {
        setPasswordRequired(true);
      }

      console.log('File found successfully:', data.original_name);
      toast({
        title: "File found",
        description: `Found: ${data.original_name}`,
      });
    } catch (error: any) {
      console.error('File search failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to search for file. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!fileData) return;

    // Check if file is locked and password is required
    if (fileData.is_locked && passwordRequired && !password.trim()) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter the password to unlock this file",
      });
      return;
    }

    setDownloading(true);
    try {
      console.log('Starting download for file:', fileData.original_name);

      // If file is locked, validate password first
      if (fileData.is_locked && password.trim()) {
        // First get the file's password hash by checking if it has a share link with password
        const { data: shareLink, error: shareLinkError } = await supabase
          .from('shared_links')
          .select('password_hash, share_token')
          .eq('file_id', fileData.id)
          .not('password_hash', 'is', null)
          .maybeSingle();

        if (shareLinkError && shareLinkError.code !== 'PGRST116') {
          console.error('Error checking share link:', shareLinkError);
          throw new Error('Failed to verify password requirements');
        }

        if (shareLink?.password_hash) {
          console.log('Validating password for locked file');
          // Validate password using the database function
          const { data: isValid, error: validateError } = await supabase.rpc('validate_share_password', {
            token: shareLink.share_token,
            password: password
          });

          if (validateError) {
            console.error('Password validation error:', validateError);
            throw new Error('Password validation failed');
          }

          if (!isValid) {
            console.log('Invalid password provided for locked file');
            toast({
              variant: "destructive",
              title: "Invalid password",
              description: "The password you entered is incorrect",
            });
            setDownloading(false);
            return;
          }
          console.log('Password validated successfully');
        }
      }

      const { data: fileBlob, error } = await supabase.storage
        .from('files')
        .download(fileData.storage_path);

      if (error) {
        console.error('Storage download error:', error);
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!fileBlob) {
        throw new Error('File data not available');
      }

      // Create download link
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the download
      const { error: logError } = await supabase.from('download_logs').insert({
        file_id: fileData.id,
        shared_link_id: null,
        download_method: 'share_code',
        downloader_ip: null,
        downloader_user_agent: navigator.userAgent,
      });

      if (logError) {
        console.warn('Failed to log download:', logError);
        // Don't fail download for logging issues
      }

      // Update file download count
      const { error: updateError } = await supabase
        .from('files')
        .update({ download_count: (fileData as any).download_count + 1 })
        .eq('id', fileData.id);

      if (updateError) {
        console.warn('Failed to update download count:', updateError);
        // Don't fail download for count update issues
      }

      console.log('File downloaded successfully via share code:', fileData.original_name);
      toast({
        title: "Download started",
        description: "Your file download has begun",
      });

      setPasswordRequired(false);
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Unable to download file. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Key className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle>Access File with Code</CardTitle>
          <CardDescription>
            Enter the share code to access the file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareCode">Share Code</Label>
            <div className="flex space-x-2">
              <Input
                id="shareCode"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="font-mono"
                onKeyPress={(e) => e.key === 'Enter' && fetchFileByCode()}
              />
              <Button onClick={fetchFileByCode} disabled={loading} size="sm">
                {loading ? 'Finding...' : 'Find'}
              </Button>
            </div>
          </div>

          {fileData && (
            <div className="space-y-4">
              <div className="text-center space-y-2 p-4 bg-muted rounded-lg">
                <FileText className="mx-auto h-8 w-8 text-primary" />
                <h3 className="font-medium">{fileData.original_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(fileData.file_size)} • {fileData.file_type}
                </p>
              </div>

              {fileData.is_locked && (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    This file is password protected
                  </AlertDescription>
                </Alert>
              )}

              {passwordRequired && (
                <div className="space-y-2">
                  <Label htmlFor="password">Enter Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === 'Enter' && downloadFile()}
                  />
                </div>
              )}

              <Button 
                onClick={downloadFile} 
                disabled={downloading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download File'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};