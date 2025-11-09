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
                  className="flex items-center gap-3 h-10 px-3 hover:bg-accent/10 transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">{name}</span>
                    <Badge
                      variant={
                        profile?.subscription_tier === "pro"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs flex items-center gap-1"
                    >
                      {profile?.subscription_tier === "pro" ? (
                        <>
                          <LordIcon src={LordIcons.crown} size={12} trigger="hover" primaryColor="#ffffff" /> Pro
                        </>
                      ) : (
                        "Free"
                      )}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-background/95 border-border backdrop-blur-md"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LordIcon src={LordIcons.dashboard} size={18} trigger="hover" primaryColor="#ffffff" className="mr-2" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center">
                    <LordIcon src={LordIcons.settings} size={18} trigger="hover" primaryColor="#ffffff" className="mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                {profile?.subscription_tier !== "pro" && (
                  <DropdownMenuItem asChild>
                    <Link to="/subscription" className="flex items-center">
                      <LordIcon src={LordIcons.crown} size={18} trigger="hover" primaryColor="#ffffff" className="mr-2" /> Upgrade to Pro
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                  <LordIcon src={LordIcons.logout} size={18} trigger="hover" primaryColor="#ffffff" className="mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
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
