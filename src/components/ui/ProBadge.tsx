import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, DiamondsFour } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'outline' | 'minimal';
  showIcon?: boolean;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ 
  size = 'sm', 
  className,
  variant = 'default',
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0',
    outline: 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    minimal: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <Badge 
      className={cn(
        'font-heading font-semibold uppercase tracking-wide',
        sizeClasses[size],
        variantClasses[variant],
        'flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Crown size={iconSizes[size]} weight="fill" />}
      Pro
    </Badge>
  );
};

export const UpgradeTooltip: React.FC<{ featureName: string }> = ({ featureName }) => {
  return (
    <div className="max-w-xs p-3 space-y-2">
      <div className="flex items-center gap-2">
        <DiamondsFour className="h-4 w-4 text-amber-500" weight="fill" />
        <p className="font-heading font-semibold text-sm">Premium Feature</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Upgrade to Pro to unlock {featureName} and many more premium features.
      </p>
    </div>
  );
};