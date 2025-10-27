import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';

interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
  date: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DownloadHeatmap: React.FC = () => {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHeatmapData = async () => {
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

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: downloads } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', weekAgo.toISOString());

      const heatmap = new Map<string, number>();
      let max = 0;

      downloads?.forEach((download) => {
        const date = new Date(download.downloaded_at);
        const day = date.getDay();
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        const count = (heatmap.get(key) || 0) + 1;
        heatmap.set(key, count);
        if (count > max) max = count;
      });

      const cells: HeatmapCell[] = [];
      DAYS.forEach((day, dayIndex) => {
        HOURS.forEach((hour) => {
          const key = `${dayIndex}-${hour}`;
          cells.push({
            day,
            hour,
            count: heatmap.get(key) || 0,
            date: new Date(),
          });
        });
      });

      setHeatmapData(cells);
      setMaxCount(max);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();

    const interval = setInterval(() => {
      fetchHeatmapData();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'bg-zinc-800';
    const intensity = maxCount > 0 ? count / maxCount : 0;
    if (intensity < 0.25) return 'bg-emerald-900/40';
    if (intensity < 0.5) return 'bg-emerald-700/60';
    if (intensity < 0.75) return 'bg-emerald-600/80';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-zinc-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded w-64 mt-2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-zinc-800/50 rounded-lg animate-pulse" />
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
              <Calendar className="w-5 h-5 text-emerald-400" />
              Download Activity Heatmap
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-1">
              Download patterns by day and hour (last 7 days)
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Peak: {maxCount} downloads
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex gap-1 mb-2 ml-12">
              {HOURS.filter((_, i) => i % 2 === 0).map((hour) => (
                <div key={hour} className="w-8 text-center text-xs text-zinc-400">
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-10 text-xs text-zinc-400 font-medium">{day}</div>
                <div className="flex gap-1">
                  {HOURS.map((hour) => {
                    const cell = heatmapData.find(
                      (c) => c.day === day && c.hour === hour
                    );
                    const count = cell?.count || 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`w-4 h-4 rounded ${getIntensityColor(
                          count
                        )} transition-colors duration-200 cursor-pointer hover:ring-2 hover:ring-emerald-400`}
                        title={`${day} ${hour}:00 - ${count} downloads`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-700">
              <span className="text-xs text-zinc-400">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-zinc-800" />
                <div className="w-4 h-4 rounded bg-emerald-900/40" />
                <div className="w-4 h-4 rounded bg-emerald-700/60" />
                <div className="w-4 h-4 rounded bg-emerald-600/80" />
                <div className="w-4 h-4 rounded bg-emerald-500" />
              </div>
              <span className="text-xs text-zinc-400">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
