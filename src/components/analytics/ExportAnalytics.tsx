import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, FileText, CalendarIcon, Loader2 } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
type ExportFormat = 'csv' | 'json';
type DateRange = 'week' | 'month' | 'all' | 'custom';
export const ExportAnalytics: React.FC = () => {
  const {
    user
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);
  const getDateFilter = (): Date | null => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return subDays(now, 7);
      case 'month':
        return subMonths(now, 1);
      case 'custom':
        return customStartDate || null;
      case 'all':
      default:
        return null;
    }
  };
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportToJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {
      type: 'application/json'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExport = async () => {
    if (!user?.id) return;
    try {
      setExporting(true);
      const {
        data: userFiles
      } = await supabase.from('files').select('id, original_name, file_size, file_type, created_at, download_count').eq('user_id', user.id);
      const fileIds = userFiles?.map(f => f.id) || [];
      let query = supabase.from('download_logs').select('*, files!inner(original_name, file_size, file_type)').in('file_id', fileIds).order('downloaded_at', {
        ascending: false
      });
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('downloaded_at', dateFilter.toISOString());
      }
      if (dateRange === 'custom' && customEndDate) {
        query = query.lte('downloaded_at', customEndDate.toISOString());
      }
      const {
        data: downloads
      } = await query;
      if (!downloads || downloads.length === 0) {
        alert('No data available for the selected date range');
        return;
      }
      const exportData = downloads.map((d: any) => ({
        file_name: d.files?.original_name || 'Unknown',
        file_size: d.files?.file_size || 0,
        file_type: d.files?.file_type || 'Unknown',
        download_method: d.download_method,
        downloaded_at: d.downloaded_at,
        downloader_ip: d.downloader_ip || 'N/A'
      }));
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `analytics_export_${timestamp}`;
      if (exportFormat === 'csv') {
        exportToCSV(exportData, `${filename}.csv`);
      } else {
        exportToJSON(exportData, `${filename}.json`);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Failed to export analytics data');
    } finally {
      setExporting(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-zinc-700 bg-zinc-200 hover:bg-zinc-100 text-neutral-600">
          <Download className="w-4 h-4 mr-2" />
          Export Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Export Analytics Data</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Download your analytics data in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-zinc-300">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={val => setExportFormat(val as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="text-zinc-300 cursor-pointer">
                  CSV - Comma Separated Values
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="text-zinc-300 cursor-pointer">
                  JSON - JavaScript Object Notation
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-zinc-300">Date Range</Label>
            <RadioGroup value={dateRange} onValueChange={val => setDateRange(val as DateRange)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="week" id="week" />
                <Label htmlFor="week" className="text-zinc-300 cursor-pointer">
                  Last 7 Days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month" className="text-zinc-300 cursor-pointer">
                  Last 30 Days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-zinc-300 cursor-pointer">
                  All Time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-zinc-300 cursor-pointer">
                  Custom Range
                </Label>
              </div>
            </RadioGroup>

            {dateRange === 'custom' && <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700', !customStartDate && 'text-zinc-400')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                      <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700', !customEndDate && 'text-zinc-400')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                      <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {exporting ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </> : <>
                <FileText className="w-4 h-4 mr-2" />
                Export
              </>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};