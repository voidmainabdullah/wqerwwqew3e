import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
const Logo = () => {
  const {
    actualTheme
  } = useTheme();
  return <div className="flex items-left gap-3">
      <div className="relative">
        <img src="/sky.png" alt="Logo" className={`h-12 w-auto sm:h-16 md:h-20 lg:h-24 xl:h-28 object-contain transition-all duration-300 hover:scale-105 ${actualTheme === 'light' ? 'filter brightness-90 contrast-110' : ''}`} />
        
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-sm transition-opacity duration-300 ${actualTheme === 'light' ? 'opacity-10 hover:opacity-20' : 'opacity-20 hover:opacity-30'}`}>
         <img src="/sky.png" alt="Logo" className="max-h- w-auto object-contain transition-all duration-300 hover:scale-105" /> 

        </div> 
      </div>
    </div>;
};
export default Logo;