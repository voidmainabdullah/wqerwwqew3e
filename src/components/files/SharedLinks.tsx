// SharedLinks.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ShareNetwork,
  Copy,
  Download,
  Eye,
  Clock,
  Shield,
  Trash,
  ArrowSquareOut,
  Share,
  Lock,
  Globe,
  Gear,
  LockSimple,
  Link as LinkIcon
} from 'phosphor-react';

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
  const { user } = useAuth();
  const { toast } = useToast();

  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<SharedLink | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filters / search
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // AI-based manual sorting: prioritize active and popular links
  const [sortOption, setSortOption] = useState<'recent' | 'downloads' | 'expires'>('recent');

  useEffect(() => {
    if (user) fetchSharedLinks();
  }, [user]);

  const fetchSharedLinks = async () => {
    setLoading(true);
    try {
      const { data: userFiles } = await supabase.from('files').select('id').eq('user_id', user?.id);
      const fileIds = userFiles?.map((f: any) => f.id) || [];
      if (!fileIds.length) {
        setSharedLinks([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('shared_links').select(`
        *,
        files!inner(id, original_name, file_size, is_public, is_locked)
      `).in('file_id', fileIds).order('created_at', { ascending: false });

      if (error) throw error;
      setSharedLinks(data || []);
    } catch (error) {
      console.error('Error fetching shared links:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load shared links.' });
    } finally {
      setLoading(false);
    }
  };

  // Clipboard actions
  const copyToClipboard = async (shareToken: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Share link has been copied.' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy link.' });
    }
  };

  const shortenLink = async (shareToken: string) => {
    const shortToken = shareToken.substring(0, 8);
    const shortenedUrl = `${window.location.origin}/s/${shortToken}`;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      toast({ title: 'Shortened link copied', description: 'Short link has been copied.' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy shortened link.' });
    }
  };

  const deleteSharedLink = async (id: string) => {
    try {
      const { error } = await supabase.from('shared_links').delete().eq('id', id);
      if (error) throw error;
      setSharedLinks(prev => prev.filter(link => link.id !== id));
      toast({ title: 'Link deleted', description: 'Shared link has been deleted.' });
    } catch (error) {
      console.error('Delete error', error);
      toast({ variant: 'destructive', title: 'Delete failed', description: 'Could not delete the link.' });
    }
  };

  // Utilities
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = (expiresAt: string | null) => expiresAt ? new Date(expiresAt) < new Date() : false;
  const isLimitReached = (downloadLimit: number | null, downloadCount: number) => downloadLimit ? downloadCount >= downloadLimit : false;

  const toggleFilePublicStatus = async (fileId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase.rpc('toggle_file_public_status', { p_file_id: fileId, p_is_public: isPublic });
      if (error) throw error;
      setSharedLinks(prev =>
        prev.map(link => link.file_id === fileId ? { ...link, files: { ...link.files, is_public: isPublic } } : link)
      );
      toast({ title: 'File visibility updated', description: `File is now ${isPublic ? 'public' : 'private'}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    }
  };

  const toggleSharedLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.rpc('update_shared_link_settings', { p_link_id: linkId, p_is_active: isActive });
      if (error) throw error;
      setSharedLinks(prev =>
        prev.map(link => link.id === linkId ? { ...link, is_active: isActive } : link)
      );
      toast({ title: 'Link status updated', description: `Link is now ${isActive ? 'active' : 'disabled'}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    }
  };

  const openEditDialog = (link: SharedLink) => { setEditingLink(link); setIsEditDialogOpen(true); };
  const saveEditedLink = async () => {
    if (!editingLink) return;
    try {
      await toggleSharedLinkStatus(editingLink.id, editingLink.is_active);
      setIsEditDialogOpen(false); setEditingLink(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    }
  };

  const clearFilters = () => { setSearchQuery(''); setDateFrom(null); setDateTo(null); };

  // Manual AI features (no API):
  // 1. Smart sorting based on activity and downloads
  // 2. Suggested actions (like unlock popular links)
  // 3. Highlight soon-to-expire or high download links
  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    let results = sharedLinks.filter(link => {
      if (q && !(link.files.original_name.toLowerCase().includes(q))) return false;
      if (from && new Date(link.created_at) < from) return false;
      if (to && new Date(link.created_at) > to) return false;
      return true;
    });

    // Manual AI sorting
    if (sortOption === 'downloads') results = results.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    if (sortOption === 'expires') results = results.sort((a, b) => {
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aExp - bExp;
    });
    return results;
  }, [sharedLinks, searchQuery, dateFrom, dateTo, sortOption]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <HeaderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        clearFilters={clearFilters}
        sortOption={sortOption}
        setSortOption={setSortOption}
        refresh={fetchSharedLinks}
      />

      {sharedLinks.length === 0 ? <EmptyState /> :
        <>
          <ResultsCount filteredLinks={filteredLinks} total={sharedLinks.length} exportCSV={() => exportCSV(filteredLinks, toast)} />
          <LinksGrid
            filteredLinks={filteredLinks}
            copyToClipboard={copyToClipboard}
            shortenLink={shortenLink}
            toggleSharedLinkStatus={toggleSharedLinkStatus}
            toggleFilePublicStatus={toggleFilePublicStatus}
            openEditDialog={openEditDialog}
            deleteSharedLink={deleteSharedLink}
            formatFileSize={formatFileSize}
            isExpired={isExpired}
            isLimitReached={isLimitReached}
          />
        </>
      }

      {editingLink && <EditDialog
        editingLink={editingLink}
        setEditingLink={setEditingLink}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        saveEditedLink={saveEditedLink}
        toggleFilePublicStatus={toggleFilePublicStatus}
      />}
    </div>
  );
};

