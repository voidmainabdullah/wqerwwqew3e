import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { Menu, X, CircleDot, LayoutDashboard, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion } from 'framer-motion';
const Header = () => {
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
  return <motion.div className={`fixed top-0 left-0 right-0 z-50 pt-2 px-4 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-background/50 shadow-lg' : 'bg-transparent'}`}>
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
              <ToggleGroupItem value="features" className={cn("px-3 py-1.5 rounded-full transition-colors relative text-sm", activePage === 'features' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted')} onClick={handleNavClick('features')}>
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
                <Button variant="ghost" className="w-full h-10 bg-neutral-700 text-slate-250 font-medium text-sm justify-center" asChild>
                  <a href="/auth">
                  Log in
                  </a>
                </Button>
                <Button variant="ghost" className="w-full h-10 bg-white text-slate-950 font-medium text-sm justify-center" asChild>
                  <a href="/auth">
                  Get Started
                  </a>
                </Button>
              </div>
            </div>
          </div>}
        
       <div className="hidden md:flex items-center gap-3">
  <div className="flex gap-3 rounded-xl"> 
    <Button variant="ghost" className="h-8 px-4 bg-neutral-700 text-slate-250 font-medium text-sm text-left" asChild>
      <a href="/auth">
      Log in
      </a>
    </Button>
    <Button variant="ghost" className="h-8 px-3 bg-white text-slate-950 font-medium text-sm text-left" asChild>
      <a href="/auth">
      Get Started
      </a>
    </Button>
  </div>
</div>

      </header>
    </motion.div>;
};
export default Header;