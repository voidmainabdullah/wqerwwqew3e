import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  showText = true,
  text = 'Loading...',
  className = '' 
}) => {
  const { actualTheme } = useTheme();
  
  const sizeClasses = {
    sm: { logo: 'h-8 w-8', text: 'text-sm', container: 'gap-2' },
    md: { logo: 'h-12 w-12', text: 'text-base', container: 'gap-3' },
    lg: { logo: 'h-16 w-16', text: 'text-lg', container: 'gap-4' },
    xl: { logo: 'h-20 w-20', text: 'text-xl', container: 'gap-5' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${currentSize.container} ${className}`}>
      {/* Animated Logo Container */}
      <div className="relative">
        {/* Main Logo with Rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${currentSize.logo} relative`}
        >
          <img 
            src="/sky.png" 
            alt="SkieShare Logo" 
            className={`${currentSize.logo} object-contain`}
          />
        </motion.div>
        
        {/* Orbital Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 ${currentSize.logo} border-2 border-dashed rounded-full ${
            actualTheme === 'light' 
              ? 'border-blue-400/30' 
              : 'border-blue-400/40'
          }`}
        />
        
        {/* Pulsing Glow Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 ${currentSize.logo} rounded-full blur-md ${
            actualTheme === 'light' 
              ? 'bg-blue-400/20' 
              : 'bg-blue-400/30'
          }`}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -20, -10],
              x: [0, 5, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            className={`absolute w-1 h-1 rounded-full ${
              actualTheme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
            }`}
            style={{
              top: `${20 + i * 15}%`,
              left: `${30 + i * 20}%`
            }}
          />
        ))}
      </div>

      {/* Animated Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-2"
        >
          {/* Brand Name */}
          <motion.h2
            animate={{ 
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`font-heading font-bold tracking-tight ${currentSize.text} ${
              actualTheme === 'light'
                ? 'bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent'
            }`}
          >
            SkieShare
          </motion.h2>
          
          {/* Loading Text */}
          <motion.p
            animate={{ 
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className={`font-body text-muted-foreground ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 
              size === 'lg' ? 'text-base' : 'text-lg'
            }`}
          >
            {text}
          </motion.p>
          
          {/* Loading Dots */}
          <div className="flex items-center justify-center space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className={`w-2 h-2 rounded-full ${
                  actualTheme === 'light' ? 'bg-blue-600' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Professional Page Loading Component
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

// Inline Loading Component for smaller areas
export const InlineLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
};

// Button Loading State
export const ButtonLoader: React.FC = () => {
  return (
    <LoadingSpinner size="sm" showText={false} className="mr-2" />
  );
};