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
import { DownloadHeatmap } from "@/components/analytics/DownloadHeatmap";
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
    return <div className="space-y-8 p-6 sm:p-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted w-48 animate-pulse rounded-xl"></div>
          <div className="h-4 bg-muted rounded-xl w-96 animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse bg-card border border-border">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded-xl w-24"></div>
                <div className="h-6 bg-muted rounded-xl w-16 mt-2"></div>
              </CardHeader>
            </Card>)}
        </div>
      </div>;
  }
  const isPro = stats?.subscriptionTier === "pro";
  const storageProgress = stats && !isPro ? stats.storageUsed / stats.storageLimit * 100 : 0;
  return <div className="min-h-screen bg-background rounded-xl">
  {/* Apple-inspired Header */}   
  <div className="w-full border-b border-border/50 bg-background/95 backdrop-blur-md rounded-t-xl">  
    <div className="w-full border-none rounded-none bg-background py-3 sm:py-4 px-4 sm:px-6 md:px-8 -mt-8">  
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mx-0 my-0 px-0 gap-3 sm:gap-0">
        {/* Dashboard Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          <Badge variant={isPro ? "default" : "secondary"} className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full ${isPro ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {isPro ? <>
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" weight="fill" /> Pro
              </> : "Free"}
          </Badge>
        </div>
       <p className="hidden sm:block text-sm font-medium text-muted-foreground">
  Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
            </p>

      </div>
    </div>
  </div>
    </div>



      <div className="p-6 sm:p-8 space-y-8 bg-background">
        {/* Main Stats Grid - Apple-inspired clean cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Files Card */}
          <Card className="bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div className="space-y-2"> 
                <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Total Files
                </CardTitle>
                <div className="text-3xl font-bold text-foreground">
                  {stats?.totalFiles?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground text-sm">
                  Files stored
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10">
                <Files className="h-6 w-6 text-primary" weight="duotone" />
              </div>
            </CardHeader>
          </Card>

          {/* Shares Card */}
          <Card className="bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div className="space-y-2">
                <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Active Shares
                </CardTitle>
                <div className="text-3xl font-bold text-foreground">
                  {stats?.totalShares?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground text-sm">
                  Shared links
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShareNetwork className="h-6 w-6 text-primary" weight="duotone" />
              </div>
            </CardHeader>
          </Card>

          {/* Downloads Card */}
          <Card className="bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div className="space-y-2">
                <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Downloads
                </CardTitle>
                <div className="text-3xl font-bold text-foreground">
                  {stats?.totalDownloads?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground text-sm">
                  Total downloads
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" weight="duotone" />
              </div>
            </CardHeader>
          </Card>

          {/* Storage Card */}
          <Card className="bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Storage Used 
                </CardTitle>
                <div className="text-3xl font-bold text-foreground">
                  {isPro ? <div className="flex items-center gap-2">
                      <span>{formatFileSize(stats?.storageUsed || 0)}</span>
                      <Badge className="bg-primary text-primary-foreground border-0 text-xs rounded-full">
                        ∞
                      </Badge>
                    </div> : <div>
                      <div>{formatFileSize(stats?.storageUsed || 0)}</div>
                      <div className="text-sm text-muted-foreground">
                        of {formatFileSize(stats?.storageLimit || 0)}
                      </div>
                    </div>}
                </div>
                {!isPro && <div className="mt-2">
                    <Progress value={storageProgress} className="h-2" />
                  </div>}
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10">
                <Cloud className="h-6 w-6 text-primary" weight="duotone" />
              </div>
            </CardHeader>
          </Card>
        </div> 

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Download Activity Heatmap */}
            <DownloadHeatmap />

            {/* Real-time Analytics Component */}
            <Card className="bg-card border border-border">
              <div className="p-6 space-y-6">
                {/* Analytics Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-xl font-semibold">Live Analytics</h3>
                    <p className="text-muted-foreground">Real-time file sharing performance</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                </div>
                
                {/* Analytics Cards Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl p-4 border border-border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                        <Download className="w-5 h-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Downloads</p>
                        <p className="text-foreground text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl p-4 border border-border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                        <ShareNetwork className="w-5 h-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Active Shares</p>
                        <p className="text-foreground text-2xl font-bold">{stats?.totalShares || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl p-4 border border-border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                        <Files className="w-5 h-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Files</p>
                        <p className="text-foreground text-2xl font-bold">{stats?.totalFiles || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Files */}
                <div className="rounded-xl p-4 border border-border bg-muted/50">
                  <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
                    <TrendUp className="w-4 h-4 text-primary" weight="duotone" />
                    Popular Files
                  </h4>
                  <div className="space-y-2">
                    {stats?.popularFiles.length ? stats.popularFiles.slice(0, 3).map((file, index) => <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <Files className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-foreground text-sm truncate max-w-[150px]">
                            {file.original_name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{file.download_count} downloads</span>
                      </div>) : <p className="text-muted-foreground text-sm">No files uploaded yet</p>}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity and Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-primary" weight="duotone" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/dashboard/upload" className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/code" className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Receive Files
                  </Link>
                </Button>
                
                <Button asChild variant="secondary" className="w-full h-12">
                  <Link to="/dashboard/shared" className="flex items-center gap-2">
                    <ShareNetwork className="w-5 h-5" />
                    Manage Shares
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Storage Overview */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" weight="duotone" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span className="text-foreground font-medium">
                      {formatFileSize(stats?.storageUsed || 0)}
                    </span>
                  </div>
                  {!isPro && <>
                      <Progress value={storageProgress} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {storageProgress.toFixed(1)}% used
                        </span>
                        <span className="text-muted-foreground">
                          {formatFileSize(stats?.storageLimit || 0)} total
                        </span>
                      </div>
                    </>}
                </div>
                
                {!isPro && <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to="/subscription" className="flex items-center gap-2">
                      <Crown className="w-4 h-4" weight="fill" />
                      Upgrade to Pro 
                    </Link>
                  </Button>}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border border-border">  
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" weight="duotone" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentActivity.length ? stats.recentActivity.map((activity, index) => <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Download className="w-4 h-4 text-primary" weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">
                             {activity.files?.original_name || 'Unknown file'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(activity.downloaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>) : <div className="text-center py-6 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>;
};