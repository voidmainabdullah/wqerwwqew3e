import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShareNetwork, Copy, Download, Eye, Clock, Shield, Trash, ArrowSquareOut, Share, Lock, Globe, LockSimple, Gear, Link as LinkIcon } from 'phosphor-react';
interface SharedLink {
  id: string;
  file_id: string;
  share_token: string;
  password_hash: string | null;
  download_limit: number | null;
  download_count: number;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
  message: string | null;
  files: {
    id: string;
    original_name: string;
    file_size: number;
    is_public: boolean;
    is_locked: boolean;
  };
}
export const SharedLinks: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<SharedLink | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  useEffect(() => {
    if (user) {
      fetchSharedLinks();
    }
  }, [user]);
  const fetchSharedLinks = async () => {
    try {
      // Get user's files first
      const {
        data: userFiles
      } = await supabase.from('files').select('id').eq('user_id', user?.id);
      const fileIds = userFiles?.map(f => f.id) || [];
      if (fileIds.length === 0) {
        setSharedLinks([]);
        return;
      }

      // Get shared links for user's files
      const {
        data,
        error
      } = await supabase.from('shared_links').select(`
          *,
          files!inner(id, original_name, file_size, is_public, is_locked)
        `).in('file_id', fileIds).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setSharedLinks(data || []);
    } catch (error) {
      console.error('Error fetching shared links:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shared links."
      });
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = async (shareToken: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy link to clipboard."
      });
    }
  };

  const shortenLink = async (shareToken: string) => {
    const originalUrl = `${window.location.origin}/share/${shareToken}`;
    
    // Simple shortening - use first 8 chars of token
    const shortToken = shareToken.substring(0, 8);
    const shortenedUrl = `${window.location.origin}/s/${shortToken}`;
    
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      toast({
        title: "Shortened link copied",
        description: "Short link has been copied to clipboard."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy shortened link."
      });
    }
  };
  const deleteSharedLink = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('shared_links').delete().eq('id', id);
      if (error) throw error;
      setSharedLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: "Link deleted",
        description: "Shared link has been deleted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete the shared link."
      });
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };
  const isLimitReached = (downloadLimit: number | null, downloadCount: number) => {
    if (!downloadLimit) return false;
    return downloadCount >= downloadLimit;
  };
  const toggleFilePublicStatus = async (fileId: string, isPublic: boolean) => {
    try {
      const {
        error
      } = await supabase.rpc('toggle_file_public_status', {
        p_file_id: fileId,
        p_is_public: isPublic
      });
      if (error) throw error;

      // Update local state
      setSharedLinks(prev => prev.map(link => link.file_id === fileId ? {
        ...link,
        files: {
          ...link.files,
          is_public: isPublic
        }
      } : link));
      toast({
        title: "File visibility updated",
        description: `File is now ${isPublic ? 'public' : 'private'}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message
      });
    }
  };
  const toggleSharedLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      const {
        error
      } = await supabase.rpc('update_shared_link_settings', {
        p_link_id: linkId,
        p_is_active: isActive
      });
      if (error) throw error;

      // Update local state
      setSharedLinks(prev => prev.map(link => link.id === linkId ? {
        ...link,
        is_active: isActive
      } : link));
      toast({
        title: "Link status updated",
        description: `Link is now ${isActive ? 'active' : 'disabled'}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message
      });
    }
  };
  const openEditDialog = (link: SharedLink) => {
    setEditingLink(link);
    setIsEditDialogOpen(true);
  };
  const saveEditedLink = async () => {
    if (!editingLink) return;
    try {
      // Update the link settings
      await toggleSharedLinkStatus(editingLink.id, editingLink.is_active);
      setIsEditDialogOpen(false);
      setEditingLink(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message
      });
    }
  };
  if (loading) {
    return <div className="space-y-4 p-4 max-w-7xl mx-auto">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  } 
  return <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shared Links</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage and monitor your active file sharing links.
        </p>
      </div>

      {sharedLinks.length === 0 ? <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <Share className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-base md:text-lg font-medium mb-2">No shared links yet</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center mb-4 px-4">
              Create shared links from your files to start sharing securely.
            </p>
            <Button asChild>
              <a href="/dashboard/files">
                <Share className="mr-2 h-4 w-4" />
                Go to My Files
              </a>
            </Button>
          </CardContent>
        </Card> : <div className="grid gap-4">
          {sharedLinks.map((link, index) => {
        const expired = isExpired(link.expires_at);
        const limitReached = isLimitReached(link.download_limit, link.download_count);
        const inactive = expired || limitReached;
        return <Card key={link.id} className={`transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in ${inactive ? 'opacity-60' : ''} overflow-hidden`} style={{
          animationDelay: `${index * 0.1}s`
        }}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg flex items-center truncate">
                        <ShareNetwork className="mr-2 h-5 w-5" />
                        <span className="truncate">{link.files.original_name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs md:text-sm">
                        {formatFileSize(link.files.file_size)} • Created {new Date(link.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {link.password_hash && <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          Protected
                        </Badge>}
                      {link.files.is_public ? <Badge variant="default" className="text-white text-xs bg-emerald-600">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge> : <Badge variant="secondary" className="text-xs">
                          <LockSimple className="w-3 h-3 mr-1" />
                          Private
                        </Badge>}
                      {expired && <Badge variant="destructive" className="text-xs">Expired</Badge>}
                      {limitReached && <Badge variant="destructive" className="text-xs">Limit Reached</Badge>}
                      {!inactive && link.is_active && <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">Unlocked</Badge>}
                      {!link.is_active && <Badge variant="destructive" className="text-xs">Locked</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={`${window.location.origin}/share/${link.share_token}`} readOnly className="font-mono text-xs md:text-sm flex-1 min-w-0 bg-black" />
                    <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.share_token)} className="hover:bg-functions-share/10 hover:text-functions-share transition-all duration-300 flex-shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/share/${link.share_token}`, '_blank')} className="hover:bg-primary/10 hover:text-primary transition-all duration-300 flex-shrink-0">
                      <ArrowSquareOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shortenLink(link.share_token)} className="hover:bg-secondary/10 hover:text-secondary transition-all duration-300 flex-shrink-0" title="Shorten link">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>

                  {link.message && <div className="p-3 rounded-2xl border bg-inherit ">
                      <p className="text-xs md:text-sm text-muted-foreground break-words">
                        <span className="font-medium">Message:</span> {link.message}
                      </p>
                    </div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">
                        {link.download_count} / {link.download_limit || '∞'} downloads
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">
                        {link.expires_at ? `Expires ${new Date(link.expires_at).toLocaleDateString()}` : 'Never expires'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">
                        {link.password_hash ? 'Password protected' : 'Public access'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      {/* Lock/Unlock Toggle - Only enabled if file has password protection */}
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={!link.is_active} 
                          onCheckedChange={(checked) => toggleSharedLinkStatus(link.id, !checked)}
                          disabled={!link.password_hash}
                        />
                        <Label className="text-xs whitespace-nowrap">
                          {!link.is_active ? (
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Unlocked
                            </span>
                          )}
                        </Label>
                        {!link.password_hash && (
                          <span className="text-xs text-muted-foreground italic">(Password required)</span>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" onClick={() => deleteSharedLink(link.id)} className="text-functions-delete hover:text-functions-deleteGlow hover:bg-functions-delete/10 transition-all duration-300 hover:scale-105 flex-shrink-0">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>;
      })}
        </div>}

      {/* Edit Link Settings Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shared Link Settings</DialogTitle>
          </DialogHeader>
          
          {editingLink && <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch checked={editingLink.is_active} onCheckedChange={checked => setEditingLink({
              ...editingLink,
              is_active: checked
            })} />
                <Label>Link Active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch checked={editingLink.files.is_public} onCheckedChange={checked => toggleFilePublicStatus(editingLink.file_id, checked)} />
                <Label>File Public</Label>
              </div>
            </div>}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedLink}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent> 
      </Dialog>
    </div>;
};