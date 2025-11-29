import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGuardProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  imageSrc?: string; // new (optional)
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({
  children,
  featureName,
  description,
  imageSrc
}) => {
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  if (isPro) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[550px] p-6">
      <Card className="max-w-4xl w-full bg-zinc-900 text-white rounded-xl shadow-xl p-8 border border-zinc-800 flex gap-8">

        {/* LEFT — Image */}
        <div className="flex-1 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 aspect-video">
          <img
            src={imageSrc || '/default-placeholder.png'}
            alt={featureName}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.currentTarget.src = '/default-placeholder.png';
              e.currentTarget.classList.add('opacity-50');
            }}
          />
        </div>

        {/* RIGHT — Content */}
        <div className="flex-1 flex flex-col justify-between space-y-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-700/20 border border-zinc-600">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold">{featureName}</h2>
            </div>
            <p className="text-zinc-400 text-sm">
              {description || `${featureName} is available only for Pro users.`}
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Why Upgrade?</h3>
            <ul className="space-y-2">
              {[
                "Unlock all premium tools",
                "Advanced analytics & insights",
                "Enterprise-grade virus scanning",
                "AI-powered file organization",
                "Team sharing & collaboration",
                "Password protection + download limits",
                "Priority support included"
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-zinc-300 text-sm">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => navigate('/subscription')}
              className="flex-1 bg-zinc-100 text-black font-semibold hover:bg-zinc-200"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>

            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800/40"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust message */}
          <div className="p-3 rounded-lg bg-purple-800/30 border border-purple-900/75 text-center">
            <p className="text-xs text-zinc-400">
              Trusted by thousands. Secure, encrypted, reliable. Cancel anytime.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
