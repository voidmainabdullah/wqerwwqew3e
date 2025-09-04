import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-left gap-3">
      <div className="relative">
        <img 
          src="/sky.png" 
          alt="Logo" 
          className="logo-responsive object-contain transition-all duration-300 hover:scale-105 filter brightness-110 contrast-110"
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 blur-sm transition-opacity duration-300 opacity-20 hover:opacity-30">
          <img 
            src="/sky.png"
            alt="Logo"
            className="logo-responsive object-contain transition-all duration-300 hover:scale-105"
          /> 
        </div> 
      </div>
    </div> 
  );
};

export default Logo;