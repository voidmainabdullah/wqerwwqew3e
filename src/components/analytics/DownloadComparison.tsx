import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { FileText, TrendingUp } from 'lucide-react';
interface FileComparisonData {
  name: string;
  downloads: number;
  shares: number;
  color: string;
}
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
export const DownloadComparison: React.FC = () => {
  const {
    user
  } = useAuth();
  const [comparisonData, setComparisonData] = useState<FileComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const fetchComparisonData = async () => {
    if (!user?.id) return;
    try {
      const {
        data: userFiles
      } = await supabase.from('files').select('id, original_name').eq('user_id', user.id);
      if (!userFiles?.length) {
        setLoading(false);
        return;
      }
      const fileIds = userFiles.map(f => f.id);

      // Get actual download counts from download_logs table (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const {
        data: downloadLogs
      } = await supabase
        .from('download_logs')
        .select('file_id')
        .in('file_id', fileIds)
        .gte('downloaded_at', weekAgo.toISOString());

      // Get all shared links for user's files
      const {
        data: shares
      } = await supabase
        .from('shared_links')
        .select('file_id')
        .in('file_id', fileIds);

      // Aggregate downloads and shares per file
      const downloadCounts = new Map<string, number>();
      const shareCounts = new Map<string, number>();
      
      downloadLogs?.forEach(log => {
        if (log.file_id) {
          downloadCounts.set(log.file_id, (downloadCounts.get(log.file_id) || 0) + 1);
        }
      });
      
      shares?.forEach(share => {
        if (share.file_id) {
          shareCounts.set(share.file_id, (shareCounts.get(share.file_id) || 0) + 1);
        }
      });
      
      const fileData = userFiles.map((file, i) => ({
        name: file.original_name.length > 16 ? file.original_name.substring(0, 16) + '...' : file.original_name,
        downloads: downloadCounts.get(file.id) || 0,
        shares: shareCounts.get(file.id) || 0,
        color: COLORS[i % COLORS.length]
      })).filter(f => f.downloads > 0 || f.shares > 0).sort((a, b) => b.downloads - a.downloads).slice(0, 6);
      const total = fileData.reduce((sum, f) => sum + f.downloads, 0);
      setComparisonData(fileData);
      setTotalDownloads(total);
    } catch (e) {
      console.error('Error fetching comparison data:', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComparisonData();
    
    // Set up real-time subscription for instant updates
    const channel = supabase
      .channel('download-comparison-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'download_logs'
        },
        (payload) => {
          // Refresh data immediately when a new download is logged
          fetchComparisonData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  const CustomTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload?.length) {
      return <div className="bg-zinc-900 border border-zinc-700 rounded-md p-2 shadow-lg text-xs">
          <p className="text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-emerald-400">Downloads: {payload[0].value}</p>
          {payload[1] && <p className="text-blue-400">Shares: {payload[1].value}</p>}
        </div>;
    }
    return null;
  };
  if (loading) {
    return <Card className="rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 p-3">
        <CardHeader>
          <div className="h-4 bg-zinc-700 rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-zinc-800/50 rounded-md animate-pulse" />
        </CardContent>
      </Card>;
  }
  if (!comparisonData.length) {
    return <Card className="rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            File Performance
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-1">
            No data yet — start sharing files to see stats
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">No download data available</p>
        </CardContent>
      </Card>;
  }
  return <Card className="rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              File Comparison
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Downloads vs Shares
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30 text-xs px-2 py-0.5">
            <TrendingUp className="w-3 h-3 mr-1" />
            {totalDownloads}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 40
          }} className="bg-inherit">
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" tick={{
              fill: '#a1a1aa',
              fontSize: 10
            }} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#71717a" tick={{
              fill: '#a1a1aa',
              fontSize: 10
            }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
              <Bar dataKey="shares" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-white">{comparisonData.length}</p>
            <p className="text-[11px] text-zinc-400">Files</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-50">{totalDownloads}</p>
            <p className="text-[11px] text-zinc-400">Downloads</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-200">
              {comparisonData.reduce((s, f) => s + f.shares, 0)}
            </p>
            <p className="text-[11px] text-zinc-400">Shares</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-200">
              {comparisonData.length > 0 ? Math.round(totalDownloads / comparisonData.length) : 0}
            </p>
            <p className="text-[11px] text-zinc-400">Avg/File</p>
          </div>
        </div>
      </CardContent>
    </Card>;
};