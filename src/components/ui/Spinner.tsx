import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return (
    <Loader2 
      className={cn(sizeMap[size], 'animate-spin text-primary', className)} 
    />
  );
};

export default Spinner;
