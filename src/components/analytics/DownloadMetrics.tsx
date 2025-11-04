import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  
} from 'recharts';

/**
 * DownloadComparison_DarkApple.jsx
 * Rewritten component with a minimal dark "Apple-like" black & white theme.
 * Keeps original Supabase integration and functionality but improves layout,
 * accessibility and styling for a modern, crisp look.
 *
 * Export: default
 */

interface FileComparisonData {
  name: string;
  downloads: number;
  shares: number;
  color: string;
}

const ACCENTS = {
  fg: 'text-white',
  sub: 'text-zinc-400',
  muted: 'text-zinc-500',
  border: 'border-zinc-700',
  panel: 'bg-black/60',
};

const COLORS = [
  '#9CA3AF', // cool gray
  '#E5E7EB', // lighter
  '#A3A3A3',
  '#D1D5DB',
  '#F3F4F6',
  '#A8A29E',
];

const DownloadComparison: React.FC = () => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<FileComparisonData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);

  // Fetch and prepare data from Supabase (keeps original behaviour)
  const fetchComparisonData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: userFiles } = await supabase
        .from('files')
        .select('id, original_name')
        .eq('user_id', user.id);

      if (!userFiles?.length) {
        setComparisonData([]);
        setTotalDownloads(0);
        return;
      }

      const fileIds = userFiles.map((f: any) => f.id);

      const { data: downloads } = await supabase
        .from('download_logs')
        .select('file_id')
        .in('file_id', fileIds);

      const { data: shares } = await supabase
        .from('shared_links')
        .select('file_id')
        .in('file_id', fileIds)
        .eq('is_active', true);

      const downloadCounts = new Map<string, number>();
      downloads?.forEach((d: any) =>
        downloadCounts.set(d.file_id, (downloadCounts.get(d.file_id) || 0) + 1)
      );

      const shareCounts = new Map<string, number>();
      shares?.forEach((s: any) =>
        shareCounts.set(s.file_id, (shareCounts.get(s.file_id) || 0) + 1)
      );

      const fileData: FileComparisonData[] = userFiles
        .map((file: any, i: number) => ({
          name:
            file.original_name.length > 18
              ? file.original_name.substring(0, 18) + '...'
              : file.original_name,
          downloads: downloadCounts.get(file.id) || 0,
          shares: shareCounts.get(file.id) || 0,
          color: COLORS[i % COLORS.length],
        }))
        .filter((f) => f.downloads > 0 || f.shares > 0)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 6);

      const total = fileData.reduce((sum, f) => sum + f.downloads, 0);
      setComparisonData(fileData);
      setTotalDownloads(total);
    } catch (err) {
      console.error('DownloadComparison fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
    const id = setInterval(fetchComparisonData, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Small, clean tooltip that matches the dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className={`rounded-md p-2 shadow-md ${ACCENTS.panel} border ${ACCENTS.border} max-w-xs`}
        >
          <div className="text-sm font-medium text-white mb-1">{label}</div>
          <div className="text-xs text-zinc-300">Downloads: {payload[0]?.value ?? 0}</div>
          {payload[1] && (
            <div className="text-xs text-zinc-300">Shares: {payload[1]?.value ?? 0}</div>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className="rounded-2xl border p-4 border-zinc-700 bg-black/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 rounded-lg bg-zinc-800 animate-pulse" />
              <div className="h-3 w-56 rounded-lg bg-zinc-800 animate-pulse mt-1" />
            </div>
            <div className="h-6 w-14 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-52 w-full rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="h-12 rounded bg-zinc-800 animate-pulse" />
            <div className="h-12 rounded bg-zinc-800 animate-pulse" />
            <div className="h-12 rounded bg-zinc-800 animate-pulse" />
            <div className="h-12 rounded bg-zinc-800 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!comparisonData.length) {
    return (
      <Card className="rounded-2xl border p-6 border-zinc-700 bg-black/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base font-semibold">
            <FileText className="w-5 h-5" />
            File Performance
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400 mt-1">
            No download data yet — start sharing files to see insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center">
            <FileText className="w-6 h-6 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-400">No download data available</p>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <Card className="rounded-2xl border p-4 border-zinc-700 bg-black/60 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-white text-lg font-semibold">
              <div className="w-9 h-9 rounded-md flex items-center justify-center border border-zinc-700 bg-black/50">
                <FileText className="w-4 h-4" />
              </div>
              File Comparison
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-1">Downloads vs Shares</CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="px-3 py-1 rounded-full border border-zinc-700 bg-transparent text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium text-white">{totalDownloads}</span>
              </div>
            </Badge>
            {/* placeholder for future actions */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 8, right: 6, left: 0, bottom: 48 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                angle={-40}
                textAnchor="end"
                height={60}
              />

              <YAxis
                stroke="#52525b"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />

              <Bar dataKey="downloads" radius={[6, 6, 0, 0]}>
                {comparisonData.map((entry, idx) => (
                  <Cell key={`d-${idx}`} fill={entry.color} />
                ))}
              </Bar>

              <Bar dataKey="shares" radius={[6, 6, 0, 0]} fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-white">{comparisonData.length}</p>
            <p className="text-[11px] text-zinc-400">Files</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">{totalDownloads}</p>
            <p className="text-[11px] text-zinc-400">Downloads</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {comparisonData.reduce((s, f) => s + f.shares, 0)}
            </p>
            <p className="text-[11px] text-zinc-400">Shares</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {comparisonData.length > 0 ? Math.round(totalDownloads / comparisonData.length) : 0}
            </p>
            <p className="text-[11px] text-zinc-400">Avg/File</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


