import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QuickStats {
  todayDownloads: number;
  totalDownloads: number;
  trend: number;
  lastDownload?: string;
}

export const QuickAnalyticsSummary: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuickStats>({
    todayDownloads: 0,
    totalDownloads: 0,
    trend: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchQuickStats = async () => {
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

      const { data: allDownloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .order('downloaded_at', { ascending: false });

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

      const todayCount = todayDownloads?.length || 0;
      const yesterdayCount = yesterdayDownloads?.length || 0;
      const trend =
        yesterdayCount > 0
          ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
          : todayCount > 0
          ? 100
          : 0;

      setStats({
        todayDownloads: todayCount,
        totalDownloads: allDownloads?.length || 0,
        trend,
        lastDownload: allDownloads?.[0]?.downloaded_at,
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickStats();

    const interval = setInterval(() => {
      fetchQuickStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-5 bg-zinc-700 rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-zinc-700 rounded w-24" />
            <div className="h-4 bg-zinc-700 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Downloads Today
          </span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {stats.todayDownloads}
          </span>
          {stats.trend !== 0 && (
            <Badge
              variant="outline"
              className={
                stats.trend > 0
                  ? 'bg-green-500/10 text-green-400 border-green-700/30'
                  : 'bg-red-500/10 text-red-400 border-red-700/30'
              }
            >
              {stats.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
              {stats.trend > 0 ? '+' : ''}
              {stats.trend.toFixed(0)}%
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-700">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{stats.totalDownloads} total</span>
          </div>
          {stats.lastDownload && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(stats.lastDownload), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
