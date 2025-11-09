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

// ✅ Correct Lucide import
import { AlignRight } from "lucide-react";

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
            <AlignRight />  {/* ✅ replaced TextAlignEnd with AlignRight */}
          ) : (
            <LordIcon
              src={LordIcons.menu}
              size={24}
              trigger="hover"
              primaryColor="#ffffff"
            />
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

            {/* Dropdowns and rest of nav stay same ... */}
          </ToggleGroup>
        </nav>

        {/* Profile / Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            // dropdown menu (same as your version)
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
                          <LordIcon
                            src={LordIcons.crown}
                            size={12}
                            trigger="hover"
                            primaryColor="#ffffff"
                          />{" "}
                          Pro
                        </>
                      ) : (
                        "Free"
                      )}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              {/* rest of dropdown same */}
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

      {/* Mobile Menu (unchanged) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-4 right-4 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-4 z-50 space-y-3">
          {/* mobile links */}
          <a
            href="#features"
            onClick={handleNavClick("features")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <LordIcon
              src={LordIcons.dot}
              size={18}
              trigger="hover"
              primaryColor="#ffffff"
            />{" "}
            Features
          </a>
          {/* rest same */}
        </div>
      )}
    </motion.header>
  );
};

export default Header;
