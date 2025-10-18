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
}
interface UserProfile {
  storage_used: number;
  storage_limit: number;
  subscription_tier: string;
}
const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
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
  const {
    user
  } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.id) fetchDashboardStats();
  }, [user]);
  const fetchDashboardStats = async () => {
    try {
      const {
        data: profile
      } = await supabase.from("profiles").select("storage_used, storage_limit, subscription_tier").eq("id", user?.id).maybeSingle<UserProfile>();
      const {
        count: totalFiles = 0
      } = await supabase.from("files").select("*", {
        count: "exact",
        head: true
      }).eq("user_id", user?.id);
      const {
        data: userFiles
      } = await supabase.from("files").select("id, original_name, download_count, created_at").eq("user_id", user?.id).order('download_count', {
        ascending: false
      }).limit(5);
      const fileIds = userFiles?.map(f => f.id) || [];
      const {
        count: totalShares = 0
      } = await supabase.from("shared_links").select("*", {
        count: "exact",
        head: true
      }).in("file_id", fileIds.length ? fileIds : [""]);
      const {
        count: totalDownloads = 0
      } = await supabase.from("download_logs").select("*", {
        count: "exact",
        head: true
      }).in("file_id", fileIds.length ? fileIds : [""]);

      // Get recent activity
      const {
        data: recentActivity
      } = await supabase.from("download_logs").select(`
          *,
          files!inner(original_name)
        `).in("file_id", fileIds.length ? fileIds : [""]).order('downloaded_at', {
        ascending: false
      }).limit(5);
      setStats({
        totalFiles,
        totalShares,
        totalDownloads,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6_442_450_944,
        subscriptionTier: profile?.subscription_tier || "free",
        recentActivity: recentActivity || [],
        popularFiles: userFiles || []
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </CardHeader>
            </Card>)}
        </div>
      </div>;
  }
  const isPro = stats?.subscriptionTier === "pro";
  const storageProgress = stats && !isPro ? stats.storageUsed / stats.storageLimit * 100 : 0;
  return <div className="min-h-screen text-white rounded-xl bg-inherit">
     {/* Professional Header */}
    <div className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md rounded-full">
  <div className="px-6 py-4 rounded-xl border border-[#ffffff10] bg-[#1c1917]">
    <div className="flex items-center justify-between">
      {/* Dashboard Title */}
      <div className=" md:block space-y-1">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r  from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <Badge className={`px-3 py-1 text-sm font-medium ${isPro ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white border-0" : "bg-neutral-800 text-gray-300 border border-neutral-700"}`}>
            {isPro ? <>
                <Crown className="w-4 h-4 mr-1" /> Pro +
              </> : "Basic"}
          </Badge>
        </div>
        <p className="text-gray-500">
          Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
        </p>
      </div>
    </div>
  </div>
    </div>

    {/* Ultra Professional Ad Layout */}
    <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center w-full max-w-6xl mx-auto p-4">

  {/* Interactive Video Ad Card */}
  <div className="relative overflow-hidden  bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 rounded-3xl border border-neutral-800 shadow-2xl w-full md:w-2/3 group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-gray-500/20 h-[300px]">

    {/* Background Video */}
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <iframe className="w-full h-80 object-cover scale-105 opacity-85 transition-all duration-500 group-hover:opacity-100" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&modestbranding=1&showinfo=0" title="Ad Video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe> 
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-900/40 to-neutral-800/70 group-hover:from-transparent group-hover:to-transparent transition-all duration-500 backdrop-blur-[1px]"></div>
    </div>

    {/* Top Bar (Ad Label + Dropdown Menu) */}
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
      <span className="text-xs sm:text-sm font-semibold text-gray-200 bg-neutral-950/80 backdrop-blur-sm px-3 py-1 rounded-full border border-neutral-800 shadow-sm">
        Ad · Sponsored
      </span>

      <div className="relative">
        <button onClick={() => {
              const el = document.getElementById("adDropdown");
              el.classList.toggle("hidden");
              el.classList.toggle("animate-fadeIn");
            }} className="text-gray-300 hover:text-gray-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu - Professional Key Points */}
        <div id="adDropdown" className="hidden absolute right-0 mt-3 w-64 bg-neutral-950/95 border border-neutral-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30">
          <h4 className="text-gray-100 text-sm font-semibold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20h9" />
            </svg>
            Key Features
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              Secure File Synchronization
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Global High-Speed Access
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              End-to-End Encryption
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              +1TB Free Storage Offer
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Hover Title */}
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="relative z-10 flex flex-col items-center justify-center text-center py-20 md:py-28 transition-all duration-500">
      <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 text-2xl font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 tracking-wide drop-shadow-lg">
        Cloud Sync Pro — Lightning Fast Uploads
      </h3>
    </a>

    {/* Visit Now CTA */}
    <div className="absolute bottom-5 right-5 z-20">
      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center gap-2 text-sm sm:text-base px-4 py-2 rounded-full bg-neutral-900/80 text-gray-100 font-semibold border border-neutral-700 hover:bg-neutral-800 hover:border-gray-600 shadow-md hover:shadow-gray-500/20 transition-all duration-300 overflow-hidden">
        <span className="relative z-10">Visit Now</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>

    {/* Glow Orbs */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-neutral-600/15 rounded-full blur-3xl animate-pulse-slow"></div>
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-neutral-500/10 rounded-full blur-3xl animate-pulse-slow delay-1500"></div>
  </div>

  {/* Right Side Preview Card */}
  <div className="hidden md:flex relative flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 rounded-3xl border border-neutral-800 shadow-xl h-80 w-full md:w-1/3 p-6 hover:shadow-gray-500/20 transition-all duration-500">
    <div className="relative overflow-hidden rounded-2xl mb-5">
      <img src="/skie.png" alt="Ad Preview" className="w-full h-48 object-cover rounded-2xl hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 rounded-2xl"></div>
    </div>

    <div className="text-left space-y-3">
      <h4 className="text-gray-100 text-lg font-semibold">Ultra Cloud Storage</h4>
      <p className="text-gray-400 text-sm leading-relaxed">
        Experience next-gen speed and security with the most efficient cloud system built for professionals.
      </p>
    </div>

    <div className="mt-5">
      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-850 text-gray-200 font-semibold border border-neutral-700 hover:from-neutral-700 hover:to-neutral-600 hover:text-white transition-all duration-300">
        Learn More
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  </div>
    </div>

    <style>
      {`
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.9; }
}
.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
`}
    </style>


      <div className="p-8 space-y-8 bg-stone-950">
        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Files Card */}
          <Card className="bg-[#1c1917] border border border-zinc-700/40 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div> 
                <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Total Files
                </CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats?.totalFiles?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 
                  <span className="text-emerald-400 text-sm"> This Month : 287</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-zinc-700 ">
                <Files className="h-6 w-6 text-white bg-inherit" />
              </div>
            </CardHeader>
          </Card>

          {/* Shares Card */}
          <Card className="bg-[#1c1917] border border border-zinc-700/40  transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Active Shares
                </CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats?.totalShares?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-purple-400 text-sm">+8.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center">
                <ShareNetwork className="h-6 w-6  text-white" />
              </div>
            </CardHeader>
          </Card>

          {/* Downloads Card */}
          <Card className="bg-[#1c1917] border border border-zinc-700/40  hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Downloads
                </CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats?.totalDownloads?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-emerald-400 text-sm">+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center">
                <Download className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
          </Card>

          {/* Storage Card */}
          <Card className="bg-card border border-zinc-700/40  hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Storage Used 
                </CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  {isPro ? <div className="flex items-center gap-2">
                      <span>{formatFileSize(stats?.storageUsed || 0)}</span>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                        ∞
                      </Badge>
                    </div> : <div>
                      <div>{formatFileSize(stats?.storageUsed || 0)}</div>
                      <div className="text-sm text-slate-400">
                        of {formatFileSize(stats?.storageLimit || 0)}
                      </div>
                    </div>}
                </div>
                {!isPro && <div className="mt-2">
                    <Progress value={storageProgress} className="h-2 bg-slate-600" />
                  </div>}
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white-400" />
              </div>
            </CardHeader>
          </Card>
        </div> 

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-slate-600/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">File Transfer Analytics</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your file sharing performance over time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
                      7 Days
                    </Button>
                    <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
                      30 Days
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simulated Chart Area */}
                <div className="h-64 bg-neutral-900/50 rounded-xl p-6 relative overflow-hidden">
                  {/* Chart Background Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                    backgroundImage: `
                        linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                      `,
                    backgroundSize: '40px 40px'
                  }} />
                  </div>
                  
                  {/* Simulated Chart Line */}
                  <div className="relative h-full flex items-end justify-between px-4">
                    {[65, 45, 78, 92, 67, 89, 76, 95, 82, 88, 94, 87].map((height, i) => <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-6 bg-gradient-to-t from-neutral-500 to-neutral-400 rounded-t-sm transition-all duration-1000" style={{
                      height: `${height}%`
                    }} />
                        <span className="text-xs text-slate-500">{i + 1}</span>
                      </div>)}
                  </div>
                  
                  {/* Chart Stats Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-neutral-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-white text-sm font-medium">Downloads</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stats?.totalDownloads?.toLocaleString() || 0}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">+23.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Analytics Component */}
            <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-slate-600/50 rounded-xl p-6 bg-inherit">
              <div className="space-y-6">
                {/* Analytics Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-semibold">Live Analytics</h3>
                    <p className="text-slate-400">Real-time file sharing performance</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                
                {/* Analytics Cards Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Downloads</p>
                        <p className="text-white text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <ShareNetwork className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Active Shares</p>
                        <p className="text-white text-2xl font-bold">{stats?.totalShares || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Files className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Files</p>
                        <p className="text-white text-2xl font-bold">{stats?.totalFiles || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Files */}
                <div className="rounded-lg p-4 border border-slate-600/30 bg-neutral-800">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <TrendUp className="w-4 h-4 text-emerald-400" />
                    Popular Files
                  </h4>
                  <div className="space-y-2">
                    {stats?.popularFiles.length ? stats.popularFiles.slice(0, 3).map((file, index) => <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                            <Files className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-slate-300 text-sm truncate max-w-[150px]">
                            {file.original_name}
                          </span>
                        </div>
                        <span className="text-emerald-400 text-sm">{file.download_count} downloads</span>
                      </div>) : <p className="text-slate-400 text-sm">No files uploaded yet</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity and Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-12">
                  <Link to="/dashboard/upload" className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-12">
                  <Link to="/code" className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Receive Files
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-12">
                  <Link to="/dashboard/shared" className="flex items-center gap-2">
                    <ShareNetwork className="w-5 h-5" />
                    Manage Shares
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Storage Overview */}
            <Card className="bg-gradient-to-br from-neutral-900 to-slate-600 border-slate-600/50 text-white bg-neutral-800">
              <CardHeader className="bg-zinc-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-neutral-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Used</span>
                    <span className="text-white font-medium">
                      {formatFileSize(stats?.storageUsed || 0)}
                    </span>
                  </div>
                  {!isPro && <>
                      <Progress value={storageProgress} className="h-2 bg-slate-600" />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          {storageProgress.toFixed(1)}% used
                        </span>
                        <span className="text-slate-500">
                          {formatFileSize(stats?.storageLimit || 0)} total
                        </span>
                      </div>
                    </>}
                </div>
                
                {!isPro && <Button asChild className="w-full bg-gradient-to-br from-blue-600 to-blue-400 text-white hover:from-blue-400 hover:to-blue-800 text-white border-0">
                    <Link to="/subscription" className="flex items-center gap-2 ">
                      <Crown className="w-4 h-4 text-amber-300" />
                      Upgrade to Pro 
                    </Link>
                  </Button>}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentActivity.length ? stats.recentActivity.map((activity, index) => <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Download className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {activity.files?.original_name || 'Unknown file'}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {new Date(activity.downloaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>) : <div className="text-center py-6 text-slate-400">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50">
              
              
            </Card>
          </div>
        </div>

        {/* Bottom Action Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-neutral-600/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-neutral-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Enhanced Security</CardTitle>
              <CardDescription className="text-slate-400">
                Advanced encryption and access controls for your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full from-neutral-950 via-neutral-900 to-neutral-850 text-blue-300 hover:bg-blue-600/50">
                <Link to="/dashboard/settings">
                  Configure Security
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-neutral-600/50 hover:border-purple-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-neutral-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Team Collaboration</CardTitle>
              <CardDescription className="text-slate-400">
                Share files and collaborate with your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full from-neutral-950 via-neutral-900 to-neutral-850 text-purple-300 hover:bg-neutral-600/50">
                <Link to="/dashboard/teams">
                  Manage Teams
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 border-neutral-600/50 hover:border-emerald-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-neutral-500/20 flex items-center justify-center mb-4 ">
                <ChartLineUp className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">Analytics & Insights</CardTitle>
              <CardDescription className="text-slate-400">
                Track performance and optimize your file sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full from-neutral-950 via-neutral-900 to-neutral-850 text-emerald-300 hover:bg-emerald-600/50">
                <Link to="/dashboard/analytics">
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};