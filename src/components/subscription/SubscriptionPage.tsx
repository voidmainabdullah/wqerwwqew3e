import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CheckCircle } from "phosphor-react";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { isPro, subscriptionEndDate } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const PADDLE_CHECKOUT_URL =
    "https://sandbox-pay.paddle.io/hsc_01kbnh9xfbrrjdshk5ppmcff4k_652dx1e709v3e33edy8d8w7rwh1e9hez";

  const handleSubscribe = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to subscribe.",
      });
      return;
    }

    setIsLoading(true);

    const passthrough = JSON.stringify({ user_id: user.id, email: user.email });

    const checkoutUrl = new URL(PADDLE_CHECKOUT_URL);
    checkoutUrl.searchParams.set("passthrough", passthrough);
    checkoutUrl.searchParams.set("email", user.email || "");
    checkoutUrl.searchParams.set(
      "success_url",
      `${window.location.origin}/subscription/success`
    );

    window.location.href = checkoutUrl.toString();
  };

  const features = {
    free: ["5GB storage", "2GB per file", "Auto-delete after 2 days", "Basic file sharing", "Community support"],
    pro: ["Unlimited storage", "10m+++GB per file", "No auto-delete", "Custom link expiry", "Download limits", "Analytics dashboard", "Password protection", "Virus scan", "Team sharing", "AI file organizer", "Priority support"],
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Background animation */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 bg-gray-900/80 backdrop-blur-md min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-white">
              {isPro ? "You're on Pro!" : "Upgrade to Pro"}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {isPro
                ? "Thank you for being a Pro member. Enjoy all premium features!"
                : "Unlock unlimited storage, advanced analytics, and premium features."}
            </p>
          </div>

          {/* Pro Status */}
          {isPro && (
            <div className="max-w-md mx-auto">
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6 text-center backdrop-blur-sm">
                <CheckCircle
                  className="w-12 h-12 text-green-400 mx-auto mb-3"
                  weight="fill"
                />
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  Pro Plan Active
                </h3>
                {subscriptionEndDate && (
                  <p className="text-sm text-gray-300">
                    Your subscription renews on {subscriptionEndDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <PriceCard
              title="Free"
              price="$0"
              period="forever"
              description="Perfect for getting started"
              features={features.free}
              onSubscribe={() =>
                toast({
                  title: "Free Plan",
                  description: "You are already using the free plan.",
                })
              }
              className="bg-gray-800 hover:bg-gray-700 shadow-lg shadow-black/20 border border-gray-700"
            />

            <PriceCard
              title="Pro"
              price="$9.99"
              period="month"
              description="Unlock all premium features"
              features={features.pro}
              isPopular
              loading={isLoading}
              disabled={isPro}
              onSubscribe={handleSubscribe}
              className="bg-gradient-to-br from-indigo-600 via-cyan-500 to-teal-400 text-white shadow-xl border border-transparent hover:brightness-110"
            />
          </div>

          {/* Bottom Notes */}
          <div className="max-w-2xl mx-auto text-center text-sm text-gray-400 space-y-2">
            <p>Secure payments powered by Paddle. Cancel anytime.</p>
            <p>Questions? Contact <a href="mailto:support@skie.app" className="text-cyan-400 underline">support@skie.app</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};
