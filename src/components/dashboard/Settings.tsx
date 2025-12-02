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
  Trash,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  X,
  Globe,
  FloppyDisk,
} from "phosphor-react";
import { motion } from "framer-motion";

type Lang = "en" | "ur" | "ar";

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (displayName) score += 30;
    if (avatarPreview) score += 30;
    if (tagline) score += 20;
    if (profile?.subscription_tier === "pro") score += 20;
    return Math.min(100, score);
  }, [displayName, avatarPreview, tagline, profile]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
    setTagline(user.user_metadata?.tagline || "");
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      setProfile(data);
      if (data?.avatar_url) setAvatarPreview(data.avatar_url);
      if (data?.language) setLang(data.language as Lang);
      if (data?.timezone) setTimezone(data.timezone);
    } catch (error) {
      console.error("fetchProfile error", error);
    }
  };

  useEffect(() => {
    if (!avatarFile) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileUpdates: any = {
        id: user.id,
        display_name: displayName,
        tagline,
        language: lang,
        timezone,
        avatar_url: avatarPreview || profile?.avatar_url,
      };

      const { error } = await supabase.from("profiles").upsert(profileUpdates);
      if (error) throw error;

      await supabase.auth.updateUser({ data: { display_name: displayName, tagline } });

      toast({ title: "Saved", description: "Profile saved successfully." });
      fetchProfile();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err?.message || "Could not save profile" });
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    try {
      await supabase.from("profiles").update({ avatar_url: null }).eq('id', user?.id || '');
      setProfile((p: any) => ({ ...p, avatar_url: null }));
      toast({ title: "Avatar removed" });
    } catch {}
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      const { data: files } = await supabase.from("files").select("storage_path").eq("user_id", user.id);
      if (files && files.length) {
        const paths = files.map((f: any) => f.storage_path).filter(Boolean);
        if (paths.length) {
          try {
            await supabase.storage.from("files").remove(paths);
          } catch (e) {
            console.warn("storage remove error", e);
          }
        }
      }
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.from("files").delete().eq("user_id", user.id);
      toast({ title: "Account deleted", description: "Your account and data have been removed." });
      await signOut();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err?.message || "Could not delete account." });
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  const Section: React.FC<{ title: string; desc?: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ title, desc, icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="mb-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-blue-500">Settings</h1>
            <p className="text-neutral-400 mt-1">Manage your profile and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-zinc-800" variant={profile?.subscription_tier === "pro" ? "default" : "secondary"}>
              {profile?.subscription_tier === "pro" ? "Pro" : "Free"}
            </Badge>
            <Button onClick={saveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "Saving..." : <><CheckCircle size={16} className="mr-1" /> Save</>}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Section title="Profile" desc="Your account details" icon={<User size={20} className="text-blue-400" />}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative rounded-xl overflow-hidden">
                  <div className="w-24 h-24 bg-zinc-800 flex items-center justify-center rounded-full">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User size={36} className="text-neutral-500" />
                    )}
                  </div>
                  {avatarPreview && (
                    <button onClick={removeAvatar} className="absolute -top-1 -right-1 bg-zinc-800 p-1 rounded-full hover:bg-red-600">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <Label htmlFor="avatar-upload" className="cursor-pointer text-xs text-blue-400 hover:underline">
                  Change Avatar
                </Label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-neutral-300">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="bg-zinc-800 border-zinc-700 mt-1" />
                </div>
                <div>
                  <Label className="text-neutral-300">Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-zinc-800/50 border-zinc-700 mt-1 text-neutral-500" />
                </div>
                <div>
                  <Label className="text-neutral-300">Tagline</Label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A short bio" className="bg-zinc-800 border-zinc-700 mt-1" />
                </div>
              </div>
            </div>
          </Section>

          {/* Appearance Section */}
          <Section title="Appearance" desc="Customize your experience" icon={<PaintBrush size={20} className="text-purple-400" />}>
            <div className="space-y-4">
              <div>
                <Label className="text-neutral-300 mb-2 block">Theme</Label>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")} className="flex-1">
                    <Sun size={16} className="mr-1" /> Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")} className="flex-1">
                    <Moon size={16} className="mr-1" /> Dark
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")} className="flex-1">
                    <Monitor size={16} className="mr-1" /> System
                  </Button>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Language</Label>
                  <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-300">Timezone</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-zinc-800 border-zinc-700 flex-1" />
                    <Button variant="outline" size="icon" onClick={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}>
                      <Globe size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Danger Zone */}
          <Section title="Danger Zone" desc="Irreversible actions" icon={<Trash size={20} className="text-red-400" />}>
            <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
              <p className="text-sm text-neutral-400 mb-3">
                Once you delete your account, there is no going back. All your files and data will be permanently removed.
              </p>
              {!deleteModalOpen ? (
                <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400 font-medium">Are you sure? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDeleteAccount} disabled={deletingAccount}>
                      {deletingAccount ? "Deleting..." : "Yes, Delete My Account"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};
