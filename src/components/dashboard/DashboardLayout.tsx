import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Files, Upload, ShareNetwork, ChartBar, Gear, SignOut, Shield, House, Users, FolderOpen, Crown, Question, ChatCircle, CurrencyDollar, Info, Cloud } from 'phosphor-react';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const {
    user,
    signOut
  } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const handleSignOut = async () => {
    await signOut();
  };
  const sidebarItems = [{
    icon: House,
    label: 'Dashboard',
    href: '/dashboard'
  }, {
    icon: Upload,
    label: 'Upload',
    href: '/dashboard/upload'
  }, {
    icon: Files,
    label: 'My Files',
    href: '/dashboard/files'
  }, {
    icon: Users,
    label: 'Teams',
    href: '/dashboard/teams'
  }, {
    icon: FolderOpen,
    label: 'Team Files',
    href: '/dashboard/team-files'
  }, {
    icon: ShareNetwork,
    label: 'Shared Links',
    href: '/dashboard/shared'
  }, {
    icon: ChartBar,
    label: 'Analytics',
    href: '/dashboard/analytics'
  }, {
    icon: Crown,
    label: 'Subscription',
    href: '/subscription'
  }, {
    icon: Gear,
    label: 'Settings',
    href: '/dashboard/settings'
  }];
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Cloud Branding Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
         
        
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-blue-400/2" /> 
        </div>
        
        <Sidebar className="bg-sidebar border-sidebar-border">
          <SidebarHeader className="p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <img 
                src="/Skieshare-removebg-preview.png" 
                alt="DropThrow Logo" 
                className="h-8 w-auto sm:h-10 md:h-12 object-contain"
              />
              <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground">SkieShare</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map(item => <Button key={item.href} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
                  <Link to={item.href} className="">
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>)}
            </nav>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col relative z-10">
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="text-foreground" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.display_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Navigation Links */}
                  <DropdownMenuItem asChild>
                    <a href="/" className="flex items-center">
                      <House className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <a href="/subscription" className="flex items-center">
                      <CurrencyDollar className="mr-2 h-4 w-4" />
                      <span>Pricing</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <a href="/dashboard/settings" className="flex items-center">
                      <Gear className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Support & Info Links */}
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      window.open('mailto:support@skieshare.com?subject=Support Request', '_blank');
                    }} className="flex items-center">
                      <Question className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      // You can replace this with your actual FAQ page
                      window.open('https://docs.skieshare.com/faq', '_blank');
                    }} className="flex items-center">
                      <ChatCircle className="mr-2 h-4 w-4" />
                      <span>FAQ</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      // You can replace this with your actual about page
                      window.open('https://skieshare.com/about', '_blank');
                    }} className="flex items-center">
                      <Info className="mr-2 h-4 w-4" />
                      <span>About</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    <SignOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 bg-inherit">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
};