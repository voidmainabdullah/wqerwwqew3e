import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Files, ShareNetwork, Download, Upload, Cloud, Crown, Activity, PaperPlaneTilt, Lightning, TrendUp, Users, Calendar, Eye, Shield, ChartLineUp, ArrowUpRight, Database, Globe } from "phosphor-react";

interface DashboardStats {
  totalFiles: number;
  totalShares: number;
  totalDownloads: number;
  storageUsed: number;
  storageLimit: number;
  subscriptionTier: string;
  recentActivity: any[];
  popularFiles: any[];
  activeUsers?: number;
  filesSharedToday?: number;
  trafficSource?: { organic: number; direct: number; referral: number };
}

interface UserProfile {
  storage_used: number;
  storage_limit: number;
  subscription_tier: string;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase.from("profiles").select("storage_used, storage_limit, subscription_tier").eq("id", user?.id).maybeSingle<UserProfile>();

      // Fetch total files
      const { count: totalFiles = 0 } = await supabase.from("files").select("*", { count: "exact", head: true }).eq("user_id", user?.id);

      // Fetch popular files
      const { data: userFiles } = await supabase.from("files").select("id, original_name, download_count, created_at").eq("user_id", user?.id).order('download_count', { ascending: false }).limit(5);

      const fileIds = userFiles?.map(f => f.id) || [];

      // Fetch total shares
      const { count: totalShares = 0 } = await supabase.from("shared_links").select("*", { count: "exact", head: true }).in("file_id", fileIds.length ? fileIds : [""]);

      // Fetch total downloads
      const { count: totalDownloads = 0 } = await supabase.from("download_logs").select("*", { count: "exact", head: true }).in("file_id", fileIds.length ? fileIds : [""]);

      // Fetch recent activity
      const { data: recentActivity } = await supabase.from("download_logs").select(`*, files!inner(original_name)`).in("file_id", fileIds.length ? fileIds : [""]).order('downloaded_at', { ascending: false }).limit(5);

      // Simulate extra stats
      const activeUsers = Math.floor(Math.random() * 120) + 20;
      const filesSharedToday = Math.floor(Math.random() * 50) + 10;
      const trafficSource = { organic: 50, direct: 30, referral: 20 };