// ---------------------
// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-4 p-4 max-w-7xl mx-auto">
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="h-3 bg-muted rounded w-32 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ---------------------
// Empty State
const EmptyState = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
      <Share className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-base md:text-lg font-medium mb-2">No shared links yet</h3>
      <p className="text-sm md:text-base text-muted-foreground text-center mb-4 px-4">
        Create shared links from your files to start sharing securely.
      </p>
      <Button asChild>
        <a href="/dashboard/files" className="inline-flex items-center gap-2">
          <Share className="mr-2 h-4 w-4" /> Go to My Files
        </a>
      </Button>
    </CardContent>
  </Card>
);

// ---------------------
// Export CSV manually
const exportCSV = (links: SharedLink[], toast: any) => {
  if (!links.length) {
    toast({ title: 'No data', description: 'No links to export for the current filter.' });
    return;
  }
  const rows = links.map(l => ({
    id: l.id,
    file: l.files.original_name,
    url: `${window.location.origin}/share/${l.share_token}`,
    created_at: l.created_at
  }));
  const csv = 'id,file,url,created_at\n' + rows.map(r => `${r.id},"${r.file.replace(/"/g, '""')}",${r.url},${r.created_at}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shared_links_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------------------
// Header + Filters component
const HeaderFilters = ({
  searchQuery, setSearchQuery,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  clearFilters,
  sortOption, setSortOption,
  refresh
}: any) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-stone-600/20 pb-3">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shared Links</h1>
      <p className="text-sm md:text-base text-muted-foreground">Manage and monitor your active file sharing links.</p>
    </div>

    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input placeholder="Search by file name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="min-w-0" />
        <Button variant="ghost" onClick={() => setSearchQuery('')} className="bg-transparent border text-neutral-200">Clear</Button>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs">From</Label>
        <Input type="date" value={dateFrom || ''} onChange={e => setDateFrom(e.target.value || null)} className="max-w-[150px]" />
        <Label className="text-xs">To</Label>
        <Input type="date" value={dateTo || ''} onChange={e => setDateTo(e.target.value || null)} className="max-w-[150px]" />
        <Button variant="ghost" onClick={clearFilters} className="bg-zinc-300 hover:bg-zinc-200 text-stone-600">Reset</Button>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs">Sort by</Label>
        <select value={sortOption} onChange={e => setSortOption(e.target.value as any)} className="bg-black text-white text-xs p-1 rounded">
          <option value="recent">Most Recent</option>
          <option value="downloads">Most Downloads</option>
          <option value="expires">Expiring Soon</option>
        </select>
        <Button variant="outline" onClick={refresh}>Refresh</Button>
      </div>
    </div>
  </div>
);

// ---------------------
// Results count + export
const ResultsCount = ({ filteredLinks, total, exportCSV }: any) => (
  <div className="flex items-center justify-between">
    <div className="text-sm text-neutral-400">
      Showing <span className="text-white font-medium">{filteredLinks.length}</span> of <span className="text-white font-medium">{total}</span> links
    </div>
    <div className="flex items-center gap-2">
      <Button onClick={() => exportCSV()}>Export CSV</Button>
    </div>
  </div>
);

// ---------------------
// Links grid component
const LinksGrid = ({
  filteredLinks,
  copyToClipboard,
  shortenLink,
  toggleSharedLinkStatus,
  toggleFilePublicStatus,
  openEditDialog,
  deleteSharedLink,
  formatFileSize,
  isExpired,
  isLimitReached
}: any) => (
  <div className="grid gap-3">
    {filteredLinks.map((link: SharedLink) => {
      const expired = isExpired(link.expires_at);
      const limitReached = isLimitReached(link.download_limit, link.download_count);
      const inactive = expired || limitReached;
      return (
        <Card key={link.id} className={`transition-all duration-200 hover:shadow-lg ${inactive ? 'opacity-70' : ''}`}>
          <CardHeader className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-sm md:text-base flex items-center gap-2 truncate">
                  <ShareNetwork size={16} />
                  <span className="truncate">{link.files.original_name}</span>
                </CardTitle>
                <CardDescription className="text-xs text-neutral-400 mt-1 truncate">
                  {formatFileSize(link.files.file_size)} • Created {new Date(link.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badges link={link} expired={expired} limitReached={limitReached} />
            </div>
          </CardHeader>

          <CardContent className="py-2 space-y-2">
            <div className="flex flex-col sm:flex-row sm:
