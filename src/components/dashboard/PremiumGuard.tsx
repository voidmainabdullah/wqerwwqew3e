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
    <div className="flex items-center justify-center min-h-[550px] p-4">
      <Card className="
        max-w-lg w-full 
        border border-zinc-700/50
        bg-zinc-900/90 backdrop-blur-xl
        shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]
        rounded-2xl
      ">
        
        {/* Header */}
        <CardHeader className="text-center space-y-4">
          
          {/* Premium Image */}
          <div className="flex justify-center">
            <img 
              src="/image-case.png"
              className="w-32 h-32 rounded-2xl shadow-xl 
                border border-zinc-600/50
                bg-gradient-to-br from-zinc-800/50 to-zinc-700/50
                p-2 object-cover"
              alt="Premium Feature"
            />
          </div>

          {/* Lock Icon */}
          <div className="
            mx-auto w-16 h-16 rounded-full
            bg-gradient-to-br from-zinc-700 to-zinc-800
            flex items-center justify-center shadow-md
            border border-zinc-600/50
          ">
            <Lock className="h-8 w-8 text-zinc-300" weight="fill" />
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-zinc-100">
                Premium Feature
              </CardTitle>
              <ProBadge size="md" />
            </div>
            <CardDescription className="text-base text-zinc-400">
              {description || `${featureName} is only available for Pro users`}
            </CardDescription>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="space-y-6">
          <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl space-y-2 shadow-inner">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <DiamondsFour className="h-4 w-4 text-zinc-400" weight="fill" />
              What you unlock in Pro:
            </h4>

            {/* Feature List */}
            <ul className="space-y-1 text-sm text-zinc-300 ml-6">
              <li>• Unlimited storage & uploads</li>
              <li>• Advanced analytics & insights</li>
              <li>• Virus scanning protection</li>
              <li>• Team collaboration features</li>
              <li>• AI-powered file organization</li>
              <li>• Password protection & download limits</li>
              <li>• Priority support</li>
            </ul>
          </div>

          {/* Upgrade Button */}
          <Button 
            onClick={() => navigate('/subscription')} 
            className="
              w-full text-zinc-100 text-lg py-6
              bg-gradient-to-r from-zinc-700 to-zinc-800
              hover:from-zinc-600 hover:to-zinc-700
              border border-zinc-600/50
              rounded-xl shadow-lg
              transition-all duration-200
            "
          >
            <DiamondsFour className="mr-2 h-5 w-5" weight="fill" />
            Upgrade to Pro
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};