      setStats({
        totalFiles,
        totalShares,
        totalDownloads,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6_442_450_944,
        subscriptionTier: profile?.subscription_tier || "free",
        recentActivity: recentActivity || [],
        popularFiles: userFiles || [],
        activeUsers,
        filesSharedToday,
        trafficSource
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-8 animate-pulse p-4">
      <div className="h-8 bg-muted w-48 rounded"></div>
      <div className="h-4 bg-muted w-96 rounded"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse h-36"></Card>)}
      </div>
    </div>;
  }

  const isPro = stats?.subscriptionTier === "pro";
  const storageProgress = stats && !isPro ? stats.storageUsed / stats.storageLimit * 100 : 0;

  return (
    <div className="min-h-screen text-white bg-stone-950 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400">Hello, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}</p>
        </div>
        <Badge className={`px-3 py-1 text-sm font-medium ${isPro ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white" : "bg-neutral-800 text-gray-300 border border-neutral-700"}`}>
          {isPro ? <><Crown className="w-4 h-4 mr-1" /> Pro +</> : "Basic"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-[#1c1917] border border-zinc-700/40 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="flex justify-between items-center pb-3">
            <div>
              <CardTitle className="text-slate-400 text-sm uppercase tracking-wide">Total Files</CardTitle>
              <div className="text-3xl font-bold mt-2">{stats?.totalFiles?.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-emerald-400 text-sm">This Month: 287</span></div>
            </div>
            <div className="w-12 h-12 rounded-md flex items-center justify-center bg-zinc-700">
              <Files className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#1c1917] border border-zinc-700/40 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="flex justify-between items-center pb-3">
            <div>
              <CardTitle className="text-slate-400 text-sm uppercase tracking-wide">Active Shares</CardTitle>
              <div className="text-3xl font-bold mt-2">{stats?.totalShares?.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2"><div className="w-2 h-2 bg-purple-400 rounded-full"></div><span className="text-purple-400 text-sm">+8.1%</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-700">
              <ShareNetwork className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#1c1917] border border-zinc-700/40 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="flex justify-between items-center pb-3">
            <div>
              <CardTitle className="text-slate-400 text-sm uppercase tracking-wide">Downloads</CardTitle>
              <div className="text-3xl font-bold mt-2">{stats?.totalDownloads?.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-emerald-400 text-sm">+15.3%</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-700">
              <Download className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#1c1917] border border-zinc-700/40 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="flex justify-between items-center pb-3">
            <div>
              <CardTitle className="text-slate-400 text-sm uppercase tracking-wide">Storage Used</CardTitle>
              <div className="text-3xl font-bold mt-2">
                {isPro
                  ? <div className="flex items-center gap-2"><span>{formatFileSize(stats?.storageUsed)}</span><Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">∞</Badge></div>
                  : <div>{formatFileSize(stats?.storageUsed)} of {formatFileSize(stats?.storageLimit)}</div>
                }
              </div>
              {!isPro && <div className="mt-2"><Progress value={storageProgress} className="h-2 bg-slate-600" /></div>}
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/20">
              <Cloud className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* File Analytics Chart */}
          <Card className="bg-[#1c1917] border border-slate-600/50">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-xl">File Transfer Analytics</CardTitle>
                <CardDescription className="text-slate-400">Your file sharing performance over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-[#1c1917] border-slate-600 text-slate-300 hover:bg-slate-600">7 Days</Button>
                <Button variant="outline" size="sm" className="bg-[#1c1917] border-slate-600 text-slate-300 hover:bg-slate-600">30 Days</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-[#1c1917] rounded-xl p-6 relative overflow-hidden">
                {/* Placeholder chart */}
                <div className="absolute inset-0 opacity-20" style={{backgroundImage:`linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`, backgroundSize:'40px 40px'}} />
                <div className="relative h-full flex items-end justify-between px-4">
                  {[65,45,78,92,67,89,76,95,82,88,94,87].map((h,i)=><div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-6 bg-gradient-to-t from-neutral-500 to-neutral-400 rounded-t-sm transition-all duration-1000" style={{height:`${h}%`}} />
                    <span className="text-xs text-slate-500">{i+1}</span>
                  </div>)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Analytics */}
          <Card className="bg-[#1c1917] border border-slate-600/50 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-xl font-semibold">Live Analytics</h3>
                <p className="text-slate-400">Real-time file sharing performance</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Download className="w-5 h-5 text-emerald-400"/></div>
                <div>
                  <p className="text-slate-400 text-sm">Total Downloads</p>
                  <p className="text-white text-2xl font-bold">{stats?.totalDownloads}</p>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><ShareNetwork className="w-5 h-5 text-purple-400"/></div>
                <div>
                  <p className="text-slate-400 text-sm">Active Shares</p>
                  <p className="text-white text-2xl font-bold">{stats?.totalShares}</p>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Files className="w-5 h-5 text-blue-400"/></div>
                <div>
                  <p className="text-slate-400 text-sm">Total Files</p>
                  <p className="text-white text-2xl font-bold">{stats?.totalFiles}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="bg-stone-950 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Lightning className="w-5 h-5 text-amber-400"/>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-12">
                <Link to="/dashboard/upload" className="flex items-center gap-2"><Upload className="w-5 h-5"/>Upload Files</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-12">
                <Link to="/code" className="flex items-center gap-2"><Download className="w-5 h-5"/>Receive Files</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-12">
                <Link to="/dashboard/shared" className="flex items-center gap-2"><ShareNetwork className="w-5 h-5"/>Manage Shares</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
