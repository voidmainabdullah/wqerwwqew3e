import React from 'react';
import { RealTimeAnalytics } from '@/components/analytics/RealTimeAnalytics';
import { DownloadAnalyticsGraph } from '@/components/analytics/DownloadAnalyticsGraph';
import { DownloadMetrics } from '@/components/analytics/DownloadMetrics';
import { DownloadHeatmap } from '@/components/analytics/DownloadHeatmap';
import { DownloadComparison } from '@/components/analytics/DownloadComparison';
import { LiveDownloadFeed } from '@/components/analytics/LiveDownloadFeed';
import { ExportAnalytics } from '@/components/analytics/ExportAnalytics';
export const Analytics: React.FC = () => {
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-400">
            Track your file sharing performance and download statistics in real-time.
          </p>
        </div>
        <ExportAnalytics />
      </div>

      <DownloadMetrics />

      <DownloadAnalyticsGraph />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DownloadHeatmap />
          <DownloadComparison />
        </div>
        <div>
          <LiveDownloadFeed />
        </div>
      </div>

      
    </div>;
};