import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import Logo from './Logo';
import { Menu, X, CircleDot, LayoutDashboard, DollarSign, User, Settings, LogOut, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
const Header = () => {
 const { actualTheme } = useTheme();
const { user, profile, signOut } = useAuth();

  const [activePage, setActivePage] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
    const element = document.getElementById(page);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  };
  return <motion.div className={`fixed top-0 left-0 right-0 z-50 pt-2 px-4 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-background/50 shadow-lg' : 'bg-transparent'}`}>
      {/* Animated White Glow Line at Top */}
      <motion.div className={`absolute top-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent ${actualTheme === 'light' ? 'via-neutral-800' : 'via-neutral-800'}`} initial={{
      width: "0%"
    }} animate={{
      width: "100%"
    }} transition={{
      duration: 2,
      ease: "easeInOut"
    }} style={{
      boxShadow: actualTheme === 'light' ? "0 0 20px rgba(38, 38, 38, 0.8), 0 0 40px rgba(38, 38, 38, 0.4)" : "0 0 20px rgba(38, 38, 38, 0.8), 0 0 40px rgba(38, 38, 38, 0.4)"
    }} />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating boxes with low opacity */}
        <div className={`absolute top-4 left-20 w-8 h-8 rounded-lg rotate-12 ${actualTheme === 'light' ? 'bg-neutral-800/5' : 'bg-white/5'} animate-float`} style={{
        animationDelay: '0s'
      }} />
        <div className={`absolute top-6 right-32 w-6 h-6 rounded-md rotate-45 ${actualTheme === 'light' ? 'bg-neutral-700/8' : 'bg-white/8'} animate-float`} style={{
        animationDelay: '2s'
      }} />
        <div className={`absolute top-8 left-1/3 w-4 h-4 rounded-full ${actualTheme === 'light' ? 'bg-neutral-600/6' : 'bg-white/6'} animate-float`} style={{
        animationDelay: '1s'
      }} />
        <div className={`absolute top-5 right-1/4 w-5 h-5 rounded-lg rotate-30 ${actualTheme === 'light' ? 'bg-neutral-800/7' : 'bg-white/7'} animate-float`} style={{
        animationDelay: '3s'
      }} />
        <div className={`absolute top-7 left-2/3 w-3 h-3 rounded-md rotate-60 ${actualTheme === 'light' ? 'bg-neutral-700/5' : 'bg-white/5'} animate-float`} style={{
        animationDelay: '1.5s'
      }} />
      </div>
      
      <header className="w-full max-w-7xl mx-auto py-2 px-6 md:px-8 flex items-center justify-between max-h-14">
        <div className="p-3">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6
        }}>
            <Logo />
          </motion.div>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden p-3 rounded-2xl text-muted-foreground hover:text-foreground" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation with dropdowns */}
        <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          <div className="px-1 py-1 backdrop-blur-md bg-background/80 border border-border shadow-lg rounded-2xl">
            <ToggleGroup type="single" value={activePage} onValueChange={value => value && setActivePage(value)}>
              <ToggleGroupItem value="features" className={cn("px-3 py-1.5 rounded-full transition-colors relative text-sm", activePage === 'features' ? 'text-accent-foreground bg-red-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted')} onClick={handleNavClick('features')}>
                <CircleDot size={14} className="inline-block mr-1" /> Features
              </ToggleGroupItem>
              
              {/* Products Dropdown */}
              <div className="relative group">
                <ToggleGroupItem value="products" className={cn("px-3 py-1.5 rounded-full transition-colors relative text-sm", 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                  <LayoutDashboard size={14} className="inline-block mr-1" /> Products
                </ToggleGroupItem>
                <div className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">File Storage</a>
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Team Collaboration</a>
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Enterprise Security</a>
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">API Platform</a>
                  </div>
                </div>
              </div>

              <ToggleGroupItem value="pricing" className={cn("px-3 py-1.5 rounded-full transition-colors relative text-sm", activePage === 'pricing' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted')} onClick={handleNavClick('pricing')}>
                <DollarSign size={14} className="inline-block mr-1" /> Pricing
              </ToggleGroupItem>

              {/* Resources Dropdown */}
              <div className="relative group">
                <ToggleGroupItem value="resources" className={cn("px-3 py-1.5 rounded-full transition-colors relative text-sm", 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                  Resources
                </ToggleGroupItem>
                <div className="absolute top-full left-0 mt-2 w-44 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <a href="/docs" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Documentation</a>
                    <a href="/blog" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Blog</a>
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Case Studies</a>
                    <a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </ToggleGroup>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && <div className="md:hidden absolute top-16 left-4 right-4 bg-background/95 backdrop-blur-md py-3 px-4 border border-border rounded-xl shadow-lg z-50">
            <div className="flex flex-col gap-2">
              <a href="#features" className={`px-2 py-1.5 text-sm rounded-md transition-colors ${activePage === 'features' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`} onClick={handleNavClick('features')}>
                <CircleDot size={14} className="inline-block mr-1" /> Features
              </a>
              <a href="#pricing" className={`px-2 py-1.5 text-sm rounded-md transition-colors ${activePage === 'pricing' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`} onClick={handleNavClick('pricing')}>
                <DollarSign size={14} className="inline-block mr-1" /> Pricing
              </a>
              <div className="border-t border-border pt-2 mt-2">
                <a href="#" className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">Products</a>
                <a href="#" className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">Resources</a>
                <a href="#" className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">Support</a>
              </div>
              
              {/* Mobile CTA Buttons */}
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'} className="text-xs">
                            {profile?.subscription_tier === 'pro' ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Pro
                              </>
                            ) : 'Free'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="default" className="w-full h-10 font-medium text-sm justify-center" asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full h-10 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium text-sm justify-center transition-all duration-300" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full h-10 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium text-sm justify-center transition-all duration-300" asChild>
                      <a href="/auth">
                        Log in
                      </a>
                    </Button>
                    <Button variant="default" className="w-full h-10 font-medium text-sm justify-center" asChild>
                      <a href="/auth">
                        Get Started
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>}
        
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 h-10 px-3 hover:bg-accent/50 transition-all duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      <div className="flex items-center">
                        <Badge variant={profile?.subscription_tier === 'pro' ? 'default' : 'secondary'} className="text-xs">
                          {profile?.subscription_tier === 'pro' ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </>
                          ) : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {profile?.subscription_tier !== 'pro' && (
                    <DropdownMenuItem asChild>
                      <Link to="/subscription">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-3 rounded-xl"> 
              <Button variant="ghost" className="h-8 px-4 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium text-sm text-left transition-all duration-300" asChild>
                <a href="/auth" className="bg-neutral-300">
                  Log in
                </a>
              </Button>
              <Button variant="default" className="h-8 px-3 font-medium text-sm text-left" asChild>
                <a href="/auth">
                  Get Started
                </a>
              </Button>
            </div>
          )}
        </div>

      </header>
    </motion.div>;
};
export default Header;