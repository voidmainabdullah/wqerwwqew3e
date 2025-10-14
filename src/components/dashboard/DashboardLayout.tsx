import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'; 
import { House, Upload, Files, ShareNetwork, ChartBar, Gear, SignOut, Users, PaperPlaneTilt, Code, CurrencyCircleDollar, Lifebuoy, Info, Bell,Headset, HardDrive,ClockCounterClockwise,HardDrives, Question,UserGear, ChatCircle, Crown } from 'phosphor-react';
import { NotificationPopover } from './NotificationPopover';
import { TeamFileSharePage } from '../teams/TeamFileSharePage';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress'; 
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
interface UserProfile {
  storage_used: number;
  storage_limit: number;
  subscription_tier: string;
}
const navigation = [{ 
  name: 'Dashboard',
  href: '/dashboard',
  icon: 'dashboard'
}, {
  name: 'Upload',
  href: '/dashboard/upload',
  icon: 'upload'
}, {
  name: 'My Files',
  href: '/dashboard/files',
  icon: 'folder'
}, {
  name: 'Teams',
  href: '/dashboard/teams',
  icon: 'groups'
}, {
  name: 'Team Files',
  href: '/dashboard/team-files',
  icon: 'send'
}, {
  name: 'Shared Links',
  href: '/dashboard/shared',
  icon: 'share'
}, {
  name: 'Analytics',
  href: '/dashboard/analytics',
  icon: 'analytics'
}, {
  name: 'Settings',
  href: '/dashboard/settings',
  icon: 'settings'
}];
const AppSidebar = () => {
  const location = useLocation();
  return <Sidebar className="border-r border-border/50 h-screen flex flex-col bg-zinc-900">
      <SidebarHeader className="flex-shrink-0 px-3 py-3">
        <div className="flex items-center space-x-3 px-2 py-1 group">
          <div className="relative">
            <img src="/skie.png" alt="SkieShare Logo" className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300">
              <img src="/skie.png" alt="SkieShare Logo Glow" className="h-10 w-auto object-contain" />
            </div>
          </div>
          <div className="hidden xl:block">
            <span className="font-heading font-bold text-base bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              SkieShare
            </span>
            <p className="text-xs text-muted-foreground font-body">Secure Transfer</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto px-2 py-2 bg-zinc-900">
        {/* Navigation */}
        <SidebarGroup className="w-60">
          <SidebarGroupLabel className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navigation.map(item => <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="h-9 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                    <Link to={item.href}>
                      <span className="material-icons md-18">{item.icon}</span>
                      <span className="font-body text-sm">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-9 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/code">
                    <span className="material-icons md-18">qr_code</span>
                    <span className="font-body text-sm">Receive Now</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-9 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/dashboard/receive">
                    <span className="material-icons md-18">inbox</span>
                    <span className="font-body text-sm">Receive File</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        

        {/* Extra Pages */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-9 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/subscription">
                    <span className="material-icons md-18">payments</span>
                    <span className="font-body text-sm">Pricing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
};
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const {
    user,
    signOut
  } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  const fetchProfile = async () => {
    try {
      const {
        data
      } = await supabase.from('profiles').select('storage_used, storage_limit, subscription_tier').eq('id', user?.id).single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  const storageProgress = profile && profile.subscription_tier !== 'pro' && profile.storage_limit ? profile.storage_used / profile.storage_limit * 100 : 0;
  const StoragePopover = () => <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent transition-colors">
          <HardDrive className="h-5 w-5 text-muted-foreground" weight="fill" />
          {profile?.subscription_tier !== 'pro' && storageProgress > 80 && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning flex items-center justify-center animate-pulse">
              <span className="text-[10px] text-warning-foreground font-bold">!</span>
            </div>} 
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" weight="fill" />
              <h3 className="text-base font-heading font-semibold text-foreground">Storage Usage</h3>
            </div>
            {profile?.subscription_tier === 'pro' && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Pro
              </Badge>}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-body">
              <span className="text-muted-foreground">Used</span>
              <span className="font-semibold text-foreground">
                {formatFileSize(profile?.storage_used || 0)}
                {profile?.subscription_tier !== 'pro' && ` / ${formatFileSize(profile?.storage_limit || 0)}`}
              </span>
            </div>
            
            {profile?.subscription_tier !== 'pro' && <>
                <div className="space-y-1.5">
                  <Progress value={storageProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground font-body">
                    <span>{storageProgress.toFixed(1)}% used</span>
                    <span>{(100 - storageProgress).toFixed(1)}% free</span>
                  </div>
                </div>
              </>}
            
            {profile?.subscription_tier === 'pro' && <div className="text-center py-3 px-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/50 bg-transparent font-body">
                  ✨ Unlimited Storage
                </Badge>
              </div>}
          </div>
          
          {profile?.subscription_tier !== 'pro' && storageProgress > 80 && <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
              <p className="text-sm text-warning-foreground/90 font-body mb-2">
                You're running low on storage space. Upgrade to Pro for unlimited storage.
              </p>
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Link to="/subscription">Upgrade Now</Link>
              </Button>
            </div>}
        </div>
      </PopoverContent>
    </Popover>;
  const HelpPopover = () => <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent transition-colors">
          <Question className="h-5 w-5 text-muted-foreground" weight="fill" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Lifebuoy className="h-5 w-5 text-primary" weight="fill" />
            <h3 className="text-base font-heading font-semibold text-foreground">Help & Support</h3>
          </div>
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent transition-colors" asChild>
              <a href="#" className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" weight="fill" />
                <div className="text-left flex-1">
                  <p className="font-heading font-semibold text-sm text-foreground">Documentation</p>
                  <p className="text-xs text-muted-foreground font-body">Learn how to use the platform</p>
                </div>
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent transition-colors" asChild>
              <a href="#" className="flex items-start gap-3">
                <Lifebuoy className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" weight="fill" />
                <div className="text-left flex-1">
                  <p className="font-heading font-semibold text-sm text-foreground">Support Center</p>
                  <p className="text-xs text-muted-foreground font-body">Get help from our team</p>
                </div>
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent transition-colors" asChild>
              <a href="#" className="flex items-start gap-3">
                <Question className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" weight="fill" />
                <div className="text-left flex-1">
                  <p className="font-heading font-semibold text-sm text-foreground">FAQ</p>
                  <p className="text-xs text-muted-foreground font-body">Common questions</p>
                </div>
              </a>
            </Button>
            
            <div className="pt-2 border-t border-border">
              <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent transition-colors" asChild>
                <a href="#" className="flex items-start gap-3">
                  <ChatCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" weight="fill" />
                  <div className="text-left flex-1">
                    <p className="font-heading font-semibold text-sm text-foreground">Live Chat</p>
                    <p className="text-xs text-muted-foreground font-body">Chat with our support team</p>
                  </div>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>;
 const CreateTeamButton = () => (
  <Button
    asChild
    className="
      group relative h-9 px-5 rounded-full border-0 
      font-semibold text-white
      bg-[linear-gradient(90deg,#2563eb,#1e40af,#2563eb)]
      bg-[length:300%_100%]
      shadow-[0_4px_20px_-5px_rgba(37,99,235,0.5)]
      transition-all duration-300 ease-in-out
      hover:bg-[length:320%_100%]
      hover:scale-[1.03]
      hover:shadow-[0_6px_25px_-8px_rgba(37,99,235,0.7)]
    "
  >
    <Link to="/dashboard/teams" className="flex items-center gap-2">
      <Users className="h-4 w-4 text-blue-200 group-hover:text-white transition-colors" weight="fill" />
      <span className="text-sm font-medium">Create Team</span>
    </Link>
  </Button>
); 

  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 md:px-6 bg-zinc-900">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-accent/80 transition-colors" />
                
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center gap-3">
                  <img src="/skie.png" alt="SkieShare Logo" className="h-8 w-auto object-contain" />
                </div>
                
                {/* Desktop Welcome Message */}
                <div className="hidden lg:block">
                  <div className="space-y-0.5">
                    <h2 className="text-base xl:text-lg font-heading font-semibold text-foreground">
                      Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </h2>
                    <p className="text-xs xl:text-sm text-muted-foreground font-body">
                      {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Navbar Icons Group */}
                <div className="flex items-center gap-1 bg-neutral-900 ">
                  <NotificationPopover />
                  <StoragePopover />
                  <HelpPopover />
                  
                  {/* Separator */}
                  <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
                  
                  {/* Feedback Button */}
                  <FeedbackButton />
                  
                  {/* Separator */}
                  <div className="w-px h-6 bg-border mx-2"></div>
                </div>
                
                {/* User Profile Dropdown with Badge */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                      <Avatar className="h-9 w-9 ring-2 ring-border">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                          {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.subscription_tier === 'pro' && <Badge className="absolute -top-1 -right-1 h-5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] border-2 border-background">
                          PRO
                        </Badge>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" forceMount className="w-64 border-none shadow-lg border-c rounded-2xl bg-zinc-800">
                    <DropdownMenuLabel className="font-normal pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-border">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-lg text-blue-700 font-extrabold">
                            {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-heading font-semibold leading-none text-foreground">
                              {user.user_metadata?.display_name || 'User'}
                            </p>
                            {profile?.subscription_tier === 'pro' && <Badge className="h-5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                                PRO
                              </Badge>}
                          </div>
                          <p className="text-xs leading-none text-muted-foreground font-body">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/analytics" className="flex items-center gap-3 py-2.5">
                        <UserGear className="h-4 w-4 text-primary" weight="fill" />
                        <span className="font-body">Account</span>
                      </Link>
                    </DropdownMenuItem>

                     <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/analytics" className="flex items-center gap-3 py-2.5">
                        <ChartBar className="h-4 w-4 text-primary" weight="fill" />
                        <span className="font-body">Analytic</span>
                      </Link>
                    </DropdownMenuItem>

                     <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/analytics" className="flex items-center gap-3 py-2.5">
                        <ClockCounterClockwise className="h-4 w-4 text-primary " weight="fill" />
                        <span className="font-body">Backup</span>
                      </Link>
                    </DropdownMenuItem>

                     <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/analytics" className="flex items-center gap-3 py-2.5">
                        <HardDrives className="h-4 w-4 text-primary" weight="fill" />
                        <span className="font-body">Storage</span>
                      </Link>
                    </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border" />
                     <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/analytics" className="flex items-center gap-3 py-2.5">
                        <Gear className="h-4 w-4 text-primary" weight="fill" />
                        <span className="font-body">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    

                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Link to="/dashboard/settings" className="flex items-center gap-3 py-2.5">
                        <Headset className="h-4 w-4 text-primary" weight="fill" />
                        <span className="font-body">Support 24/7</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {profile?.subscription_tier !== 'pro' && <>
               <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                          <Link to="/subscription" className="flex items-center gap-3 py-2.5">
                            <CurrencyCircleDollar className="h-4 w-4 text-amber-500" weight="fill" />
                            <span className="font-body">Subscription</span>
                          </Link>
                        </DropdownMenuItem>
                      </>}
                    
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive">
                      <SignOut className="mr-3 h-4 w-4" weight="fill" />
                      <span className="font-body">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-4 md:p-6 lg:p-8 bg-zinc-900">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};