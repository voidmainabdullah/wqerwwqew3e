import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';

interface HeatmapCell {
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DownloadHeatmap: React.FC = () => {
  const { user } = useAuth();
  const [heatmap, setHeatmap] = useState<HeatmapCell[][]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHeatmapData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: userFiles, error: userFilesError } = await supabase
        .from('files')
        .select('id')
        .eq('user_id', user.id);

      if (userFilesError) {
        console.error('Error fetching user files:', userFilesError);
        setHeatmap(Array.from({ length: 7 }, () => Array(24).fill({ count: 0 })));
        setMaxCount(0);
        return;
      }

      const fileIds = userFiles?.map(f => f.id) || [];

      if (!fileIds.length) {
        setHeatmap(Array.from({ length: 7 }, () => Array(24).fill({ count: 0 })));
        setMaxCount(0);
        return;
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: downloads, error: downloadError } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .in('file_id', fileIds)
        .gte('downloaded_at', weekAgo.toISOString());

      if (downloadError) {
        console.error('Error fetching downloads:', downloadError);
        setHeatmap(Array.from({ length: 7 }, () => Array(24).fill({ count: 0 })));
        setMaxCount(0);
        return;
      }

      const tempHeatmap: HeatmapCell[][] = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ count: 0 }))
      );

      let peak = 0;

      downloads?.forEach(d => {
        // Parse the timestamp correctly (it's already in ISO format with timezone)
        const date = new Date(d.downloaded_at);
        const day = date.getDay(); 
        const hour = date.getHours();
        tempHeatmap[day][hour].count += 1;
        if (tempHeatmap[day][hour].count > peak) peak = tempHeatmap[day][hour].count;
      });

      setHeatmap(tempHeatmap);
      setMaxCount(peak);

      console.log('Heatmap updated:', tempHeatmap);
    } catch (err) {
      console.error('Unexpected error fetching heatmap data:', err);
      setHeatmap(Array.from({ length: 7 }, () => Array(24).fill({ count: 0 })));
      setMaxCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchHeatmapData();

    const channel = supabase
      .channel('download-heatmap-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'download_logs'
        },
        payload => {
          console.log('Realtime payload received:', payload);
          fetchHeatmapData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-zinc-800';
    const intensity = maxCount > 0 ? count / maxCount : 0;
    if (intensity < 0.25) return 'bg-emerald-900/40';
    if (intensity < 0.5) return 'bg-emerald-700/60';
    if (intensity < 0.75) return 'bg-emerald-600/80';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-card shadow-lg">
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
    <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-black to-zinc-800/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
        <div className="overflow-x-auto min-w-max">
          <div className="flex gap-1 mb-2 ml-12">
            {HOURS.filter((_, i) => i % 2 === 0).map(hour => (
              <div key={hour} className="w-8 text-center text-xs text-zinc-400">
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-10 text-xs text-zinc-400 font-medium">{day}</div>
              <div className="flex gap-1">
                {HOURS.map(hour => {
                  const count = heatmap[dayIndex]?.[hour]?.count || 0;
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
      </CardContent>
    </Card>
  );
};
