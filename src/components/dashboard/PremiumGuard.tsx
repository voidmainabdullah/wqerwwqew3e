import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X, Crown } from 'lucide-react';

interface PremiumGaurdProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
  imageSrc: string;
}

export function  PremiumGaurd({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  imageSrc
}: ProFeatureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          max-w-4xl 
          bg-black/60 backdrop-blur-xl 
          text-white rounded-2xl 
          border border-amber-500/20 
          shadow-[0_0_40px_-12px_rgba(255,165,0,0.4)]
          p-6 flex gap-8
        "
      >
        
        {/* LEFT SECTION - PREMIUM IMAGE */}
        <div className="
          flex-1 rounded-xl overflow-hidden
          bg-gradient-to-br from-amber-500/10 to-orange-500/10
          border border-amber-400/20 
          shadow-inner flex items-center justify-center
        ">
          <img
            src={imageSrc || '/default-placeholder.png'}
            alt={featureName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/default-placeholder.png';
              e.currentTarget.classList.add('opacity-40');
            }}
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex-1 flex flex-col justify-between space-y-6">

          {/* HEADER */}
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5 text-zinc-300" />
            </button>

            <div className="flex items-center gap-3 pb-3">
              <div className="
                w-11 h-11 rounded-xl 
                bg-gradient-to-br from-amber-500 to-orange-600 
                flex items-center justify-center shadow-md border border-amber-400/30
              ">
                <Crown className="h-6 w-6 text-white" />
              </div>

              <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                {featureName}
              </DialogTitle>
            </div>

            <DialogDescription className="text-amber-200/80 text-base leading-relaxed">
              {featureDescription}
            </DialogDescription>
          </div>

          {/* WHY UPGRADE */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-300">Why Upgrade?</h3>

            <ul className="space-y-2">
              {[
                'Unlock this premium feature',
                'Boost productivity & control',
                'Enterprise-level performance',
                'Priority customer support'
              ].map((benefit, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-3 text-amber-100/80 text-sm"
                >
                  <span 
                    className="
                      w-2.5 h-2.5 rounded-full 
                      bg-gradient-to-r from-amber-400 to-orange-400
                      shadow-[0_0_8px_rgba(255,160,0,0.7)]
                      flex-shrink-0
                    "
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex gap-4 pt-2">
            <Button
              asChild
              className="
                flex-1 py-5 text-lg font-semibold 
                bg-gradient-to-r from-amber-500 to-orange-600 
                hover:from-amber-600 hover:to-orange-700
                text-white rounded-xl shadow-lg
              "
            >
              <Link to="/subscription">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="
                flex-1 text-zinc-200 rounded-xl 
                border-amber-400/20 hover:bg-white/10
              "
            >
              Maybe Later
            </Button>
          </div>

          {/* TRUST BOX */}
          <div className="
            p-3 text-center rounded-xl 
            bg-orange-900/20 border border-orange-800/40
          ">
            <p className="text-xs text-amber-200/70">
              Trusted by thousands. Fully encrypted. You can cancel anytime.
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
