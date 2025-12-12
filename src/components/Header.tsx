// Header.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LordIcon, LordIcons } from "@/components/ui/LordIcon";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Logo from "./Logo";

const Header = () => {
  const { actualTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const [activePage, setActivePage] = useState("features");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setActivePage(page);
    document.getElementById(page)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setMobileMenuOpen((p) => !p);
  const handleSignOut = async () => await signOut();

  const initials =
    user?.user_metadata?.display_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const name =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-background/70 shadow-md"
          : "bg-transparent"
      }`}
    >
      {/* Subtle animated glow line */}
      <motion.div
        className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-8 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition"
          onClick={toggleMobileMenu}
        >
        {mobileMenuOpen ? (
            <LordIcon src={LordIcons.close} size={24} trigger="hover" primaryColor="#ffffff" />
          ) : (
            <LordIcon src={LordIcons.menu} size={24} trigger="hover" primaryColor="#ffffff" />
          )}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
          <ToggleGroup
            type="single"
            value={activePage}
            onValueChange={(v) => v && setActivePage(v)}
            className="bg-background/70 border border-border rounded-xl backdrop-blur-md shadow-sm"
          >
            <ToggleGroupItem
              value="features"
              onClick={handleNavClick("features")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                activePage === "features"
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Features
            </ToggleGroupItem>

            {/* Products Dropdown */}
            <div className="relative group">
              <ToggleGroupItem
                value="products"
                className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
              >
                Products
                <LordIcon src={LordIcons.arrowDown} size={14} trigger="hover" primaryColor="#ffffff" />
              </ToggleGroupItem>
              <div className="absolute top-full left-0 mt-2 w-52 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.fileStack} size={18} trigger="hover" primaryColor="#ffffff" /> File Storage
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.users} size={18} trigger="hover" primaryColor="#ffffff" /> Team Collaboration
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.shield} size={18} trigger="hover" primaryColor="#ffffff" /> Enterprise Security
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.code} size={18} trigger="hover" primaryColor="#ffffff" /> API Platform
                </a>
              </div>
            </div>

            <ToggleGroupItem
              value="pricing"
              onClick={handleNavClick("pricing")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                activePage === "pricing"
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Pricing
            </ToggleGroupItem>

            {/* Resources Dropdown */}
            <div className="relative group">
              <ToggleGroupItem
                value="resources"
                className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
              >
                Resources
                <LordIcon src={LordIcons.arrowDown} size={14} trigger="hover" primaryColor="#ffffff" />
              </ToggleGroupItem>
              <div className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <a
                  href="/docs"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.book} size={18} trigger="hover" primaryColor="#ffffff" /> Documentation
                </a>
                <a
                  href="/blog"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.newspaper} size={18} trigger="hover" primaryColor="#ffffff" /> Blog
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.briefcase} size={18} trigger="hover" primaryColor="#ffffff" /> Case Studies
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition"
                >
                  <LordIcon src={LordIcons.support} size={18} trigger="hover" primaryColor="#ffffff" /> Support
                </a>
              </div>
            </div>
          </ToggleGroup>
        </nav>

        {/* Right: Profile / Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-3 h-11 px-2 pr-3 rounded-full border border-border/50 bg-background/50 hover:bg-accent/10 hover:border-border transition-all duration-200 group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.subscription_tier === "pro" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-background flex items-center justify-center">
                        <LordIcon src={LordIcons.crown} size={8} trigger="hover" primaryColor="#ffffff" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {profile?.subscription_tier === "pro" ? "Pro Member" : "Free Plan"}
                    </span>
                  </div>
                  <LordIcon 
                    src={LordIcons.arrowDown} 
                    size={14} 
                    trigger="hover" 
                    primaryColor="currentColor" 
                    className="text-muted-foreground group-hover:text-foreground transition-colors ml-1" 
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 p-2 bg-background border-border/80 backdrop-blur-xl shadow-xl rounded-xl"
              >
                {/* Profile Header */}
                <div className="px-2 py-3 mb-2 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <Badge
                        variant={profile?.subscription_tier === "pro" ? "default" : "secondary"}
                        className="mt-1.5 text-[10px] h-5 px-2"
                      >
                        {profile?.subscription_tier === "pro" ? (
                          <span className="flex items-center gap-1">
                            <LordIcon src={LordIcons.crown} size={10} trigger="hover" primaryColor="#ffffff" /> Pro Plan
                          </span>
                        ) : (
                          "Free Plan"
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LordIcon src={LordIcons.dashboard} size={16} trigger="hover" primaryColor="hsl(var(--primary))" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                  <Link to="/dashboard/settings" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <LordIcon src={LordIcons.settings} size={16} trigger="hover" primaryColor="hsl(var(--muted-foreground))" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </Link>
                </DropdownMenuItem>

                {profile?.subscription_tier !== "pro" && (
                  <>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20">
                      <Link to="/subscription" className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <LordIcon src={LordIcons.crown} size={16} trigger="hover" primaryColor="#ffffff" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Upgrade to Pro</span>
                          <span className="text-[10px] text-muted-foreground">Unlock all features</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="rounded-lg h-10 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <LordIcon src={LordIcons.logout} size={16} trigger="hover" primaryColor="hsl(var(--destructive))" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="rounded-full px-4">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="rounded-full px-5 shadow-lg shadow-primary/25">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-4 right-4 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-4 z-50 space-y-3">
          <a
            href="#features"
            onClick={handleNavClick("features")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <LordIcon src={LordIcons.dot} size={18} trigger="hover" primaryColor="#ffffff" /> Features
          </a>
          <a
            href="#pricing"
            onClick={handleNavClick("pricing")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <LordIcon src={LordIcons.dollar} size={18} trigger="hover" primaryColor="#ffffff" /> Pricing
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Products
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Resources
          </a>
          <div className="pt-2 border-t border-border" />
          {user ? (
            <>
              <Button asChild className="w-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </motion.header>
  );
};

export default Header;
