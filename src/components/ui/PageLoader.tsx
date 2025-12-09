import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
  text?: string;
}

export const PageLoader = ({ className, text }: PageLoaderProps) => {
  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <Spinner size="xl" className="text-primary" />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default PageLoader;
