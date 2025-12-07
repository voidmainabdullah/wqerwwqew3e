import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Download, Clock, Activity } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DownloadEvent {
  id: string;
  file_name: string;
  downloaded_at: string;
  download_method: string;
  isNew?: boolean;
}

export const LiveDownloadFeed: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DownloadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentDownloads = async () => {
    if (!user?.id) return;

    try {
      // Get user's files first
      const { data: userFiles } = await supabase
        .from('files')
        .select('id, original_name')
        .eq('user_id', user.id);

      const fileIds = userFiles?.map((f) => f.id) || [];
      const fileMap = new Map(userFiles?.map((f) => [f.id, f.original_name]) || []);

      if (fileIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch REAL download logs from download_logs table
      const { data: downloadLogs, error } = await supabase
        .from('download_logs')
        .select('id, file_id, downloaded_at, download_method')
        .in('file_id', fileIds)
        .order('downloaded_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching download logs:', error);
        setLoading(false);
        return;
      }

      const formattedEvents: DownloadEvent[] =
        downloadLogs?.map((log) => ({
          id: log.id,
          file_name: fileMap.get(log.file_id) || 'Unknown',
          downloaded_at: log.downloaded_at,
          download_method: log.download_method || 'direct',
        })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching download events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentDownloads();

    // Subscribe to real download_logs inserts
    const channel = supabase
      .channel('live-download-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'download_logs',
        },
        async (payload) => {
          const newLog = payload.new as any;

          // Check if this download is for one of the user's files
          const { data: file } = await supabase
            .from('files')
            .select('original_name, user_id')
            .eq('id', newLog.file_id)
            .maybeSingle();

          if (file && file.user_id === user?.id) {
            const newEvent: DownloadEvent = {
              id: newLog.id,
              file_name: file.original_name,
              downloaded_at: newLog.downloaded_at,
              download_method: newLog.download_method || 'direct',
              isNew: true,
            };

            setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);

            // Remove "new" highlight after 3 seconds
            setTimeout(() => {
              setEvents((prev) =>
                prev.map((e) => (e.id === newEvent.id ? { ...e, isNew: false } : e))
              );
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'direct':
        return 'bg-blue-500/10 text-blue-400 border-blue-700/30';
      case 'code':
        return 'bg-purple-500/10 text-purple-400 border-purple-700/30';
      case 'email':
        return 'bg-amber-500/10 text-amber-400 border-amber-700/30';
      case 'link':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-700/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-700/30';
    }
  };

  const getMethodIcon = (method: string): string => {
    switch (method) {
      case 'direct':
        return 'D';
      case 'code':
        return 'C';
      case 'email':
        return 'E';
      case 'link':
        return 'L';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-zinc-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded w-64 mt-2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
            ))}
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
              <Activity className="w-5 h-5 text-emerald-400" />
              Live Download Feed
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-1">
              Real-time download activity from download_logs
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-700/30">
              Live
            </Badge>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
            <Download className="w-4 h-4" />
            <span>{events.length} recent downloads</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No download activity yet</p>
            <p className="text-sm text-zinc-500 mt-1">
              Download events will appear here in real-time
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ${
                    event.isNew
                      ? 'bg-emerald-900/20 border-emerald-700/50 shadow-lg shadow-emerald-500/10 scale-105'
                      : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/60'
                  }`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300">
                      {getMethodIcon(event.download_method)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {event.file_name}
                      </p>
                      {event.isNew && (
                        <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5 animate-pulse">
                          NEW
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getMethodColor(event.download_method)}`}
                      >
                        {event.download_method}
                      </Badge>

                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(event.downloaded_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 mt-1">
                      {format(new Date(event.downloaded_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
