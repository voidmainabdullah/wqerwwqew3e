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
import { useSubscription } from '@/hooks/useSubscription';
import { ProBadge } from '@/components/ui/ProBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
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
export function FileShareDialog({
  isOpen,
  onClose,
  fileId,
  fileName
}: FileShareDialogProps) {
  const navigate = useNavigate();
  const { isPro, isBasic } = useSubscription();
  const [activeTab, setActiveTab] = useState('link');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    password: '',
    expiryDays: isBasic ? 3 : 7,
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
      const expiresAt = shareSettings.expiryDays > 0 ? new Date(Date.now() + shareSettings.expiryDays * 24 * 60 * 60 * 1000).toISOString() : null;

      // Hash password if provided
      let passwordHash = null;
      if (hasPassword && shareSettings.password) {
        const {
          data: hashData
        } = await supabase.rpc('hash_password', {
          password: shareSettings.password
        });
        passwordHash = hashData;
      }

      // Use the new backend function for robust sharing
      const {
        data,
        error
      } = await supabase.rpc('create_file_share', {
        p_file_id: fileId,
        p_link_type: linkType,
        p_expires_at: expiresAt,
        p_download_limit: hasDownloadLimit ? shareSettings.downloadLimit : null,
        p_password_hash: passwordHash,
        p_recipient_email: linkType === 'email' ? shareSettings.recipientEmail : null,
        p_message: shareSettings.message
      });

      // Track analytics
      const {
        AnalyticsTracker
      } = await import('@/components/analytics/AnalyticsTracker');
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
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto  border-neutral-800 ">
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
              {/* Password Protection - Pro Only */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center justify-between space-x-2 ${!isPro ? 'opacity-50' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="password-protection" 
                          checked={hasPassword} 
                          onCheckedChange={(checked) => {
                            if (!isPro) {
                              toast.error('Password protection is a Pro feature');
                              return;
                            }
                            setHasPassword(checked);
                          }} 
                          disabled={!isPro}
                        />
                        <Label htmlFor="password-protection" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password Protection
                        </Label>
                      </div>
                      {!isPro && <ProBadge size="sm" />}
                    </div>
                  </TooltipTrigger>
                  {!isPro && (
                    <TooltipContent>
                      <p className="text-xs">Upgrade to Pro to protect files with passwords</p>
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="h-auto p-0 text-xs text-amber-400"
                        onClick={() => navigate('/subscription')}
                      >
                        Upgrade Now
                      </Button>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {hasPassword && isPro && <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password for file access" value={shareSettings.password} onChange={e => setShareSettings(prev => ({
                ...prev,
                password: e.target.value
              }))} />
                </div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expires in
                  </Label>
                  <Select 
                    value={shareSettings.expiryDays.toString()} 
                    onValueChange={value => {
                      const numValue = parseInt(value);
                      if (!isPro && numValue > 3 && numValue !== 0) {
                        toast.error('Custom expiry dates are a Pro feature');
                        return;
                      }
                      setShareSettings(prev => ({
                        ...prev,
                        expiryDays: numValue
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days {isBasic && '(Max for Basic)'}</SelectItem>
                      <SelectItem value="7" disabled={!isPro}>
                        1 Week {!isPro && '(Pro)'}
                      </SelectItem>
                      <SelectItem value="30" disabled={!isPro}>
                        1 Month {!isPro && '(Pro)'}
                      </SelectItem>
                      <SelectItem value="0" disabled={!isPro}>
                        Never {!isPro && '(Pro)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Download Limit - Pro Only */}
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center justify-between space-x-2 mb-2 ${!isPro ? 'opacity-50' : ''}`}>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="download-limit" 
                              checked={hasDownloadLimit} 
                              onCheckedChange={(checked) => {
                                if (!isPro) {
                                  toast.error('Download limits are a Pro feature');
                                  return;
                                }
                                setHasDownloadLimit(checked);
                              }}
                              disabled={!isPro}
                            />
                            <Label htmlFor="download-limit" className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Limit
                            </Label>
                          </div>
                          {!isPro && <ProBadge size="sm" />}
                        </div>
                      </TooltipTrigger>
                      {!isPro && (
                        <TooltipContent>
                          <p className="text-xs">Upgrade to Pro for download limits</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  {hasDownloadLimit && isPro && <Input type="number" placeholder="Max downloads" min="1" value={shareSettings.downloadLimit || ''} onChange={e => setShareSettings(prev => ({
                  ...prev,
                  downloadLimit: e.target.value ? parseInt(e.target.value) : null
                }))} />}
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
                  onChange={e => setShareSettings(prev => ({
                    ...prev,
                    message: e.target.value
                  }))} 
                  rows={3} 
                />
              </div>

              {generatedLink ? <Card>
                  <CardContent className="p-4">
                    <Label>Share Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={generatedLink} readOnly />
                      <Button size="icon" onClick={() => copyToClipboard(generatedLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card> : <Button onClick={() => createShareLink('direct')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating Link...' : 'Generate Share Link'}
                </Button>}
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="recipient-email">Recipient Email *</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={shareSettings.recipientEmail}
                  onChange={e => setShareSettings(prev => ({
                    ...prev,
                    recipientEmail: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="email-message">Personal Message</Label>
                <Textarea 
                  id="email-message" 
                  placeholder="Add a personal message for the recipient..." 
                  value={shareSettings.message} 
                  onChange={e => setShareSettings(prev => ({
                    ...prev,
                    message: e.target.value
                  }))} 
                  rows={4} 
                />
              </div>

              {generatedLink ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <Mail className="h-5 w-5" />
                        <span className="font-medium">Email sent successfully!</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The recipient will receive an email with a secure link to access the file.
                      </p>
                      <div className="pt-2">
                        <Label className="text-xs text-muted-foreground">Share Link (for reference)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value={generatedLink} readOnly className="text-sm" />
                          <Button size="icon" onClick={() => copyToClipboard(generatedLink)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send a secure link directly to the recipient's email address.
                  </p>
                  <Button 
                    onClick={() => createShareLink('email')} 
                    disabled={isLoading || !shareSettings.recipientEmail.trim()}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? 'Sending Email...' : 'Send via Email'}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div>
                <Label htmlFor="code-message">Message (Optional)</Label>
                <Textarea 
                  id="code-message" 
                  placeholder="Add a personal message..." 
                  value={shareSettings.message} 
                  onChange={e => setShareSettings(prev => ({
                    ...prev,
                    message: e.target.value
                  }))} 
                  rows={3} 
                />
              </div>

              {generatedCode ? <Card>
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
                </Card> : <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a short code that recipients can use to access your file.
                  </p>
                  <Button onClick={() => createShareLink('code')} disabled={isLoading} className="w-full">
                    {isLoading ? 'Generating Code...' : 'Generate Share Code'}
                  </Button>
                </div>}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}