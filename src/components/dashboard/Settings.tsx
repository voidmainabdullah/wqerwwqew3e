import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Gear, User, Shield, Trash, Crown, Warning, Sun, Moon, Monitor } from 'phosphor-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export const Settings: React.FC = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    theme,
    setTheme,
    actualTheme
  } = useTheme();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  useEffect(() => {
    if (user) {
      fetchProfile();
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
    }
  }, [user]);
  const fetchProfile = async () => {
    try {
      const {
        data
      } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  const updateDisplayName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        data: {
          display_name: displayName
        }
      });
      if (error) throw error;
      toast({
        title: 'Profile updated',
        description: 'Your display name has been updated successfully.'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const deleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.');
    if (!confirmed) return;
    try {
      const {
        data: files
      } = await supabase.from('files').select('storage_path').eq('user_id', user.id);
      if (files) {
        const filePaths = files.map(f => f.storage_path);
        if (filePaths.length > 0) {
          await supabase.storage.from('files').remove(filePaths);
        }
      }
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('files').delete().eq('user_id', user.id);
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently deleted.'
      });
      await signOut();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error.message
      });
    }
  };
  return <div className="space-y-8 px-6 py-8 bg-neutral-700">
      <div>
        <h1 className="text-4xl font-heading font-bold text-primary">Settings</h1>
        <p className="font-body text-muted-foreground">Manage your account settings and preferences with ease.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card className="border-neutral-700 bg-neutral-800">
          <CardHeader className="bg-neutral-800 rounded-3xl">
            <CardTitle className="text-white font-heading font-medium flex items-center">
              <span className="material-icons md-18 mr-2 text-blue-500">person</span>
              Profile Information
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Update your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-neutral-800">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-heading">Email</Label>
              <Input id="email" value={user?.email || ''} disabled className="bg-muted font-body" />
              <p className="text-xs font-body text-muted-foreground">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-heading">Display Name</Label>
              <div className="flex gap-2 items-center">
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your display name" className="flex-grow font-body" />
                <Button onClick={updateDisplayName} disabled={loading} className="flex-shrink-0 font-heading">
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="border-neutral-700 bg-neutral-800">
          <CardHeader className="bg-neutral-800 rounded-3xl">
            <CardTitle className="text-white font-heading font-medium flex items-center">
              <span className="material-icons md-18 mr-2 text-yellow-400">
                {actualTheme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              Appearance
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Customize the appearance of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-neutral-800">
            <div className="space-y-2">
              <Label htmlFor="theme" className="font-heading">Theme</Label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <span className="material-icons md-18">light_mode</span>
                      <span className="font-body">Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <span className="material-icons md-18">dark_mode</span>
                      <span className="font-body">Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <span className="material-icons md-18">computer</span>
                      <span className="font-body">System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="bg-neutral-800">
          <CardHeader className="bg-neutral-800 rounded-full">
            <CardTitle className="text-xl text-blue-500 font-heading font-semibold flex items-center">
              <span className="material-icons md-18 mr-2">crown</span>
              Subscription
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Your current subscription plan and usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-medium">Current Plan</p>
                <p className="text-sm font-body text-muted-foreground">
                  {profile?.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </p>
              </div>
              <Badge variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'} className="bg-stone-800">
                {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-medium">Storage Usage</p>
                <p className="text-sm font-body text-muted-foreground">
                  {profile?.subscription_tier === 'pro' ? `${formatFileSize(profile?.storage_used || 0)} used (unlimited)` : `${formatFileSize(profile?.storage_used || 0)} / ${formatFileSize(profile?.storage_limit || 6442450944)} used`}
                </p>
              </div>
            </div>

            {profile?.subscription_tier !== 'pro' && <Button asChild>
                <a href="/subscription" className="flex items-center font-heading icon-text">
                  <span className="material-icons md-18">upgrade</span>
                  Upgrade to Pro
                </a>
              </Button>}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-neutral-700 bg-zinc-800">
          <CardHeader className="bg-neutral-800 rounded-3xl">
            <CardTitle className="text-white font-heading font-medium flex items-center">
              <span className="material-icons md-18 mr-2 text-blue-500">security</span>
              Security
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-neutral-800">
            <div>
              <p className="font-heading font-medium mb-2">Account Security</p>
              <p className="text-sm font-body text-muted-foreground mb-4">
                Your account is secured with email authentication. All file uploads and shares are encrypted.
              </p>
              <Button variant="outline" onClick={() => signOut()} className="font-heading icon-text">
                <span className="material-icons md-18">logout</span>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-neutral-900 border-destructive">
          <CardHeader className="bg-neutral-800 rounded-lg">
            <CardTitle className="flex items-center text-white font-heading">
              <span className="material-icons md-18 mr-2 text-yellow-500">warning</span>
              Danger Zone
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Permanently delete your account and all associated data.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-neutral-800">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-body text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <Button variant="destructive" onClick={deleteAccount} className="w-full font-heading icon-text">
                <span className="material-icons md-18">delete_forever</span>
                Delete Account Permanently
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};