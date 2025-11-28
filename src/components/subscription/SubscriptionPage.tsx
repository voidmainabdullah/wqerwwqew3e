import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Hosted Paddle links for test/live
  const paddleLinks: Record<string, string> = {
    monthly: "https://sandbox-pay.paddle.io/hsc_01kb6ayrhtz5kdax3h891s0k70_k6epa0rq35v905a580gwckj5mqbk72hy",
    yearly: "https://sandbox-pay.paddle.io/hsc_YOUR_YEARLY_LINK_HERE",
  };

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: (
          <>
            Please <a href="/auth" className="text-blue-500 underline">log in</a> first.
          </>
        ),
      });
      return;
    }

    try {
      // Open Paddle hosted checkout
      const checkoutUrl = paddleLinks[plan];
      if (!checkoutUrl) throw new Error("Checkout link not configured for this plan");

      window.open(checkoutUrl, "_blank");
      toast({
        title: "Checkout opened",
        description: "Complete your subscription in the new tab",
      });

      // Optional: Poll/check after redirect to update Supabase plan automatically
      // This requires a backend function or webhook to verify payment
      // Example: await supabase.functions.invoke('verify-paddle-payment', { user_id: user.id });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Subscription error",
        description: err.message,
      });
    }
  };

  const features = {
    free: ["2GB storage", "500MB per file", "Basic file sharing", "Community support"],
    basic: ["5GB storage", "2GB per file", "Auto-delete after 24h", "3-day link expiry", "Email support"],
    pro: ["Unlimited storage", "10GB per file", "No auto-delete", "Custom expiry", "Analytics", "Password protection", "Virus scan", "Team sharing", "AI organizer", "Priority support"],
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 bg-background/70 backdrop-blur-sm min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-heading font-bold tracking-tight">Take Control of Your Files</h1>
            <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
              Because Your Files Deserve Better!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <PriceCard
              title="Free"
              price="$0"
              period="forever"
              description="Perfect for trying out"
              features={features.free}
              onSubscribe={() => toast({ title: "Free Plan", description: "You are on the free plan" })}
            />
            <PriceCard
              title="Basic"
              price="$0"
              period="forever"
              description="Basic usage with limits"
              features={features.basic}
              onSubscribe={() => toast({ title: "Basic Plan", description: "Basic plan is free with auto-deletion" })}
            />
            <PriceCard
              title="Pro"
              price="$9.99"
              period="month"
              description="Unlimited everything"
              features={features.pro}
              isPopular
              onSubscribe={() => handleSubscribe("monthly")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
