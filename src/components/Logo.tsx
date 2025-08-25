import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img 
          src="/sky.png" 
          alt="Logo" 
          className="h-14 w-auto sm:h-15 md:h-16 object-contain transition-all duration-300 hover:scale-105"
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 blur-sm opacity-30 hover:opacity-50 transition-opacity duration-300">
          <img 
            src="/sky.png" 
            alt="Logo Glow" 
            className="h-20 w-auto sm:h-10 md:h-12 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Logo;