import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import AppSidebar from './AppSidebar';
import { Gear, SignOut, CurrencyCircleDollar } from 'phosphor-react';
import ThemeSwitcher from './ThemeSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-neutral-800">
      {/* Sidebar */}
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-white/30 bg-neutral-900/30 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <div className="md:hidden flex items-center space-x-3">
                <img src="/sky.png" alt="SecureShare Logo" className="h-8 w-auto object-contain" />
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">SecureShare</span>
              </div>
            </div>

            {/* Desktop Welcome Message */}
            <div className="hidden md:block">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">
                  Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </h2>
                <p className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-700 text-white">
                        {user.user_metadata?.display_name?.charAt(0).toUpperCase() || user.email?.split('@')[0]?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.display_name || 'User'}</p>
                      <p className="text-xs leading-none text-slate-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  {/* Theme Switcher */}
                  <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">
                      <Gear className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/pricing">
                      <CurrencyCircleDollar className="mr-2 h-4 w-4" />
                      Pricing
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
