import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Files,
  ShareNetwork,
  Download,
  Upload,
  Shield,
  Lightning,
  Cloud,
  Crown,
  Activity,
  PaperPlaneTilt,
} from "phosphor-react";
import { AnimatedIcon } from "@/components/ui/animated-icons";

interface DashboardStats {
  totalFiles: number;
  totalShares: number;
  totalDownloads: number;
  storageUsed: number;
  storageLimit: number;
  subscriptionTier: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("storage_used, storage_limit, subscription_tier")
        .eq("id", user?.id)
        .single();

      const { count: fileCount } = await supabase
        .from("files")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      const { data: userFiles } = await supabase
        .from("files")
        .select("id")
        .eq("user_id", user?.id);

      const fileIds = userFiles?.map((f) => f.id) || [];

      const { count: shareCount } = await supabase
        .from("shared_links")
        .select("*", { count: "exact", head: true })
        .in("file_id", fileIds);

      const { count: downloadCount } = await supabase
        .from("download_logs")
        .select("*", { count: "exact", head: true })
        .in("file_id", fileIds);

      setStats({
        totalFiles: fileCount || 0,
        totalShares: shareCount || 0,
        totalDownloads: downloadCount || 0,
        storageUsed: profile?.storage_used || 0,
        storageLimit: profile?.storage_limit || 6442450944,
        subscriptionTier: profile?.subscription_tier || "free",
      });

      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const storageProgress = stats
    ? stats.subscriptionTier === "pro"
      ? 0
      : (stats.storageUsed / stats.storageLimit) * 100
    : 0;

  const isPro = stats?.subscriptionTier === "pro";

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <Badge
              variant={isPro ? "default" : "secondary"}
              className={`px-3 py-1 text-sm font-medium ${
                isPro
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isPro ? (
                <>
                  <Crown className="w-4 h-4 mr-1" />
                  Pro
                </>
              ) : (
                "Free"
              )}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Welcome back,{" "}
            {user?.user_metadata?.display_name ||
              user?.email?.split("@")[0]}
            . Here's your file sharing overview and quick actions.
          </p>
        </div>
        <div className="hidden lg:block">
          <Link
            to="/subscription"
            className="group block transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
          >
            <div className="relative overflow-hidden rounded-xl border-2 border-primary shadow-lg bg-gradient-to-r from-card to-card/80 p-6 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <Lightning className="w-6 h-6 text-primary" />
                  <span className="text-foreground font-semibold text-lg">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Unlock unlimited storage and premium features
                </p>
                <div className="flex items-center text-foreground text-sm font-medium">
                  <span>Get Started — $6.99/month</span>
                  <Lightning className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Files
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalFiles.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Files className="h-6 w-6 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Files in your account</p>
            {stats?.totalFiles === 0 && <AnimatedIcon show type="files" />}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Shares
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalShares.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <ShareNetwork className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sharing links created</p>
            {stats?.totalShares === 0 && <AnimatedIcon show type="shares" />}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Downloads
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalDownloads.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Download className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">File downloads completed</p>
            {stats?.totalDownloads === 0 && <AnimatedIcon show type="downloads" />}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Storage Used
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {isPro ? (
                  <div className="flex items-center gap-2">
                    <span>{formatFileSize(stats?.storageUsed || 0)}</span>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
                      Unlimited
                    </Badge>
                  </div>
                ) : (
                  <>
                    <div>{formatFileSize(stats?.storageUsed || 0)}</div>
                    <div className="text-sm text-muted-foreground">
                      of {formatFileSize(stats?.storageLimit || 0)}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Cloud className="h-6 w-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            {!isPro ? (
              <div className="space-y-2">
                <Progress value={storageProgress} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {(100 - storageProgress).toFixed(1)}% remaining
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unlimited cloud storage</p>
            )}
            {stats?.storageUsed === 0 && <AnimatedIcon show type="storage" />}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-functions-upload/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-functions-upload" />
              </div>
              <CardTitle className="text-xl">Upload Files</CardTitle>
              <CardDescription>
                Upload and share files instantly with advanced security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" asChild>
                <Link to="/dashboard/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Upload
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-functions-download/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PaperPlaneTilt className="w-6 h-6 text-functions-download" />
              </div>
              <CardTitle className="text-xl">Request Files</CardTitle>
              <CardDescription>
                Collect files securely from others with unique request links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" asChild>
                <Link to="/dashboard/request">
                  <PaperPlaneTilt className="mr-2 h-4 w-4" />
                  Request Files
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
