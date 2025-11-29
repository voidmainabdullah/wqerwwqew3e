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
        border border-amber-500/20 
        bg-black/50 backdrop-blur-xl
        shadow-[0_0_40px_-10px_rgba(255,165,0,0.5)]
        rounded-2xl
      ">
        
        {/* Header */}
        <CardHeader className="text-center space-y-4">
          
          {/* 🔥 Premium Image */}
          <div className="flex justify-center">
            <img 
              src="/premium-lock.png"   // <<---------- Yahan apna image path daalna
              className="w-32 h-32 rounded-full shadow-xl 
                border border-amber-500/40 
                bg-gradient-to-br from-amber-500/20 to-orange-600/20 
                p-1 object-cover"
              alt="Premium Feature"
            />
          </div>

          {/* 🔒 Lock Icon */}
          <div className="
            mx-auto w-16 h-16 rounded-full
            bg-gradient-to-br from-amber-500 to-orange-600
            flex items-center justify-center shadow-md
          ">
            <Lock className="h-8 w-8 text-white" weight="fill" />
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Premium Feature
              </CardTitle>
              <ProBadge size="md" />
            </div>
            <CardDescription className="text-base text-amber-200/80">
              {description || `${featureName} is only available for Pro users`}
            </CardDescription>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="space-y-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 shadow-inner">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <DiamondsFour className="h-4 w-4 text-amber-400" weight="fill" />
              What you unlock in Pro:
            </h4>

            {/* Feature List */}
            <ul className="space-y-1 text-sm text-amber-100/80 ml-6">
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
              w-full text-white text-lg py-6
              bg-gradient-to-r from-amber-500 to-orange-600 
              hover:from-amber-600 hover:to-orange-700
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
