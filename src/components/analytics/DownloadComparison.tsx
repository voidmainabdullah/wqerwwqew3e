import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { FileText, TrendingUp } from 'lucide-react';

interface FileComparisonData {
  name: string;
  downloads: number;
  shares: number;
  color: string;
}

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
];

export const DownloadComparison: React.FC = () => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<FileComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const fetchComparisonData = async () => {
    if (!user?.id) return;

    try {
      const { data: userFiles } = await supabase
        .from('files')
        .select('id, original_name')
        .eq('user_id', user.id);

      if (!userFiles || userFiles.length === 0) {
        setLoading(false);
        return;
      }

      const fileIds = userFiles.map((f) => f.id);

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
      downloads?.forEach((d) => {
        downloadCounts.set(d.file_id, (downloadCounts.get(d.file_id) || 0) + 1);
      });

      const shareCounts = new Map<string, number>();
      shares?.forEach((s) => {
        shareCounts.set(s.file_id, (shareCounts.get(s.file_id) || 0) + 1);
      });

      const fileData = userFiles
        .map((file, index) => ({
          name: file.original_name.length > 20
            ? file.original_name.substring(0, 20) + '...'
            : file.original_name,
          downloads: downloadCounts.get(file.id) || 0,
          shares: shareCounts.get(file.id) || 0,
          color: COLORS[index % COLORS.length],
        }))
        .filter((f) => f.downloads > 0 || f.shares > 0)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 8);

      const total = fileData.reduce((sum, f) => sum + f.downloads, 0);

      setComparisonData(fileData);
      setTotalDownloads(total);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();

    const interval = setInterval(() => {
      fetchComparisonData();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">
            {payload[0].payload.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-emerald-400">
              Downloads: {payload[0].value}
            </p>
            {payload[1] && (
              <p className="text-sm text-blue-400">
                Shares: {payload[1].value}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-zinc-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded w-64 mt-2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-zinc-800/50 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            File Performance Comparison
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400 mt-1">
            Compare downloads and shares across files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No download data available yet</p>
            <p className="text-sm text-zinc-500 mt-1">
              Start sharing files to see performance metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              File Performance Comparison
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-1">
              Compare downloads and shares across your top files
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            {totalDownloads} total
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-96 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar
                dataKey="downloads"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar
                dataKey="shares"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{comparisonData.length}</p>
              <p className="text-xs text-zinc-400 mt-1">Files Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{totalDownloads}</p>
              <p className="text-xs text-zinc-400 mt-1">Total Downloads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {comparisonData.reduce((sum, f) => sum + f.shares, 0)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Total Shares</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {comparisonData.length > 0
                  ? Math.round(totalDownloads / comparisonData.length)
                  : 0}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Avg per File</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
