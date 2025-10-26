import React, { useState } from 'react';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Inbox,
  Share2,
  Mail,
  Shield,
  Activity,
  Settings,
  Menu,
  ChevronLeft,
  Crown,
  LogOut,
  Bell,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface EnterpriseTeamManagerLayoutProps {
  children: React.ReactNode;
}

const sidebarNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/teams',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    name: 'Teams',
    href: '/dashboard/teams/manage',
    icon: Users,
    description: 'Manage your teams'
  },
  {
    name: 'Receive Files',
    href: '/dashboard/teams/receive',
    icon: Inbox, 
    description: 'View received files'
  }, 
  {
    name: 'Share Files',
    href: '/dashboard/teams/share',
    icon: Share2,
    description: 'Share with teams'
  },
  {
    name: 'Invites',
    href: '/dashboard/teams/invites',
    icon: Mail,
    description: 'Team invitations'
  },
  {
    name: 'Policies',
    href: '/dashboard/teams/policies',
    icon: Shield,
    description: 'Security policies'
  },
  {
    name: 'Audit',
    href: '/dashboard/teams/audit',
    icon: Activity,
    description: 'Activity logs'
  },
  {
    name: 'Settings',
    href: '/dashboard/teams/settings',
    icon: Settings,
    description: 'Team settings'
  }
];

export const EnterpriseTeamManagerLayout: React.FC<EnterpriseTeamManagerLayoutProps> = ({ children }) => {
  const { user, signOut, profile } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getUserInitials = () => {
    if (user?.user_metadata?.display_name)
      return user.user_metadata.display_name.charAt(0).toUpperCase();
    if (user?.email)
      return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () =>
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen bg-stone-950 border-r border-white/10 sticky top-0 z-40"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <img src="/skie.png" alt="SkieShare Logo" className="h-10 w-auto object-contain" />
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    SkieShare
                  </h2>
                  <p className="text-xs text-muted-foreground">Enterprise Teams</p>
                </div>
              </motion.div>
            ) : (
              <motion.img
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src="/skie.png"
                alt="Logo"
                className="h-10 w-auto object-contain mx-auto"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 h-6 w-6 rounded-full bg-stone-800 border border-white/10 hover:bg-stone-700 z-50"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </Button>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {sidebarNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-zinc-400/30 opacity-10 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col overflow-hidden"
                    >
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {item.name}
                      </span>
                      {isActive && (
                        <span className="text-xs opacity-90 whitespace-nowrap">
                          {item.description}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-stone-800 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
                    <AvatarFallback className="bg-zinc-800 text-white font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <Badge
                      variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {profile?.subscription_tier === 'pro' ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </>
                      ) : (
                        'Free'
                      )}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Avatar className="h-10 w-10 mx-auto ring-2 ring-blue-500/30">
                  <AvatarFallback className="bg-zinc-800 text-white font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={toggleMobileMenu}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-stone-950 border-r border-white/10 z-50 overflow-y-auto"
            >
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src="/skie.png" alt="SkieShare Logo" className="h-10 w-auto object-contain" />
                  <div>
                    <h2 className="text-lg font-bold text-white">SkieShare</h2>
                    <p className="text-xs text-muted-foreground">Enterprise Teams</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="py-6 px-3 space-y-1">
                {sidebarNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={toggleMobileMenu}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-zinc-400/30 opacity-10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{item.name}</span>
                        <span className="text-xs opacity-80">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-stone-950">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-3">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
                    <AvatarFallback className="bg-zinc-800 text-white font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    toggleMobileMenu();
                    signOut();
                  }}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-20 bg-stone-950/80 backdrop-blur-xl border-b border-white/10 shadow-xl">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="lg:hidden hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3 lg:hidden">
                <img src="/skie.png" alt="Logo" className="h-8 w-auto object-contain" />
              </div>

              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-white">Enterprise Team Manager</h1>
                <p className="text-sm text-gray-400">Manage your teams and collaborate efficiently</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-white/10 relative">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </Button>

              <div className="h-8 w-px bg-white/10 mx-2" />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 hover:bg-white/10 h-auto py-2 px-3"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                      <AvatarFallback className="bg-zinc-800 text-white font-bold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <span className="text-sm font-semibold text-white">
                        {getUserDisplayName()}
                      </span>
                      <Badge
                        variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'}
                        className="text-xs h-4 px-1"
                      >
                        {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-stone-900 border-white/10">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Main Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {profile?.subscription_tier !== 'pro' && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link to="/subscription" className="flex items-center text-amber-400">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
