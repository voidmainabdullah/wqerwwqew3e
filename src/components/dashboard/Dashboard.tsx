import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Files, Share, Download, TrendingUp, Upload, Clock, Shield, Zap, Users, Cloud, FileText } from 'lucide-react';
import { AnimatedIcon, EmptyStateIcon } from '@/components/ui/animated-icons';
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your file sharing activity.
          </p>
        </div>
        
        {/* Desktop Banner - positioned to the right of heading */}
        <div className="hidden lg:block ml-6 flex-shrink-0">
          <a 
            href="/subscription" 
            className="block transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            aria-label="View pricing and upgrade options"
          >
            <img 
              src="/one.png" 
              alt="Tech Day Sale - Up to 40% Off" 
              className="h-20 w-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </a>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={stats?.subscriptionTier === 'pro' ? 'default' : 'secondary'} className="text-white bg-blue-700">
            {stats?.subscriptionTier === 'pro' ? <>
                <Zap className="w-3 h-3 mr-1" />
                Pro
              </> : 'Free'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {/* Animated icon for empty state */}
            <AnimatedIcon 
              show={stats?.totalFiles === 0} 
              type="files" 
              className="z-0" 
            />
            <div className="text-2xl font-bold">{stats?.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Files uploaded to your account
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Links</CardTitle>
            <Share className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            {/* Animated icon for empty state */}
            <AnimatedIcon 
              show={stats?.totalShares === 0} 
              type="shares" 
              className="z-0" 
            />
            <div className="text-2xl font-bold">{stats?.totalShares}</div>
            <p className="text-xs text-muted-foreground">
              Active sharing links created
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {/* Animated icon for empty state */}
            <AnimatedIcon 
              show={stats?.totalDownloads === 0} 
              type="downloads" 
              className="z-0" 
            />
            <div className="text-2xl font-bold">{stats?.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Total file downloads
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <TrendingUp className="h-4 w-4 t bg-[#17d117]/0 text-red-400" />
          </CardHeader>
          <CardContent>
            {/* Animated icon for empty state */}
            <AnimatedIcon 
              show={stats?.storageUsed === 0} 
              type="storage" 
              className="z-0" 
            />
            <div className="text-sm font-semibold rounded-3xl text-white bg-blue-50/[0.03]">
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
        <Card>
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
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-success" />
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
          <div className="absolute inset-0 bg-transparent overflow-hidden">
            {/* Animated File Sharing Icons */}
            <div className="absolute inset-0 bg-blue-800">
              {/* Upload Animation */}
              <div className="absolute top-4 left-4 animate-bounce-subtle">
                <Upload className="w-6 h-6 text-blue-400/60" />
              </div>
              
              {/* Download Animation */}
              <div className="absolute top-4 right-4 animate-bounce-subtle" style={{
              animationDelay: '0.5s'
            }}>
                <Download className="w-6 h-6 text-green-400/60" />
              </div>
              
              {/* Cloud Storage Animation */}
              <div className="absolute bottom-4 left-4 animate-pulse">
                <Cloud className="w-8 h-8 text-cyan-400/50" />
              </div>
              
              {/* Share Link Animation */}
              <div className="absolute bottom-4 right-4 animate-pulse" style={{
              animationDelay: '1s'
            }}>
                <Share className="w-6 h-6 text-purple-400/60" />
              </div>
              
              {/* Floating Files */}
              <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 animate-float">
                <Files className="w-5 h-5 text-blue-300/40" />
              </div>
              
              <div className="absolute top-1/3 right-1/3 transform translate-x-1/2 -translate-y-1/2 animate-float" style={{
              animationDelay: '2s'
            }}>
                <FileText className="w-4 h-4 text-green-300/40" />
              </div>
              
              {/* Data Flow Lines */}
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-data-flow"></div>
              <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-data-flow" style={{
              animationDelay: '1.5s'
            }}></div>
              
              {/* Connection Nodes */}
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-500/60 rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-500/60 rounded-full animate-ping" style={{
              animationDelay: '0.8s'
            }}></div>
              <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-500/60 rounded-full animate-ping" style={{
              animationDelay: '1.6s'
            }}></div>
              
              {/* Progress Indicators */}
              <div className="absolute top-1/2 right-8 flex flex-col space-y-1">
                <div className="w-12 h-1 bg-blue-600/30 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full animate-progress-bar"></div>
                </div>
                <div className="w-12 h-1 bg-green-600/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full animate-progress-bar" style={{
                  animationDelay: '0.5s'
                }}></div>
                </div>
                <div className="w-12 h-1 bg-purple-600/30 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full animate-progress-bar" style={{
                  animationDelay: '1s'
                }}></div>
                </div>
              </div>
              
              {/* Network Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                    <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M20,30 Q100,10 180,30" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" className="animate-draw-line" />
                <path d="M20,70 Q100,90 180,70" stroke="url(#connectionGradient)" strokeWidth="1" fill="none" className="animate-draw-line" style={{
                animationDelay: '1s'
              }} />
              </svg>
            </div>
          </div>
          <CardHeader className="relative bg-blue-800">
            <CardTitle className="flex items-center font-semibold text-xl text-slate-50">
              <Zap className="mr-2 h-6 w-6  text-blue-500 bg-inherit" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-base text-gray-200">
              Unlock unlimited storage and advanced team features.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-gradient-to-t from-blue-900 via-blue-800 bg-[#6bffa0]/5">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Zap className="mr-2 h-4 w-4 text-primary" />
                Unlimited file storage
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-[#00ee00]/0">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Advanced team collaboration
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4 text-primary" />
                Priority support & security
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-black hover:from-blue/90 hover:to-black/90 text-white font-semibold py-2 px-4 rounded-lg transform transition hover:scale-105 flex items-center justify-center gap-2" asChild>
              <Link to="/subscription" className="">
                <Zap className="mr-2 h-4 w-4" />
                Get Premium !
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Teams Management Section */}
      
      {/* Mobile Banner - positioned at the bottom of dashboard */}
      <div className="lg:hidden mt-8">
        <a 
          href="/subscription" 
          className="block transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          aria-label="View pricing and upgrade options"
        >
          <img 
            src="/one.png" 
            alt="Tech Day Sale - Up to 40% Off" 
            className="w-full h-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 max-h-32 sm:max-h-40"
          />
        </a>
      </div>
      
    </div>;
};