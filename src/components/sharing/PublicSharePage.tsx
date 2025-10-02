import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Lock, Warning, FileText } from 'phosphor-react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageFooter } from '@/components/ui/page-footer';
import Logo from '@/components/Logo';

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
  message: string | null;
  file: {
    original_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    is_locked: boolean;
    is_public: boolean;
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
      const { data, error } = await supabase
        .from('shared_links')
        .select(`
          *,
          file:files(
            original_name,
            file_size,
            file_type,
            storage_path,
            is_locked,
            is_public
          )
        `)
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Share link not found or has expired');
        return;
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
      if (data.password_hash || data.file.is_locked) {
        setPasswordRequired(true);
      }
    } catch (error: any) {
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

      // Use the database function to properly validate password
      const { data, error } = await supabase.rpc('validate_share_password', {
        token: token,
        password: password
      });

      if (error) throw error;
      
      if (data === true) {
        setPasswordRequired(false);
        toast({
          title: "Access granted",
          description: "Password verified successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please check your password and try again",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const downloadFile = async () => {
    if (!shareData) return;

    // Check if file is locked or password is required
    if ((shareData.file.is_locked || shareData.password_hash) && passwordRequired) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter the password to access this file",
      });
      return;
    }

    // Final check for download limits before starting download
    if (shareData.download_limit && shareData.download_count >= shareData.download_limit) {
      toast({
        variant: "destructive",
        title: "Download limit exceeded",
        description: "This file has reached its maximum download limit",
      });
      return;
    }

    setDownloading(true);
    try {
      const { data: fileData, error } = await supabase.storage
        .from('files')
        .download(shareData.file.storage_path);

      if (error) throw error;

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
      await supabase.from('download_logs').insert({
        file_id: shareData.file_id,
        shared_link_id: shareData.id,
        download_method: 'shared_link',
        downloader_ip: null, // Could be implemented with IP detection
        downloader_user_agent: navigator.userAgent,
      });

      // Update download count
      await supabase
        .from('shared_links')
        .update({ download_count: shareData.download_count + 1 })
        .eq('id', shareData.id);

      toast({
        title: "Download started",
        description: "Your file download has begun",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message,
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
        <LoadingSpinner size="lg" text="Loading share link..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative">
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>
        
        <div className="relative z-10 p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <Card className="w-full max-w-md backdrop-blur-md bg-card/95 border border-border/60 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="material-icons md-48 mx-auto mb-4 text-destructive">warning</span>
              <h2 className="text-lg font-heading font-semibold mb-2">Access Denied</h2>
              <p className="font-body text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
        </div>
        
        <PageFooter className="relative z-10" />
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative">
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>
        
        <div className="relative z-10 p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <Card className="w-full max-w-md backdrop-blur-md bg-card/95 border border-border/60 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="material-icons md-48 mx-auto mb-4 text-muted-foreground">link_off</span>
              <h2 className="text-lg font-heading font-semibold mb-2">Share Link Not Found</h2>
              <p className="font-body text-muted-foreground">This share link does not exist or has been deactivated.</p>
            </div>
          </CardContent>
        </Card>
        </div>
        
        <PageFooter className="relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      
      {/* Header with Logo */}
      <div className="relative z-10 p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Logo />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md backdrop-blur-md bg-card/95 border border-border/60 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-icons md-36 text-primary">description</span>
          </div>
          <CardTitle className="font-heading">Shared File</CardTitle>
          <CardDescription className="font-body">
            Someone has shared a file with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-heading font-medium text-lg">{shareData.file.original_name}</h3>
            <p className="text-sm font-body text-muted-foreground">
              {formatFileSize(shareData.file.file_size)} • {shareData.file.file_type}
            </p>
            
            {shareData.message && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm font-body text-blue-800 dark:text-blue-200">{shareData.message}</p>
              </div>
            )}
            
            {shareData.expires_at && (
              <p className="text-xs font-body text-muted-foreground">
                Expires: {new Date(shareData.expires_at).toLocaleDateString()}
              </p>
            )}
            
            {shareData.download_limit && (
              <p className="text-xs font-body text-muted-foreground">
                Downloads: {shareData.download_count}/{shareData.download_limit}
              </p>
            )}
          </div>

          {shareData.password_hash && (
            <Alert>
              <span className="material-icons md-18">lock</span>
              <AlertDescription>
                This file is password protected
              </AlertDescription>
            </Alert>
          )}

          {passwordRequired && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-heading">Enter Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="font-body"
                  onKeyPress={(e) => e.key === 'Enter' && validatePassword()}
                />
                <Button onClick={validatePassword} size="sm" className="font-heading">
                  Unlock
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={downloadFile} 
            disabled={downloading || passwordRequired}
            className="w-full h-12 font-heading icon-text"
          >
            {downloading ? (
              <>
                <LoadingSpinner size="sm" showText={false} className="mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <span className="material-icons md-18">download</span>
                Download File
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </div>
      
      {/* Footer */}
      <PageFooter className="relative z-10" />
      </div>
     
  );
};