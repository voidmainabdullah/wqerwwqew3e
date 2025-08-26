import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Download, ShareNetwork, Files, TrendUp, Users, Calendar, Warning, CheckCircle } from 'phosphor-react';

interface AnalyticsData {
  totalDownloads: number;
  totalShares: number;
  totalFiles: number;
  recentDownloads: any[];
  popularFiles: any[];
}

export const Analytics: React.FC = () => {
  const {
    user
  } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);
  const fetchAnalytics = async () => {
    try {
      // Get user's files
      const {
        data: userFiles
      } = await supabase.from('files').select('id, original_name, created_at').eq('user_id', user?.id);
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
        const fileName = download.files.original_name;
        acc[fileName] = (acc[fileName] || 0) + 1;
        return acc;
      }, {}) || {};
      const popularFiles = Object.entries(fileDownloadCounts).map(([name, count]) => ({
        name,
        downloads: count
      })).sort((a: any, b: any) => b.downloads - a.downloads).slice(0, 5);
      setData({
        totalDownloads: downloads?.length || 0,
        totalShares: shares?.length || 0,
        totalFiles: userFiles?.length || 0,
        recentDownloads: downloads?.slice(0, 10) || [],
        popularFiles
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your file sharing performance and download statistics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="analytics-card analytics-card-green hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <div className="icon-container icon-container-green">
              <Download className="h-5 w-5 analytics-icon analytics-icon-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data?.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              All-time file downloads
            </p>
          </CardContent>
        </Card>

        <Card className="analytics-card analytics-card-purple hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Links</CardTitle>
            <div className="icon-container icon-container-purple">
              <ShareNetwork className="h-5 w-5 analytics-icon analytics-icon-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data?.totalShares}</div>
            <p className="text-xs text-muted-foreground">
              Active sharing links
            </p>
          </CardContent>
        </Card>

        <Card className="analytics-card analytics-card-yellow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <div className="icon-container icon-container-yellow">
              <Files className="h-5 w-5 analytics-icon analytics-icon-yellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data?.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Files in your account
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="analytics-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="icon-container icon-container-green mr-3">
                <TrendUp className="h-5 w-5 analytics-icon analytics-icon-green" />
              </div>
              Popular Files
            </CardTitle>
            <CardDescription>
              Your most downloaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.popularFiles.length ? <div className="space-y-3">
                {data.popularFiles.map((file: any, index: number) => <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="icon-container icon-container-yellow" style={{ width: '32px', height: '32px' }}>
                        <Files className="h-4 w-4 analytics-icon analytics-icon-yellow" />
                      </div>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Badge className="status-success">
                      {file.downloads} downloads
                    </Badge>
                  </div>)}
              </div> : <p className="text-sm text-muted-foreground">No downloads yet</p>}
          </CardContent>
        </Card>

        <Card className="analytics-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="icon-container icon-container-purple mr-3">
                <Calendar className="h-5 w-5 analytics-icon analytics-icon-purple" />
              </div>
              Recent Downloads
            </CardTitle>
            <CardDescription>
              Latest file download activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentDownloads.length ? <div className="space-y-3">
                {data.recentDownloads.map((download: any, index: number) => <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="icon-container icon-container-green" style={{ width: '32px', height: '32px' }}>
                        <Download className="h-4 w-4 analytics-icon analytics-icon-green" />
                      </div>
                      <span className="text-sm truncate max-w-[200px]">
                        {download.files?.original_name || 'Unknown file'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(download.downloaded_at).toLocaleDateString()}
                    </Badge>
                  </div>)}
              </div> : <p className="text-sm text-muted-foreground">No downloads yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>;
};