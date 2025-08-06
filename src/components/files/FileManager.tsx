import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Share, 
  Trash2, 
  Lock, 
  Unlock, 
  Copy, 
  Mail, 
  Eye, 
  EyeOff,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileData {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  share_code: string | null;
  is_public: boolean;
  is_locked: boolean;
  download_limit: number | null;
  download_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ShareLinkData {
  id: string;
  share_token: string;
  link_type: string;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  is_active: boolean;
  password_hash: string | null;
  recipient_email: string | null;
}

export const FileManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareType, setShareType] = useState<'public' | 'email' | 'code'>('public');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [shareLimit, setShareLimit] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (user) {
      fetchFiles();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('file-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
        console.log('Files table changed, refreshing...');
        fetchFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchFiles = async () => {
    try {
      console.log('Fetching files for user:', user?.id);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        throw error;
      }

      console.log('Files fetched successfully:', data?.length || 0);
      setFiles(data || []);
    } catch (error: any) {
      console.error('Failed to fetch files:', error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error.message || "Failed to load your files. Please refresh the page.",
      });
      // Set empty array on error to prevent infinite loading
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileData) => {
    try {
      console.log('Downloading file:', file.id, file.original_name);
      
      if (file.is_locked) {
        toast({
          variant: "destructive",
          title: "File is locked",
          description: "This file is currently locked and cannot be downloaded.",
        });
        return;
      }

      // Check if file exists in storage first
      const { data: fileExists, error: existsError } = await supabase.storage
        .from('files')
        .list('', { search: file.storage_path });

      if (existsError) {
        console.error('Error checking file existence:', existsError);
        throw new Error('Failed to verify file existence');
      }

      const { data, error } = await supabase.storage
        .from('files')
        .download(file.storage_path);

      if (error) {
        console.error('Storage download error:', error);
        throw new Error(`Download failed: ${error.message}`);
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the download
      const { error: logError } = await supabase.from('download_logs').insert({
        file_id: file.id,
        download_method: 'direct',
        downloader_user_agent: navigator.userAgent,
      });

      if (logError) {
        console.warn('Failed to log download:', logError);
        // Don't fail the download for logging issues
      }

      // Update download count
      const { error: updateError } = await supabase
        .from('files')
        .update({ download_count: file.download_count + 1 })
        .eq('id', file.id);

      if (updateError) {
        console.warn('Failed to update download count:', updateError);
        // Don't fail the download for count update issues
      }

      console.log('File downloaded successfully:', file.original_name);
      toast({
        title: "Download started",
        description: `${file.original_name} is being downloaded`,
      });

      fetchFiles(); // Refresh to update download count
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "The file may have been moved or deleted.",
      });
    }
  };

  const deleteFile = async (file: FileData) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${file.original_name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      console.log('Deleting file:', file.id, file.original_name);

      // First delete from database to prevent orphaned records
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw new Error(`Failed to delete file record: ${dbError.message}`);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.storage_path]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Don't fail if storage deletion fails - file record is already deleted
      }

      console.log('File deleted successfully:', file.original_name);
      toast({
        title: "File deleted",
        description: `${file.original_name} has been deleted successfully`,
      });

      fetchFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete file. It may have already been removed.",
      });
    }
  };

  const toggleFileLock = async (file: FileData) => {
    try {
      console.log('Toggling file lock:', file.id, !file.is_locked);

      const { error } = await supabase
        .from('files')
        .update({ is_locked: !file.is_locked })
        .eq('id', file.id);

      if (error) {
        console.error('Lock toggle error:', error);
        throw new Error(`Failed to update lock status: ${error.message}`);
      }

      console.log('File lock toggled successfully:', file.original_name);
      toast({
        title: file.is_locked ? "File unlocked" : "File locked",
        description: `${file.original_name} has been ${file.is_locked ? 'unlocked' : 'locked'}`,
      });

      fetchFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Lock toggle failed:', error);
      toast({
        variant: "destructive",
        title: "Lock toggle failed",
        description: error.message || "Unable to change file lock status. Please try again.",
      });
    }
  };

  const toggleFileVisibility = async (file: FileData) => {
    try {
      console.log('Toggling file visibility:', file.id, !file.is_public);

      const { error } = await supabase
        .from('files')
        .update({ is_public: !file.is_public })
        .eq('id', file.id);

      if (error) {
        console.error('Visibility toggle error:', error);
        throw new Error(`Failed to update visibility: ${error.message}`);
      }

      console.log('File visibility toggled successfully:', file.original_name);
      toast({
        title: file.is_public ? "File made private" : "File made public",
        description: `${file.original_name} is now ${file.is_public ? 'private' : 'public'}`,
      });

      fetchFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Visibility toggle failed:', error);
      toast({
        variant: "destructive",
        title: "Visibility toggle failed",
        description: error.message || "Unable to change file visibility. Please try again.",
      });
    }
  };

  const generateShareCode = async (file: FileData) => {
    try {
      console.log('Generating share code for file:', file.id);

      // Check if file already has a share code
      if (file.share_code) {
        setGeneratedCode(file.share_code);
        toast({
          title: "Share code already exists",
          description: `Share code: ${file.share_code}`,
        });
        return;
      }

      // Generate a unique 8-character code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_share_code');
      
      if (codeError) {
        console.error('Share code generation error:', codeError);
        throw new Error(`Failed to generate share code: ${codeError.message}`);
      }

      const shareCode = codeData;

      // Update file with share code
      const { error: updateError } = await supabase
        .from('files')
        .update({ share_code: shareCode })
        .eq('id', file.id);

      if (updateError) {
        console.error('Share code update error:', updateError);
        throw new Error(`Failed to save share code: ${updateError.message}`);
      }

      console.log('Share code generated successfully:', shareCode);
      setGeneratedCode(shareCode);
      toast({
        title: "Share code generated",
        description: `Share code: ${shareCode}`,
      });

      fetchFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Share code generation failed:', error);
      toast({
        variant: "destructive",
        title: "Share code generation failed",
        description: error.message || "Unable to generate share code. Please try again.",
      });
    }
  };

  const createShareLink = async () => {
    if (!selectedFile) return;

    try {
      console.log('Creating share link:', shareType, selectedFile.id);

      // Validate inputs
      if (shareType === 'email' && !shareEmail.trim()) {
        toast({
          variant: "destructive",
          title: "Email required",
          description: "Please enter a recipient email address.",
        });
        return;
      }

      const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiryDate = shareExpiry ? new Date(shareExpiry).toISOString() : null;
      const downloadLimit = shareLimit ? parseInt(shareLimit) : null;
      
      let passwordHash = null;
      if (sharePassword.trim()) {
        const { data: hashData, error: hashError } = await supabase.rpc('hash_password', { 
          password: sharePassword 
        });
        
        if (hashError) {
          console.error('Password hashing error:', hashError);
          throw new Error('Failed to secure password');
        }
        
        passwordHash = hashData;
      }

      const { data, error } = await supabase
        .from('shared_links')
        .insert({
          file_id: selectedFile.id,
          link_type: shareType,
          share_token: shareToken,
          recipient_email: shareType === 'email' ? shareEmail : null,
          password_hash: passwordHash,
          expires_at: expiryDate,
          download_limit: downloadLimit,
        })
        .select()
        .single();

      if (error) {
        console.error('Share link creation error:', error);
        throw new Error(`Failed to create share link: ${error.message}`);
      }

      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      setGeneratedLink(shareUrl);

      console.log('Share link created successfully:', shareUrl);

      // Send email if it's an email share
      if (shareType === 'email' && shareEmail) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              recipientEmail: shareEmail,
              subject: `File shared: ${selectedFile.original_name}`,
              shareUrl: shareUrl,
              fileName: selectedFile.original_name,
              message: shareMessage,
            },
          });
          
          if (emailError) {
            console.warn('Email sending failed:', emailError);
            toast({
              variant: "destructive",
              title: "Email sending failed",
              description: "Share link created but email could not be sent.",
            });
          } else {
            console.log('Email sent successfully');
            toast({
              title: "Email sent",
              description: `Share link sent to ${shareEmail}`,
            });
          }
        } catch (emailError) {
          console.warn('Email service error:', emailError);
          toast({
            title: "Share link created",
            description: "Link created but email service is unavailable.",
          });
        }
      } else {
        toast({
          title: "Share link created",
          description: "Your file has been shared successfully",
        });
      }
    } catch (error: any) {
      console.error('Share link creation failed:', error);
      toast({
        variant: "destructive",
        title: "Share link creation failed",
        description: error.message || "Unable to create share link. Please try again.",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Link has been copied to your clipboard",
      });
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "Copied to clipboard",
          description: "Link has been copied to your clipboard",
        });
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Please manually copy the link",
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📁';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
        <p className="text-muted-foreground">
          Manage your uploaded files and create sharing links.
        </p>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload your first file to start sharing securely.
            </p>
            <Button asChild>
              <a href="/dashboard/upload">
                Upload Files
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file, index) => (
            <Card 
              key={file.id} 
              className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-2xl">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate">{file.original_name}</h3>
                        {file.is_locked && <Lock className="w-4 h-4 text-warning" />}
                        {file.is_public ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{file.file_type}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{file.download_count}</span>
                        </span>
                        {file.expires_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Expires {formatDistanceToNow(new Date(file.expires_at), { addSuffix: true })}</span>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </span>
                        {file.share_code && (
                          <Badge variant="outline" className="text-xs">
                            Code: {file.share_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      className="hover:bg-functions-download/10 hover:text-functions-download transition-all duration-300 hover:scale-105"
                      disabled={file.is_locked}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Dialog open={shareDialogOpen && selectedFile?.id === file.id} onOpenChange={(open) => {
                      setShareDialogOpen(open);
                      if (open) {
                        setSelectedFile(file);
                        setGeneratedLink('');
                        setGeneratedCode('');
                        setShareEmail('');
                        setSharePassword('');
                        setShareExpiry('');
                        setShareLimit('');
                        setShareMessage('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-functions-share/10 hover:text-functions-share transition-all duration-300 hover:scale-105"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share File</DialogTitle>
                          <DialogDescription>
                            Create a secure sharing link for "{file.original_name}"
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Share Method</Label>
                            <Select value={shareType} onValueChange={(value: 'public' | 'email' | 'code') => setShareType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public Link</SelectItem>
                                <SelectItem value="email">Email Share</SelectItem>
                                <SelectItem value="code">Share Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {shareType === 'email' && (
                            <div>
                              <Label htmlFor="shareEmail">Recipient Email</Label>
                              <Input
                                id="shareEmail"
                                type="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="Enter recipient email"
                              />
                            </div>
                          )}

                          <div>
                            <Label htmlFor="sharePassword">Password (Optional)</Label>
                            <Input
                              id="sharePassword"
                              type="password"
                              value={sharePassword}
                              onChange={(e) => setSharePassword(e.target.value)}
                              placeholder="Set password for extra security"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="shareExpiry">Expiry Date (Optional)</Label>
                              <Input
                                id="shareExpiry"
                                type="datetime-local"
                                value={shareExpiry}
                                onChange={(e) => setShareExpiry(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="shareLimit">Download Limit (Optional)</Label>
                              <Input
                                id="shareLimit"
                                type="number"
                                value={shareLimit}
                                onChange={(e) => setShareLimit(e.target.value)}
                                placeholder="Max downloads"
                                min="1"
                              />
                            </div>
                          </div>

                          {shareType === 'email' && (
                            <div>
                              <Label htmlFor="shareMessage">Message (Optional)</Label>
                              <Textarea
                                id="shareMessage"
                                value={shareMessage}
                                onChange={(e) => setShareMessage(e.target.value)}
                                placeholder="Add a personal message..."
                                rows={3}
                              />
                            </div>
                          )}

                          {shareType === 'code' && !file.share_code && (
                            <Button onClick={() => generateShareCode(file)} className="w-full">
                              Generate Share Code
                            </Button>
                          )}

                          {(generatedLink || generatedCode || file.share_code) && (
                            <div className="space-y-2">
                              <Label>
                                {shareType === 'code' ? 'Share Code' : 'Share Link'}
                              </Label>
                              <div className="flex space-x-2">
                                <Input 
                                  value={shareType === 'code' ? (generatedCode || file.share_code || '') : generatedLink} 
                                  readOnly 
                                  className="font-mono text-sm"
                                />
                                <Button 
                                  onClick={() => copyToClipboard(shareType === 'code' ? (generatedCode || file.share_code || '') : generatedLink)} 
                                  size="sm" 
                                  variant="outline"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                            Cancel
                          </Button>
                          {shareType !== 'code' && (
                            <Button onClick={createShareLink}>
                              Create Share Link
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFileVisibility(file)}
                      className="hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                    >
                      {file.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFileLock(file)}
                      className="hover:bg-warning/10 hover:text-warning transition-all duration-300 hover:scale-105"
                    >
                      {file.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file)}
                      className="hover:bg-functions-delete/10 hover:text-functions-delete transition-all duration-300 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};