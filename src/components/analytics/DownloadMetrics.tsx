import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Download,
  BarChart3,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color,
}) => {
  return (
    <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-zinc-500 mb-2">{subtitle}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DownloadMetrics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalDownloads: 0,
    todayDownloads: 0,
    avgDownloadsPerDay: 0,
    peakHour: '--:--',
    uniqueFiles: 0,
    activeShares: 0,
    downloadTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!user?.id) return;

    try {
      const { data: userFiles } = await supabase
        .from('files')
        .select('id')
        .eq('user_id', user.id);

      const fileIds = userFiles?.map((f) => f.id) || [];

      if (fileIds.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: allDownloads } = await supabase
        .from('download_logs')
        .select('downloaded_at, file_id')
        .in('file_id', fileIds);

      const { data: todayDownloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', todayStart.toISOString());

      const { data: yesterdayDownloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', yesterdayStart.toISOString())
        .lt('downloaded_at', todayStart.toISOString());

      const { data: weekDownloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', weekAgo.toISOString());

      const { data: activeShares } = await supabase
        .from('shared_links')
        .select('id')
        .in('file_id', fileIds)
        .eq('is_active', true);

      const uniqueFilesDownloaded = new Set(
        allDownloads?.map((d) => d.file_id) || []
      ).size;

      const hourCounts = new Map<number, number>();
      allDownloads?.forEach((download) => {
        const hour = new Date(download.downloaded_at).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });

      let peakHour = 0;
      let maxCount = 0;
      hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          peakHour = hour;
        }
      });

      const todayCount = todayDownloads?.length || 0;
      const yesterdayCount = yesterdayDownloads?.length || 0;
      const trend =
        yesterdayCount > 0
          ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
          : todayCount > 0
          ? 100
          : 0;

      const avgDownloads =
        (weekDownloads?.length || 0) / 7;

      setMetrics({
        totalDownloads: allDownloads?.length || 0,
        todayDownloads: todayCount,
        avgDownloadsPerDay: Math.round(avgDownloads),
        peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
        uniqueFiles: uniqueFilesDownloaded,
        activeShares: activeShares?.length || 0,
        downloadTrend: trend,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-zinc-700 bg-zinc-800 animate-pulse"
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Total Downloads"
        value={metrics.totalDownloads.toLocaleString()}
        icon={<Download className="w-5 h-5 text-white" />}
        subtitle="All-time downloads"
        color="bg-emerald-600"
      />

      <MetricCard
        title="Today's Downloads"
        value={metrics.todayDownloads}
        icon={<Activity className="w-5 h-5 text-white" />}
        trend={metrics.downloadTrend}
        subtitle="Downloads today"
        color="bg-blue-600"
      />

      <MetricCard
        title="Avg. Daily Downloads"
        value={metrics.avgDownloadsPerDay}
        icon={<BarChart3 className="w-5 h-5 text-white" />}
        subtitle="Last 7 days"
        color="bg-purple-600"
      />

      <MetricCard
        title="Peak Hour"
        value={metrics.peakHour}
        icon={<Clock className="w-5 h-5 text-white" />}
        subtitle="Most active time"
        color="bg-amber-600"
      />

      <MetricCard
        title="Unique Files"
        value={metrics.uniqueFiles}
        icon={<TrendingUp className="w-5 h-5 text-white" />}
        subtitle="Files with downloads"
        color="bg-teal-600"
      />

      <MetricCard
        title="Active Shares"
        value={metrics.activeShares}
        icon={<Activity className="w-5 h-5 text-white" />}
        subtitle="Currently active"
        color="bg-pink-600"
      />
    </div>
  );
};
