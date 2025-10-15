import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DownloadSimple, ShareNetwork, Files, TrendUp, Calendar } from 'phosphor-react';

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files', filter: `user_id=eq.${user?.id}` }, fetchAnalytics)
      .subscribe();

    const downloadChannel = supabase
      .channel('download-logs-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'download_logs' }, fetchAnalytics)
      .subscribe();

    const shareChannel = supabase
      .channel('shared-links-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_links' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(fileChannel);
      supabase.removeChannel(downloadChannel);
      supabase.removeChannel(shareChannel);
    };
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
          <Card key={i} className="animate-pulse bg-slate-800 border border-slate-700">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded w-16"></div>
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
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-zinc-600/20 to-neutral-400/10 border border-zinc-700/40 hover:shadow-emerald-500/20 hover:shadow-md transition-all">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-300 font-medium">Total Downloads</CardTitle>
            <DownloadSimple size={22} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{stats?.totalDownloads || 0}</div>
            <p className="text-xs text-gray-400 mt-1">All-time downloads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-600/20 to-neutral-400/10 border border-zinc-700/40 hover:shadow-indigo-500/20 hover:shadow-md transition-all">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-300 font-medium">Shared Links</CardTitle>
            <ShareNetwork size={22} className="text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{stats?.totalShares || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Active share links</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-600/20 to-neutral-400/10 border border-zinc-700/40 hover:shadow-amber-500/20 hover:shadow-md transition-all">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-300 font-medium">Total Files</CardTitle>
            <Files size={22} className="text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{stats?.totalFiles || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Files in your account</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      {stats?.subscriptionTier !== 'pro' && (
        <Card className="bg-gradient-to-brfrom-zinc-600/20 to-blue-800/80 border border-zinc-700/40 hover:shadow-sky-500/20 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-200 font-medium">
              <TrendUp size={20} className="text-sky-400" /> Storage Usage
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              {formatFileSize(stats?.storageUsed || 0)} of {formatFileSize(stats?.storageLimit || 0)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={storageProgress} className="h-2 bg-slate-700" />
            <p className="text-xs text-gray-400 mt-2">
              {(100 - storageProgress).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity & Popular Files */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-200 font-medium">
              <TrendUp size={20} className="text-emerald-400" /> Popular Files
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Your most downloaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.popularFiles.length ? (
              <div className="space-y-3">
                {stats.popularFiles.map((file, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="truncate max-w-[180px] text-sm text-gray-300">{file.name}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-700/40">
                      {file.downloads} downloads
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No downloads yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-200 font-medium">
              <Calendar size={20} className="text-indigo-400" /> Recent Downloads
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Latest file activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentDownloads.length ? (
              <div className="space-y-3">
                {stats.recentDownloads.map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="truncate max-w-[180px] text-sm text-gray-300">
                      {d.files?.original_name || 'Unknown file'}
                    </span>
                    <Badge variant="outline" className="border border-slate-600 text-slate-300 text-xs">
                      {new Date(d.downloaded_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No downloads yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
