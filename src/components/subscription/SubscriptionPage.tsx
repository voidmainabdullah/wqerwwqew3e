import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hosted Paddle Checkout Links
   * ⚠️ These must be generated from Paddle dashboard.
   * Go to:
   * Products → Prices → Select Price → "Create Hosted Checkout Link"
   */
  const paddleLinks: Record<string, string> = {
    monthly:
      "https://sandbox-pay.paddle.io/hsc_01kb6ayrhtz5kdax3h891s0k70_k6epa0rq35v905a580gwckj5mqbk72hy",

    // ⚠️ YEARLY LINK MUST BE GENERATED FROM PADDLE (not auto)
    yearly: "", // ← paste your generated yearly checkout link here
  };

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: (
          <>
            Please{" "}
            <a href="/auth" className="text-blue-500 underline">
              log in
            </a>{" "}
            to continue.
          </>
        ),
      });
      return;
    }

    try {
      setIsLoading(true);

      const checkoutUrl = paddleLinks[plan];
      if (!checkoutUrl) {
        throw new Error(
          `Hosted checkout link not configured for the "${plan}" plan.`
        );
      }

      window.open(checkoutUrl, "_blank");

      toast({
        title: "Checkout Opened",
        description: "Complete your subscription in the new tab.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = {
    free: [
      "2GB storage",
      "500MB per file",
      "Basic file sharing",
      "Community support",
    ],
    basic: [
      "5GB storage",
      "2GB per file",
      "Auto-delete after 24h",
      "3-day link expiry",
      "Email support",
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
              Take Control of Your Files
            </h1>
            <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your workflow.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
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
              title="Basic"
              price="$0"
              period="forever"
              description="Basic usage with limitations"
              features={features.basic}
              onSubscribe={() =>
                toast({
                  title: "Basic Plan",
                  description:
                    "Basic plan features are active with auto-delete enabled.",
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
              onSubscribe={() => handleSubscribe("monthly")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
