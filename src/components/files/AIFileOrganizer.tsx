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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// Keep the same props and interfaces as you provided (no breaking changes)
interface AIFileOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
  files: Array<{
    id: string;
    original_name: string;
    file_type: string;
    file_size: number;
    created_at?: string | null;
    // keep flexible for any additional metadata your backend supplies
    [k: string]: any;
  }>;
  onOrganized: () => void;
}

interface OrganizationSuggestion {
  folderName: string;
  originalFolderName?: string; // for when user edits name
  fileIds: string[];
  filesPreview: Array<{ id: string; name: string; size: number; created_at?: string | null }>;
  reason: string;
  fileCount: number;
  estimatedBytes: number;
  confidence: number; // 0..1
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

// small helper: safe lowercase
const lc = (s?: string) => (s || '').toLowerCase();

export function AIFileOrganizer({ isOpen, onClose, files, onOrganized }: AIFileOrganizerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([]);
  const [autoApplyHighConfidence, setAutoApplyHighConfidence] = useState(true);
  const [minAutoApplyConfidence, setMinAutoApplyConfidence] = useState(0.85);
  const [lastAnalysisAt, setLastAnalysisAt] = useState<Date | null>(null);

  // Derived totals
  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.file_size || 0), 0), [files]);
  const totalFiles = files.length;

  useEffect(() => {
    // Reset suggestions when closed or files change
    if (!isOpen) {
      setSuggestions([]);
      setAnalyzing(false);
      setOrganizing(false);
      setLastAnalysisAt(null);
    }
  }, [isOpen]);

  // --- Analysis logic (deterministic heuristics to feel "intelligent") ---
  const analyzeFiles = async () => {
    if (!files || files.length === 0) {
      toast.info('No files to analyze.');
      return;
    }

    setAnalyzing(true);
    try {
      // small helpers
      const extFromName = (name: string) => {
        const m = name.match(/\.([a-z0-9]+)$/i);
        return (m && m[1]) ? m[1].toLowerCase() : '';
      };

      // tokenize name to help with fuzzy categories
      const tokenScore = (tokens: string[], nameTokens: string[]) => {
        let score = 0;
        for (const t of tokens) {
          if (nameTokens.includes(t)) score += 1;
        }
        return score / Math.max(1, tokens.length);
      };

      // produce normalized name tokens for a file
      const fileTokens = (name: string) =>
        lc(name)
          .replace(/[_\-\.]/g, ' ')
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(Boolean);

      // grouping map: categoryName -> { ids, bytes, preview }
      const groups: Map<
        string,
        { ids: string[]; bytes: number; preview: Array<{ id: string; name: string; size: number; created_at?: string | null }> }
      > = new Map();

      // add to group helper
      const addToGroup = (name: string, file: any) => {
        if (!groups.has(name)) groups.set(name, { ids: [], bytes: 0, preview: [] });
        const g = groups.get(name)!;
        g.ids.push(file.id);
        g.bytes += file.file_size || 0;
        if (g.preview.length < 6) {
          g.preview.push({ id: file.id, name: file.original_name, size: file.file_size || 0, created_at: file.created_at });
        }
      };

      // precompute recency and size info
      const now = Date.now();
      const recencyWeight = (created_at?: string | null) => {
        if (!created_at) return 0.5;
        const then = new Date(created_at).getTime();
        const days = Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
        // more recent => higher weight (exponential decay)
        return Math.max(0.1, Math.min(1, Math.exp(-days / 120) * 1.2));
      };

      // iterate files and apply heuristics
      for (const f of files) {
        const name = f.original_name || 'unknown';
        const ext = extFromName(name) || lc(f.file_type || '');
        const tokens = fileTokens(name);

        // Base category candidates with scores
        const candidates: Array<{ category: string; score: number; reasonTags: string[] }> = [];

        // Type-based heuristics (strong)
        if (KNOWN_IMAGE_EXT.includes(ext) || lc(f.file_type || '').includes('image')) {
          candidates.push({ category: 'Images', score: 1.0, reasonTags: ['type:image'] });
        } else if (KNOWN_VIDEO_EXT.includes(ext) || lc(f.file_type || '').includes('video')) {
          candidates.push({ category: 'Videos', score: 1.0, reasonTags: ['type:video'] });
        } else if (KNOWN_AUDIO_EXT.includes(ext) || lc(f.file_type || '').includes('audio')) {
          candidates.push({ category: 'Audio', score: 1.0, reasonTags: ['type:audio'] });
        } else if (KNOWN_DOC_EXT.includes(ext) || lc(f.file_type || '').includes('pdf')) {
          candidates.push({ category: 'Documents', score: 0.95, reasonTags: ['type:doc'] });
        } else if (KNOWN_SHEETS_EXT.includes(ext)) {
          candidates.push({ category: 'Spreadsheets', score: 0.95, reasonTags: ['type:sheet'] });
        } else if (KNOWN_PRESENT_EXT.includes(ext)) {
          candidates.push({ category: 'Presentations', score: 0.95, reasonTags: ['type:presentation'] });
        } else if (KNOWN_ARCHIVE_EXT.includes(ext)) {
          candidates.push({ category: 'Archives', score: 0.95, reasonTags: ['type:archive'] });
        } else if (KNOWN_CODE_EXT.includes(ext)) {
          candidates.push({ category: 'Code', score: 0.95, reasonTags: ['type:code'] });
        } else {
          // fallback generic
          candidates.push({ category: 'Miscellaneous', score: 0.3, reasonTags: ['type:unknown'] });
        }

        // Name-based heuristics (medium)
        if (tokens.some(t => ['invoice', 'receipt', 'bill', 'payment'].includes(t))) {
          candidates.push({ category: 'Financial', score: 0.9, reasonTags: ['name:financial'] });
        }
        if (tokens.some(t => ['project', 'proj', 'task', 'client', 'work', 'spec'].includes(t))) {
          candidates.push({ category: 'Work Projects', score: 0.9, reasonTags: ['name:project'] });
        }
        if (tokens.some(t => ['personal', 'private', 'diary', 'personalnotes'].includes(t))) {
          candidates.push({ category: 'Personal', score: 0.9, reasonTags: ['name:personal'] });
        }
        if (tokens.some(t => ['backup', 'bak', 'backup-202', 'snap'].includes(t))) {
          candidates.push({ category: 'Backups', score: 0.95, reasonTags: ['name:backup'] });
        }
        if (tokens.some(t => ['photo', 'pic', 'image', 'img', 'portrait'].includes(t))) {
          candidates.push({ category: 'Photos', score: 0.93, reasonTags: ['name:photo'] });
        }
        if (tokens.some(t => /\b20(1[5-9]|2[0-9])\b/.test(t))) {
          // date-like tokens e.g., 2024
          const matched = tokens.find(t => t.match(/\b20(1[5-9]|2[0-9])\b/));
          candidates.push({ category: `Files ${matched}`, score: 0.7, reasonTags: ['name:year'] });
        }

        // token-based small project grouping (medium-low)
        const projectTokens = ['website', 'app', 'design', 'logo', 'proposal', 'contract'];
        const ts = tokenScore(projectTokens, tokens);
        if (ts > 0) candidates.push({ category: 'Work Projects', score: 0.6 + ts * 0.3, reasonTags: ['tokens:project-like'] });

        // combine scores into final category selection
        // weighting: type heuristics more important, name heuristics next, recency and size nudge
        // compute best candidate
        let best = candidates[0]; 
        for (const c of candidates) {
          if (c.score > best.score) best = c;
        }

        // compute confidence: base candidate score * recencyWeight * size factor
        const recW = recencyWeight(f.created_at);
        const sizeFactor = Math.min(1, Math.log2((f.file_size || 1) + 1) / 20 + 0.5); // small files less influence
        const finalConfidence = Math.min(1, Math.max(0, best.score * (0.5 + 0.4 * recW) * (0.6 + 0.4 * sizeFactor)));

        addToGroup(best.category, f);

        // store a secondary 'low confidence fallback' for files that were put into "Miscellaneous"
        // e.g. keep track of tokens to later try to merge small similar groups
      } // end for files

      // Post-process groups to merge similar small groups and create reasonable folder names
      // heuristics: if there is "Images" and "Photos" merge into "Photos" (prefer more specific)
      if (groups.has('Images') && groups.has('Photos')) {
        const imgs = groups.get('Images')!;
        const photos = groups.get('Photos')!;
        // merge smaller into larger
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

      // convert to suggestions list with computed confidence and reason
      const built: OrganizationSuggestion[] = [];
      for (const [folderName, payload] of Array.from(groups.entries())) {
        // compute a synthetic confidence: lots of files + bytes + distribution
        const count = payload.ids.length;
        const bytes = payload.bytes;
        // fileCount factor
        const countFactor = Math.min(1, Math.log2(count + 1) / 6); // >64 files => ~1
        const byteFactor = Math.min(1, Math.log2(bytes + 1) / 24); // large total size nudges confidence
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
          enabled: heuristicConfidence >= 0.45, // default enable if somewhat confident
        };
        built.push(suggestion);
      }

      // Sort suggestions by a combined priority: enabled & confidence & fileCount
      built.sort((a, b) => {
        const pa = (a.enabled ? 1 : 0) * 100 + a.confidence * 10 + a.fileCount;
        const pb = (b.enabled ? 1 : 0) * 100 + b.confidence * 10 + b.fileCount;
        return pb - pa;
      });

      // If auto-apply high confidence is ON, pre-mark the high ones (done by enabled flag above)
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

  // simple reason fallback (keeps your original getReason mapping but extended)
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

  // allow user to toggle / change folder name locally
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

  // Apply organization: create or reuse folders and move files
  const applyOrganization = async () => {
    setOrganizing(true);
    try {
      const userRes = await supabase.auth.getUser();
      // supabase v2: userRes.data.user may be undefined
      const user = (userRes as any)?.data?.user;
      if (!user) throw new Error('User not authenticated');

      // pick only enabled suggestions
      const toApply = suggestions.filter(s => s.enabled);
      if (toApply.length === 0) {
        toast.info('No suggestions selected to apply.');
        setOrganizing(false);
        return;
      }

      // Check existing folders for this user to avoid duplicates
      const folderNames = toApply.map(s => s.folderName);
      const { data: existingFolders, error: fetchFoldersError } = await supabase
        .from('folders')
        .select('id,name')
        .in('name', folderNames)
        .eq('user_id', user.id);

      if (fetchFoldersError) {
        console.warn('Could not fetch existing folders:', fetchFoldersError);
        // continue — we'll attempt to create folders (may cause duplicates)
      }

      // map folder name -> id (from existing or after creation)
      const folderNameToId: Record<string, string> = {};
      if (existingFolders && Array.isArray(existingFolders)) {
        for (const f of existingFolders) {
          if (f && f.name) folderNameToId[f.name] = f.id;
        }
      }

      // loop suggestions and create missing folders then update file folder_id
      const appliedFolderIds: string[] = [];
      const results: Array<{ suggestion: OrganizationSuggestion; success: boolean; error?: any }> = [];

      for (const suggestion of toApply) { 
        try {
          let folderId = folderNameToId[suggestion.folderName];
          // if folder doesn't exist create it
          if (!folderId) {
            const insertRes = await supabase
              .from('folders')
              .insert({
                user_id: user.id,
                name: suggestion.folderName,
                parent_folder_id: null,
              })
              .select()
              .single();
            if (insertRes.error) throw insertRes.error;
            folderId = insertRes.data.id;
            // record in map so we won't create again
            folderNameToId[suggestion.folderName] = folderId;
          }

          // update files in bulk
          const updateRes = await supabase
            .from('files')
            .update({ folder_id: folderId })
            .in('id', suggestion.fileIds);

          if (updateRes.error) throw updateRes.error;

          appliedFolderIds.push(folderId);

          // create an organization log row (optional analytics) - skipped as table doesn't exist
          // This could be tracked in audit_logs or a custom table if needed

          results.push({ suggestion, success: true });
        } catch (err) {
          console.error('Error applying suggestion', suggestion.folderName, err);
          results.push({ suggestion, success: false, error: err });
        }
      }

      // Report summary
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      if (successCount > 0) {
        toast.success(`Organized ${successCount} folder(s).`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} folder(s) failed — check logs.`);
      }

      onOrganized(); // let parent refresh
      onClose();
    } catch (err: any) {
      console.error('Organization error:', err);
      toast.error('Failed to organize files: ' + (err?.message || String(err)));
    } finally {
      setOrganizing(false);
    }
  };

  // Undo/clear suggestions
  const resetSuggestions = () => {
    setSuggestions([]);
  };

  // Quick UI helpers
  const prettyBytes = (n = 0) => {
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  // If auto-apply is on, we can pre-enable suggestions above threshold (already done in analyze),
  // but here we provide a one-click to enable / disable based on confidence
  const applyAutoConfidenceFilter = () => {
    setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI File Organizer
          </DialogTitle>
          <DialogDescription>
            Smart, deterministic organization suggestions — tuned for predictability and safety.
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
                  <p className="text-muted-foreground text-sm">
                    The AI will inspect names, types, size, and creation date, then propose folders with confidence scores.
                  </p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {prettyBytes(totalBytes)} total · {totalFiles} files
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={analyzeFiles} disabled={analyzing} className="flex-1">
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { setSuggestions([]); toast('Reset'); }} className="flex-1">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className=" text-md font-semibold">Organization Suggestions ({suggestions.length})</h3>
                  <div className="text-sm text-muted-foreground">
                    {prettyBytes(totalBytes)} total · {totalFiles} files · analyzed {lastAnalysisAt ? lastAnalysisAt.toLocaleString() : '—'}
                  </div>
                </div>

                <div className="flex items-center gap-3 hidden">
                  <div className="flex items-center gap-2 text-sm hidden">
                    <Settings className="h-4 w-4" />
                    <span>Auto-apply high confidence</span>
                  </div>
                  <Switch checked={autoApplyHighConfidence} onCheckedChange={(v: boolean) => setAutoApplyHighConfidence(v)} />
                  <div className="flex items-center gap-2 pl-2">
                    <Input
                      value={String(minAutoApplyConfidence)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) setMinAutoApplyConfidence(Math.max(0, Math.min(1, val)));
                      }}
                      className="w-20"
                    />
                    <Button onClick={applyAutoConfidenceFilter} size="sm">Apply</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-2">
                {suggestions.map((s, idx) => (
                  <Card key={s.folderName + idx}>
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
                                  <h4 className="font-semibold truncate">{s.folderName}</h4>
                                  <Badge variant="outline" className="text-xs">{s.fileCount} files</Badge>
                                  <Badge variant="secondary" className="text-xs">{s.confidence * 100}%</Badge>
                                </div>
                                <div className="text-muted-foreground text-sm">{s.reason}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1 text-sm px-2 py-1 border rounded"
                                onClick={() => toggleSuggestion(idx)}
                              >
                                {s.enabled ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                {s.enabled ? 'Enable' : 'Disabled'}
                              </button>

                              <button
                                className="flex items-center gap-1 text-sm px-2 py-1 border rounded"
                                onClick={() => {
                                  const newName = prompt('Edit folder name', s.folderName);
                                  if (newName && newName.trim()) editFolderName(idx, newName.trim());
                                }}
                                title="Edit folder name"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                className="flex items-center gap-1 text-sm px-2 py-1 border rounded"
                                onClick={() => {
                                  // remove this suggestion from list
                                  setSuggestions(prev => prev.filter((_, i) => i !== idx));
                                }}
                                title="Remove suggestion"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {s.filesPreview.map(fp => (
                              <div key={fp.id} className="text-xs border rounded p-2">
                                <div className="truncate font-medium">{fp.name}</div>
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
                ))}
              </div>

              <Separator />

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetSuggestions} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    // if auto apply high confidence enabled, set enabled for those
                    if (autoApplyHighConfidence) {
                      setSuggestions(prev => prev.map(s => ({ ...s, enabled: s.confidence >= minAutoApplyConfidence })));
                      // slight delay to reflect UI update (no blocking)
                      await new Promise(res => setTimeout(res, 120));
                    }
                    applyOrganization();
                  }}
                  disabled={organizing}
                  className="flex-1"
                >
                  {organizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Organizing...
                    </>
                  ) : (
                    <>
                      <FolderTree className="mr-2 h-4 w-4" />
                      Apply Organization
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  ); 
}
 
