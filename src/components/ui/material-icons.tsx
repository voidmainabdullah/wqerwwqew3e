import React from 'react';

interface MaterialIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  filled?: boolean;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ 
  icon, 
  size = 'md', 
  className = '', 
  filled = false 
}) => {
  const sizeClasses = {
    sm: 'md-18',
    md: 'md-24',
    lg: 'md-36',
    xl: 'md-48'
  };

  const iconClass = filled ? 'material-icons' : 'material-symbols-outlined';

  return (
    <span className={`${iconClass} ${sizeClasses[size]} ${className}`}>
      {icon}
    </span>
  );
};

// Common icon mappings for easy use
export const IconMap = {
  // Navigation
  home: 'home',
  dashboard: 'dashboard',
  settings: 'settings',
  
  // File operations
  upload: 'upload',
  download: 'download',
  folder: 'folder',
  file: 'description',
  share: 'share',
  
  // Security
  lock: 'lock',
  unlock: 'lock_open',
  security: 'security',
  visibility: 'visibility',
  visibilityOff: 'visibility_off',
  
  // User actions
  person: 'person',
  groups: 'groups',
  email: 'email',
  
  // Status
  check: 'check',
  error: 'error',
  warning: 'warning',
  info: 'info',
  
  // Navigation arrows
  arrowForward: 'arrow_forward',
  arrowBack: 'arrow_back',
  expandMore: 'expand_more',
  errowRight: 'arrow_top_right'
  
  // Misc
  star: 'star',
  crown: 'crown',
  analytics: 'analytics',
  payments: 'payments',
  support: 'support_agent'
} as const;

// Helper component for common icon + text combinations
interface IconTextProps {
  icon: keyof typeof IconMap;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  filled?: boolean;
}

export const IconText: React.FC<IconTextProps> = ({ 
  icon, 
  children, 
  size = 'md', 
  className = '',
  filled = false 
}) => {
  return (
    <span className={`icon-text ${className}`}>
      <MaterialIcon icon={IconMap[icon]} size={size} filled={filled} />
      {children}
    </span>
  );
};