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
  CurrencyCircleDollar,
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
            src="/Skieshare-removebg-preview.png" 
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
                    <span>Enter Code</span>
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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            {/* Glowing Curved Line */}
            <svg
              className="absolute top-0 left-0 w-full h-10"
              viewBox="0 0 1440 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke="white"
                strokeWidth="2"
                d="M0,50 C360,0 1080,100 1440,50"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.5))"
                }}
              />
            </svg>

            <div className="flex items-center justify-between h-16 px-6 relative z-10">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center space-x-3">
                  <img 
                    src="/Skieshare-removebg-preview.png" 
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
                    <h2 className="text-lg font-semibold text-foreground">
                      Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </h2>
                    <p className="text-sm text-muted-foreground">
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
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.display_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
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
          <main className="flex-1 p-8 bg-background/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
