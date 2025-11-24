import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FolderTree, ChevronRight, Loader2, Trash2, Edit3, Settings, CheckCircle, XCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// --- Props & interfaces (kept unchanged in shape) ---
interface AIFileOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
  files: Array<{
    id: string;
    original_name: string;
    file_type: string;
    file_size: number;
    created_at?: string | null;
    [k: string]: any;
  }>;
  onOrganized: () => void;
}
interface OrganizationSuggestion {
  folderName: string;
  originalFolderName?: string;
  fileIds: string[];
  filesPreview: Array<{
    id: string;
    name: string;
    size: number;
    created_at?: string | null;
  }>;
  reason: string;
  fileCount: number;
  estimatedBytes: number;
  confidence: number; // 0..1
  enabled: boolean;
}

// Known extensions (same set, exposed as constants for easy tuning)
const KNOWN_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'heic', 'avif'];
const KNOWN_VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const KNOWN_AUDIO_EXT = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
const KNOWN_DOC_EXT = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'];
const KNOWN_SHEETS_EXT = ['xls', 'xlsx', 'csv', 'ods'];
const KNOWN_PRESENT_EXT = ['ppt', 'pptx', 'key', 'odp'];
const KNOWN_ARCHIVE_EXT = ['zip', 'rar', '7z', 'tar', 'gz'];
const KNOWN_CODE_EXT = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'go', 'rs'];

const lc = (s?: string) => (s || '').toLowerCase();

