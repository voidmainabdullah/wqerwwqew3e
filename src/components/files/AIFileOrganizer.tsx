import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  FolderTree,
  ChevronRight,
  Loader2,
  Trash2,
  Edit3,
  Settings,
  CheckCircle,
  XCircle,
  BarChart2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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
  filesPreview: Array<{ id: string; name: string; size: number; created_at?: string | null }>;
  reason: string;
  fileCount: number;
  estimatedBytes: number;
  confidence: number;
  enabled: boolean;
}

const KNOWN_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'heic', 'avif'];
const KNOWN_VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const KNOWN_AUDIO_EXT = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
const KNOWN_DOC_EXT = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'];
const KNOWN_SHEETS_EXT = ['xls', 'xlsx', 'csv', 'ods'];
const KNOWN_PRESENT_EXT = ['ppt', 'pptx', 'key', 'odp'];
const KNOWN_ARCHIVE_EXT = ['zip', 'rar', '7z', 'tar', 'gz'];
const KNOWN_CODE_EXT = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'go', 'rs'];

const lc = (s?: string) => (s || '').toLowerCase();

export default function AIFileOrganizer({ isOpen, onClose, files, onOrganized }: AIFileOrganizerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([]);
  const [autoApplyHighConfidence, setAutoApplyHighConfidence] = useState(true);
  const [minAutoApplyConfidence, setMinAutoApplyConfidence] = useState(0.85);
  const [lastAnalysisAt, setLastAnalysisAt] = useState<Date | null>(null);
  const [query, setQuery] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [useRemoteML, setUseRemoteML] = useState(true);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.file_size || 0), 0), [files]);
  const totalFiles = files.length;

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setAnalyzing(false);
      setOrganizing(false);
      setLastAnalysisAt(null);
      setQuery('');
      setExpandedIndex(null);
    }
  }, [isOpen]);

  const prettyBytes = (n = 0) => {
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const extFromName = (name: string) => {
    const m = name.match(/\.([a-z0-9]+)$/i);
    return (m && m[1]) ? m[1].toLowerCase() : '';
  };

  const fileTokens = (name: string) =>
    lc(name)
      .replace(/[_\-.]/g, ' ')
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const localAnalyze = async () => {
    setAnalyzing(true);
    try {
      const tokenScore = (tokens: string[], nameTokens: string[]) => {
        let score = 0;
        for (const t of tokens) if (nameTokens.includes(t)) score += 1;
        return score / Math.max(1, tokens.length);
      };

      const groups: Map<string, { ids: string[]; bytes: number; preview: Array<{ id: string; name: string; size: number; created_at?: string | null }> }> = new Map();

      const addToGroup = (name: string, file: any) => {
        if (!groups.has(name)) groups.set(name, { ids: [], bytes: 0, preview: [] });
        const g = groups.get(name)!;
        g.ids.push(file.id);
        g.bytes += file.file_size || 0;
        if (g.preview.length < 6) g.preview.push({ id: file.id, name: file.original_name, size: file.file_size || 0, created_at: file.created_at });
      };

      const now = Date.now();
      const recencyWeight = (created_at?: string | null) => {
        if (!created_at) return 0.5;
        const then = new Date(created_at).getTime();
        const days = Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
        return Math.max(0.1, Math.min(1, Math.exp(-days / 90) * 1.2));
      };

      for (const f of files) {
        const name = f.original_name || 'unknown';
        const ext = extFromName(name) || lc(f.file_type || '');
        const tokens = fileTokens(name);

        const candidates: Array<{ category: string; score: number; reasonTags: string[] }> = [];

        if (KNOWN_IMAGE_EXT.includes(ext) || lc(f.file_type || '').includes('image')) candidates.push({ category: 'Images', score: 1.0, reasonTags: ['type:image'] });
        else if (KNOWN_VIDEO_EXT.includes(ext) || lc(f.file_type || '').includes('video')) candidates.push({ category: 'Videos', score: 1.0, reasonTags: ['type:video'] });
        else if (KNOWN_AUDIO_EXT.includes(ext) || lc(f.file_type || '').includes('audio')) candidates.push({ category: 'Audio', score: 1.0, reasonTags: ['type:audio'] });
        else if (KNOWN_DOC_EXT.includes(ext) || lc(f.file_type || '').includes('pdf')) candidates.push({ category: 'Documents', score: 0.95, reasonTags: ['type:doc'] });
        else if (KNOWN_SHEETS_EXT.includes(ext)) candidates.push({ category: 'Spreadsheets', score: 0.95, reasonTags: ['type:sheet'] });
        else if (KNOWN_PRESENT_EXT.includes(ext)) candidates.push({ category: 'Presentations', score: 0.95, reasonTags: ['type:presentation'] });
        else if (KNOWN_ARCHIVE_EXT.includes(ext)) candidates.push({ category: 'Archives', score: 0.95, reasonTags: ['type:archive'] });
        else if (KNOWN_CODE_EXT.includes(ext)) candidates.push({ category: 'Code', score: 0.95, reasonTags: ['type:code'] });
        else candidates.push({ category: 'Miscellaneous', score: 0.3, reasonTags: ['type:unknown'] });

        if (tokens.some(t => ['invoice', 'receipt', 'bill', 'payment'].includes(t))) candidates.push({ category: 'Financial', score: 0.9, reasonTags: ['name:financial'] });
        if (tokens.some(t => ['project', 'proj', 'task', 'client', 'work', 'spec'].includes(t))) candidates.push({ category: 'Work Projects', score: 0.9, reasonTags: ['name:project'] });
        if (tokens.some(t => ['personal', 'private', 'diary'].includes(t))) candidates.push({ category: 'Personal', score: 0.9, reasonTags: ['name:personal'] });
        if (tokens.some(t => ['backup', 'bak', 'snap'].includes(t))) candidates.push({ category: 'Backups', score: 0.95, reasonTags: ['name:backup'] });
        if (tokens.some(t => ['photo', 'pic', 'image', 'img', 'portrait'].includes(t))) candidates.push({ category: 'Photos', score: 0.93, reasonTags: ['name:photo'] });
        if (tokens.some(t => /\b20(1[5-9]|2[0-9])\b/.test(t))) {
          const matched = tokens.find(t => t.match(/\b20(1[5-9]|2[0-9])\b/));
          candidates.push({ category: `Files ${matched}`, score: 0.7, reasonTags: ['name:year'] });
        }

        const projectTokens = ['website', 'app', 'design', 'logo', 'proposal', 'contract'];
        const ts = tokenScore(projectTokens, tokens);
        if (ts > 0) candidates.push({ category: 'Work Projects', score: 0.6 + ts * 0.3, reasonTags: ['tokens:project-like'] });

        let best = candidates[0];
        for (const c of candidates) if (c.score > best.score) best = c;

        const recW = recencyWeight(f.created_at);
        const sizeFactor = Math.min(1, Math.log2((f.file_size || 1) + 1) / 20 + 0.5);
        const finalConfidence = Math.min(1, Math.max(0, best.score * (0.5 + 0.45 * recW) * (0.6 + 0.4 * sizeFactor)));

        addToGroup(best.category, f);
      }

      if (groups.has('Images') && groups.has('Photos')) {
        const imgs = groups.get('Images')!;
        const photos = groups.get('Photos')!;
        if (imgs.ids.length <= photos.ids.length) {
          photos.ids.push(...imgs.ids);
          photos.bytes += imgs.bytes;
          photos.preview = photos.preview.concat(imgs.preview).slice(0, 6);
          groups.delete('Images');
        } else {
          imgs.ids.push(...photos.ids);
          imgs.bytes += photos.bytes;
          imgs.preview = imgs.preview.concat(photos.preview).slice(0, 6);
          groups.delete('Photos');
        }
      }

      const built: OrganizationSuggestion[] = [];
      for (const [folderName, payload] of Array.from(groups.entries())) {
        const count = payload.ids.length;
        const bytes = payload.bytes;
        const countFactor = Math.min(1, Math.log2(count + 1) / 6);
        const byteFactor = Math.min(1, Math.log2(bytes + 1) / 24);
        const heuristicConfidence = Math.min(0.99, 0.4 + 0.5 * countFactor + 0.2 * byteFactor);

        const reason = getReason(folderName, count);

        const suggestion: OrganizationSuggestion = {
          folderName,
          originalFolderName: folderName,
          fileIds: payload.ids,
          filesPreview: payload.preview,
          reason,
          fileCount: count,
          estimatedBytes: bytes,
          confidence: Number(heuristicConfidence.toFixed(2)),
          enabled: heuristicConfidence >= 0.45,
        };
        built.push(suggestion);
      }

      built.sort((a, b) => {
        const pa = (a.enabled ? 1 : 0) * 100 + a.confidence * 10 + a.fileCount;
        const pb = (b.enabled ? 1 : 0) * 100 + b.confidence * 10 + b.fileCount;
        return pb - pa;
      });

      setSuggestions(built);
      setLastAnalysisAt(new Date());
      toast.success(`Analysis complete — ${built.length} suggestion(s) ready.`);
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze files');
    } finally {
      setAnalyzing(false);
    }
  };

  const remoteAnalyze = async () => {
    setAnalyzing(true);
    try {
      const batch = files.map(f => ({ id: f.id, name: f.original_name, type: f.file_type, size: f.file_size }));
      const { data, error } = await supabase.functions.invoke('ml-analyze-files', { body: { files: batch } });
      if (error) throw error;
      if (!data) throw new Error('No data from ML function');

      const built: OrganizationSuggestion[] = data.suggestions.map((s: any) => ({
        folderName: s.folderName,
        originalFolderName: s.folderName,
        fileIds: s.fileIds,
        filesPreview: s.preview || [],
        reason: s.reason || getReason(s.folderName, s.fileIds.length),
        fileCount: s.fileIds.length,
        estimatedBytes: s.estimatedBytes || 0,
        confidence: Number((s.confidence ?? 0.6).toFixed(2)),
        enabled: (s.confidence ?? 0.6) >= 0.45,
      }));

      built.sort((a, b) => (b.confidence - a.confidence) || (b.fileCount - a.fileCount));
      setSuggestions(built);
      setLastAnalysisAt(new Date());
      toast.success(`ML analysis complete — ${built.length} suggestion(s).`);
    } catch (err: any) {
      console.error(err);
      toast.error('Remote ML analysis failed, falling back to local logic');
      await localAnalyze();
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeFiles = async () => {
    if (!files || files.length === 0) {
      toast.info('No files to analyze.');
      return;
    }

    if (useRemoteML) await remoteAnalyze(); else await localAnalyze();
  };

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
      Miscellaneous: 'Miscellaneous files that don’t fit other categories.',
    };
    return reasons[folderName] || `Suggested folder for ${count} related file(s).`;
  };

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

      const folderNames = toApply.map(s => s.folderName);
      const { data: existingFolders, error: fetchFoldersError } = await supabase
        .from('folders')
        .select('id,name')
        .in('name', folderNames)
        .eq('user_id', user.id);

      if (fetchFoldersError) console.warn('Could not fetch existing folders:', fetchFoldersError);

      const folderNameToId: Record<string, string> = {};
      if (existingFolders && Array.isArray(existingFolders)) for (const f of existingFolders) if (f && f.name) folderNameToId[f.name] = f.id;

      const results: Array<{ suggestion: OrganizationSuggestion; success: boolean; error?: any }> = [];

      for (const suggestion of toApply) {
        try {
          let folderId = folderNameToId[suggestion.folderName];
          if (!folderId) {
            const insertRes = await supabase
              .from('folders')
              .insert({ user_id: user.id, name: suggestion.folderName, parent_folder_id: null })
              .select()
              .single();
            if (insertRes.error) throw insertRes.error;
            folderId = insertRes.data.id;
            folderNameToId[suggestion.folderName] = folderId;
          }

          const updateRes = await supabase.from('files').update({ folder_id: folderId }).in('id', suggestion.fileIds);
          if (updateRes.error) throw updateRes.error;

          await supabase.from('organization_logs').insert({ user_id: user.id, folder_id: folderId, file_count: suggestion.fileIds.length, total_bytes: suggestion.estimatedBytes, suggestion_confidence: suggestion.confidence, created_at: new Date().toISOString(), folder_name: suggestion.folderName, details: JSON.stringify({ files: suggestion.fileIds.slice(0, 20) }) });

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

  const applyAutoConfidenceFilter = () => setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));

  const filtered = suggestions.filter(s => (!showOnlyEnabled || s.enabled) && (s.folderName.toLowerCase().includes(query.toLowerCase()) || s.reason.toLowerCase().includes(query.toLowerCase())));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-surface/80 dark:bg-surface-dark rounded-lg shadow-lg overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base">AI File Organizer</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Intelligent suggestions — review and apply</DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart2 className="h-4 w-4" />
                  <div>{prettyBytes(totalBytes)} · {totalFiles} files</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Auto-apply high confidence</span>
                  </div>
                  <Switch checked={autoApplyHighConfidence} onCheckedChange={(v: boolean) => setAutoApplyHighConfidence(v)} />
                </div>

                <div className="flex items-center gap-2">
                  <input title="Use remote ML function if available" type="checkbox" checked={useRemoteML} onChange={(e) => setUseRemoteML(e.target.checked)} className="hidden" />
                </div>

                <Button variant="ghost" onClick={onClose} title="Close dialog">Close</Button>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search suggestions or reasons" aria-label="Search suggestions" />
              </div>

              <div className="flex gap-2 items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowOnlyEnabled(!showOnlyEnabled); }} title="Toggle to show only selected suggestions">{showOnlyEnabled ? 'Showing: Enabled' : 'Show All'}</Button>
                <Button onClick={analyzeFiles} disabled={analyzing} title="Analyze files with AI">
                  {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze</>}
                </Button>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <FolderTree className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Analyze {totalFiles} file(s)</div>
                      <div className="text-sm text-muted-foreground">AI inspects names, types, size and usage patterns to suggest folders.</div>
                    </div>

                    <div className="w-full mt-3 flex gap-2">
                      <Button onClick={analyzeFiles} disabled={analyzing} className="flex-1">{analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Working...</> : <><Sparkles className="mr-2 h-4 w-4" />Start Analysis</>}</Button>
                      <Button variant="outline" onClick={() => { resetSuggestions(); toast('Reset'); }} className="hidden sm:inline-flex">Reset</Button>
                    </div>
                  </div>
                </CardContent>
              </Card> 
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-md">Organization Suggestions ({filtered.length})</div>
                    <div className="text-sm text-muted-foreground">Analyzed at {lastAnalysisAt ? lastAnalysisAt.toLocaleString() : '—'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground hidden sm:block">Min auto apply confidence</div>
                    <Input value={String(minAutoApplyConfidence)} onChange={(e) => { const val = Number(e.target.value); if (!Number.isNaN(val)) setMinAutoApplyConfidence(Math.max(0, Math.min(1, val))); }} className="w-20 text-xs" />
                    <Button size="sm" variant="outline" onClick={applyAutoConfidenceFilter}>Apply</Button>
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  {filtered.map((s, idx) => (
                    <Card key={s.folderName + idx}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FolderTree className="h-6 w-6 text-primary" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate" title={s.folderName}>{s.folderName}</h4>
                                    <Badge variant="outline" className="text-xs hidden sm:inline">{s.fileCount} files</Badge>
                                    <Badge variant="secondary" className="text-xs">{Math.round(s.confidence * 100)}%</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate" title={s.reason}>{s.reason}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button aria-label={s.enabled ? 'Disable suggestion' : 'Enable suggestion'} title={s.enabled ? 'Disable suggestion' : 'Enable suggestion'} className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => toggleSuggestion(idx)}>
                                  {s.enabled ? <Check className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                  <span className="hidden sm:inline">{s.enabled ? 'Enabled' : 'Disabled'}</span>
                                </button>

                                <button aria-label="Edit folder name" title="Edit folder name" className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => { const newName = prompt('Edit folder name', s.folderName); if (newName && newName.trim()) editFolderName(idx, newName.trim()); }}>
                                  <Edit3 className="h-4 w-4" />
                                </button>

                                <button aria-label="Remove suggestion" title="Remove suggestion" className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => setSuggestions(prev => prev.filter((_, i) => i !== idx))}>
                                  <Trash2 className="h-4 w-4" />
                                </button>

                                <button aria-label="Toggle details" title="Toggle details" className="flex items-center gap-1 text-sm px-2 py-1 border rounded" onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                                  <ChevronRight className={`h-4 w-4 transform transition-transform ${expandedIndex === idx ? 'rotate-90' : ''}`} />
                                </button>
                              </div>
                            </div>

                            <div className={`mt-3 grid ${expandedIndex === idx ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}> 
                              {s.filesPreview.map(fp => (
                                <div key={fp.id} className="text-xs border rounded p-2 flex items-start gap-2" title={fp.name}>
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium">{fp.name}</div>
                                    <div className="text-muted-foreground text-[11px]">{prettyBytes(fp.size)}</div>
                                    {fp.created_at ? <div className="text-muted-foreground text-[10px]">{new Date(fp.created_at).toLocaleDateString()}</div> : null}
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button variant="outline" onClick={resetSuggestions} className="w-full sm:w-1/2">Cancel</Button>
                  <Button onClick={async () => { if (autoApplyHighConfidence) { setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence }))); await new Promise(res => setTimeout(res, 120)); } applyOrganization(); }} disabled={organizing} className="w-full sm:w-1/2">
                    {organizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Organizing...</> : <><FolderTree className="mr-2 h-4 w-4" />Apply Organization</>}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
