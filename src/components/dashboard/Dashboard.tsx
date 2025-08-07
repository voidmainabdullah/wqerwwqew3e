import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Files, Share, Download, TrendingUp, Upload, Clock, Shield, Zap, Users } from 'lucide-react';
import TeamsManager from '@/components/teams/TeamsManager';
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
    return <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
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
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your file sharing activity.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={stats?.subscriptionTier === 'pro' ? 'default' : 'secondary'} className="bg-blue-600">
            {stats?.subscriptionTier === 'pro' ? <>
                <Zap className="w-3 h-3 mr-1" />
                Pro
              </> : 'Free'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Files uploaded to your account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Links</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalShares}</div>
            <p className="text-xs text-muted-foreground">
              Active sharing links created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Total file downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold rounded-xl mx-0 my-0 py-px px-[5px] bg-[#4262f0]/[0.89]">
              {stats?.subscriptionTier === 'pro' ? formatFileSize(stats?.storageUsed || 0) : `${formatFileSize(stats?.storageUsed || 0)} / ${formatFileSize(stats?.storageLimit || 0)}`}
            </div>
            {stats?.subscriptionTier !== 'pro' && <Progress value={storageProgress} className="mt-2" />}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.subscriptionTier === 'pro' ? 'Unlimited storage' : '6GB total storage limit'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Quick Upload
            </CardTitle>
            <CardDescription>
              Upload files quickly and start sharing them instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/dashboard/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share className="mr-2 h-5 w-5" />
              Request Files
            </CardTitle>
            <CardDescription>
              Create secure links for others to send files to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/dashboard/receive">
                <Share className="mr-2 h-4 w-4" />
                Request Files
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-black">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Features
            </CardTitle>
            <CardDescription>
              Your files are protected with enterprise-grade security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm bg-black">
              <Clock className="mr-2 h-4 w-4 text-success bg-black" />
              Automatic expiry dates
            </div>
            <div className="flex items-center text-sm">
              <Shield className="mr-2 h-4 w-4 text-success" />
              Download limits
            </div>
            <div className="flex items-center text-sm">
              <Files className="mr-2 h-4 w-4 text-success" />
              File locking
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-700"></div>
          <CardHeader className="relative bg-indigo-700">
            <CardTitle className="flex items-center text-xl font-semibold text-slate-50">
              <Zap className="mr-2 h-6 w-6 text-primary text-red bg-inherit" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-base">
              Unlock unlimited storage and advanced team features.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 mx-0 my-0 bg-indigo-700">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Zap className="mr-2 h-4 w-4 text-primary" />
                Unlimited file storage
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Advanced team collaboration
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4 text-primary" />
                Priority support & security
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-2 px-4 rounded-lg transform transition hover:scale-105" asChild>
              <Link to="/subscription" className="bg-red-400 mx-0">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Now - Starting at $9/month
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Teams Management Section */}
      <div className="mt-8">
        <TeamsManager />
      </div>
    </div>;
};