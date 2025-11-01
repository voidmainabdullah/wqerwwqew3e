import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { Separator } from '@/components/ui/separator';
import {
  User,
  PaintBrush,
  Shield,
  Trash,
  Crown,
  Warning,
  Sun,
  Moon,
  Monitor,
  CloudArrowUp,
  CheckCircle,
} from 'phosphor-react';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLastBackup();
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLastBackup = async () => {
    // Backup feature placeholder - not implemented in current schema
    setLastBackup(null);
  };

  const requestBackup = async () => {
    if (!user) return;
    setBackupLoading(true);
    try {
      toast({
        title: 'Backup Feature Coming Soon',
        description: 'File backup functionality will be available in a future update.',
      });
      setLastBackup(new Date().toLocaleString());
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Backup Failed',
        description: error.message,
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateDisplayName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) throw error;
      toast({
        title: 'Profile updated',
        description: 'Your display name has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.'
    );
    if (!confirmed) return;

    try {
      const { data: files } = await supabase.from('files').select('storage_path').eq('user_id', user.id);
      if (files) {
        const filePaths = files.map((f) => f.storage_path);
        if (filePaths.length > 0) {
          await supabase.storage.from('files').remove(filePaths);
        }
      }

      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('files').delete().eq('user_id', user.id);
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently deleted.',
      });
      await signOut();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-heading font-bold text-blue-500">Settings</h1>
        <p className="text-neutral-400 font-body">
          Manage your profile, theme, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <User className="text-blue-400" size={20} /> Profile Information
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Update your personal details and display name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-heading">Email</Label>
                <Input value={user?.email || ''} disabled className="bg-zinc-800 text-neutral-400" />
              </div>
              <div>
                <Label className="font-heading">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="bg-zinc-800"
                  />
                  <Button
                    onClick={updateDisplayName}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Crown className="text-yellow-400" size={20} /> Subscription
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Manage your current plan and storage usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-medium">Current Plan</p>
                  <p className="text-sm text-neutral-400">
                    {profile?.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </p>
                </div>
                <Badge
                  variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'}
                  className="bg-zinc-800"
                >
                  {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <div>
                <p className="font-heading font-medium">Storage Usage</p>
                <p className="text-sm text-neutral-400">
                  {profile?.subscription_tier === 'pro'
                    ? `${formatFileSize(profile?.storage_used || 0)} used (unlimited)`
                    : `${formatFileSize(profile?.storage_used || 0)} / ${formatFileSize(
                        profile?.storage_limit || 6442450944
                      )} used`}
                </p>
              </div>
              {profile?.subscription_tier !== 'pro' && (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                  <a href="/subscription" className="flex items-center gap-2">
                    <Crown size={18} /> Upgrade to Pro
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Backup Request Card */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <CloudArrowUp className="text-blue-400" size={20} /> Backup Request
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Create a new backup of your uploaded files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400 text-sm">
                Last backup:{' '}
                {lastBackup ? (
                  <span className="text-blue-400">{lastBackup}</span>
                ) : (
                  'No backups yet'
                )}
              </p>
              <Button
                onClick={requestBackup}
                disabled={backupLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
              >
                {backupLoading ? (
                  <>
                    <span className="animate-spin">◌</span> Processing...
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={18} /> Request Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

           {/* Backup Request Card */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <CloudArrowUp className="text-blue-400" size={20} /> Get Storage
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Buy more storage to save your Data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400 text-sm">
                Last backup:{' '}
                {lastBackup ? (
                  <span className="text-blue-400">{lastBackup}</span>
                ) : (
                  'No backups yet'
                )}
              </p>
              <Button
                onClick={requestBackup}
                disabled={backupLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
              >
                {backupLoading ? (
                  <>
                    <span className="animate-spin">◌</span> Processing...
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={18} /> Get Storage
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          

          {/* Theme Settings */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <PaintBrush className="text-blue-400" size={20} /> Appearance
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Customize the look and feel of your app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="font-heading mb-2 block">Theme</Label>
              <Select value={theme} onValueChange={(v: 'light' | 'dark' | 'system') => setTheme(v)}>
                <SelectTrigger className="bg-zinc-800 w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="light" className="text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Sun size={18} /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Moon size={18} /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system" className="text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Monitor size={18} /> System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Shield className="text-blue-400" size={20} /> Security
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Manage your account safety options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400 text-sm">
                Your account is secured with email authentication. File uploads are encrypted.
              </p>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="border-blue-600 text-blue-500 hover:bg-blue-600/10 font-heading"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-800 bg-zinc-900/70 hover:border-red-500/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-red-500">
                <Warning size={20} /> Danger Zone
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Permanently delete your account and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-400">
                Once deleted, your data cannot be recovered. Please proceed with caution.
              </p>
              <Button
                variant="destructive"
                onClick={deleteAccount}
                className="w-full font-heading"
              >
                <Trash size={18} className="mr-1" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
