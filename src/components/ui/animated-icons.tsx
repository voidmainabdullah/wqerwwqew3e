import React from 'react';
import { Files, ShareNetwork, Download, TrendUp } from 'phosphor-react';

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
        return <Files className="w-8 h-8 text-yellow-1" />;
      case 'shares':
        return <ShareNetwork className="w-8 h-8 text-green-400/60" />;
      case 'downloads':
        return <Download className="w-8 h-8 text-blue-400/60" />;
      case 'storage':
        return <TrendUp className="w-8 h-8 text-red-400/60" />;
      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in ${className}`}>
      <div className="animate-bounce-subtle opacity-20">
        {getIcon()}
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
          color: 'text-yellow-400',
        };
      case 'shares':
        return {
          icon: <ShareNetwork className="w-6 h-6" />,
          text: 'No shares yet',
          color: 'text-green-400',
        };
      case 'downloads':
        return {
          icon: <Download className="w-6 h-6" />,
          text: 'No downloads yet',
          color: 'text-blue-400',
        };
      case 'storage':
        return {
          icon: <TrendUp className="w-6 h-6" />,
          text: 'Storage empty',
          color: 'text-red-400',
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
      <span className={`text-xs ${content.color}`}>{content.text}</span>
    </div>
  );
};
