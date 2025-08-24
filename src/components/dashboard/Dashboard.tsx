import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Files, ShareNetwork, Download, TrendUp, Upload, Shield, Lightning, Users, Cloud, FileText, Crown, Zap, Code, PaperPlaneTilt, ChartLineUp, Calendar, Activity } from 'phosphor-react';
import { AnimatedIcon, EmptyStateIcon } from '@/components/ui/animated-icons';
interface DashboardStats {
  totalFiles: number;
  totalShares: number;
  totalDownloads: number;
  storageUsed: number;
  storageLimit: number;
  subscriptionTier: string;
}
export const Dashboard: React.FC = () => {
  const {
    user
  } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);
  const fetchDashboardStats = async () => {
    try {
      // Fetch user profile with storage info
      const {
        data: profile
      } = await supabase.from('profiles').select('storage_used, storage_limit, subscription_tier').eq('id', user?.id).single();

      // Fetch file count
      const {
        count: fileCount
      } = await supabase.from('files').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user?.id);

      // Fetch share count - Get shared links for user's files
      const {
        data: userFiles
      } = await supabase.from('files').select('id').eq('user_id', user?.id);
      const fileIds = userFiles?.map(f => f.id) || [];
      const {
        count: shareCount
      } = await supabase.from('shared_links').select('*', {
        count: 'exact',
        head: true
      }).in('file_id', fileIds);

      // Fetch download count
      const {
        count: downloadCount
      } = await supabase.from('download_logs').select('*', {
        count: 'exact',
        head: true
      }).in('file_id', fileIds);
      setStats({
        totalFiles: fileCount || 0,
        totalShares: shareCount || 0,
        totalDownloads: downloadCount || 0,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6442450944,
        // 6GB default
        subscriptionTier: profile?.subscription_tier || 'free'
      });
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const storageProgress = stats ? stats.subscriptionTier === 'pro' ? 0 : stats.storageUsed / stats.storageLimit * 100 : 0;
  const isPro = stats?.subscriptionTier === 'pro';
  return <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <Badge variant={isPro ? 'default' : 'secondary'} className={`px-3 py-1 text-sm font-medium ${isPro ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' : 'bg-muted text-muted-foreground'}`}>
              {isPro ? <>
                  <Crown className="w-4 h-4 mr-1" />
                  Pro
                </> : 'Free'}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Welcome back, {user?.user_metadata?.display_name || user?.email?.split('@')[0]}. 
            Here's your file sharing overview and quick actions.
          </p>
        </div>

        {/* Upgrade Banner - Desktop */}
        <div className="hidden lg:block">
          <Link to="/subscription" className="group block transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl">
            <div className="relative overflow-hidden rounded-xlborder-4 border-blue-400 shadow-lg  bg-gradient-to-r from-neutral-850  p-6 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r border-2 rounded-xl border-white shadow-sm from-neutral-700 to-black opacity-50 bg-neutral-800"></div>
              <div className="relative"> 
                <div className="flex items-center gap-3 mb-2">
                  <Lightning className="w-6 h-6 text-indigo-400" />
                  <span className="text-white font-semibold text-lg">Upgrade to Pro</span>
                </div>
                <p className="text-blue-100 text-sm mb-3">
                  Unlock unlimited storage and premium features
                  
              
                </p>
                <div className="flex items-center text-indigo-200 text-sm font-medium">
                  <span>Learn more</span>
                  <Lightning className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Files */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0  bg-neutral-850"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Files
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalFiles.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Files className="h-6 w-6 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Files in your account
            </p>
            {stats?.totalFiles === 0 && <AnimatedIcon show={true} type="files" className="absolute inset-0" />}
          </CardContent>
        </Card>

        {/* Shared Links */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-850 to-emerald-500/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Shares
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalShares.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ShareNetwork className="h-6 w-6 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Sharing links created
            </p>
            {stats?.totalShares === 0 && <AnimatedIcon show={true} type="shares" className="absolute inset-0" />}
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br bg-neutral-850"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Downloads
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalDownloads.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Download className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              File downloads completed
            </p>
            {stats?.totalDownloads === 0 && <AnimatedIcon show={true} type="downloads" className="absolute inset-0" />}
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-blue-500/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Storage Used
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {isPro ? <div className="flex items-center gap-2">
                    <span>{formatFileSize(stats?.storageUsed || 0)}</span>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
                      Unlimited
                    </Badge>
                  </div> : <div className="space-y-1">
                    <div>{formatFileSize(stats?.storageUsed || 0)}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      of {formatFileSize(stats?.storageLimit || 0)}
                    </div>
                  </div>}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Cloud className="h-6 w-6 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {!isPro && <div className="space-y-2">
                <Progress value={storageProgress} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {(100 - storageProgress).toFixed(1)}% remaining
                </p>
              </div>}
            {isPro && <p className="text-sm text-muted-foreground">
                Unlimited cloud storage
              </p>}
            {stats?.storageUsed === 0 && <AnimatedIcon show={true} type="storage" className="absolute inset-0" />}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Quick Actions Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upload Files */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-functions-upload/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-functions-upload" />
              </div>
              <CardTitle className="text-xl">Upload Files</CardTitle>
              <CardDescription className="text-base">
                Upload and share files instantly with advanced security options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-functions-upload hover:bg-functions-uploadGlow text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/dashboard/upload" className="bg-neutral-600">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Upload
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Request Files */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-functions-download/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <PaperPlaneTilt className="w-6 h-6 text-functions-download" />
              </div>
              <CardTitle className="text-xl">Request Files</CardTitle>
              <CardDescription className="text-base">
                Create secure links for others to send files directly to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard/receive">
                  <PaperPlaneTilt className="mr-2 h-4 w-4" />
                  Create Request
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Download with Code */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-functions-processing/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Code className="w-6 h-6 text-functions-processing" />
              </div>
              <CardTitle className="text-xl">Download with Code</CardTitle>
              <CardDescription className="text-base">
                Enter a share code to access files shared with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/code">
                  <Code className="mr-2 h-4 w-4" />
                  Enter Code
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Management & Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ChartLineUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Management & Analytics</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* File Management */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Files className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">File Management</CardTitle>
                  <CardDescription className="text-base">
                    Organize, share, and manage your uploaded files.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">{stats?.totalFiles}</div>
                  <div className="text-xs text-muted-foreground">Files</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">{stats?.totalShares}</div>
                  <div className="text-xs text-muted-foreground">Shares</div>
                </div>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard/files">
                  <Files className="mr-2 h-4 w-4" />
                  Manage Files
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ChartLineUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Analytics</CardTitle>
                  <CardDescription className="text-base">
                    Track downloads and sharing performance.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">{stats?.totalDownloads}</div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-1xl font-bold text-green-500">
                    {stats?.totalDownloads > 0 ? '↗ Goes Up' : '— Stable'}
                  </div>
                  <div className="text-xs text-muted-foreground">Trend</div>
                </div>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard/analytics">
                  <ChartLineUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security & Features Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Security & Features</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Security Features */}
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-green-500" />
                Security Features
              </CardTitle>
              <CardDescription className="text-base">
                Your files are protected with enterprise-grade security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Automatic expiry dates</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Download limits & tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Collaboration */}
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Users className="w-6 h-6 text-blue-500" />
                Team Collaboration
              </CardTitle>
              <CardDescription className="text-base">
                Work together with advanced team features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/20 bg-inherit">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Team file sharing</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/20 bg-transparent">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Role-based permissions</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/20 bg-transparent">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Collaborative workflows</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard/teams">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Teams
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Upgrade Banner */}
      <div className="lg:hidden">
        <Link to="/subscription" className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50"></div>
            <div className="relative text-center">
              <Lightning className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-xl mb-2">Upgrade to Pro</h3>
              <p className="text-blue-100 mb-4">
                Unlock unlimited storage and premium features
              </p>
              <div className="inline-flex items-center text-yellow-400 font-medium">
                <span>Get Started</span>
                <Lightning className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <Button size="lg" className="w-16 h-16 rounded-full shadow-2xl hover:shadow-functions-share/30 transition-all duration-300 hover:scale-110 bg-functions-share hover:bg-functions-shareGlow border-0" asChild>
          <Link to="/dashboard/upload" title="Upload Files" className="bg-white">
            <Upload className="h-7 w-7" />
          </Link>
        </Button>
        
        <Button size="lg" variant="outline" className="w-16 h-16 rounded-full shadow-2xl hover:shadow-functions-download/30 transition-all duration-300 hover:scale-110 bg-background/80 backdrop-blur-sm border-functions-download/30 hover:border-functions-download" asChild>
          <Link to="/dashboard/receive" title="Request Files" className="bg-blue-600">
            <PaperPlaneTilt className="h-7 w-7 text-functions-download" />
          </Link>
        </Button>
      </div>
    </div>;
};