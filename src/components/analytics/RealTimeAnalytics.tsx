import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, ShareNetwork, Files, TrendUp, Users, Calendar } from 'phosphor-react';
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
  const {
    user
  } = useAuth();
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchAnalytics = async () => {
    if (!user?.id) return;
    try {
      // Get user profile
      const {
        data: profile
      } = await supabase.from('profiles').select('storage_used, storage_limit, subscription_tier').eq('id', user.id).single();

      // Get user's files
      const {
        data: userFiles
      } = await supabase.from('files').select('id, original_name, created_at, download_count').eq('user_id', user.id);
      const fileIds = userFiles?.map(f => f.id) || [];

      // Get download logs
      const {
        data: downloads
      } = await supabase.from('download_logs').select('*, files!inner(original_name)').in('file_id', fileIds).order('downloaded_at', {
        ascending: false
      });

      // Get shared links
      const {
        data: shares
      } = await supabase.from('shared_links').select('*').in('file_id', fileIds);

      // Calculate popular files
      const fileDownloadCounts = downloads?.reduce((acc: any, download: any) => {
        const fileName = download.files?.original_name || 'Unknown';
        acc[fileName] = (acc[fileName] || 0) + 1;
        return acc;
      }, {}) || {};
      const popularFiles = Object.entries(fileDownloadCounts).map(([name, count]) => ({
        name,
        downloads: count
      })).sort((a: any, b: any) => b.downloads - a.downloads).slice(0, 5);
      setStats({
        totalFiles: userFiles?.length || 0,
        totalShares: shares?.length || 0,
        totalDownloads: downloads?.length || 0,
        recentDownloads: downloads?.slice(0, 10) || [],
        popularFiles,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6442450944,
        subscriptionTier: profile?.subscription_tier || 'free'
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscription for file changes
    const fileChannel = supabase.channel('files-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'files',
      filter: `user_id=eq.${user?.id}`
    }, () => {
      fetchAnalytics(); // Refresh analytics when files change
    }).subscribe();

    // Set up real-time subscription for download logs
    const downloadChannel = supabase.channel('download-logs-changes').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'download_logs'
    }, () => {
      fetchAnalytics(); // Refresh analytics when new downloads occur
    }).subscribe();

    // Set up real-time subscription for shared links
    const shareChannel = supabase.channel('shared-links-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'shared_links'
    }, () => {
      fetchAnalytics(); // Refresh analytics when shares change
    }).subscribe();
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
    return <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>)}
      </div>;
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }
  const storageProgress = stats && stats.subscriptionTier !== 'pro' ? stats.storageUsed / stats.storageLimit * 100 : 0;
  return <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="analytics-card analytics-card-green hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-medium">Total Downloads</CardTitle>
            <div className="border-none bg-neutral-900">
              <span className="material-icons md-18 analytics-icon analytics-icon-green text-lg font-bold text-gray-200">download</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-foreground">{stats?.totalDownloads || 0}</div>
            <p className="text-xs font-body text-muted-foreground">
              All-time file downloads
            </p>
          </CardContent>
        </Card>

        <Card className="analytics-card analytics-card-purple hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-medium">Shared Links</CardTitle>
            <div className="icon-container icon-container-purple">
              <span className="material-icons md-18 analytics-icon analytics-icon-purple">share</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-foreground">{stats?.totalShares || 0}</div>
            <p className="text-xs font-body text-muted-foreground">
              Active sharing links
            </p>
          </CardContent>
        </Card>

        <Card className="analytics-card analytics-card-yellow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-medium">Total Files</CardTitle>
            <div className="icon-container icon-container-yellow">
              <span className="material-icons md-18 analytics-icon analytics-icon-yellow">folder</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-foreground">{stats?.totalFiles || 0}</div>
            <p className="text-xs font-body text-muted-foreground">
              Files in your account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage Card */}
      {stats?.subscriptionTier !== 'pro' && <Card className="analytics-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="icon-container icon-container-blue">
                <span className="material-icons md-18 analytics-icon analytics-icon-blue">storage</span>
              </div>
              Storage Usage
            </CardTitle>
            <CardDescription className="font-body">
              {formatFileSize(stats?.storageUsed || 0)} of {formatFileSize(stats?.storageLimit || 0)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={storageProgress} className="h-2" />
            <p className="text-xs font-body text-muted-foreground mt-2">
              {(100 - storageProgress).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>}

      {/* Popular Files & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="analytics-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center font-heading">
              <div className="icon-container icon-container-green mr-3">
                <span className="material-icons md-18 analytics-icon analytics-icon-green">trending_up</span>
              </div>
              Popular Files
            </CardTitle>
            <CardDescription className="font-body">
              Your most downloaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.popularFiles.length ? <div className="space-y-3">
                {stats.popularFiles.map((file: any, index: number) => <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="icon-container icon-container-yellow" style={{
                  width: '32px',
                  height: '32px'
                }}>
                        <span className="material-icons md-18 analytics-icon analytics-icon-yellow">description</span>
                      </div>
                      <span className="text-sm font-body font-medium truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Badge className="status-success">
                      {file.downloads} downloads
                    </Badge>
                  </div>)}
              </div> : <p className="text-sm font-body text-muted-foreground">No downloads yet</p>}
          </CardContent>
        </Card>

        <Card className="analytics-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center font-heading">
              <div className="icon-container icon-container-purple mr-3">
                <span className="material-icons md-18 analytics-icon analytics-icon-purple">event</span>
              </div>
              Recent Downloads
            </CardTitle>
            <CardDescription className="font-body">
              Latest file download activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentDownloads.length ? <div className="space-y-3">
                {stats.recentDownloads.map((download: any, index: number) => <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="icon-container icon-container-green" style={{
                  width: '32px',
                  height: '32px'
                }}>
                        <span className="material-icons md-18 analytics-icon analytics-icon-green">download</span>
                      </div>
                      <span className="text-sm font-body truncate max-w-[200px]">
                        {download.files?.original_name || 'Unknown file'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(download.downloaded_at).toLocaleDateString()}
                    </Badge>
                  </div>)}
              </div> : <p className="text-sm font-body text-muted-foreground">No downloads yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>;
};