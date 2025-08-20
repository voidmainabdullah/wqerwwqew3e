import React from 'react';
import { Files, Share, Download, TrendingUp } from 'lucide-react';

interface AnimatedIconProps {
  show: boolean;
  type: 'files' | 'shares' | 'downloads' | 'storage';
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ show, type, className = '' }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'files':
        return <Files className="w-8 h-8 text-yellow-400/60" />;
      case 'shares':
        return <Share className="w-8 h-8 text-green-400/60" />;
      case 'downloads':
        return <Download className="w-8 h-8 text-blue-400/60" />;
      case 'storage':
        return <TrendingUp className="w-8 h-8 text-red-400/60" />;
      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in ${className}`}>
      <div className="animate-bounce-subtle opacity-40">
        {getIcon()}
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-current rounded-full animate-float opacity-30" 
             style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-current rounded-full animate-float opacity-30" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-current rounded-full animate-float opacity-30" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-current rounded-full animate-float opacity-30" 
             style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Pulsing ring effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border border-current rounded-full animate-ping opacity-20" 
             style={{ animationDuration: '3s' }} />
      </div>
    </div>
  );
};

interface EmptyStateIconProps {
  type: 'files' | 'shares' | 'downloads' | 'storage';
  className?: string;
}

export const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({ type, className = '' }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'files':
        return {
          icon: <Files className="w-6 h-6" />,
          text: 'No files yet',
          color: 'text-yellow-400'
        };
      case 'shares':
        return {
          icon: <Share className="w-6 h-6" />,
          text: 'No shares yet',
          color: 'text-green-400'
        };
      case 'downloads':
        return {
          icon: <Download className="w-6 h-6" />,
          text: 'No downloads yet',
          color: 'text-blue-400'
        };
      case 'storage':
        return {
          icon: <TrendingUp className="w-6 h-6" />,
          text: 'Storage empty',
          color: 'text-red-400'
        };
      default:
        return null;
    }
  };

  const content = getEmptyStateContent();
  if (!content) return null;

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in ${className}`}>
      <div className={`${content.color} animate-bounce-subtle opacity-50 mb-1`}>
        {content.icon}
      </div>
      <span className="text-xs text-muted-foreground/60 animate-pulse">
        {content.text}
      </span>
    </div>
  );
};