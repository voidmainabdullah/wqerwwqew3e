// SharedLinks.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 import { Search, X } from "lucide-react"; // import Lucide icons
import { ShareNetwork, Copy, Download, Eye, Clock, Shield, Trash, ArrowSquareOut, Link as LinkIcon, FolderOpen, Gear, Globe, Sparkle } from 'phosphor-react';
interface SharedLink {
  id: string;
  file_id?: string;
  folder_id?: string;
  item_type?: 'file' | 'folder';
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

  // Filters / search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'downloads' | 'expires'>('recent');
  useEffect(() => {
    if (user) fetchSharedLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const fetchSharedLinks = async () => {
    setLoading(true);
    try {
      const {
        data: userFiles
      } = await supabase.from('files').select('id').eq('user_id', user?.id);
      const {
        data: userFolders
      } = await supabase.from('folders').select('id').eq('user_id', user?.id);
      const fileIds = userFiles?.map((f: any) => f.id) || [];
      const folderIds = userFolders?.map((f: any) => f.id) || [];
      if (!fileIds.length && !folderIds.length) {
        setSharedLinks([]);
        setLoading(false);
        return;
      }
      const fileSharesPromise = fileIds.length ? supabase.from('shared_links').select(`
            *,
            files!inner(id, original_name, file_size, is_public, is_locked)
          `).in('file_id', fileIds).not('file_id', 'is', null) : Promise.resolve({
        data: [],
        error: null
      });
      const folderSharesPromise = folderIds.length ? supabase.from('shared_links').select(`
            *,
            folders!inner(id, name)
          `).in('folder_id', folderIds).not('folder_id', 'is', null) : Promise.resolve({
        data: [],
        error: null
      });
      const [fileSharesResult, folderSharesResult] = await Promise.all([fileSharesPromise, folderSharesPromise]);
      if (fileSharesResult.error) throw fileSharesResult.error;
      if (folderSharesResult.error) throw folderSharesResult.error;
      const fileShares = (fileSharesResult.data || []).map((item: any) => ({
        ...item,
        item_type: 'file',
        files: item.files
      }));
      const folderShares = (folderSharesResult.data || []).map((item: any) => ({
        ...item,
        item_type: 'folder',
        files: {
          id: item.folders.id,
          original_name: item.folders.name,
          file_size: 0,
          is_public: true,
          is_locked: false
        }
      }));
      const allShares = [...fileShares, ...folderShares].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSharedLinks(allShares);
    } catch (error) {
      console.error('Error fetching shared links:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load shared links.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Clipboard actions
  const copyToClipboard = async (shareToken: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied.'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Could not copy link.'
      });
    }
  };
  const shortenLink = async (shareToken: string) => {
    const shortToken = shareToken.substring(0, 8);
    const shortenedUrl = `${window.location.origin}/s/${shortToken}`;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      toast({
        title: 'Shortened link copied',
        description: 'Short link has been copied.'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Could not copy shortened link.'
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
        title: 'Link deleted',
        description: 'Shared link has been deleted.'
      });
    } catch (error) {
      console.error('Delete error', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete the link.'
      });
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
  const toggleFilePublicStatus = async (fileId: string | undefined, isPublic: boolean) => {
    if (!fileId) return;
    try {
      const {
        error
      } = await supabase.rpc('toggle_file_public_status', {
        p_file_id: fileId,
        p_is_public: isPublic
      });
      if (error) throw error;
      setSharedLinks(prev => prev.map(link => link.file_id === fileId ? {
        ...link,
        files: {
          ...link.files,
          is_public: isPublic
        }
      } : link));
      toast({
        title: 'File visibility updated',
        description: `File is now ${isPublic ? 'public' : 'private'}.`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
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
      setSharedLinks(prev => prev.map(link => link.id === linkId ? {
        ...link,
        is_active: isActive
      } : link));
      toast({
        title: 'Link status updated',
        description: `Link is now ${isActive ? 'active' : 'disabled'}.`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
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
      // Persist changes if you made any interactive edits inside the modal (we keep it minimal)
      setIsEditDialogOpen(false);
      setEditingLink(null);
      toast({
        title: 'Settings saved'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message
      });
    }
  };

  // Filtered + Sorted Links (no date filtering)
  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let results = sharedLinks.filter(link => {
      if (q && !link.files.original_name.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortOption === 'downloads') results = results.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    if (sortOption === 'expires') results = results.sort((a, b) => {
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aExp - bExp;
    });
    // default 'recent' already sorted in fetch — but ensure fallback
    if (sortOption === 'recent') results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return results;
  }, [sharedLinks, searchQuery, sortOption]);
  if (loading) return <LoadingSkeleton />;
  return <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <HeaderFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortOption={sortOption} setSortOption={setSortOption} refresh={fetchSharedLinks} />

      {sharedLinks.length === 0 ? <EmptyState /> : <>
          <ResultsCount filteredLinks={filteredLinks} total={sharedLinks.length} exportCSV={() => exportCSV(filteredLinks, toast)} />
          <LinksGrid filteredLinks={filteredLinks} copyToClipboard={copyToClipboard} shortenLink={shortenLink} toggleSharedLinkStatus={toggleSharedLinkStatus} toggleFilePublicStatus={toggleFilePublicStatus} openEditDialog={openEditDialog} deleteSharedLink={deleteSharedLink} formatFileSize={formatFileSize} isExpired={isExpired} isLimitReached={isLimitReached} toast={toast} />
        </>}

      {editingLink && <EditDialog editingLink={editingLink} setEditingLink={setEditingLink} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} saveEditedLink={saveEditedLink} toggleFilePublicStatus={toggleFilePublicStatus} />}
    </div>;
};

// ---------------------
// Loading Skeleton Component
const LoadingSkeleton = () => <div className="space-y-4 p-4 max-w-7xl mx-auto">
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse bg-black border border-white/10">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="h-3 bg-muted rounded w-32 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>)}
    </div>
  </div>;

// ---------------------
// Empty State
const EmptyState = () => <Card className="bg-black border border-white/10">
    <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
      <ShareNetwork className="h-12 w-12 text-white/60 mb-4" />
      <h3 className="text-base md:text-lg font-medium text-white">No shared links yet</h3>
      <p className="text-sm md:text-base text-white/70 text-center mb-4 px-4">
        Create shared links from your files to start sharing securely.
      </p>
      <Button asChild>
        <a href="/dashboard/files" className="inline-flex items-center gap-2">
          <ShareNetwork className="mr-2 h-4 w-4" /> Go to My Files
        </a>
      </Button>
    </CardContent>
  </Card>;

// ---------------------
// Export CSV manually
const exportCSV = (links: SharedLink[], toast: any) => {
  if (!links.length) {
    toast({
      title: 'No data',
      description: 'No links to export for the current filter.'
    });
    return;
  }
  const rows = links.map(l => ({
    id: l.id,
    file: l.files.original_name,
    url: `${window.location.origin}/share/${l.share_token}`,
    created_at: l.created_at
  }));
  const csv = 'id,file,url,created_at\n' + rows.map(r => `${r.id},"${r.file.replace(/"/g, '""')}",${r.url},${r.created_at}`).join('\n');
  const blob = new Blob([csv], {
    type: 'text/csv'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shared_links_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------------------
// Header + Filters component (simplified: no date, no reset)
const HeaderFilters = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  refresh
}: any) => <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Shared Links</h1>
      <p className="text-sm md:text-base text-white/70">Manage and monitor your active file sharing links.</p>
    </div>

<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
  <div className="relative flex items-center w-full sm:w-auto">
    {/* Search Icon */}
    <Search className="absolute left-3 text-white/50 w-4 h-4" />

    <Input
      placeholder="Search by file name"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      className="pl-10 pr-10 min-w-0 bg-neutral-900 text-white border placeholder:text-white/50 border-white/30"
    />

    {/* Clear / Cross Icon */}
    {searchQuery && (
      <button
        onClick={() => setSearchQuery('')}
        className="absolute right-2 p-1 text-red-400 hover:bg-red-600/20 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
</div>


      <div className="flex items-center gap-2">
        <Label className="text-xs text-white/70">Sort</Label>
        <select value={sortOption} onChange={e => setSortOption(e.target.value as any)} className="text-white text-xs p-1 rounded border border-white/10 bg-stone-900">
          <option value="recent">Most Recent</option>
          <option value="downloads">Most Downloads</option>
          <option value="expires">Expiring Soon</option>
        </select>
        <Button variant="outline" onClick={refresh} className="border-white/10 bg-stone-100 text-stone-800">Refresh</Button>
      </div>
    </div>
  </div>;

// ---------------------
// Results count + export
const ResultsCount = ({
  filteredLinks,
  total,
  exportCSV
}: any) => <div className="flex items-center justify-between">
    <div className="text-sm text-white/60">
      Showing <span className="text-white font-medium">{filteredLinks.length}</span> of <span className="text-white font-medium">{total}</span> links
    </div>
    <div className="flex items-center gap-2">
      <Button onClick={() => exportCSV()} className="border-white/10 text-white/80">Export CSV</Button>
    </div>
  </div>;

// ---------------------
// Links grid component (cards with top metadata row)
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
  isLimitReached,
  toast
}: any) => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredLinks.map((link: SharedLink) => {
    const expired = isExpired(link.expires_at);
    const limitReached = isLimitReached(link.download_limit, link.download_count);
    const inactive = expired || limitReached || !link.is_active;
    return <Card key={link.id} className={`bg-[#050505] border border-white/10 shadow-sm transition-all duration-200 ${inactive ? 'opacity-70' : 'hover:shadow-md'}`}>
        {/* ✅ FIXED HEADER SECTION */}
      <CardHeader className="py-3 px-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    {/* LEFT SIDE: FILE/FOLDER NAME */}
    <div className="flex-1 min-w-[60%]">
      <CardTitle className="text-sm md:text-base flex items-center gap-2 text-white">
        {link.item_type === 'folder' ? <FolderOpen size={16} className="text-white/70 shrink-0" /> : <ShareNetwork size={16} className="text-white/70 shrink-0" />}

        {/* ✅ Ensure filename fits and doesn't overlap */}
        <span className="truncate block max-w-[calc(100%-1rem)] text-ellipsis" title={link.files?.original_name || 'Untitled File'}>
          {link.files?.original_name || 'Untitled File'}
        </span>

        {link.item_type === 'folder' && <Badge variant="outline" className="text-xs ml-1 shrink-0">
            Folder
          </Badge>}
      </CardTitle>

      <CardDescription className="text-xs text-white/60 mt-1">
        {link.item_type === 'folder' ? 'Folder' : formatFileSize(link.files.file_size)}{' '}
        • {new Date(link.created_at).toLocaleDateString()}
      </CardDescription>
    </div>

    {/* RIGHT SIDE: META ICONS */}
    <div className="flex flex-wrap justify-end items-center gap-2 shrink-0">
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5">
        <Download size={14} className="text-white/70" />
        <span className="text-xs text-white/80">
          {link.download_count}/{link.download_limit || '∞'}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5">
        <Clock size={14} className="text-white/70" />
        <span className="text-xs text-white/80">
          {link.expires_at ? new Date(link.expires_at).toLocaleDateString() : 'Never'}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5">
        {link.files.is_public ? <Globe size={14} className="text-white/70" /> : <Shield size={14} className="text-white/70" />}
        <span className="text-xs text-white/80">
          {link.files.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <Button variant="ghost" size="sm" onClick={() => openEditDialog(link)} title="Settings" className="p-1 hover:bg-stone-800">
          <Gear size={16} className="text-white/70" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => deleteSharedLink(link.id)} title="Delete" className="p-1 hover:bg-red-400/10">
          <Trash size={16} className="text-destructive" />
        </Button>
      </div>
    </div>
  </div>
      </CardHeader>


          {/* MAIN CONTENT */}
          <CardContent className="py-3 px-4 space-y-3">
            {/* Link input + quick actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input value={`${window.location.origin}/share/${link.share_token}`} readOnly className="font-mono text-xs md:text-sm flex-1 min-w-0 bg-black border border-white/6 text-white" />

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.share_token)} title="Copy link" className="border-white/8 text-white/80 p-2">
                  <Copy className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => window.open(`/share/${link.share_token}`, '_blank')} title="Open link" className="border-white/8 text-white/80 p-2">
                  <ArrowSquareOut className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => shortenLink(link.share_token)} title="Shorten link" className="border-white/8 text-white/80 p-2">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Message (if any) */}
            {link.message && <div className="p-2 rounded-md border border-white/6 bg-white/02">
                <p className="text-xs md:text-sm text-white/70 break-words">
                  <span className="font-medium text-white">Message: </span> {link.message}
                </p>
              </div>}

            {/* Mini analytics + suggestion row (bottom of card) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                
                <div className="text-xs">
                  
                  
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SuggestedAction link={link} onApplyAction={() => {
              if (!link.files.is_public && link.download_count > 20) {
                toggleFilePublicStatus(link.file_id, true);
                toast({
                  title: 'Suggested action applied',
                  description: 'File made public.'
                });
              } else {
                toast({
                  title: 'Tip',
                  description: 'Consider adding a password for more control.'
                });
              }
            }} />
              </div>
            </div>
          </CardContent>
        </Card>;
  })}
  </div>;

// ---------------------
// SuggestedAction - local heuristic "AI"
const SuggestedAction: React.FC<{
  link: SharedLink;
  onApplyAction: () => void;
}> = ({
  link,
  onApplyAction
}) => {
  const now = Date.now();
  const expiresAt = link.expires_at ? new Date(link.expires_at).getTime() : null;
  const in48h = expiresAt ? expiresAt - now <= 48 * 3600 * 1000 && expiresAt - now > 0 : false;
  const nearLimit = link.download_limit ? link.download_count / link.download_limit >= 0.75 : false;
  let suggestion = '';
  if (link.download_count > 30 && !link.files.is_public) suggestion = 'Make public to increase reach';else if (in48h) suggestion = 'Expiring soon — extend expiry';else if (nearLimit) suggestion = 'Near download limit — increase it';else if (!link.password_hash) suggestion = 'Consider protecting with a password';else suggestion = 'No action needed';
  const actionable = suggestion !== 'No action needed' && suggestion !== 'Consider protecting with a password';
  return <div className="flex items-center gap-2">
      
      {actionable}
    </div>;
};

// ---------------------
// Sparkline - tiny visual to show "trend" (purely illustrative)
const Sparkline: React.FC<{
  value: number;
}> = ({
  value
}) => {
  const base = Math.min(value, 50);
  const points = [base * 0.2, base * 0.4, base * 0.8, base * 0.6, base * 0.9, base].map(v => Math.max(2, v));
  const max = Math.max(...points);
  const width = 72;
  const height = 20;
  const step = width / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - p / max * (height - 4)}`).join(' ');
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.2} style={{
      color: 'rgba(255,255,255,0.85)'
    }} />
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
    </svg>;
};

// ---------------------
// Edit Link Settings Dialog (no switches)
const EditDialog: React.FC<{
  editingLink: SharedLink;
  setEditingLink: (l: SharedLink | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  saveEditedLink: () => void;
  toggleFilePublicStatus: (fileId: string | undefined, isPublic: boolean) => Promise<void>;
}> = ({
  editingLink,
  setEditingLink,
  isOpen,
  setIsOpen,
  saveEditedLink,
  toggleFilePublicStatus
}) => {
  const [local, setLocal] = useState<SharedLink | null>(editingLink);
  useEffect(() => setLocal(editingLink), [editingLink]);
  if (!local) return null;
  return <div aria-hidden={!isOpen}>
      {/* Using a simple dialog wrapper if your Dialog component exists use that instead */}
      {/* Kept minimal: no lock/unlock toggle */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'pointer-events-none'}`}>
        <div className="bg-black border border-white/10 rounded-lg max-w-lg w-full p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-white font-semibold">Edit Shared Link</h3>
            <button onClick={() => {
            setIsOpen(false);
            setEditingLink(null);
          }} className="text-white/60">Close</button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-white/70">Visibility</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => toggleFilePublicStatus(local.file_id, true)} className="text-white/80 border-white/6">Make Public</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleFilePublicStatus(local.file_id, false)} className="text-white/80 border-white/6">Make Private</Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-white/70">Optional message</Label>
              <Input value={local.message || ''} onChange={e => setLocal({
              ...local,
              message: e.target.value
            })} className="bg-black text-white border border-white/6 mt-2" />
            </div>

            <div className="text-xs text-white/60">
              Created on {new Date(local.created_at).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
            setIsOpen(false);
            setEditingLink(null);
          }} className="border-white/10 text-white/80">Cancel</Button>
            <Button onClick={() => {
            setEditingLink(local);
            saveEditedLink();
          }} className="bg-white text-black">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>;
};
