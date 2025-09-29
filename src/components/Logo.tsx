import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Logo = () => {
  const { actualTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-3">
      <div className="logo-container relative group">
        {/* Main Logo */}
        <img 
          src="/sky.png" 
          alt="SkieShare Logo" 
          className={`h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain transition-all duration-500 relative z-10 ${
            actualTheme === 'light' 
              ? 'filter brightness-95 contrast-105' 
              : 'filter brightness-110 contrast-110'
          }`} 
        />
        
        {/* Professional Glow Effect */}
        <div className={`logo-glow absolute inset-0 transition-all duration-500 ${
          actualTheme === 'light' 
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20' 
            : 'bg-gradient-to-br from-blue-400/30 to-cyan-400/30'
        }`}>
          <img 
            src="/sky.png" 
            alt="Logo Glow" 
            className="h-full w-auto object-contain opacity-60" 
          />
        </div>
        
        {/* Subtle Border Ring */}
        <div className={`absolute inset-0 rounded-xl border transition-all duration-500 opacity-0 group-hover:opacity-100 ${
          actualTheme === 'light' 
            ? 'border-blue-500/20' 
            : 'border-cyan-400/30'
        }`} />
      </div>
      
      {/* Brand Text (Optional - can be hidden on mobile) */}
      <div className="hidden sm:block">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl lg:text-2xl font-heading font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            SkieShare
          </h1>
          <p className="text-xs md:text-sm font-body text-muted-foreground tracking-wide">
            Secure • Fast • Control
          </p>
        </div>
      </div>
    </div>
  );
};

export default Logo;