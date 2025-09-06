import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: 'download' | 'share_created' | 'share_accessed' | 'file_uploaded';
  file_id?: string;
  share_token?: string;
  metadata?: Record<string, any>;
}

export const AnalyticsTracker = {
  track: async (event: AnalyticsEvent) => {
    try {
      // Insert download log for tracking
      await supabase.from('download_logs').insert({
        file_id: event.file_id,
        download_method: event.event_type,
        downloader_ip: null, // Will be set by RLS
        downloader_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  trackFileShare: async (fileId: string, shareToken: string) => {
    await AnalyticsTracker.track({
      event_type: 'share_created',
      file_id: fileId,
      share_token: shareToken
    });
  },

  trackFileAccess: async (fileId: string, shareToken?: string) => {
    await AnalyticsTracker.track({
      event_type: 'share_accessed',
      file_id: fileId,
      share_token: shareToken
    });
  },

  trackFileDownload: async (fileId: string, method: string = 'direct') => {
    await AnalyticsTracker.track({
      event_type: 'download',
      file_id: fileId,
      metadata: { download_method: method }
    });
  }
};

// Hook for automatic tracking
export const useAnalyticsTracker = () => {
  return AnalyticsTracker;
};