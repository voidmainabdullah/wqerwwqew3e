// analytics.tsx
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
import { Progress } from '@/components/ui/progress';
import {
  DownloadSimple,
  ShareNetwork,
  Files,
  TrendUp,
  Calendar,
} from 'phosphor-react';

interface RealTimeStats {
  totalFiles: number;
  totalShares: number;
  totalDownloads: number;
  recentDownloads: any[];
  popularFiles: any[];
  storageUsed: number;
  storageLimit: number;
  subscriptionTier: string;
}

export const RealTimeAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit, subscription_tier')
        .eq('id', user.id)
        .single();

      const { data: userFiles } = await supabase
        .from('files')
        .select('id, original_name, created_at, download_count')
        .eq('user_id', user.id);

      const fileIds = userFiles?.map((f) => f.id) || [];

      const { data: downloads } = await supabase
        .from('download_logs')
        .select('*, files!inner(original_name)')
        .in('file_id', fileIds)
        .order('downloaded_at', { ascending: false });

      const { data: shares } = await supabase
        .from('shared_links')
        .select('*')
        .in('file_id', fileIds);

      const fileDownloadCounts =
        downloads?.reduce((acc: any, download: any) => {
          const fileName = download.files?.original_name || 'Unknown';
          acc[fileName] = (acc[fileName] || 0) + 1;
          return acc;
        }, {}) || {};

      const popularFiles = Object.entries(fileDownloadCounts)
        .map(([name, count]) => ({ name, downloads: count }))
        .sort((a: any, b: any) => b.downloads - a.downloads)
        .slice(0, 5);

      setStats({
        totalFiles: userFiles?.length || 0,
        totalShares: shares?.length || 0,
        totalDownloads: downloads?.length || 0,
        recentDownloads: downloads?.slice(0, 8) || [],
        popularFiles,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6442450944,
        subscriptionTier: profile?.subscription_tier || 'free',
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const fileChannel = supabase
      .channel('files-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files', filter: `user_id=eq.${user?.id}` },
        fetchAnalytics
      )
      .subscribe();

    const downloadChannel = supabase
      .channel('download-logs-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'download_logs' },
        fetchAnalytics
      )
      .subscribe();

    const shareChannel = supabase
      .channel('shared-links-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_links' },
        fetchAnalytics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(fileChannel);
      supabase.removeChannel(downloadChannel);
      supabase.removeChannel(shareChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          >
            <CardHeader>
              <div className="h-4 bg-zinc-700 rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-zinc-700 rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const storageProgress =
    stats && stats.subscriptionTier !== 'pro' ? (stats.storageUsed / stats.storageLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-white">Analytics</h2>
          <p className="text-sm text-neutral-400">Overview of your files, shares, and downloads.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Example action buttons or filters could go here — kept minimal per request */}
          <div className="text-xs text-neutral-400">Last updated: <span className="text-neutral-300 ml-1">{new Date().toLocaleString()}</span></div>
        </div>
      </div>

      {/* Grid layout: left main (2 cols) + right side (1 col) on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Main summary & storage (span 2 on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800/60 to-zinc-900/40 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm text-neutral-300 font-medium">Total Downloads</CardTitle>
                <DownloadSimple size={22} className="text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{stats?.totalDownloads || 0}</div>
                <p className="text-xs text-neutral-400 mt-1">All-time downloads</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800/60 to-zinc-900/40 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm text-neutral-300 font-medium">Shared Links</CardTitle>
                <ShareNetwork size={22} className="text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{stats?.totalShares || 0}</div>
                <p className="text-xs text-neutral-400 mt-1">Active share links</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800/60 to-zinc-900/40 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm text-neutral-300 font-medium">Total Files</CardTitle>
                <Files size={22} className="text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-white">{stats?.totalFiles || 0}</div>
                <p className="text-xs text-neutral-400 mt-1">Files in your account</p>
              </CardContent>
            </Card>
          </div>

          {/* Storage Usage (only for non-pro) */}
          {stats?.subscriptionTier !== 'pro' && (
            <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 p-4 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <TrendUp size={20} className="text-sky-400" />
                  <CardTitle className="text-sm text-neutral-200 font-medium">Storage Usage</CardTitle>
                </div>
                <CardDescription className="text-sm text-neutral-400">
                  {formatFileSize(stats?.storageUsed || 0)} of {formatFileSize(stats?.storageLimit || 0)} used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-neutral-400">Used</div>
                    <div className="text-xs text-neutral-400">{storageProgress.toFixed(1)}%</div>
                  </div>
                  <Progress value={storageProgress} className="h-2 rounded-full bg-zinc-700" />
                  <div className="text-xs text-neutral-400 mt-3">
                    {(100 - storageProgress).toFixed(1)}% remaining
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* (Optional) You can add additional charts or widgets here in future */}
        </div>

        {/* RIGHT: Activity panels (Popular & Recent) */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-zinc-700 bg-zinc-900/50 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-200 font-medium">
                <TrendUp size={20} className="text-emerald-400" /> Popular Files
              </CardTitle>
              <CardDescription className="text-neutral-400 text-sm">Your most downloaded files</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.popularFiles?.length ? (
                <div className="flex flex-col gap-3">
                  {stats.popularFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 bg-zinc-800/40 p-3 rounded-lg"
                    >
                      <div className="truncate max-w-[220px] text-sm text-neutral-300">{file.name}</div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30">
                        {file.downloads} downloads
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No downloads yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-zinc-700 bg-zinc-900/50 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-200 font-medium">
                <Calendar size={20} className="text-indigo-400" /> Recent Downloads
              </CardTitle>
              <CardDescription className="text-neutral-400 text-sm">Latest file activity</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentDownloads?.length ? (
                <div className="flex flex-col gap-3">
                  {stats.recentDownloads.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 bg-zinc-800/40 p-3 rounded-lg"
                    >
                      <div className="truncate max-w-[220px] text-sm text-neutral-300">
                        {d.files?.original_name || 'Unknown file'}
                      </div>
                      <Badge
                        variant="outline"
                        className="border border-zinc-600 text-zinc-300 text-xs px-2 py-1"
                      >
                        {new Date(d.downloaded_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No downloads yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
