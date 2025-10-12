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
      <div className="border-b border-slate-700/50 bg-neutral-900/80 backdrop-blur-sm rounded-full">
        <div className="px-8 py-6 rounded-none bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <Badge className={`px-3 py-1 text-sm font-medium ${isPro ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0" : "bg-slate-700 text-slate-300 border-slate-600"}`}>
                  {isPro ? <>
                      <Crown className="w-4 h-4 mr-1" />
                      Pro + 
                    </> : "Basic"}
                </Badge>
              </div>
              <p className="text-slate-400">
                Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </p>
            </div>

          {/* Total Balance Card */}
<div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600/50 bg-gray-200">
  <div className="text-right">
    <p className="text-slate-400 text-sm mb-4">Connect Your Account</p>

    {/* Icons Row */}
    <div className="flex flex-col gap-4 items-start">

      {/* Drive */}
      <div className="flex items-center gap-3">
        <img
          alt="Drive icon"
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSI0OHB4IiBoZWlnaHQ9IjQ4cHgiPjxwYXRoIGZpbGw9IiMxZTg4ZTUiIGQ9Ik0zOC41OSwzOWMtMC41MzUsMC45My0wLjI5OCwxLjY4LTEuMTk1LDIuMTk3QzM2LjQ5OCw0MS43MTUsMzUuNDY1LDQyLDM0LjM5LDQySDEzLjYxIGMtMS4wNzQsMC0yLjEwNi0wLjI4NS0zLjAwNC0wLjgwMkM5LjcwOCw0MC42ODEsOS45NDUsMzkuOTMsOS40MSwzOWw3LjY3LTloMTMuODRMMzguNTksMzl6Ii8+PHBhdGggZmlsbD0iI2ZiYzAyZCIgZD0iTTI3LjQ2Myw2Ljk5OWMxLjA3My0wLjAwMiwyLjEwNC0wLjcxNiwzLjAwMS0wLjE5OGMwLjg5NywwLjUxOSwxLjY2LDEuMjcsMi4xOTcsMi4yMDFsMTAuMzksMTcuOTk2IGMwLjUzNywwLjkzLDAuODA3LDEuOTY3LDAuODA4LDMuMDAyYzAuMDAxLDEuMDM3LTEuMjY3LDIuMDczLTEuODA2LDMuMDAxbC0xMS4xMjctMy4wMDVsLTYuOTI0LTExLjk5M0wyNy40NjMsNi45OTl6Ii8+PHBhdGggZmlsbD0iI2U1MzkzNSIgZD0iTTQzLjg2LDMwYzAsMS4wNC0wLjI3LDIuMDctMC44MSwzbC0zLjY3LDYuMzVjLTAuNTMsMC43OC0xLjIxLDEuNC0xLjk5LDEuODVMMzAuOTIsMzBINDMuODZ6Ii8+PHBhdGggZmlsbD0iIzRjYWY1MCIgZD0iTTUuOTQ3LDMzLjAwMWMtMC41MzgtMC45MjgtMS44MDYtMS45NjQtMS44MDYtM2MwLjAwMS0xLjAzNiwwLjI3LTIuMDczLDAuODA4LTMuMDA0bDEwLjM5LTE3Ljk5NiBjMC41MzctMC45MywxLjMtMS42ODIsMi4xOTYtMi4yYzAuODk3LTAuNTE5LDEuOTI5LDAuMTk1LDMuMDAyLDAuMTk3bDMuNDU5LDExLjAwOWwtNi45MjIsMTEuOTg5TDUuOTQ3LDMzLjAwMXoiLz48cGF0aCBmaWxsPSIjMTU2NWMwIiBkPSJNMTcuMDgsMzBsLTYuNDcsMTEuMmMtMC43OC0wLjQ1LTEuNDYtMS4wNy0xLjk5LTEuODVMNC45NSwzM2MtMC41NC0wLjkzLTAuODEtMS45Ni0wLjgxLTNIMTcuMDh6Ii8+PHBhdGggZmlsbD0iIzJlN2QzMiIgZD0iTTMwLjQ2LDYuOEwyNCwxOEwxNy41Myw2LjhjMC43OC0wLjQ1LDEuNjYtMC43MywyLjYtMC43OUwyNy40Niw2QzI4LjU0LDYsMjkuNTcsNi4yOCwzMC40Niw2Ljh6Ii8+PC9zdmc+"
          className="w-10 h-10 hover:w-16"
        />
        <span className="text-white flex items-center gap-2">
          Drive
           </span>
            <ArrowUpRight className="w-3 h-3 text-blue-400 " />
      </div>
    </div>
        
                       
       


      {/* GitHub */}
      <div className="flex items-center gap-3">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAADv0lEQVR4nO2aSWgUQRSGvyguMS5oRBOiILjhKaC4gBejBz244kGMIJG45GD0IIIggoIXFU1yEMSzZ0XBJSoaA65xQ0QRjYKHuGXBJBpj1EjBG2mame7qmaruEeqDd5mp7v+97jdVb14VOBwOh8PhcNilBKgEGoBG4DXQCfwU65TPGmXMRrnmv6YY2AW0AINZ2gOgVu713zAFqAe+5RC433qBOqCMPGYYsBvoMRi439RDPQiMIM+YDTy1GLjfngCzyBPWW37rmawbWJd08FXAQALBp+wXUJNU8DsSDNxvaqWIPe1/5UHg3kxYG+eE1xOwXPVZDLRPNDLNCTNtBz88ZLafL+PmAUeBzwaC/gQcAebKvRcGjH0sy7E19gWIq2ALfONHAweA755xbcAd4CJwRuyifNbmGaeu2Q8U+e6pNDoC/NhrK/iygPRT1hxw7QxgjWYlVyZjpweMuR3gh/p5lmKB+pBUvUR8NIb4cty0YLFGbX+T+GgK8aXX9B+oWs3Jyj8H2KBAc3LdaVK0RUPwg0x6thkDfNTw574pwVLgT4iY+r6C+Fiq6dMkE2KVGk/7HPFzQcOvDSaEGjSE4nz7KZZp+KWaKNaXnK+2q6+AqrQ7xLfLJoRaQ0QekhyPQ3xTjdac6cijAihqdrabEOkPEblBcjSH+PbDhMhAiMgzkuNliG9qzyFnvmoUQEnxJcS3LhMibzSWm6nEzzQNv16ZELqmIVRNfvYkr5oQqtMQukL86LyYEyaENmkIKVtCflWBg7LJmjMlGn88UqvBWOwzDniu4c9vYLIp0fuaT1w1RQqxxyjglqYv90wKb9UUVfYCWIB5Fmms+17bYvrJd/gEzorI6TR7ASr9zgMrctzJVdm0Usrt3xGCb7eRicd8Io88Xd5y4F0GZ1Qv8bqsJqneftibPimp/iNC0F5T+wjGKZHKyt8HVJsgijkhjdNWyaQwVFvtfZaBD8pxG2OTn5+aNILK2fHyfbWhDcw9OTwAVSBZYwhwN43oYc+Y2jSZ0BfxQEN5lsHfER+tb452+oS7PVmgmCj9uO3AaunkRmFCFsF3iG+xUJGmT3DKcLsrSvD9MVei/06HpNuSMnGAaUSE4FWVupmEqEqTCW+BQ8Aq2cpeDmwDhka478gIbz6x4FMs1mhMDEbMjELN5S72tM/EbJmBgxzWqQFSjNKY7fPmmJx303JzQDb4DzoEUZThHl1yGNP6UpcLk6UUbc8hAwrTbHfX26zwbFAolWFTlgcW6qTtvUvqAofD4XA4HA4HBvkLVrrU+UoENrgAAAAASUVORK5CYII="
          alt="GitHub"
          className="w-10 h-10"
        />
        <span className="text-white flex items-center gap-2">
          GitHub
        </span>
         
                            <ArrowUpRight className="w-3 h-3 text-blue-400" />
                          </div>
</div>
          </div>
        </div>
      
      
    </div>

    </div>

      

      <div className="p-8 space-y-8 bg-zinc-900">
        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Files Card */}
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
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
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
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
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
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
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
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
            <Card className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-slate-600/50">
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
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-slate-600/50 rounded-xl p-6 bg-inherit">
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
            <Card className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-slate-600/50">
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
          <Card className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-neutral-600/50 hover:border-blue-500/50 transition-all duration-300">
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
              <Button asChild variant="outline" className="w-full bg-neutral-700/50 border-blue-600 text-blue-300 hover:bg-blue-600/50">
                <Link to="/dashboard/settings">
                  Configure Security
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-neutral-600/50 hover:border-purple-500/50 transition-all duration-300">
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
              <Button asChild variant="outline" className="w-full bg-neutral-700/50 border-purple-600 text-purple-300 hover:bg-neutral-600/50">
                <Link to="/dashboard/teams">
                  Manage Teams
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-neutral-600/50 hover:border-emerald-500/50 transition-all duration-300">
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
              <Button asChild variant="outline" className="w-full bg-emerald-700/50 border-emerald-600 text-emerald-300 hover:bg-emerald-600/50">
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