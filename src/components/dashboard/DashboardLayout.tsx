import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarRail,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  House,
  Upload,
  Files,
  ShareNetwork,
  ChartBar,
  Gear,
  SignOut,
  Users,
  PaperPlaneTilt,
  Code,
  CurrencyCircleDollar,
  Lifebuoy,
  Info,
  Bell,
  Headset,
  HardDrive,
  ClockCounterClockwise,
  HardDrives,
  Question,
  UserGear,
  ChatCircle,
  Crown,
  Share,
  DiamondsFour,
} from 'phosphor-react';
import { LordIcon, LordIcons } from '@/components/ui/LordIcon';
import { NotificationPopover } from './NotificationPopover';
import { TeamFileSharePage } from '../teams/TeamFileSharePage';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { ProBadge } from '@/components/ui/ProBadge';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserProfile {
  storage_used: number;
  storage_limit: number;
  subscription_tier: string;
  avatar_url: string | null;
}

// Navigation items with icons
const navigation = [
  { name: 'Dashboard', href: '/dashboard', lordIcon: LordIcons.dashboard, isPro: false },
  { name: 'Upload', href: '/dashboard/upload', lordIcon: LordIcons.fileStack, isPro: false },
  { name: 'My Files', href: '/dashboard/files', lordIcon: LordIcons.lord, isPro: false },
  { name: 'Shared Link', href: '/dashboard/shared', lordIcon: LordIcons.home, isPro: false },
  { name: 'Analytics', href: '/dashboard/analytics', lordIcon: LordIcons.ana, isPro: true },
  { name: 'Settings', href: '/dashboard/settings', lordIcon: LordIcons.settings, isPro: false },
];

