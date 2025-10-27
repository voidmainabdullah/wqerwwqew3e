export type TimePeriod = '12h' | '1d' | '1m';

export interface DownloadData {
  timestamp: string;
  downloads: number;
  period: TimePeriod;
}

export interface ChartDataPoint {
  time: string;
  downloads: number;
  fullDate: string;
}

export interface DownloadEvent {
  id: string;
  file_name: string;
  downloaded_at: string;
  download_method: string;
  downloader_ip?: string;
  isNew?: boolean;
}

export interface FileComparisonData {
  name: string;
  downloads: number;
  shares: number;
  color: string;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
  date: Date;
}

export interface AnalyticsMetrics {
  totalDownloads: number;
  todayDownloads: number;
  avgDownloadsPerDay: number;
  peakHour: string;
  uniqueFiles: number;
  activeShares: number;
  downloadTrend: number;
}

export interface RealTimeStats {
  totalFiles: number;
  totalShares: number;
  totalDownloads: number;
  recentDownloads: any[];
  popularFiles: any[];
  storageUsed: number;
  storageLimit: number;
  subscriptionTier: string;
}

export type ExportFormat = 'csv' | 'json';
export type DateRange = 'week' | 'month' | 'all' | 'custom';

export interface ExportOptions {
  format: ExportFormat;
  dateRange: DateRange;
  customStartDate?: Date;
  customEndDate?: Date;
}
