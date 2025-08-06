import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Lock, AlertCircle, FileText } from 'lucide-react';

interface ShareData {
  id: string;
  file_id: string;
  share_token: string;
  link_type: string;
  download_count: number;
  download_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  password_hash: string | null;
  file: {
    original_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    is_locked: boolean;
  };
}

export const PublicSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchShareData();
    }
  }, [token]);

  const fetchShareData = async () => {
    try {
      if (!token) {
        setError('Invalid share link');
        return;
      }

      const { data, error } = await supabase
        .from('shared_links')
        .select(`
          *,
          file:files(
            original_name,
            file_size,
            file_type,
            storage_path,
            is_locked
          )
        `)
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching share data:', error);
        throw new Error(`Failed to load share link: ${error.message}`);
      }

      if (!data) {
        setError('Share link not found or has expired');
        return;
      }
      }

      // Check if link has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('This share link has expired');
        return;
      }

      // Check download limit
      if (data.download_limit && data.download_count >= data.download_limit) {
        setError('Download limit exceeded for this file');
        return;
      }

      setShareData(data);
      
      // Check if password is required
      if (data.password_hash) {
        setPasswordRequired(true);
      }

      console.log('Share data loaded successfully:', data.file.original_name);
    } catch (error: any) {
      console.error('Failed to fetch share data:', error);
      setError(error.message || 'Failed to load share link');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = async () => {
    if (!token || !password) return;

    try {
      if (!shareData?.password_hash) {
        setPasswordRequired(false);
        return;
      }

      console.log('Validating password for share token:', token);

      // Use the database function to properly validate password
      const { data, error } = await supabase.rpc('validate_share_password', {
        token: token,
        password: password
      });

      if (error) {
        console.error('Password validation error:', error);
        throw new Error(`Password validation failed: ${error.message}`);
      }
      
      if (data === true) {
        setPasswordRequired(false);
        console.log('Password validated successfully');
        toast({
          title: "Access granted",
          description: "Password verified successfully",
        });
      } else {
        console.log('Invalid password provided');
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please check your password and try again",
        });
      }
    } catch (error: any) {
      console.error('Password validation failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Password validation failed",
      });
    }
  };

  const downloadFile = async () => {
    if (!shareData) return;

    // Check if file is locked and password is required
    if (shareData.file.is_locked && passwordRequired) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter the password to unlock this file",
      });
      return;
    }

    setDownloading(true);
    try {
      console.log('Starting download for file:', shareData.file.original_name);

      const { data: fileData, error } = await supabase.storage
        .from('files')
        .download(shareData.file.storage_path);

      if (error) {
        console.error('Storage download error:', error);
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!fileBlob) {
        throw new Error('File data not available');
      }

      // Create download link
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = shareData.file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the download
      const { error: logError } = await supabase.from('download_logs').insert({
        file_id: shareData.file_id,
        shared_link_id: shareData.id,
        download_method: 'shared_link',
        downloader_ip: null, // Could be implemented with IP detection
        downloader_user_agent: navigator.userAgent,
      });

      if (logError) {
        console.warn('Failed to log download:', logError);
        // Don't fail download for logging issues
      }

      // Update download count
      const { error: updateError } = await supabase
        .from('shared_links')
        .update({ download_count: shareData.download_count + 1 })
        .eq('id', shareData.id);

      if (updateError) {
        console.warn('Failed to update download count:', updateError);
        // Don't fail download for count update issues
      }

      console.log('File downloaded successfully:', shareData.file.original_name);
      toast({
        title: "Download started",
        description: "Your file download has begun",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading share link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Share Link Not Found</h2>
              <p className="text-muted-foreground">This share link does not exist or has been deactivated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileText className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle>Shared File</CardTitle>
          <CardDescription>
            Someone has shared a file with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-lg">{shareData.file.original_name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(shareData.file.file_size)} • {shareData.file.file_type}
            </p>
            
            {shareData.expires_at && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(shareData.expires_at).toLocaleDateString()}
              </p>
            )}
            
            {shareData.download_limit && (
              <p className="text-xs text-muted-foreground">
                Downloads: {shareData.download_count}/{shareData.download_limit}
              </p>
            )}
          </div>

          {shareData.file.is_locked && (
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
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && validatePassword()}
                />
                <Button onClick={validatePassword} size="sm">
                  Unlock
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={downloadFile} 
            disabled={downloading || passwordRequired}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Downloading...' : 'Download File'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};