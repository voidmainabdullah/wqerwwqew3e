import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
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

  // If user is Pro, render children without any guard
  if (isPro) {
    return <>{children}</>;
  }

  // User is Free/Basic - show upgrade prompt
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-3xl border border-neutral-700 bg-red-600 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center space-y-5">
              {/* Lock Icon */}
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Lock className="h-5 w-5 text-neutral-700" weight="fill" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                    Premium Feature
                  </h2>
                  <ProBadge size="sm" />
                </div>
                <p className="text-base text-slate-200">
                  {description || `${featureName} is only available for Pro users`}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 bg-zinc-800 p-4 rounded-lg border border-zinc-100/30">
                <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <DiamondsFour className="h-4 w-4 text-amber-500" weight="fill" />
                  What you unlock in Pro:
                </h4>
                <ul className="space-y-1.5 text-xs text-white/70 ml-5">
                  <li>• Unlimited storage & uploads</li>
                  <li>• Advanced analytics & insights</li>
                  <li>• Virus scanning protection</li>
                  <li>• Team collaboration</li>
                  <li>• AI file organization</li>
                  <li>• Password protection & download limits</li>
                  <li>• Priority support</li>
                </ul>
              </div>

              {/* Button */}
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full text-sm font-semibold py-4 bg-white/90 text-zinc-900 border-2 border-zinc-900 hover:bg-white/60 hover:text-white rounded-xl shadow-md transition-all duration-200"
              >
                <DiamondsFour className="mr-2 h-4 w-4" weight="fill" />
                Upgrade to Pro
              </Button>
            </div>

            {/* Right Image */}
            <div className="md:w-1/3 hidden md:flex items-center justify-center p-4 bg-neutral-800">
              <img
                src="/neon-wave.png"
                className="w-full h-full rounded-lg object-cover"
                alt="Premium Feature"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