export function AIFileOrganizer({ isOpen, onClose, files, onOrganized }: AIFileOrganizerProps) {
  // UI state
  const [analyzing, setAnalyzing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([]);
  const [autoApplyHighConfidence, setAutoApplyHighConfidence] = useState(true);
  const [minAutoApplyConfidence, setMinAutoApplyConfidence] = useState(0.85);
  const [lastAnalysisAt, setLastAnalysisAt] = useState<Date | null>(null);

  // Search / filter / pagination for large suggestion sets
  const [query, setQuery] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40); // initial window for performance

  // Derived totals
  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.file_size || 0), 0), [files]);
  const totalFiles = files.length;

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setAnalyzing(false);
      setOrganizing(false);
      setLastAnalysisAt(null);
      setQuery('');
      setVisibleCount(40);
    }
  }, [isOpen]);

  // ---------- Helper utilities ----------
  const prettyBytes = (n = 0) => {
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const extFromName = (name: string) => {
    const m = name.match(/\.([a-z0-9]+)$/i);
    return m && m[1] ? m[1].toLowerCase() : '';
  };
  const fileTokens = (name: string) => lc(name)
    .replace(/[_\-\.]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // Score helper for token overlap
  const tokenScore = (tokensA: string[], tokensB: string[]) => {
    if (!tokensA.length || !tokensB.length) return 0;
    const setB = new Set(tokensB);
    let match = 0;
    for (const t of tokensA) if (setB.has(t)) match++;
    return match / Math.max(tokensA.length, 1);
  };

  // small safe title-casing for folder names
  const titleCase = (s: string) => s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // ---------- Analysis logic (improved & scalable) ----------
  const analyzeFiles = async () => {
    if (!files || files.length === 0) {
      toast.info('No files to analyze.');
      return;
    }
    setAnalyzing(true);
    try {
      const now = Date.now();
      const recencyWeight = (created_at?: string | null) => {
        if (!created_at) return 0.5;
        const then = new Date(created_at).getTime();
        const days = Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
        return Math.max(0.05, Math.min(1, Math.exp(-days / 180) * 1.1));
      };

      // We will build multiple complementary grouping heuristics so we can return many folder candidates
      // 1) Type groups (Images, Videos, Documents...) strong
      // 2) Token clusters: frequently occurring tokens across filenames -> name-based buckets
      // 3) Date-year buckets for archival suggestions
      // 4) Size-based "Large files" bucket

      const typeGroups: Map<string, { ids: string[]; bytes: number; preview: any[] }> = new Map();
      const tokenBuckets: Map<string, { ids: string[]; bytes: number; preview: any[]; token: string }> = new Map();
      const yearBuckets: Map<string, { ids: string[]; bytes: number; preview: any[] }> = new Map();
      const miscGroup: { ids: string[]; bytes: number; preview: any[] } = { ids: [], bytes: 0, preview: [] };

      // helper to add preview
      const addPreview = (arr: any[], file: any) => {
        if (arr.length >= 6) return;
        arr.push({ id: file.id, name: file.original_name, size: file.file_size || 0, created_at: file.created_at });
      };

      // pass1: collect token frequency for large inputs
      const tokenFreq: Record<string, number> = {};
      const fileMeta = files.map(f => {
        const name = f.original_name || 'unknown';
        const ext = extFromName(name) || lc(f.file_type || '');
        const tokens = fileTokens(name).filter(t => t.length > 1);
        for (const t of tokens) tokenFreq[t] = (tokenFreq[t] || 0) + 1;
        return { f, name, ext, tokens };
      });

      // choose candidate tokens that appear at least twice (tunable) and not too generic
      const tokenCandidates = Object.entries(tokenFreq)
        .filter(([token, cnt]) => cnt >= Math.max(2, Math.floor(files.length * 0.01))) // at least 1% of files or 2
        .sort((a, b) => b[1] - a[1])
        .slice(0, 200) // cap to avoid explosion for huge datasets
        .map(([t]) => t);

      // pass2: bucket files
      for (const { f, name, ext, tokens } of fileMeta) {
        const size = f.file_size || 0;
        const created = f.created_at;

        // type buckets (strong signal)
        if (KNOWN_IMAGE_EXT.includes(ext) || lc(f.file_type || '').includes('image')) {
          const key = 'Images';
          if (!typeGroups.has(key)) typeGroups.set(key, { ids: [], bytes: 0, preview: [] });
          const g = typeGroups.get(key)!;
          g.ids.push(f.id);
          g.bytes += size;
          addPreview(g.preview, f);
        } else if (KNOWN_VIDEO_EXT.includes(ext) || lc(f.file_type || '').includes('video')) {
          const key = 'Videos';
          if (!typeGroups.has(key)) typeGroups.set(key, { ids: [], bytes: 0, preview: [] });
          const g = typeGroups.get(key)!;
          g.ids.push(f.id);
          g.bytes += size;
          addPreview(g.preview, f);
        } else if (KNOWN_AUDIO_EXT.includes(ext) || lc(f.file_type || '').includes('audio')) {
          const key = 'Audio';
          if (!typeGroups.has(key)) typeGroups.set(key, { ids: [], bytes: 0, preview: [] });
          const g = typeGroups.get(key)!;
          g.ids.push(f.id);
          g.bytes += size;
          addPreview(g.preview, f);
        } else if (KNOWN_DOC_EXT.includes(ext) || lc(f.file_type || '').includes('pdf')) {
          const key = 'Documents';
          if (!typeGroups.has(key)) typeGroups.set(key, { ids: [], bytes: 0, preview: [] });
          const g = typeGroups.get(key)!;
          g.ids.push(f.id);
          g.bytes += size;
          addPreview(g.preview, f);
        } else if (KNOWN_CODE_EXT.includes(ext)) {
          const key = 'Code';
          if (!typeGroups.has(key)) typeGroups.set(key, { ids: [], bytes: 0, preview: [] });
          const g = typeGroups.get(key)!;
          g.ids.push(f.id);
          g.bytes += size;
          addPreview(g.preview, f);
        } else {
          miscGroup.ids.push(f.id);
          miscGroup.bytes += size;
          addPreview(miscGroup.preview, f);
        }

        // year bucket
        if (created) {
          const year = new Date(created).getFullYear();
          const ky = `Year ${year}`;
          if (!yearBuckets.has(ky)) yearBuckets.set(ky, { ids: [], bytes: 0, preview: [] });
          const yb = yearBuckets.get(ky)!;
          yb.ids.push(f.id);
          yb.bytes += size;
          addPreview(yb.preview, f);
        }

        // token buckets: for any token candidate present in file tokens
        for (const t of tokenCandidates) {
          if (tokens.includes(t)) {
            if (!tokenBuckets.has(t)) tokenBuckets.set(t, { ids: [], bytes: 0, preview: [], token: t });
            const tb = tokenBuckets.get(t)!;
            tb.ids.push(f.id);
            tb.bytes += size;
            addPreview(tb.preview, f);
          }
        }
      }

      // Build a combined list of suggestion candidates
      const built: OrganizationSuggestion[] = [];

      // push strong type groups first
      for (const [name, payload] of typeGroups.entries()) {
        const count = payload.ids.length;
        const bytes = payload.bytes;
        const countFactor = Math.min(1, Math.log2(count + 1) / 6);
        const byteFactor = Math.min(1, Math.log2(bytes + 1) / 24);
        const heuristicConfidence = Math.min(0.99, 0.6 + 0.4 * countFactor + 0.15 * byteFactor);
        built.push({
          folderName: name,
          originalFolderName: name,
          fileIds: payload.ids,
          filesPreview: payload.preview,
          reason: getReason(name, count),
          fileCount: count,
          estimatedBytes: bytes,
          confidence: Number(heuristicConfidence.toFixed(2)),
          enabled: heuristicConfidence >= 0.45
        });
      }

      // token buckets next (these are the meat for "many suggestions")
      for (const [token, payload] of Array.from(tokenBuckets.entries()).sort((a, b) => b[1].ids.length - a[1].ids.length)) {
        const count = payload.ids.length;
        // don't suggest tiny buckets unless there are many unique tokens requested
        if (count < 2) continue;
        const bytes = payload.bytes;
        const score = Math.min(0.95, 0.35 + Math.log2(count + 1) / 10 + Math.min(0.25, Math.log2(bytes + 1) / 24));
        const folderName = titleCase(token.replace(/[^a-z0-9]/gi, ' '));
        built.push({
          folderName: folderName,
          originalFolderName: folderName,
          fileIds: payload.ids,
          filesPreview: payload.preview,
          reason: `Grouped by keyword "${token}" found in ${count} file(s).`,
          fileCount: count,
          estimatedBytes: bytes,
          confidence: Number(score.toFixed(2)),
          enabled: score >= 0.45
        });
      }

      // year buckets (helpful for archives)
      for (const [y, payload] of yearBuckets.entries()) {
        const count = payload.ids.length;
        if (count < 3) continue; // avoid cluttering with years that have very few files
        const bytes = payload.bytes;
        const score = Math.min(0.9, 0.3 + Math.log2(count + 1) / 12 + Math.min(0.2, Math.log2(bytes + 1) / 26));
        built.push({
          folderName: y,
          originalFolderName: y,
          fileIds: payload.ids,
          filesPreview: payload.preview,
          reason: `Files grouped by year (${y.split(' ')[1]}).`,
          fileCount: count,
          estimatedBytes: bytes,
          confidence: Number(score.toFixed(2)),
          enabled: score >= 0.5
        });
      }

      // misc fallback
      if (miscGroup.ids.length > 0) {
        built.push({
          folderName: 'Miscellaneous',
          originalFolderName: 'Miscellaneous',
          fileIds: miscGroup.ids,
          filesPreview: miscGroup.preview,
          reason: 'Files that did not match stronger heuristics.',
          fileCount: miscGroup.ids.length,
          estimatedBytes: miscGroup.bytes,
          confidence: 0.25,
          enabled: false
        });
      }

      // sort suggestions by priority: enabled first, then confidence, then fileCount
      built.sort((a, b) => {
        const pa = (a.enabled ? 1 : 0) * 1000 + a.confidence * 100 + a.fileCount;
        const pb = (b.enabled ? 1 : 0) * 1000 + b.confidence * 100 + b.fileCount;
        return pb - pa;
      });

      // Cap suggestions to a large limit (e.g., 1000) but keep ability to handle big lists
      const final = built.slice(0, 1000);

      setSuggestions(final);
      setLastAnalysisAt(new Date());

      // if auto-apply is true, pre-set enabled flags where appropriate
      if (autoApplyHighConfidence) {
        setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));
      }

      toast.success(`Analysis complete — ${final.length} suggestion(s) ready.`);
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze files');
    } finally {
      setAnalyzing(false);
    }
  };

  // reason mapping similar to original
  const getReason = (folderName: string, count: number): string => {
    const reasons: Record<string, string> = {
      Images: 'Group all image files together for easy access.',
      Videos: 'Keep video files organized in one place.',
      Audio: 'Centralize audio and music files.',
      Documents: 'Organize text documents and PDFs.',
      Spreadsheets: 'Group Excel and CSV files.',
      Presentations: 'Keep presentation files together.',
      Archives: 'Organize compressed and backup archives.',
      Code: 'Group programming and source code files.',
      'Work Projects': 'Consolidate work-related files and project assets.',
      Personal: 'Group personal files separately for privacy and clarity.',
      Financial: 'Organize invoices, receipts and financial documents.',
      Photos: 'Centralize photo collections for easier browsing.',
      Backups: 'Keep backup files separated from active assets.',
      Miscellaneous: 'Miscellaneous files that don’t fit other categories.'
    };
    return reasons[folderName] || `Suggested folder for ${count} related file(s).`;
  };

  // UI actions
  const toggleSuggestion = (index: number) => {
    setSuggestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const editFolderName = (index: number, newName: string) => {
    setSuggestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], folderName: newName };
      return copy;
    });
  };

  // Apply organization to Supabase (keeps original behavior but batched & resilient)
  const applyOrganization = async () => {
    setOrganizing(true);
    try {
      const userRes = await supabase.auth.getUser();
      const user = (userRes as any)?.data?.user;
      if (!user) throw new Error('User not authenticated');

      const toApply = suggestions.filter(s => s.enabled);
      if (toApply.length === 0) {
        toast.info('No suggestions selected to apply.');
        setOrganizing(false);
        return;
      }

      // fetch existing folders for this user to avoid duplicates
      const folderNames = Array.from(new Set(toApply.map(s => s.folderName)));
      const { data: existingFolders, error: fetchFoldersError } = await supabase.from('folders').select('id,name').in('name', folderNames).eq('user_id', user.id);
      if (fetchFoldersError) {
        console.warn('Could not fetch existing folders:', fetchFoldersError);
      }

      const folderNameToId: Record<string, string> = {};
      if (existingFolders && Array.isArray(existingFolders)) {
        for (const f of existingFolders) if (f && f.name) folderNameToId[f.name] = f.id;
      }

      const results: Array<{ suggestion: OrganizationSuggestion; success: boolean; error?: any }> = [];

      // create or reuse folders and update files in chunks to avoid DB limits
      for (const suggestion of toApply) {
        try {
          let folderId = folderNameToId[suggestion.folderName];
          if (!folderId) {
            const insertRes = await supabase.from('folders').insert({ user_id: user.id, name: suggestion.folderName, parent_folder_id: null }).select().single();
            if (insertRes.error) throw insertRes.error;
            folderId = insertRes.data.id;
            folderNameToId[suggestion.folderName] = folderId;
          }

          // chunk updates in groups of 200 ids (safe default)
          const chunkSize = 200;
          for (let i = 0; i < suggestion.fileIds.length; i += chunkSize) {
            const chunk = suggestion.fileIds.slice(i, i + chunkSize);
            const updateRes = await supabase.from('files').update({ folder_id: folderId }).in('id', chunk);
            if (updateRes.error) throw updateRes.error;
          }

          results.push({ suggestion, success: true });
        } catch (err) {
          console.error('Error applying suggestion', suggestion.folderName, err);
          results.push({ suggestion, success: false, error: err });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      if (successCount > 0) toast.success(`Organized ${successCount} folder(s).`);
      if (failCount > 0) toast.error(`${failCount} folder(s) failed — check logs.`);

      onOrganized();
      onClose();
    } catch (err: any) {
      console.error('Organization error:', err);
      toast.error('Failed to organize files: ' + (err?.message || String(err)));
    } finally {
      setOrganizing(false);
    }
  };

  const resetSuggestions = () => setSuggestions([]);

  // convenience: enable by confidence threshold
  const applyAutoConfidenceFilter = () => setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));

  // filtered & visible suggestions (search + enabled toggle)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = suggestions;
    if (showOnlyEnabled) list = list.filter(s => s.enabled);
    if (q) list = list.filter(s => s.folderName.toLowerCase().includes(q) || s.reason.toLowerCase().includes(q));
    return list.slice(0, visibleCount);
  }, [suggestions, query, showOnlyEnabled, visibleCount]);

  // quick counts
  const enabledCount = suggestions.filter(s => s.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI File Organizer
          </DialogTitle>
          <DialogDescription>
            Deterministic, scalable suggestions — tuned to return large numbers of focused folders (token + type + year buckets).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FolderTree className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Analyze {totalFiles} file(s)</h3>
                  <p className="text-muted-foreground text-sm">The AI will inspect names, types, size, and creation date, then propose folders with confidence scores.</p>
                  <div className="mt-3 text-sm text-muted-foreground">{prettyBytes(totalBytes)} total · {totalFiles} files</div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={analyzeFiles} disabled={analyzing} className="flex-1">
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />Start AI Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { setSuggestions([]); toast('Reset'); }} className="flex-1">Reset</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-normal text-neutral-200">Organization Suggestions ({suggestions.length})</h4>
                  <div className="text-sm text-muted-foreground my-[4px]">{prettyBytes(totalBytes)} total · {totalFiles} files · analyzed {lastAnalysisAt ? lastAnalysisAt.toLocaleString() : '—'}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input placeholder="Search suggestions or reasons..." value={query} onChange={e => setQuery(e.target.value)} className="w-72" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showOnlyEnabled} onCheckedChange={(v: boolean) => setShowOnlyEnabled(v)} />
                    <span className="text-sm">Show only enabled</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Enabled: {enabledCount}</span>
                    <Separator orientation="vertical" />
                    <Button size="sm" onClick={() => setSuggestions(prev => prev.map(s => ({ ...s, enabled: true })))}>Select all</Button>
                    <Button size="sm" variant="outline" onClick={() => setSuggestions([])}>Clear</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-2">
                {filtered.map((s, idx) => {
                  const globalIdx = suggestions.indexOf(s);
                  return (
                    <Card key={`${s.folderName}-${globalIdx}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FolderTree className="h-6 w-6 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate" title={s.folderName}>{s.folderName}</h4>
                                    <Badge variant="outline" className="text-xs">{s.fileCount} files</Badge>
                                    <Badge variant="outline" className="text-xs">{(s.confidence * 100).toFixed(0)}%</Badge>
                                  </div>
                                  <div className="text-muted-foreground text-sm">{s.reason}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 my-0 mx-[9px]">
                                <button className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => {
                                  const newName = prompt('Edit folder name', s.folderName);
                                  if (newName && newName.trim()) editFolderName(globalIdx, newName.trim());
                                }} title="Edit folder name"><Edit3 className="h-4 w-4 text-zinc-400" /></button>

                                <button className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => setSuggestions(prev => prev.filter(p => p !== s))} title="Remove suggestion"><Trash2 className="h-4 w-4 text-red-400" /></button>

                                <button className={`flex items-center gap-1 text-sm px-2 py-1 border rounded ${s.enabled ? 'bg-green-600/10' : ''}`} onClick={() => toggleSuggestion(globalIdx)} title="Toggle enable">
                                  {s.enabled ? <><CheckCircle className="h-4 w-4 text-green-400" /> Enabled</> : <><XCircle className="h-4 w-4 text-zinc-400" /> Enable</>}
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {s.filesPreview.map(fp => (
                                <div key={fp.id} className="text-xs border rounded p-2">
                                  <div className="truncate font-medium" title={fp.name}>{fp.name}</div>
                                  <div className="text-muted-foreground">{prettyBytes(fp.size)}</div>
                                  {fp.created_at ? <div className="text-muted-foreground text-[10px]">{new Date(fp.created_at).toLocaleDateString()}</div> : null}
                                </div>
                              ))}
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => { setVisibleCount(prev => prev + 40); }}>Load more</Button>
                  <div className="text-sm text-muted-foreground">Showing {Math.min(visibleCount, suggestions.length)} of {suggestions.length}</div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={resetSuggestions} className="flex-1">Cancel</Button>
                  <Button onClick={async () => {
                    if (autoApplyHighConfidence) {
                      setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));
                      await new Promise(res => setTimeout(res, 80));
                    }
                    applyOrganization();
                  }} disabled={organizing} className="flex-1">
                    {organizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Organizing...</> : <><FolderTree className="mr-2 h-4 w-4" />Apply Organization</>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AIFileOrganizer;
