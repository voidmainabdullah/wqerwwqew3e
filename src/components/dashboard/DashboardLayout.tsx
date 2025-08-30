import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
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
  Clock,
  CurrencyCircleDollar,
  Lifebuoy,
  Info,
  TwitterLogo,
  InstagramLogo,
  FacebookLogo
} from 'phosphor-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: House },
  { name: 'Upload', href: '/dashboard/upload', icon: Upload },
  { name: 'My Files', href: '/dashboard/files', icon: Files },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Team Files', href: '/dashboard/team-files', icon: PaperPlaneTilt },
  { name: 'Shared Links', href: '/dashboard/shared', icon: ShareNetwork },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBar },
  { name: 'Settings', href: '/dashboard/settings', icon: Gear },
];

const AppSidebar = () => {
  const location = useLocation();
  
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader>
        <div className="flex items-center space-x-3 px-6 py-4">
          <img 
            src="/sky.png" 
            alt="SecureShare Logo" 
            className="h-10 w-auto object-contain"
          />
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            SecureShare
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                    className="h-11 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200"
                  >
                    <Link to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
    </Sidebar>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-800">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-white/30 bg-neutral-900/30 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center space-x-3">
                  <img 
                    src="/sky.png" 
                    alt="SecureShare Logo" 
                    className="h-8 w-auto object-contain"
                  />
                  <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    SecureShare
                  </span>
                </div>
                
                {/* Desktop Welcome Message */}
                <div className="hidden md:block">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-white">
                      Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </h2>
                    <p className="text-sm text-slate-400">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-700 text-white">
                          {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings">
                        <Gear className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <SignOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
 