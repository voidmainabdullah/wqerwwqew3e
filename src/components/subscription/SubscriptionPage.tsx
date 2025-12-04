import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CheckCircle } from "phosphor-react";
import { createClient } from "@supabase/supabase-js";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { isPro, subscriptionEndDate } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Supabase client (make sure env vars are set)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // ----------------------------
  // TEST UPGRADE: Directly make user Pro
  // ----------------------------
  const handleTestUpgrade = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to test upgrade.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "pro",
          subscription_status: "active",
          subscription_end_date: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ).toISOString(), // 1 month test
          storage_limit: null,
          daily_upload_limit: null,
        })
        .eq("id", user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Upgrade Failed",
          description: error.message,
        });
      } else {
        toast({
          variant: "success",
          title: "Upgraded Successfully!",
          description: "Your account is now Pro (for testing).",
        });
        setTimeout(() => window.location.reload(), 500); // refresh to reflect change
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
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
      "10m+++GB per file",
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
              {isPro ? "You're on Pro!" : "Upgrade to Pro (Test)"}
            </h1>
            <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
              {isPro
                ? "Thank you for being a Pro member. Enjoy all premium features!"
                : "Click the button below to test upgrade to Pro."}
            </p>
          </div>

          {/* Current Plan Status (if Pro) */}
          {isPro && (
            <div className="max-w-md mx-auto">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <CheckCircle
                  className="w-12 h-12 text-green-500 mx-auto mb-3"
                  weight="fill"
                />
                <h3 className="text-xl font-semibold text-green-500 mb-2">
                  Pro Plan Active
                </h3>
                {subscriptionEndDate && (
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews on{" "}
                    {subscriptionEndDate.toLocaleDateString()}
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
              title="Pro (Test)"
              price="$0"
              period="test"
              description="Directly upgrade to Pro (testing)"
              features={features.pro}
              isPopular
              loading={isLoading}
              disabled={isPro}
              onSubscribe={handleTestUpgrade} // Test upgrade
            />
          </div>

          {/* FAQ / Info */}
          <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground space-y-2">
            <p>This is a test upgrade. No payment will be processed.</p>
            <p>Questions? Contact support@skie.app</p>
          </div>
        </div>
      </div>
    </div>
  );
};
