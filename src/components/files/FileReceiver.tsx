import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShareNetwork, Envelope, QrCode, Link } from 'phosphor-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageFooter } from '@/components/ui/page-footer';
import { AnimatedBackground } from '@/components/ui/animated-background';
import Logo from '@/components/Logo';

export const FileReceiver: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [receiverName, setReceiverName] = useState('');
  const [description, setDescription] = useState('');
  const [receiveUrl, setReceiveUrl] = useState('');

  const generateReceiveLink = () => {
    if (!user) return;
    
    const baseUrl = window.location.origin;
    const receiveToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const url = `${baseUrl}/receive/${receiveToken}`;
    setReceiveUrl(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receiveUrl);
      toast({
        title: "Link copied",
        description: "Receive link copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Send me files - ${receiverName || 'File Request'}`);
    const body = encodeURIComponent(`Hi!\n\nPlease send me files using this secure link:\n${receiveUrl}\n\n${description ? `Description: ${description}\n\n` : ''}Thanks!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      
      {/* Header with Logo */}
      <div className="relative z-10 p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Button variant="ghost" asChild className="font-heading icon-text">
            <a href="/dashboard">
              <span className="material-icons md-18">dashboard</span>
              Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">Request Files</h1>
            <p className="font-body text-muted-foreground text-lg">
              Create a secure link to request files from others.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Create File Request</CardTitle>
            <CardDescription className="font-body">
              Generate a secure link that others can use to send files to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName" className="font-heading">Request Name (Optional)</Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g., Project Documents, Photos, etc."
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-heading">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add instructions or details about what files you need..."
                rows={3}
                className="font-body"
              />
            </div>

            <Button onClick={generateReceiveLink} className="w-full h-12 font-heading icon-text">
              <span className="material-icons md-18">share</span>
              Generate Receive Link
            </Button>
          </CardContent>
        </Card>

        {receiveUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Share Your Receive Link</CardTitle>
              <CardDescription className="font-body">
                Share this link with people you want to receive files from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-heading">Receive Link</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={receiveUrl} 
                    readOnly 
                    className="font-mono text-sm bg-muted"
                  />
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <span className="material-icons md-18">content_copy</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareViaEmail} variant="outline" size="sm" className="font-heading icon-text">
                  <span className="material-icons md-18">email</span>
                  Email
                </Button>
                <Button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Send me files',
                        text: description || 'Please send me files using this secure link',
                        url: receiveUrl,
                      });
                    } else {
                      copyToClipboard();
                    }
                  }}
                  variant="outline" 
                  size="sm"
                  className="font-heading icon-text"
                >
                  <span className="material-icons md-18">share</span>
                  Share
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-heading font-medium mb-2">How it works:</h4>
                <ul className="text-sm font-body text-muted-foreground space-y-1">
                  <li>• Share this link with anyone</li>
                  <li>• They can upload files directly to your account</li>
                  <li>• You'll receive notifications when files are uploaded</li>
                  <li>• Files are secure and only accessible by you</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="relative z-10 p-6 pt-0">
        <div className="max-w-6xl mx-auto">
          <Card>
        <CardHeader>
          <CardTitle className="font-heading">Recent File Requests</CardTitle>
          <CardDescription className="font-body">
            Files that have been sent to you through receive links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <span className="material-icons md-48 mx-auto mb-4">inbox</span>
            <p className="font-heading font-medium">No files received yet</p>
            <p className="text-sm font-body">Files sent to your receive links will appear here</p>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
      
      {/* Footer */}
      <PageFooter className="relative z-10" />
    </div>
  );
};