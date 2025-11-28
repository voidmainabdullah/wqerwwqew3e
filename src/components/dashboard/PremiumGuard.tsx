import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/ProBadge';
import { Lock, DiamondsFour } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGuardProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({ 
  children, 
  featureName,
  description 
}) => {
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className="max-w-lg w-full border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" weight="fill" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-2xl">Premium Feature</CardTitle>
              <ProBadge size="md" />
            </div>
            <CardDescription className="text-base">
              {description || `${featureName} is only available for Pro users`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-heading font-semibold flex items-center gap-2">
              <DiamondsFour className="h-4 w-4 text-amber-500" weight="fill" />
              What you'll get with Pro:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Unlimited storage & uploads</li>
              <li>• Advanced analytics & insights</li>
              <li>• Virus scanning protection</li>
              <li>• Team collaboration features</li>
              <li>• AI-powered file organization</li>
              <li>• Password protection & download limits</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <Button 
            onClick={() => navigate('/subscription')} 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            size="lg"
          >
            <DiamondsFour className="mr-2 h-5 w-5" weight="fill" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};