// Sidebar Component
const AppSidebar = () => {
  const location = useLocation();
  const { isPro } = useSubscription();
  const { state, isMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 h-screen flex flex-col bg-transparent transition-all duration-300 ease-in-out"
    >
      {/* Sidebar Header */}
      <SidebarHeader className="flex-shrink-0 py-3 bg-stone-950 mx-px my-0 px-[5px]">
        <div className="flex items-center space-x-3 group mx-0 my-0 py-0 px-0">
          <div className="relative flex-shrink-0">
            <img
              src="/skie.png"
              alt="SkieShare Logo"
              className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-110 block mx-auto"
            />
            <div className="absolute inset-0 blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 mx-0 px-0">
              <img
                src="/skie.png"
                alt="SkieShare Logo Glow"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden transition-all duration-300 overflow-hidden">
            <span className="font-heading font-bold text-sm bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent whitespace-nowrap">
              SkieShare
            </span>
            <p className="text-xs text-muted-foreground font-body whitespace-nowrap text-neutral-400 mx-0 my-0 py-0 px-px">
              Secure Environment
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="flex-1 overflow-y-auto py-2 bg-stone-950 text-neutral-400 px-[8px]">
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-heading font-semibold tracking-wider px-2 mb-1 text-neutral-400">
            Navigation
            <span className="text-xs font-heading font-semibold text-neutral-600 uppercase tracking-wider px-2 mb-1">
              {' '}
              (ctrl + B)
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 text-neutral-400">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.name}
                    className="h-9 px-3 rounded-lg hover:bg-neutral-400/10 transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <LordIcon
                          src={item.lordIcon}
                          size={18}
                          trigger="hover"
                          primaryColor="#ffffff"
                          className="flex-shrink-0 "
                        />
                        <span className="font-body text-sm group-data-[collapsible=icon]:hidden">
                          {item.name}
                        </span>
                      </div>
                      {item.isPro && !isPro && (
                        <ProBadge size="sm" className="group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Receive Now"
                  className="h-9 px-3 rounded-lg hover:bg-neutral-400/10 transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                >
                  <Link to="/code" className="flex items-center gap-2">
                    <LordIcon
                      src="https://cdn.lordicon.com/awjeikyj.json"
                      size={18}
                      trigger="hover"
                      primaryColor="#ffffff"
                      className="flex-shrink-0"
                    />
                    <span className="font-body text-sm group-data-[collapsible=icon]:hidden">
                      Receive Now
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Request File"
                  className="h-9 px-3 rounded-lg hover:bg-neutral-400/10 transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                >
                  <Link to="/dashboard/receive" className="flex items-center gap-2">
                    <LordIcon
                      src="https://cdn.lordicon.com/meaqueth.json"
                      size={18}
                      trigger="hover"
                      primaryColor="#ffffff"
                      className="flex-shrink-0"
                    />
                    <span className="font-body text-sm group-data-[collapsible=icon]:hidden">
                      Request File
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* More / Upgrade Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Upgrade"
                  className="h-9 px-3 rounded-xl bg-accent/10  border text-neutral-200 hover:bg-accent/10 transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                >
                  <Link to="/subscription" className="flex items-center gap-2">
                    <DiamondsFour className="flex-shrink-0" />
                    <span className="font-body text-sm group-data-[collapsible=icon]:hidden">
                      Upgrade Plan
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade Image Section */}
        <div className="flex-shrink-0 mt-auto px-2 py-4 group-data-[collapsible=icon]:hidden transition-all duration-300">
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3">
            <img
              src="/image.png"
              alt="Upgrade to Pro"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>
        </div>
      </SidebarContent>

      {/* Sidebar Rail */}
      <SidebarRail />
    </Sidebar>
  );
};

// Dashboard Layout
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit, subscription_tier, avatar_url')
        .eq('id', user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const storageProgress =
    profile && profile.subscription_tier !== 'pro' && profile.storage_limit
      ? (profile.storage_used / profile.storage_limit) * 100
      : 0;

  // Storage Popover Component
  const StoragePopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex overflow-hidden border divide-x rounded-full bg-stone-950 border-zinc-700 divide-zinc-700 hover:border-zinc-600 transition-colors duration-200">
          {/* Left Button */}
          <Link
            to="/dashboard/upload"
            className="px-2 sm:px-3 md:px-4 py-2 flex items-center justify-center font-medium text-gray-300 transition-colors duration-200 hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          {/* Middle Button */}
          <Link
            to="/dashboard/teams"
            className="px-2 sm:px-3 md:px-4 py-2 flex items-center justify-center font-medium text-gray-300 transition-colors duration-200 hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 14c1.657 0 3 1.343 3 3v1H5v-1c0-1.657 1.343-3 3-3h8zM8.5 11a3.5 3.5 0 110-7 3.5 3.5 0 010 7zM15.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          {/* Right Button */}
          <button className="px-2 sm:px-3 md:px-4 py-2 flex items-center justify-center font-medium text-gray-300 transition-colors duration-200 hover:bg-zinc-800 relative">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.433 22l3.073-5.333h12.927L17.36 22H4.433z" fill="#3777E3" />
              <path d="M15.567 8.667L8.5 2h7.067l7.066 11.667h-7.066z" fill="#FFCF63" />
              <path d="M1.367 13.667L8.433 2l3.567 6.667-7.067 11.666-3.566-6.666z" fill="#11A861" />
            </svg>
            {profile?.subscription_tier !== 'pro' && storageProgress > 80 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
                <span className="text-[10px] text-black font-bold">!</span>
              </div>
            )}
          </button>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" weight="fill" />
              <h3 className="text-base font-heading font-semibold text-foreground">Storage Usage</h3>
            </div>
            {profile?.subscription_tier === 'pro' && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Pro
              </Badge>
            )}
          </div>

          {/* Storage progress details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-body">
              <span className="text-muted-foreground">Used</span>
              <span className="font-semibold text-foreground">
                {formatFileSize(profile?.storage_used || 0)}
                {profile?.subscription_tier !== 'pro' &&
                  ` / ${formatFileSize(profile?.storage_limit || 0)}`}
              </span>
            </div>

            {profile?.subscription_tier !== 'pro' && (
              <div className="space-y-1.5">
                <Progress value={storageProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground font-body">
                  <span>{storageProgress.toFixed(1)}% used</span>
                  <span>{(100 - storageProgress).toFixed(1)}% free</span>
                </div>
              </div>
            )}

            {profile?.subscription_tier === 'pro' && (
              <div className="text-center py-3 px-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
                <Badge
                  variant="outline"
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-500/50 bg-transparent font-body"
                >
                  ✨ Unlimited Storage
                </Badge>
              </div>
            )}

            {profile?.subscription_tier !== 'pro' && storageProgress > 80 && (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                <p className="text-sm text-warning font-body font-semibold">
                  Your storage is almost full, consider upgrading to Pro.
                </p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-stone-950">
            <div className="flex items-center gap-4">
              <StoragePopover />
              <NotificationPopover />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={profile?.avatar_url || '/default-avatar.png'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <SignOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
