import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Lock, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharedFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
}

interface SharedLink {
  id: string;
  share_token: string;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  password_hash: string | null;
  is_active: boolean;
  files: SharedFile;
}

export const PublicSharePage = () => {
  const { token } = useParams<{ token: string }>();
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchSharedLink();
    }
  }, [token]);

  const fetchSharedLink = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shared_links')
        .select(`
          *,
          files!inner(*)
        `)
        .eq('share_token', token)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching shared link:', error);
        toast({
          title: "Error",
          description: "Shared link not found or expired.",
          variant: "destructive",
        });
        return;
      }

      setSharedLink(data);
      setIsPasswordRequired(!!data.password_hash);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load shared link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = async () => {
    if (!token || !password) return false;

    try {
      const { data, error } = await supabase.rpc('validate_share_password', {
        token,
        password
      });

      if (error) {
        console.error('Password validation error:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!sharedLink) return;

    // Check if password is required and validate it
    if (isPasswordRequired) {
      const isValidPassword = await validatePassword();
      if (!isValidPassword) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }
    }

    // Check if download limit is reached
    if (sharedLink.download_limit && sharedLink.download_count >= sharedLink.download_limit) {
      toast({
        title: "Download Limit Reached",
        description: "This file has reached its download limit.",
        variant: "destructive",
      });
      return;
    }

    // Check if link has expired
    if (sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date()) {
      toast({
        title: "Link Expired",
        description: "This shared link has expired.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloading(true);

      // Download the file from storage
      const { data, error } = await supabase.storage
        .from('files')
        .download(sharedLink.files.storage_path);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: "Failed to download the file.",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = sharedLink.files.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the download
      await supabase
        .from('download_logs')
        .insert({
          file_id: sharedLink.files.id,
          shared_link_id: sharedLink.id,
          download_method: 'public_share',
          downloader_user_agent: navigator.userAgent,
        });

      toast({
        title: "Download Started",
        description: "Your file download has started.",
      });

      // Refresh the shared link data to update download count
      fetchSharedLink();
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the file.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (!sharedLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">File Not Found</h2>
            <p className="text-muted-foreground">
              This shared link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5" />
            Shared File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-lg break-words">
              {sharedLink.files.original_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(sharedLink.files.file_size)} • {sharedLink.files.file_type}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Downloads:</span>
              <span>{sharedLink.download_count}</span>
              {sharedLink.download_limit && (
                <span className="text-muted-foreground">/ {sharedLink.download_limit}</span>
              )}
            </div>
            {sharedLink.expires_at && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-xs">
                  {new Date(sharedLink.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {isPasswordRequired && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Password required</span>
              </div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
              />
            </div>
          )}

          <Button
            onClick={handleDownload}
            disabled={isDownloading || (isPasswordRequired && !password)}
            className="w-full"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </>
            )}
          </Button>

          {sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date() && (
            <p className="text-sm text-destructive text-center">
              This link has expired
            </p>
          )}

          {sharedLink.download_limit && sharedLink.download_count >= sharedLink.download_limit && (
            <p className="text-sm text-destructive text-center">
              Download limit reached
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};