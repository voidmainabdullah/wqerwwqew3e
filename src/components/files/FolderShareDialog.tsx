import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Hash, Link, Calendar, Lock, Download, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FolderShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
}

interface ShareSettings {
  password: string;
  expiryDays: number;
  downloadLimit: number | null;
  message: string;
}

export function FolderShareDialog({
  isOpen,
  onClose,
  folderId,
  folderName,
}: FolderShareDialogProps) {
  const [activeTab, setActiveTab] = useState('link');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    password: '',
    expiryDays: 7,
    downloadLimit: null,
    message: `Hi! I'm sharing the folder "${folderName}" with you. Click the link to access it.`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [hasDownloadLimit, setHasDownloadLimit] = useState(false);

  const createShareLink = async (linkType: 'direct' | 'code') => {
    setIsLoading(true);
    try {
      // Calculate expiry date
      const expiresAt = shareSettings.expiryDays > 0 
        ? new Date(Date.now() + shareSettings.expiryDays * 24 * 60 * 60 * 1000).toISOString() 
        : null;

      // Hash password if provided
      let passwordHash = null;
      if (hasPassword && shareSettings.password) {
        const { data: hashData } = await supabase.rpc('hash_password', {
          password: shareSettings.password
        });
        passwordHash = hashData;
      }

      // Use the backend function for folder sharing
      const { data, error } = await supabase.rpc('create_folder_share', {
        p_folder_id: folderId,
        p_link_type: linkType,
        p_expires_at: expiresAt,
        p_download_limit: hasDownloadLimit ? shareSettings.downloadLimit : null,
        p_password_hash: passwordHash,
        p_message: shareSettings.message
      }) as { data: Array<{ share_token: string; share_code: string | null }> | null; error: any };

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No data returned from share function');
      }

      const result = data[0];
      const shareToken = result.share_token;
      const shareCode = result.share_code;
      const shareUrl = `${window.location.origin}/share/${shareToken}`;

      if (linkType === 'code' && shareCode) {
        setGeneratedCode(shareCode);
        setGeneratedLink(shareUrl);
        toast.success('Share code generated! Recipients can use this code at /code');
      } else if (shareToken) {
        setGeneratedLink(shareUrl);
        toast.success('Share link created successfully!');
      } else {
        throw new Error('Invalid share response');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error('Failed to create share link: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const resetDialog = () => {
    setGeneratedLink('');
    setGeneratedCode('');
    setShareSettings({
      password: '',
      expiryDays: 7,
      downloadLimit: null,
      message: `Hi! I'm sharing the folder "${folderName}" with you. Click the link to access it.`
    });
    setHasPassword(false);
    setHasDownloadLimit(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Share Folder: "{folderName}"
          </DialogTitle>
          <DialogDescription>
            Choose how you want to share this folder with others.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              Direct Link
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {/* Common Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="password-protection"
                  checked={hasPassword}
                  onCheckedChange={setHasPassword}
                />
                <Label htmlFor="password-protection" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Protection
                </Label>
              </div>

              {hasPassword && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password for folder access"
                    value={shareSettings.password}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expires in
                  </Label>
                  <Select
                    value={shareSettings.expiryDays.toString()}
                    onValueChange={(value) => setShareSettings(prev => ({ ...prev, expiryDays: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">1 Week</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="download-limit"
                      checked={hasDownloadLimit}
                      onCheckedChange={setHasDownloadLimit}
                    />
                    <Label htmlFor="download-limit" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Limit
                    </Label>
                  </div>
                  {hasDownloadLimit && (
                    <Input
                      type="number"
                      placeholder="Max downloads"
                      min="1"
                      value={shareSettings.downloadLimit || ''}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, downloadLimit: e.target.value ? parseInt(e.target.value) : null }))}
                    />
                  )}
                </div>
              </div>
            </div>

            <TabsContent value="link" className="space-y-4">
              <div>
                <Label htmlFor="link-message">Message (Optional)</Label>
                <Textarea 
                  id="link-message" 
                  placeholder="Add a personal message..." 
                  value={shareSettings.message} 
                  onChange={(e) => setShareSettings(prev => ({ ...prev, message: e.target.value }))} 
                  rows={3} 
                />
              </div>

              {generatedLink ? (
                <Card>
                  <CardContent className="p-4">
                    <Label>Share Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={generatedLink} readOnly />
                      <Button size="icon" onClick={() => copyToClipboard(generatedLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={() => createShareLink('direct')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating Link...' : 'Generate Share Link'}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div>
                <Label htmlFor="code-message">Message (Optional)</Label>
                <Textarea 
                  id="code-message" 
                  placeholder="Add a personal message..." 
                  value={shareSettings.message} 
                  onChange={(e) => setShareSettings(prev => ({ ...prev, message: e.target.value }))} 
                  rows={3} 
                />
              </div>

              {generatedCode ? (
                <Card>
                  <CardContent className="p-4">
                    <Label>Share Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={generatedCode}
                        readOnly
                        className="font-mono text-lg tracking-wider"
                      />
                      <Button size="icon" onClick={() => copyToClipboard(generatedCode)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recipients can use this code at <strong>/code</strong> to access the folder.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a short code that recipients can use to access all files in this folder.
                  </p>
                  <Button onClick={() => createShareLink('code')} disabled={isLoading} className="w-full">
                    {isLoading ? 'Generating Code...' : 'Generate Share Code'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
