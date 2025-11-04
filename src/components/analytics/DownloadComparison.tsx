import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { FileText, TrendingUp } from "lucide-react";

interface FileComparisonData {
  name: string;
  downloads: number;
  shares: number;
  color: string;
}

const COLORS = [
  "#f5f5f5", // White accent
  "#d4d4d8", // Soft gray
  "#a1a1aa", // Mid-gray
  "#e4e4e7",
  "#fafafa",
  "#c6c6c6",
  "#bfbfbf",
];

const DownloadComparison: React.FC = () => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<FileComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const fetchComparisonData = async () => {
    if (!user?.id) return;
    try {
      const { data: userFiles } = await supabase
        .from("files")
        .select("id, original_name")
        .eq("user_id", user.id);

      if (!userFiles?.length) {
        setLoading(false);
        return;
      }

      const fileIds = userFiles.map((f) => f.id);

      const { data: downloads } = await supabase
        .from("download_logs")
        .select("file_id")
        .in("file_id", fileIds);

      const { data: shares } = await supabase
        .from("shared_links")
        .select("file_id")
        .in("file_id", fileIds)
        .eq("is_active", true);

      const downloadCounts = new Map<string, number>();
      downloads?.forEach((d) =>
        downloadCounts.set(d.file_id, (downloadCounts.get(d.file_id) || 0) + 1)
      );

      const shareCounts = new Map<string, number>();
      shares?.forEach((s) =>
        shareCounts.set(s.file_id, (shareCounts.get(s.file_id) || 0) + 1)
      );

      const fileData = userFiles
        .map((file, i) => ({
          name:
            file.original_name.length > 16
              ? file.original_name.substring(0, 16) + "..."
              : file.original_name,
          downloads: downloadCounts.get(file.id) || 0,
          shares: shareCounts.get(file.id) || 0,
          color: COLORS[i % COLORS.length],
        }))
        .filter((f) => f.downloads > 0 || f.shares > 0)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 6);

      const total = fileData.reduce((sum, f) => sum + f.downloads, 0);
      setComparisonData(fileData);
      setTotalDownloads(total);
    } catch (e) {
      console.error("Error fetching comparison data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
    const interval = setInterval(fetchComparisonData, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-black/90 border border-zinc-800 rounded-lg p-2 shadow-xl text-xs backdrop-blur-sm">
          <p className="text-white font-medium mb-1">{payload[0].payload.name}</p>
          <p className="text-white/70">Downloads: {payload[0].value}</p>
          {payload[1] && (
            <p className="text-white/70">Shares: {payload[1].value}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <Card className="rounded-xl border border-zinc-800 bg-black/80 p-4 shadow-lg">
        <CardHeader>
          <div className="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-zinc-900 rounded-md animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!comparisonData.length) {
    return (
      <Card className="rounded-xl border border-zinc-800 bg-black/80 p-6 text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-white/80" />
            File Performance
          </CardTitle>
          <CardDescription className="text-sm text-white/50 mt-1">
            No download or share data yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full border border-zinc-700">
            <FileText className="w-6 h-6 text-white/40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main chart
  return (
    <Card className="rounded-xl border border-zinc-800 bg-gradient-to-br from-black to-zinc-900/90 p-5 shadow-[0_0_20px_rgba(255,255,255,0.04)] transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-white/80" />
              File Comparison
            </CardTitle>
            <CardDescription className="text-sm text-white/50">
              Downloads vs Shares
            </CardDescription>
          </div>
          <Badge className="bg-white/10 text-white border border-white/20 text-xs px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1 opacity-80" />
            {totalDownloads}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#52525b"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  color: "#d4d4d8",
                  paddingTop: "10px",
                }}
                iconType="circle"
              />
              <Bar dataKey="downloads" radius={[5, 5, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="shares" fill="#9ca3af" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-white">{comparisonData.length}</p>
            <p className="text-[11px] text-white/50">Files</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{totalDownloads}</p>
            <p className="text-[11px] text-white/50">Downloads</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {comparisonData.reduce((s, f) => s + f.shares, 0)}
            </p>
            <p className="text-[11px] text-white/50">Shares</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {comparisonData.length > 0
                ? Math.round(totalDownloads / comparisonData.length)
                : 0}
            </p>
            <p className="text-[11px] text-white/50">Avg/File</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadComparison;
