import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Files, ShareNetwork, Download, Upload, Cloud, Crown, Activity, PaperPlaneTilt, Lightning, TrendUp, Users, Calendar, Eye, Shield, ChartLineUp, Database, Globe } from "phosphor-react";
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
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard
                </h1>
                <Badge className={`px-3 py-1 text-sm font-medium ${isPro ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0" : "bg-slate-700 text-slate-300 border-slate-600"}`}>
                  {isPro ? <>
                      <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                      Pro + 
                    </> : "Basic"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </p>
            </div>

            {/* Total Balance Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-right">
                <p className="text-muted-foreground text-sm mb-1">Total Storage Value</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency((stats?.storageUsed || 0) * 0.0001)}
                </p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <TrendUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">+12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Files Card */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Total Files
                </CardTitle>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {stats?.totalFiles?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 
                  <span className="text-emerald-400 text-sm"> This Month : 287</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-analytics-purple-bg flex items-center justify-center">
                <Files className="h-6 w-6 analytics-icon analytics-icon-purple" />
              </div>
            </CardHeader>
          </Card>

          {/* Shares Card */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Active Shares
                </CardTitle>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {stats?.totalShares?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-purple-400 text-sm">+8.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-analytics-green-bg flex items-center justify-center">
                <ShareNetwork className="h-6 w-6 analytics-icon analytics-icon-green" />
              </div>
            </CardHeader>
          </Card>

          {/* Downloads Card */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Downloads
                </CardTitle>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {stats?.totalDownloads?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-emerald-400 text-sm">+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-analytics-yellow-bg flex items-center justify-center">
                <Download className="h-6 w-6 analytics-icon analytics-icon-yellow" />
              </div>
            </CardHeader>
          </Card>

          {/* Storage Card */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Storage Used
                </CardTitle>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {isPro ? <div className="flex items-center gap-2">
                      <span>{formatFileSize(stats?.storageUsed || 0)}</span>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
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
              <div className="w-12 h-12 rounded-xl bg-analytics-red-bg flex items-center justify-center">
                <Cloud className="h-6 w-6 analytics-icon analytics-icon-red" />
              </div>
            </CardHeader>
          </Card>
        </div> 

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-xl">File Transfer Analytics</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your file sharing performance over time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      7 Days
                    </Button>
                    <Button variant="outline" size="sm">
                      30 Days
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simulated Chart Area */}
                <div className="h-64 bg-muted/30 rounded-xl p-6 relative overflow-hidden">
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
                        <div className="w-6 bg-gradient-to-t from-primary/60 to-primary rounded-t-sm transition-all duration-1000" style={{
                      height: `${height}%`
                    }} />
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                      </div>)}
                  </div>
                  
                  {/* Chart Stats Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-foreground text-sm font-medium">Downloads</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">
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
            <Card className="p-6">
              <div className="space-y-6">
                {/* Analytics Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">Live Analytics</h3>
                    <p className="text-muted-foreground">Real-time file sharing performance</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                
                {/* Analytics Cards Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-analytics-green-bg flex items-center justify-center">
                        <Download className="w-5 h-5 analytics-icon analytics-icon-green" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Downloads</p>
                        <p className="text-foreground text-xl font-bold">{stats?.totalDownloads || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-analytics-purple-bg flex items-center justify-center">
                        <ShareNetwork className="w-5 h-5 analytics-icon analytics-icon-purple" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Active Shares</p>
                        <p className="text-foreground text-xl font-bold">{stats?.totalShares || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-analytics-yellow-bg flex items-center justify-center">
                        <Files className="w-5 h-5 analytics-icon analytics-icon-yellow" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Files</p>
                        <p className="text-foreground text-xl font-bold">{stats?.totalFiles || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Files */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                  <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
                    <TrendUp className="w-4 h-4 text-emerald-400" />
                    Popular Files
                  </h4>
                  <div className="space-y-2">
                    {stats?.popularFiles.length ? stats.popularFiles.slice(0, 3).map((file, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-analytics-purple-bg flex items-center justify-center">
                            <Files className="w-3 h-3 analytics-icon analytics-icon-purple" />
                          </div>
                          <span className="text-foreground text-sm truncate max-w-[150px]">
                            {file.original_name}
                          </span>
                        </div>
                        <span className="text-emerald-400 text-sm">{file.download_count} downloads</span>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-sm">No files uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity and Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full h-12">
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
                
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/dashboard/shared" className="flex items-center gap-2">
                    <ShareNetwork className="w-5 h-5" />
                    Manage Shares
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Storage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
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
                
                  <Button asChild className="w-full">
                    <Link to="/subscription" className="flex items-center gap-2 ">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Upgrade to Pro 
                    </Link>
                  </Button>}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                      <div className="w-8 h-8 rounded-lg bg-analytics-green-bg flex items-center justify-center">
                        <Download className="w-4 h-4 analytics-icon analytics-icon-green" />
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Download className="w-4 h-4 text-emerald-400" />
                        <p className="text-foreground text-sm font-medium truncate">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                        <p className="text-muted-foreground text-xs">
                          </p>
                          <p className="text-slate-400 text-xs">
                            {new Date(activity.downloaded_at).toLocaleDateString()}
                          </p>
                        </div>
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Bottom Action Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-analytics-red-bg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 analytics-icon analytics-icon-red" />
              </div>
              <CardTitle className="text-foreground">Enhanced Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Advanced encryption and access controls for your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/settings">
                  Configure Security
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-analytics-purple-bg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 analytics-icon analytics-icon-purple" />
              </div>
              <CardTitle className="text-foreground">Team Collaboration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Share files and collaborate with your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/teams">
                  Manage Teams
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-analytics-green-bg flex items-center justify-center mb-4">
                <ChartLineUp className="w-6 h-6 analytics-icon analytics-icon-green" />
              </div>
              <CardTitle className="text-foreground">Analytics & Insights</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track performance and optimize your file sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/analytics">
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
};