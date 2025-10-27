import React from 'react';
import { DownloadAnalyticsGraph } from './DownloadAnalyticsGraph';

export const AnalyticsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Download Analytics Dashboard</h1>
          <p className="text-zinc-400 text-lg">
            Monitor your file downloads in real-time with interactive charts and insights
          </p>
        </div>

        <DownloadAnalyticsGraph />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Key Features</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Real-time data updates every 30 seconds
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Multiple time period views
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Responsive design for all devices
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Interactive tooltips on hover
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Time Periods</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700 rounded text-xs">12H</span>
                Last 12 hours with hourly breakdowns
              </li>
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700 rounded text-xs">1D</span>
                Last 24 hours with hourly breakdowns
              </li>
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700 rounded text-xs">1M</span>
                Last 30 days with daily breakdowns
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Live Indicators</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Real-time status indicator
              </li>
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-700/30 rounded text-xs">
                  +24.5%
                </span>
                Trend percentage change
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs">12:45:30</span>
                Last update timestamp
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
