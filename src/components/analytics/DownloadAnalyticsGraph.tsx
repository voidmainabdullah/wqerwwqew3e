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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { format, subHours, subDays, subMonths, isAfter } from 'date-fns';

type TimePeriod = '12h' | '1d' | '1m';

interface DownloadData {
  timestamp: string;
  downloads: number;
  period: TimePeriod;
}

interface ChartDataPoint {
  time: string;
  downloads: number;
  fullDate: string;
}

export const DownloadAnalyticsGraph: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>('12h');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [percentChange, setPercentChange] = useState(0);

  const fetchDownloadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: userFiles } = await supabase
        .from('files')
        .select('id')
        .eq('user_id', user.id);

      const fileIds = userFiles?.map((f) => f.id) || [];

      if (fileIds.length === 0) {
        setChartData([]);
        setTotalDownloads(0);
        setPercentChange(0);
        setLoading(false);
        return;
      }

      let cutoffDate: Date;
      switch (period) {
        case '12h':
          cutoffDate = subHours(new Date(), 12);
          break;
        case '1d':
          cutoffDate = subDays(new Date(), 1);
          break;
        case '1m':
          cutoffDate = subMonths(new Date(), 1);
          break;
      }

      const { data: downloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', cutoffDate.toISOString())
        .order('downloaded_at', { ascending: true });

      if (!downloads || downloads.length === 0) {
        const emptyData = generateEmptyDataPoints(period);
        setChartData(emptyData);
        setTotalDownloads(0);
        setPercentChange(0);
        setLoading(false);
        return;
      }

      const groupedData = groupDownloadsByTime(downloads, period);
      const formattedData = formatChartData(groupedData, period);

      setChartData(formattedData);
      setTotalDownloads(downloads.length);

      const change = calculatePercentChange(formattedData);
      setPercentChange(change);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching download data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmptyDataPoints = (timePeriod: TimePeriod): ChartDataPoint[] => {
    const points: ChartDataPoint[] = [];
    const now = new Date();
    let intervals: number;
    let intervalUnit: 'hours' | 'days';

    switch (timePeriod) {
      case '12h':
        intervals = 12;
        intervalUnit = 'hours';
        break;
      case '1d':
        intervals = 24;
        intervalUnit = 'hours';
        break;
      case '1m':
        intervals = 30;
        intervalUnit = 'days';
        break;
    }

    for (let i = intervals; i >= 0; i--) {
      const date =
        intervalUnit === 'hours'
          ? subHours(now, i)
          : subDays(now, i);

      points.push({
        time: formatTimeLabel(date, timePeriod),
        downloads: 0,
        fullDate: date.toISOString(),
      });
    }

    return points;
  };

  const groupDownloadsByTime = (
    downloads: any[],
    timePeriod: TimePeriod
  ): Map<string, number> => {
    const grouped = new Map<string, number>();

    downloads.forEach((download) => {
      const date = new Date(download.downloaded_at);
      let key: string;

      switch (timePeriod) {
        case '12h':
        case '1d':
          key = format(date, 'yyyy-MM-dd HH:00');
          break;
        case '1m':
          key = format(date, 'yyyy-MM-dd');
          break;
      }

      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return grouped;
  };

  const formatChartData = (
    grouped: Map<string, number>,
    timePeriod: TimePeriod
  ): ChartDataPoint[] => {
    const points: ChartDataPoint[] = [];
    const now = new Date();
    let intervals: number;
    let intervalUnit: 'hours' | 'days';

    switch (timePeriod) {
      case '12h':
        intervals = 12;
        intervalUnit = 'hours';
        break;
      case '1d':
        intervals = 24;
        intervalUnit = 'hours';
        break;
      case '1m':
        intervals = 30;
        intervalUnit = 'days';
        break;
    }

    for (let i = intervals; i >= 0; i--) {
      const date =
        intervalUnit === 'hours'
          ? subHours(now, i)
          : subDays(now, i);

      const key =
        intervalUnit === 'hours'
          ? format(date, 'yyyy-MM-dd HH:00')
          : format(date, 'yyyy-MM-dd');

      points.push({
        time: formatTimeLabel(date, timePeriod),
        downloads: grouped.get(key) || 0,
        fullDate: date.toISOString(),
      });
    }

    return points;
  };

  const formatTimeLabel = (date: Date, timePeriod: TimePeriod): string => {
    switch (timePeriod) {
      case '12h':
      case '1d':
        return format(date, 'HH:mm');
      case '1m':
        return format(date, 'MMM dd');
    }
  };

  const calculatePercentChange = (data: ChartDataPoint[]): number => {
    if (data.length < 2) return 0;

    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const firstHalfSum = firstHalf.reduce((sum, d) => sum + d.downloads, 0);
    const secondHalfSum = secondHalf.reduce((sum, d) => sum + d.downloads, 0);

    if (firstHalfSum === 0) return secondHalfSum > 0 ? 100 : 0;

    return ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
  };

  useEffect(() => {
    fetchDownloadData();

    const interval = setInterval(() => {
      fetchDownloadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, period]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-zinc-400 mb-1">
            {format(new Date(payload[0].payload.fullDate), 'MMM dd, yyyy HH:mm')}
          </p>
          <p className="text-lg font-semibold text-white">
            {payload[0].value} downloads
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && chartData.length === 0) {
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

  return (
    <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Download Analytics
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-1">
              Real-time download metrics for your files
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-800/60 rounded-lg p-1">
              <Button
                size="sm"
                variant={period === '12h' ? 'default' : 'ghost'}
                onClick={() => setPeriod('12h')}
                className={
                  period === '12h'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }
              >
                12H
              </Button>
              <Button
                size="sm"
                variant={period === '1d' ? 'default' : 'ghost'}
                onClick={() => setPeriod('1d')}
                className={
                  period === '1d'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }
              >
                1D
              </Button>
              <Button
                size="sm"
                variant={period === '1m' ? 'default' : 'ghost'}
                onClick={() => setPeriod('1m')}
                className={
                  period === '1m'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }
              >
                1M
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchDownloadData}
              disabled={loading}
              className="text-zinc-400 hover:text-white hover:bg-zinc-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30 px-3 py-1">
              <span className="text-lg font-semibold">{totalDownloads}</span>
              <span className="ml-1 text-xs">total downloads</span>
            </Badge>
            {percentChange !== 0 && (
              <Badge
                className={
                  percentChange > 0
                    ? 'bg-green-500/10 text-green-400 border border-green-700/30'
                    : 'bg-red-500/10 text-red-400 border border-red-700/30'
                }
              >
                {percentChange > 0 ? '+' : ''}
                {percentChange.toFixed(1)}%
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="w-4 h-4" />
            <span>Last updated: {format(lastUpdate, 'HH:mm:ss')}</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f3f46"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={{ stroke: '#52525b' }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={{ stroke: '#52525b' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#downloadGradient)"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {chartData.length > 0 && totalDownloads === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-sm">
              No downloads in the selected time period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
