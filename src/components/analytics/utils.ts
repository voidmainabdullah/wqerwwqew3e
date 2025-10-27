import { format, subHours, subDays, subMonths } from 'date-fns';
import { TimePeriod, ChartDataPoint } from './types';

export const formatTimeLabel = (date: Date, timePeriod: TimePeriod): string => {
  switch (timePeriod) {
    case '12h':
    case '1d':
      return format(date, 'HH:mm');
    case '1m':
      return format(date, 'MMM dd');
  }
};

export const getCutoffDate = (period: TimePeriod): Date => {
  switch (period) {
    case '12h':
      return subHours(new Date(), 12);
    case '1d':
      return subDays(new Date(), 1);
    case '1m':
      return subMonths(new Date(), 1);
  }
};

export const generateEmptyDataPoints = (timePeriod: TimePeriod): ChartDataPoint[] => {
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
    const date = intervalUnit === 'hours' ? subHours(now, i) : subDays(now, i);

    points.push({
      time: formatTimeLabel(date, timePeriod),
      downloads: 0,
      fullDate: date.toISOString(),
    });
  }

  return points;
};

export const groupDownloadsByTime = (
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

export const formatChartData = (
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
    const date = intervalUnit === 'hours' ? subHours(now, i) : subDays(now, i);

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

export const calculatePercentChange = (data: ChartDataPoint[]): number => {
  if (data.length < 2) return 0;

  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);

  const firstHalfSum = firstHalf.reduce((sum, d) => sum + d.downloads, 0);
  const secondHalfSum = secondHalf.reduce((sum, d) => sum + d.downloads, 0);

  if (firstHalfSum === 0) return secondHalfSum > 0 ? 100 : 0;

  return ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
};

export const getIntensityColor = (count: number, maxCount: number): string => {
  if (count === 0) return 'bg-zinc-800';
  const intensity = maxCount > 0 ? count / maxCount : 0;
  if (intensity < 0.25) return 'bg-emerald-900/40';
  if (intensity < 0.5) return 'bg-emerald-700/60';
  if (intensity < 0.75) return 'bg-emerald-600/80';
  return 'bg-emerald-500';
};

export const getMethodColor = (method: string): string => {
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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateFileName = (name: string, maxLength: number = 20): string => {
  return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};

export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => `"${val}"`)
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

export const exportToJSON = (data: any[], filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const CHART_COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);
