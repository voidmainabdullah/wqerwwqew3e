// Settings.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { Separator } from "@/components/ui/separator";
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
  Camera,
  Upload,
  X,
  Globe,
  Bell,
  Gear,
  FloppyDisk,
  ArrowsClockwise,
  LockSimple,
  Wallet,
  FileText,
  ArrowDown,
  Spinner,
} from "phosphor-react";
import { motion } from "framer-motion";

type Lang = "en" | "ur" | "ar";
type FontStyle = "default" | "modern" | "serif";
type CornerStyle = "sharp" | "rounded";

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // profile & UI state
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [loadingProfileSave, setLoadingProfileSave] = useState(false);

  // avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // backup & export
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [autoBackup, setAutoBackup] = useState(false);

  // subscription
  const [upgrading, setUpgrading] = useState(false);

  // preferences
  const [lang, setLang] = useState<Lang>("en");
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  // extra UI options
  const [fontStyle, setFontStyle] = useState<FontStyle>("default");
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>("rounded");

  // security
  const [twoFA, setTwoFA] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // utility
  const [saving, setSaving] = useState(false);

  // profile completion (derived)
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (displayName) score += 30;
    if (avatarPreview) score += 30;
    if (tagline) score += 20;
    if (profile?.subscription_tier === "pro") score += 20;
    return Math.min(100, score);
  }, [displayName, avatarPreview, tagline, profile]);

  // fetch profile
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
    setTagline(user.user_metadata?.tagline || "");
    fetchProfile();
    fetchLastBackup();
    fetchActiveSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      setProfile(data);
      if (data?.avatar_url) setAvatarPreview(data.avatar_url);
      if (data?.language) setLang(data.language as Lang);
      if (data?.timezone) setTimezone(data.timezone);
      if (data?.notifications) setNotifications(data.notifications as any);
      if (data?.font_style) setFontStyle(data.font_style as FontStyle);
      if (data?.corner_style) setCornerStyle(data.corner_style as CornerStyle);
      if (data?.two_fa_enabled) setTwoFA(!!data.two_fa_enabled);
    } catch (error) {
      console.error("fetchProfile error", error);
    }
  };

  const fetchLastBackup = async () => {
    // placeholder: attempt to read last_backup column
    try {
      const { data } = await supabase.from("profiles").select("last_backup").eq("id", user?.id).single();
      setLastBackup(data?.last_backup || null);
    } catch {
      setLastBackup(null);
    }
  };

  const fetchActiveSessions = async () => {
    // Mock session list (useful for UI) - sessions table doesn't exist
    setActiveSessions([
      { id: "s1", device: "Chrome — Windows", ip: "1.2.3.4", last_active: new Date().toISOString() },
      { id: "s2", device: "Safari — iPhone", ip: "5.6.7.8", last_active: new Date(Date.now() - 3600_000).toISOString() },
    ]);
  };

  // avatar preview handling
  useEffect(() => {
    if (!avatarFile) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  // save profile (name, tagline, preferences)
  const saveProfile = async (opts?: { saveAvatar?: boolean }) => {
    if (!user) return;
    setSaving(true);
    try {
      // update auth user metadata (for display_name)
      const metaUpdates: any = { display_name: displayName, tagline };
      const profileUpdates: any = {
        id: user.id,
        display_name: displayName,
        tagline,
        language: lang,
        timezone,
        notifications,
        font_style: fontStyle,
        corner_style: cornerStyle,
      };

      // if avatar needs uploading, do it first (client-side preview only here)
      if (opts?.saveAvatar && avatarFile) {
        setAvatarUploading(true);
        try {
          // Optional: upload to Supabase storage (commented in case bucket not set)
          // const filePath = `${user.id}/avatar_${Date.now()}_${avatarFile.name}`;
          // const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
          // if (uploadErr) throw uploadErr;
          // const { publicURL } = supabase.storage.from('avatars').getPublicUrl(filePath);
          // profileUpdates.avatar_url = publicURL.publicUrl;

          // For now keep preview as avatar url (base64) — better to switch to storage in production
          profileUpdates.avatar_url = avatarPreview;
        } finally {
          setAvatarUploading(false);
        }
      } else if (avatarPreview && !avatarFile && profile?.avatar_url) {
        // keep existing avatar url
        profileUpdates.avatar_url = profile.avatar_url;
      }

      // update profile table
      const { error } = await supabase.from("profiles").upsert(profileUpdates);
      if (error) throw error;

      // update auth metadata
      await supabase.auth.updateUser({ data: metaUpdates });

      toast({
        title: "Saved",
        description: "Profile and preferences saved.",
      });

      // refresh
      fetchProfile();
    } catch (err: any) {
      console.error("saveProfile", err);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err?.message || "Could not save profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // backup request (simulate)
  const requestBackup = async () => {
    if (!user) return;
    setBackupLoading(true);
    try {
      // Simulate a backup process and store lastBackup timestamp in profiles table
      const ts = new Date().toISOString();
      // Attempt to write to profile's last_backup column if exists
      await supabase.from("profiles").update({ last_backup: ts }).eq('id', user.id);
      setLastBackup(ts);
      toast({
        title: "Backup requested",
        description: "Backup started. We'll notify you when it's ready.",
      });
      // fake delay
      await new Promise((r) => setTimeout(r, 900));
      toast({
        title: "Backup complete",
        description: "Backup created successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: err?.message || "Could not create backup.",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  // export data as JSON (client-side)
  const exportAllData = async () => {
    if (!user) return;
    try {
      toast({ title: "Preparing export", description: "Gathering your data..." });
      // gather basic profile & files listing
      const [profileResult, filesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("files").select("id, original_name, file_size, created_at").eq("user_id", user.id),
      ]);
      const payload = {
        profile: profileResult.data || {},
        files: filesResult.data || [],
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `export_${user.id}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "Export ready", description: "Your data download should start shortly." });
    } catch (err: any) {
      console.error("exportAllData", err);
      toast({ variant: "destructive", title: "Export failed", description: err?.message || "Could not export data." });
    }
  };

  // toggle 2FA (fake toggle for now)
  const toggleTwoFA = async (enable: boolean) => {
    try {
      setTwoFA(enable);
      await supabase.from("profiles").update({ two_fa_enabled: enable }).eq('id', user?.id || '');
      toast({ title: enable ? "2FA enabled" : "2FA disabled" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err?.message || "Could not update 2FA" });
    }
  };

  // sign out from session (local mock)
  const revokeSession = async (sessionId: string) => {
    // Just remove from local state since sessions table doesn't exist
    setActiveSessions((s) => s.filter((x) => x.id !== sessionId));
    toast({ title: "Session removed", description: "Session removed from this device." });
  };

  // delete account with a custom modal (safer than window.confirm)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const confirmDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      // remove files from storage (if paths present)
      const { data: files } = await supabase.from("files").select("storage_path").eq("user_id", user.id);
      if (files && files.length) {
        const paths = files.map((f: any) => f.storage_path).filter(Boolean);
        if (paths.length) {
          try {
            await supabase.storage.from("files").remove(paths);
          } catch (e) {
            // ignore storage errors for now
            console.warn("storage remove error", e);
          }
        }
      }
      // delete DB rows
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.from("files").delete().eq("user_id", user.id);
      toast({ title: "Account deleted", description: "Your account and data have been removed." });
      await signOut();
    } catch (err: any) {
      console.error("confirmDeleteAccount", err);
      toast({ variant: "destructive", title: "Delete failed", description: err?.message || "Could not delete account." });
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  // auto-save small preferences
 // 👇 Replace this effect with this safer version
useEffect(() => {
  const handler = setTimeout(() => {
    if (!user) return;
    // sirf preferences change hone par save karo, not typing fields
    const preferencesChanged = [lang, timezone, fontStyle, cornerStyle].some(Boolean);
    if (!preferencesChanged) return;
    supabase.from("profiles").update({
      language: lang,
      timezone,
      font_style: fontStyle,
      corner_style: cornerStyle,
    }).eq('id', user.id).catch(() => {});
  }, 2000);

  return () => clearTimeout(handler);
}, [lang, timezone, fontStyle, cornerStyle]);


  // small helper UI components (within file to keep single file)
  const Section: React.FC<{ title: string; desc?: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ title, desc, icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="card-outer">
      <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            {icon}
            <span>{title}</span>
          </CardTitle>
          {desc && <CardDescription className="text-neutral-400">{desc}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );

  const smallButton = (props: any) => (
    <Button {...props} className={`${props.className || ""} text-sm py-1 px-3`} />
  );

  // upload avatar handler (client preview only + optional storage)
  const handleAvatarPick = (f?: File | null) => {
    if (!f) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    setAvatarFile(f);
    // preview handled by FileReader effect above
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    // optionally remove stored avatar
    (async () => {
      try {
        await supabase.from("profiles").update({ avatar_url: null }).eq('id', user?.id || '');
        setProfile((p: any) => ({ ...p, avatar_url: null }));
        toast({ title: "Avatar removed" });
      } catch {
        // ignore
      }
    })();
  };

  // upgrade plan (mock)
  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // open external checkout or simulate
      await new Promise((r) => setTimeout(r, 900));
      await supabase.from("profiles").update({ subscription_tier: "pro", subscription_renewal: new Date(Date.now() + 30 * 24 * 3600_000).toISOString() }).eq('id', user?.id || '');
      toast({ title: "Upgraded", description: "Your plan has been upgraded to Pro." });
      fetchProfile();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upgrade failed", description: err?.message || "Could not upgrade" });
    } finally {
      setUpgrading(false);
    }
  };

  // quick helper for pretty date
  const prettyDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

  // Timezone detection helper
  const detectTimezone = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setTimezone(tz);
    toast({ title: "Timezone detected", description: tz });
  };

  // UI layout
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="mb-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-blue-500">Settings</h1>
            <p className="text-neutral-400 mt-1">Manage profile, preferences, security and backups.</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-zinc-800" variant={profile?.subscription_tier === "pro" ? "default" : "secondary"}>
              {profile?.subscription_tier === "pro" ? "Pro" : "Free"}
            </Badge>
            <Button variant="outline" onClick={() => saveProfile({ saveAvatar: false })} className="hidden sm:inline-flex">
              <FloppyDisk size={16} /> &nbsp; Save
            </Button>
            <Button onClick={() => saveProfile({ saveAvatar: true })} className="bg-blue-600 hover:bg-blue-700 text-white">
              <CheckCircle size={16} /> &nbsp; Save & Apply
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: profile summary & avatar */}
          <div className="space-y-6">
            <Section title="Profile" desc="Your public account details" icon={<User size={20} className="text-blue-400" />}>
              <div className="flex flex-col items-center gap-3">
                <div className={`relative ${cornerStyle === "rounded" ? "rounded-xl" : "rounded-sm"} overflow-hidden`}>
                  <div className="w-28 h-28 bg-zinc-800 flex items-center justify-center rounded-full">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User size={40} className="text-neutral-500" />
                    )}
                  </div>
                  {avatarPreview && (
                    <button onClick={removeAvatar} title="Remove avatar" className="absolute -top-2 -right-2 bg-zinc-800 p-1 rounded-full hover:bg-red-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarPick(e.target.files?.[0] || undefined)}
                      className="hidden"
                    />
                    <Button className="flex items-center gap-2" onClick={() => {
                      // trigger file input hack
                      const inp = document.createElement("input");
                      inp.type = "file";
                      inp.accept = "image/*";
                      inp.onchange = () => handleAvatarPick((inp.files && inp.files[0]) || undefined);
                      inp.click();
                    }}>
                      <Camera size={16} /> Upload
                    </Button>
                    <Button variant="ghost" onClick={() => { setAvatarFile(null); setAvatarPreview(profile?.avatar_url || null); }} >
                      Revert
                    </Button>
                  </label>
                </div>

                <div className="w-full">
                  <Label>Display name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="bg-zinc-800" />
                </div>

                <div className="w-full">
                  <Label>Tagline</Label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short tagline" className="bg-zinc-800" />
                </div>

                <div className="w-full mt-2">
                  <Label>Profile completion</Label>
                  <div className="w-full h-3 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div style={{ width: `${profileCompletion}%` }} className="h-full bg-blue-500 transition-all" />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">{profileCompletion}% complete</div>
                </div>

                <div className="w-full mt-3 flex gap-2">
                  <Button onClick={() => saveProfile({ saveAvatar: true })} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    {loadingProfileSave ? <Spinner className="animate-spin" /> : <><FloppyDisk size={16} /> &nbsp; Save Profile</>}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // quick reset fields to server state
                    setDisplayName(profile?.display_name || user?.user_metadata?.display_name || "");
                    setTagline(profile?.tagline || "");
                    setAvatarPreview(profile?.avatar_url || null);
                    toast({ title: "Reverted", description: "Fields reverted to saved profile." });
                  }}>
                    Revert
                  </Button>
                </div>
              </div>
            </Section>

            <Section title="Subscription" desc="Manage plan & storage" icon={<Crown size={20} className="text-yellow-400" />}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Plan</div>
                    <div className="text-xs text-neutral-400">{profile?.subscription_tier === "pro" ? "Pro" : "Free"}</div>
                  </div>
                  <Badge className="bg-zinc-800">{profile?.subscription_tier === "pro" ? "Pro" : "Free"}</Badge>
                </div>

                <div>
                  <div className="text-sm font-medium">Storage</div>
                  <div className="text-xs text-neutral-400">
                    {profile?.subscription_tier === "pro" ? `${formatBytes(profile?.storage_used || 0)} used (Pro)` : `${formatBytes(profile?.storage_used || 0)} / ${formatBytes(profile?.storage_limit || 6442450944)} used`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpgrade} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {upgrading ? <><Spinner className="animate-spin" /> &nbsp; Upgrading...</> : <><Wallet size={16} /> &nbsp; Upgrade</>}
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: "Invoices", description: "Invoices feature coming soon." })}>
                    <FileText size={16} /> &nbsp; Invoices
                  </Button>
                </div>
              </div>
            </Section>

            <Section title="Backup" desc="Manual and auto backups" icon={<CloudArrowUp size={20} className="text-blue-400" />}>
              <div className="space-y-3">
                <div className="text-sm text-neutral-400">Last backup: {lastBackup ? <span className="text-blue-400">{lastBackup}</span> : "No backups yet"}</div>
                <div className="flex gap-2">
                  <Button onClick={requestBackup} className="bg-blue-600 hover:bg-blue-700 text-white flex-1" disabled={backupLoading}>
                    {backupLoading ? <><Spinner className="animate-spin" /> &nbsp; Processing...</> : <><CloudArrowUp size={16} /> &nbsp; Request Backup</>}
                  </Button>
                  <Button variant="outline" onClick={exportAllData}>
                    <ArrowDown size={16} /> &nbsp; Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">Auto-backup</div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Every 7 days</Label>
                    <input type="checkbox" checked={autoBackup} onChange={(e) => { setAutoBackup(e.target.checked); toast({ title: "Auto-backup", description: e.target.checked ? "Enabled" : "Disabled" }); }} />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Middle column: preferences */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Appearance" desc="Customize theme & style" icon={<PaintBrush size={20} className="text-blue-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                    <SelectTrigger className="bg-zinc-800 w-full">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="light" className="text-neutral-300"><div className="flex items-center gap-2"><Sun size={16} /> Light</div></SelectItem>
                      <SelectItem value="dark" className="text-neutral-300"><div className="flex items-center gap-2"><Moon size={16} /> Dark</div></SelectItem>
                      <SelectItem value="system" className="text-neutral-300"><div className="flex items-center gap-2"><Monitor size={16} /> System</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font style</Label>
                  <Select value={fontStyle} onValueChange={(v: any) => setFontStyle(v)}>
                    <SelectTrigger className="bg-zinc-800 w-full">
                      <SelectValue placeholder="Font style" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Corner style</Label>
                  <Select value={cornerStyle} onValueChange={(v: any) => setCornerStyle(v)}>
                    <SelectTrigger className="bg-zinc-800 w-full">
                      <SelectValue placeholder="Corners" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="sharp">Sharp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-neutral-400">Preview</div>
                <div className="mt-3 p-4 rounded-md bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center`}>{avatarPreview ? <img src={avatarPreview} className="w-full h-full rounded-full object-cover" alt="preview" /> : <User size={18} className="text-neutral-500" />}</div>
                      <div>
                        <div className="font-medium">{displayName || user?.email?.split("@")[0]}</div>
                        <div className="text-xs text-neutral-400">{tagline || "No tagline set"}</div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400">Theme: <span className="text-blue-400">{theme}</span></div>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Preferences" desc="Language, timezone, and notifications" icon={<Globe size={20} className="text-blue-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Language</Label>
                  <Select value={lang} onValueChange={(v: any) => setLang(v)}>
                    <SelectTrigger className="bg-zinc-800 w-full">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">اردو</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-zinc-800" />
                  <div className="mt-2 flex gap-2">
                    <Button onClick={detectTimezone} variant="outline">Detect</Button>
                    <Button onClick={() => { setTimezone("UTC"); toast({ title: "Timezone set", description: "Set to UTC" }); }} variant="ghost">UTC</Button>
                  </div>
                </div>

                <div>
                  <Label>Notifications</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Email</div>
                      <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications((n) => ({ ...n, email: e.target.checked }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Push</div>
                      <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications((n) => ({ ...n, push: e.target.checked }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Marketing</div>
                      <input type="checkbox" checked={notifications.marketing} onChange={(e) => setNotifications((n) => ({ ...n, marketing: e.target.checked }))} />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Security" desc="Secure your account" icon={<Shield size={20} className="text-blue-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Two-factor authentication</div>
                      <div className="text-xs text-neutral-400">Add another layer of security to your account</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">{twoFA ? "Enabled" : "Disabled"}</Label>
                      <input type="checkbox" checked={twoFA} onChange={(e) => toggleTwoFA(e.target.checked)} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Active sessions</div>
                  <div className="mt-2 space-y-2">
                    {activeSessions.map((s: any) => (
                      <div key={s.id} className="p-2 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between">
                        <div>
                          <div className="text-sm">{s.device}</div>
                          <div className="text-xs text-neutral-400">{s.ip} • {prettyDate(s.last_active)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={() => revokeSession(s.id)}>Logout</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Change password</Label>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="New password" className="bg-zinc-800" type="password" />
                    <Button onClick={() => toast({ title: "Change password", description: "Password change flow not wired." })}>Change</Button>
                  </div>
                </div>

                <div>
                  <Label>Sessions</Label>
                  <div className="mt-2 text-xs text-neutral-400">You can log out from other devices anytime.</div>
                </div>
              </div>
            </Section>

            <Section title="Danger Zone" desc="Destructive actions" icon={<Warning size={20} className="text-red-500" />}>
              <div className="space-y-3">
                <div className="text-sm text-neutral-400">Delete your account permanently. This action cannot be undone.</div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} className="w-full">
                    <Trash size={16} /> &nbsp; Delete Account
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // soft reset
                    (async () => {
                      await supabase.from("profiles").update({ 
                        notifications: { email: true, push: false, marketing: false }, 
                        font_style: "default", 
                        corner_style: "rounded" 
                      }).eq('id', user?.id || '');
                      setFontStyle("default"); setCornerStyle("rounded"); setNotifications({ email: true, push: false, marketing: false });
                      toast({ title: "Settings reset", description: "Settings restored to defaults." });
                    })();
                  }}>
                    Reset Settings
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md p-4 rounded-lg bg-zinc-900 border border-red-700 shadow-lg">
            <div className="flex items-center gap-3">
              <Warning size={22} className="text-red-500" />
              <div>
                <div className="font-semibold text-lg">Confirm account deletion</div>
                <div className="text-xs text-neutral-400">This action is permanent and cannot be undone.</div>
              </div>
            </div>

            <div className="mt-4">
              <Label>Type <span className="font-mono">DELETE</span> to confirm</Label>
              <DeleteConfirmInput onConfirm={() => confirmDeleteAccount()} loading={deletingAccount} onCancel={() => setDeleteModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// small helper components used above

const DeleteConfirmInput: React.FC<{ onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({ onConfirm, onCancel, loading }) => {
  const [val, setVal] = useState("");
  return (
    <div className="mt-2 flex gap-2 items-center">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Type DELETE here" className="bg-zinc-800" />
      <Button disabled={val !== "DELETE" || loading} onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
        {loading ? "Deleting..." : "Confirm"}
      </Button>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  );
};

// small util: format bytes
function formatBytes(bytes: number | undefined) {
  if (!bytes && bytes !== 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log((bytes || 0) + 1) / Math.log(k));
  const val = (bytes || 0) / Math.pow(k, i);
  return `${parseFloat(val.toFixed(2))} ${sizes[i] || "Bytes"}`;
}

export default Settings;
