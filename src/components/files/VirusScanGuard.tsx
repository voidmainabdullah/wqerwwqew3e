import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/ProBadge';
import { Shield, DiamondsFour } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VirusScanGuardProps {
  onScan: () => void;
  disabled?: boolean;
}

export const VirusScanButton: React.FC<VirusScanGuardProps> = ({ onScan, disabled }) => {
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  if (!isPro) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <Shield className="mr-2 h-4 w-4" weight="fill" />
              Scan for Viruses
              <ProBadge size="sm" className="ml-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs space-y-2">
              <div className="flex items-center gap-2">
                <DiamondsFour className="h-4 w-4 text-amber-500" weight="fill" />
                <p className="font-heading font-semibold text-sm">Premium Feature</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro to scan your files for viruses and malware.
              </p>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                onClick={() => navigate('/subscription')}
              >
                Upgrade Now
              </Button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onScan}
      disabled={disabled}
    >
      <Shield className="mr-2 h-4 w-4" weight="fill" />
      Scan for Viruses
    </Button>
  );
};