import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
const Logo = () => {
  const { actualTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-3 group">
      <div className="relative"> 
        {/* Main Logo */}
        <img 
          src="/skie.png" 
          alt="SkieShare Logo" 
          className={`h-26 w-auto sm:h-12 md:h-14 lg:h-20 object-contain transition-all duration-500 group-hover:scale-110 ${
            actualTheme === 'light' 
              ? 'filter brightness-95 contrast-105' 
              : 'filter brightness-110 contrast-95'
          }`} 
        />
        
        {/* Professional Glow Effect */}
        <div className={`absolute inset-0 blur-md transition-all duration-500 group-hover:blur-lg ${
          actualTheme === 'light' 
            ? 'opacity-0 group-hover:opacity-20' 
            : 'opacity-0 group-hover:opacity-30'
        }`}>
          <img 
            src="/skie.png" 
            alt="SkieShare Logo Glow" 
            className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain" 
          />
        </div>
        
        {/* Subtle Ring Effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-125 ${
          actualTheme === 'light'
            ? 'bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/20 group-hover:to-blue-500/10'
            : 'bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 group-hover:from-blue-400/15 group-hover:via-blue-400/25 group-hover:to-blue-400/15'
        }`} />
      </div>
      
      {/* Brand Text - Hidden on mobile for space optimization */}
      <div className="hidden lg:block">
        <div className="flex flex-col">
          <span className={`text-xl xl:text-2xl font-heading font-bold tracking-tight transition-all duration-300 group-hover:scale-105 ${
            actualTheme === 'light'
              ? 'bg-gradient-to-r from-white/80 via-white/60 to-white bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-white/80 via-white/60 to-white bg-clip-text text-transparent'
          }`}>
            SkieShare
          </span>
          <span className="text-xs font-body text-muted-foreground tracking-wider opacity-75 group-hover:opacity-100 transition-opacity duration-300">
            Secure • Fast • Yours
          </span>
        </div>
      </div>
    </div>
  );
};
export default Logo;