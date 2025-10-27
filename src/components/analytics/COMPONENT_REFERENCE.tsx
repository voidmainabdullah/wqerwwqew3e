/*
 * ANALYTICS COMPONENTS REFERENCE GUIDE
 *
 * This file provides examples of how to use each analytics component
 * in your application. These are TypeScript/React examples.
 */

import React from 'react';
import {
  DownloadAnalyticsGraph,
  DownloadMetrics,
  DownloadHeatmap,
  DownloadComparison,
  LiveDownloadFeed,
  ExportAnalytics,
  QuickAnalyticsSummary,
  RealTimeAnalytics,
} from './index';

export const AnalyticsComponentExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          1. Download Analytics Graph
        </h2>
        <p className="text-zinc-400 mb-4">
          Main time-series graph showing downloads over 12h, 1d, or 1m periods.
          Updates every 30 seconds automatically.
        </p>
        <DownloadAnalyticsGraph />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">2. Download Metrics</h2>
        <p className="text-zinc-400 mb-4">
          Six metric cards showing key statistics with trends and comparisons.
        </p>
        <DownloadMetrics />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          3. Download Heatmap
        </h2>
        <p className="text-zinc-400 mb-4">
          Visual heatmap showing download activity by day of week and hour of day.
        </p>
        <DownloadHeatmap />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          4. Download Comparison
        </h2>
        <p className="text-zinc-400 mb-4">
          Bar chart comparing downloads and shares across your top files.
        </p>
        <DownloadComparison />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          5. Live Download Feed
        </h2>
        <p className="text-zinc-400 mb-4">
          Real-time feed of download events with WebSocket updates. Shows new
          downloads as they happen.
        </p>
        <LiveDownloadFeed />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          6. Quick Analytics Summary
        </h2>
        <p className="text-zinc-400 mb-4">
          Compact summary card perfect for dashboards showing today's downloads.
        </p>
        <QuickAnalyticsSummary />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">7. Export Analytics</h2>
        <p className="text-zinc-400 mb-4">
          Button component to export analytics data to CSV or JSON format.
        </p>
        <ExportAnalytics />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          8. Real-Time Analytics (Legacy)
        </h2>
        <p className="text-zinc-400 mb-4">
          Original analytics component with overview cards and file lists.
        </p>
        <RealTimeAnalytics />
      </section>
    </div>
  );
};

/*
 * USAGE EXAMPLES:
 *
 * 1. Full Analytics Dashboard:
 *
 * import { Analytics } from '@/components/dashboard/Analytics';
 *
 * function App() {
 *   return <Analytics />;
 * }
 *
 *
 * 2. Individual Components:
 *
 * import { DownloadAnalyticsGraph, QuickAnalyticsSummary } from '@/components/analytics';
 *
 * function MyPage() {
 *   return (
 *     <div>
 *       <QuickAnalyticsSummary />
 *       <DownloadAnalyticsGraph />
 *     </div>
 *   );
 * }
 *
 *
 * 3. Custom Layout:
 *
 * import {
 *   DownloadMetrics,
 *   DownloadAnalyticsGraph,
 *   LiveDownloadFeed
 * } from '@/components/analytics';
 *
 * function CustomDashboard() {
 *   return (
 *     <div className="space-y-6">
 *       <DownloadMetrics />
 *       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 *         <div className="lg:col-span-2">
 *           <DownloadAnalyticsGraph />
 *         </div>
 *         <div>
 *           <LiveDownloadFeed />
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 *
 *
 * 4. Using Utility Functions:
 *
 * import {
 *   formatFileSize,
 *   exportToCSV,
 *   calculatePercentChange
 * } from '@/components/analytics';
 *
 * const size = formatFileSize(1024000);  // "1000.0 KB"
 * exportToCSV(data, 'downloads');
 * const trend = calculatePercentChange(chartData);
 *
 *
 * 5. Using TypeScript Types:
 *
 * import type {
 *   TimePeriod,
 *   ChartDataPoint,
 *   AnalyticsMetrics
 * } from '@/components/analytics';
 *
 * const period: TimePeriod = '12h';
 * const data: ChartDataPoint[] = [...];
 */

/*
 * KEY FEATURES:
 *
 * - Real-time updates every 30 seconds
 * - WebSocket integration for live events
 * - Multiple time period views (12h, 1d, 1m)
 * - Interactive charts with tooltips
 * - Responsive design for all screen sizes
 * - Dark theme with emerald accents
 * - Export to CSV and JSON
 * - TypeScript type safety
 * - Supabase database integration
 * - Row Level Security compliant
 * - Loading states and error handling
 * - Smooth animations and transitions
 *
 *
 * DATABASE REQUIREMENTS:
 *
 * All components fetch data from:
 * - files table (user's uploaded files)
 * - download_logs table (download history)
 * - shared_links table (active shares)
 * - profiles table (user metadata)
 *
 * Ensure RLS policies are properly configured for authenticated users.
 *
 *
 * PERFORMANCE NOTES:
 *
 * - Components use React hooks for state management
 * - Data fetching is optimized with proper query filters
 * - Real-time subscriptions are cleaned up on unmount
 * - Charts use memoization for better performance
 * - Loading states prevent UI jank
 *
 *
 * CUSTOMIZATION:
 *
 * To customize colors, edit the following:
 * - Chart colors: utils.ts CHART_COLORS array
 * - Theme colors: Tailwind classes in component files
 * - Accent color: Change emerald-* to your preferred color
 *
 * To change update intervals:
 * - Main graph: 30000ms (30 seconds)
 * - Live feed: Real-time via WebSocket
 * - Metrics: 30000ms (30 seconds)
 * - Heatmap: 60000ms (60 seconds)
 */

export default AnalyticsComponentExamples;
