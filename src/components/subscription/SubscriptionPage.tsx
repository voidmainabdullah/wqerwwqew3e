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

  // Paddle Hosted Checkout Links (from Paddle dashboard)
  // These include passthrough parameter for user identification
  const PADDLE_CHECKOUT_BASE = "https://sandbox-checkout-service.paddle.com/transaction-checkout";
  
  // Replace with your actual Paddle product/price checkout links
  const paddleCheckoutLinks = {
    // Monthly Pro plan - replace with your actual Paddle hosted checkout link
    monthly: "https://sandbox-pay.paddle.io/hsc_01kbnh9xfbrrjdshk5ppmcff4k_652dx1e709v3e33edy8d8w7rwh1e9hez",
    // Yearly Pro plan (if you have one)
    yearly: "https://sandbox-pay.paddle.io/hsc_01kb6ayrhtz5kdax3h891s0k70_k6epa0rq35v905a580gwckj5mqbk72hy",
  };

  const handleSubscribe = (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to subscribe.",
      });
      return;
    }

    setIsLoading(true);

    // Get the base checkout URL
    let checkoutUrl = paddleCheckoutLinks[plan];
    
    // Add passthrough data with user_id for webhook identification
    // Paddle accepts passthrough as a URL parameter
    const passthrough = encodeURIComponent(JSON.stringify({
      user_id: user.id,
      user_email: user.email,
    }));
    
    // Append passthrough to the checkout URL
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    checkoutUrl = `${checkoutUrl}${separator}passthrough=${passthrough}`;
    
    // Add success and cancel URLs
    const successUrl = encodeURIComponent(`${window.location.origin}/subscription-success`);
    const cancelUrl = encodeURIComponent(`${window.location.origin}/subscription`);
    checkoutUrl = `${checkoutUrl}&success_url=${successUrl}&cancel_url=${cancelUrl}`;

    // Redirect to Paddle checkout
    window.location.href = checkoutUrl;
  };

  const features = {
    free: [
      "5GB storage",
      "2GB per file",
      "Auto-delete after 2 days",
      "Basic file sharing",
      "Community support",
    ],
    pro: [
      "Unlimited storage",
      "10GB per file",
      "No auto-delete",
      "Custom link expiry",
      "Download limits",
      "Analytics dashboard",
      "Password protection",
      "Virus scan",
      "Team sharing",
      "AI file organizer",
      "Priority support",
    ],
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 bg-background/70 backdrop-blur-sm min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-heading font-bold tracking-tight">
              {isPro ? "You're on Pro!" : "Upgrade to Pro"}
            </h1>
            <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
              {isPro 
                ? "Thank you for being a Pro member. Enjoy all premium features!"
                : "Unlock unlimited storage, advanced analytics, and premium features."}
            </p>
          </div>

          {/* Current Plan Status (if Pro) */}
          {isPro && (
            <div className="max-w-md mx-auto">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" weight="fill" />
                <h3 className="text-xl font-semibold text-green-500 mb-2">Pro Plan Active</h3>
                {subscriptionEndDate && (
                  <p className="text-sm text-muted-foreground">
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
            />

            <PriceCard
              title="Pro"
              price="$9.99"
              period="month"
              description="Best for power users"
              features={features.pro}
              isPopular
              loading={isLoading}
              disabled={isPro}
              onSubscribe={() => handleSubscribe("monthly")}
            />
          </div>

          {/* FAQ or Additional Info */}
          <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground space-y-2">
            <p>Secure payment powered by Paddle. Cancel anytime.</p>
            <p>Questions? Contact support@skie.app</p>
          </div>
        </div>
      </div>
    </div>
  );
};
