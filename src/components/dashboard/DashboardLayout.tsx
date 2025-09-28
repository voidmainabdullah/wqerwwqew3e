import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { House, Upload, Files, ShareNetwork, ChartBar, Gear, SignOut, Users, PaperPlaneTilt, Code, CurrencyCircleDollar, Lifebuoy, Info, Bell, HardDrive, Question, ChatCircle } from 'phosphor-react';
import { NotificationPopover } from './NotificationPopover';
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
  icon: House
}, {
  name: 'Upload',
  href: '/dashboard/upload',
  icon: Upload
}, {
  name: 'My Files',
  href: '/dashboard/files',
  icon: Files
}, {
  name: 'Teams',
  href: '/dashboard/teams',
  icon: Users
}, {
  name: 'Team Files',
  href: '/dashboard/team-files',
  icon: PaperPlaneTilt
}, {
  name: 'Shared Links',
  href: '/dashboard/shared',
  icon: ShareNetwork
}, {
  name: 'Analytics',
  href: '/dashboard/analytics',
  icon: ChartBar
}, {
  name: 'Settings',
  href: '/dashboard/settings',
  icon: Gear
}];
const AppSidebar = () => {
  const location = useLocation();
  
  return <Sidebar className="border-r border-border/50 bg-zinc-900">
      <SidebarHeader className="w-auto h-35 px-[6px] py-[6px] my-0 mx-[4px]">
        <div className="flex items-center space-x-4 px- py-1 bg-inherit w-50 h-50">
          <img src="/sky.png" alt="SecureShare Logo" className="h-30 w-auto sm:h-20 md:h-16 object-contain" />
          <span className="font-bold text-xl bg-gradient-to-r from-red-200 to-green-400 bg-clip-text">
            
          </span>
        </div> 
      </SidebarHeader>
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup className="w-60">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(item => <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="h-11 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                    <Link to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/code">
                    <Code className="h-5 w-5" />
                    <span>Recieve Now</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/dashboard/receive">
                    <PaperPlaneTilt className="h-5 w-5" />
                    <span>Receive File</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        

        {/* Extra Pages */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
                  <Link to="/subscription">
                    <CurrencyCircleDollar className="h-5 w-5" />
                    <span>Pricing</span>
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
      const { data } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit, subscription_tier')
        .eq('id', user?.id)
        .single();
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

  const storageProgress = profile && profile.subscription_tier !== 'pro' && profile.storage_limit
    ? (profile.storage_used / profile.storage_limit) * 100
    : 0;

  const StoragePopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent/50">
          <HardDrive className="h-5 w-5 text-muted-foreground" />
          {profile?.subscription_tier !== 'pro' && storageProgress > 80 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-yellow-500 text-white text-xs">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Storage Usage</h3>
            {profile?.subscription_tier === 'pro' && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Pro
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">
                {formatFileSize(profile?.storage_used || 0)}
                {profile?.subscription_tier !== 'pro' && ` / ${formatFileSize(profile?.storage_limit || 0)}`}
              </span>
            </div>
            
            {profile?.subscription_tier !== 'pro' && (
              <>
                <Progress value={storageProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{storageProgress.toFixed(1)}% used</span>
                  <span>{(100 - storageProgress).toFixed(1)}% remaining</span>
                </div>
              </>
            )}
            
            {profile?.subscription_tier === 'pro' && (
              <div className="text-center py-2">
                <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                  Unlimited Storage
                </Badge>
              </div>
            )}
          </div>
          
          {profile?.subscription_tier !== 'pro' && storageProgress > 80 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You're running low on storage space. Consider upgrading to Pro for unlimited storage.
              </p>
              <Button asChild size="sm" className="mt-2 w-full">
                <Link to="/subscription">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  const HelpPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50">
          <Question className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Help & Support</h3>
          
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
              <a href="#" className="flex items-center gap-3">
                <Info className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Documentation</p>
                  <p className="text-xs text-muted-foreground">Learn how to use the platform</p>
                </div>
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
              <a href="#" className="flex items-center gap-3">
                <Lifebuoy className="h-4 w-4 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Support Center</p>
                  <p className="text-xs text-muted-foreground">Get help from our team</p>
                </div>
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
              <a href="#" className="flex items-center gap-3">
                <Question className="h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">FAQ</p>
                  <p className="text-xs text-muted-foreground">Common questions</p>
                </div>
              </a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const FeedbackButton = () => (
    <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-accent/50" asChild>
      <a href="#" className="flex items-center gap-2">
        <ChatCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">Feedback</span>
      </a>
    </Button>
  );

  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-800">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-white/30 bg-neutral-900/30 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 md:px-6 bg-neutral-900">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center space-x-3">
                  <img src="/sky.png" alt="SecureShare Logo" className="h-20 w-auto object-contain" />
                  <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  
                  </span>
                </div>
                
                {/* Desktop Welcome Message */}
                <div className="hidden lg:block">
                  <div className="space-y-1">
                    <h2 className="text-base xl:text-lg font-semibold text-white">
                      Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </h2>
                    <p className="text-xs xl:text-sm text-slate-400">
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
              
              <div className="flex items-center space-x-4">
                {/* Navbar Icons Group */}
                <div className="flex items-center space-x-1 md:space-x-2">
                  <NotificationPopover />
                  <StoragePopover />
                  <HelpPopover />
                  
                  {/* Separator */}
                  <div className="hidden sm:block w-px h-6 bg-border/50 mx-2"></div>
                  
                  {/* Feedback Button */}
                  <FeedbackButton />
                  
                  {/* Separator */}
                  <div className="w-px h-6 bg-border/50 mx-2"></div>
                </div>
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-accent/50 transition-all duration-200">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-700 text-white">
                          {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" forceMount className="w-56 bg-zinc-800">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {user.user_metadata?.display_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-600" />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/analytics" className="">
                        <ChartBar className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-zinc-600" />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings">
                        <Gear className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-600" />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <SignOut className="mr-2 text-red-600 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8 bg-neutral-900">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};