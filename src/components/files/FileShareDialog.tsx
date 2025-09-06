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
import { Copy, Mail, Hash, Link, Calendar, Lock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

interface ShareSettings {
  password: string;
  expiryDays: number;
  downloadLimit: number | null;
  recipientEmail: string;
  message: string;
}

export function FileShareDialog({ isOpen, onClose, fileId, fileName }: FileShareDialogProps) {
  const [activeTab, setActiveTab] = useState('link');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    password: '',
    expiryDays: 7,
    downloadLimit: null,
    recipientEmail: '',
    message: `Hi! I'm sharing "${fileName}" with you. Click the link to access it.`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [hasDownloadLimit, setHasDownloadLimit] = useState(false);

  const createShareLink = async (linkType: 'direct' | 'email' | 'code') => {
    setIsLoading(true);
    try {
      // Calculate expiry date
      const expiresAt = shareSettings.expiryDays > 0 ? 
        new Date(Date.now() + shareSettings.expiryDays * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      // Hash password if provided
      let passwordHash = null;
      if (hasPassword && shareSettings.password) {
        const { data: hashData } = await supabase.rpc('hash_password', {
          password: shareSettings.password
        });
        passwordHash = hashData;
      }

      // Use the new backend function for robust sharing
      const { data, error } = await supabase.rpc('create_file_share', {
        p_file_id: fileId,
        p_link_type: linkType,
        p_expires_at: expiresAt,
        p_download_limit: hasDownloadLimit ? shareSettings.downloadLimit : null,
        p_password_hash: passwordHash,
        p_recipient_email: linkType === 'email' ? shareSettings.recipientEmail : null,
        p_message: shareSettings.message
      });

      // Track analytics
      const { AnalyticsTracker } = await import('@/components/analytics/AnalyticsTracker');
      if (data?.[0]?.share_token) {
        await AnalyticsTracker.trackFileShare(fileId, data[0].share_token);
      }

      if (error) throw error;

      const shareToken = data[0]?.share_token;
      const shareCode = data[0]?.share_code;
      const shareUrl = `${window.location.origin}/share/${shareToken}`;

      if (linkType === 'code') {
        setGeneratedCode(shareCode);
        setGeneratedLink(shareUrl);
      } else {
        setGeneratedLink(shareUrl);
      }

      // Send email if email sharing
      if (linkType === 'email') {
        await supabase.functions.invoke('send-email', {
          body: {
            recipientEmail: shareSettings.recipientEmail,
            subject: `File shared: ${fileName}`,
            shareUrl,
            fileName,
            message: shareSettings.message
          }
        });
        toast.success('Email sent successfully!');
      } else if (linkType === 'code') {
        toast.success('Share code generated! Recipients can use this code at /code');
      } else {
        toast.success('Share link created successfully!');
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
      recipientEmail: '',
      message: `Hi! I'm sharing "${fileName}" with you. Click the link to access it.`
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Share "{fileName}"
          </DialogTitle>
          <DialogDescription>
            Choose how you want to share this file with others.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              Direct Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
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
                    placeholder="Enter password for file access"
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
                      <SelectItem value="30">1 Month (Pro)</SelectItem>
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
                      onChange={(e) => setShareSettings(prev => ({ 
                        ...prev, 
                        downloadLimit: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                    />
                  )}
                </div>
              </div>
            </div>

            <TabsContent value="link" className="space-y-4">
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
                <Button 
                  onClick={() => createShareLink('direct')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating Link...' : 'Generate Share Link'}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={shareSettings.recipientEmail}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message..."
                  value={shareSettings.message}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => createShareLink('email')} 
                disabled={isLoading || !shareSettings.recipientEmail}
                className="w-full"
              >
                {isLoading ? 'Sending Email...' : 'Send Share Link via Email'}
              </Button>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              {generatedCode ? (
                <Card>
                  <CardContent className="p-4">
                    <Label>Share Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={generatedCode} readOnly className="font-mono text-lg tracking-wider" />
                      <Button size="icon" onClick={() => copyToClipboard(generatedCode)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recipients can use this code at <strong>/code</strong> to access the file.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a short code that recipients can use to access your file.
                  </p>
                  <Button 
                    onClick={() => createShareLink('code')} 
                    disabled={isLoading}
                    className="w-full"
                  >
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