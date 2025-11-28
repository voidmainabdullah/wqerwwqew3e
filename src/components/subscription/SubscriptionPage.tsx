import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in first to subscribe",
      });
      window.location.href = "/auth"; // redirect if not logged in
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) throw new Error("No valid session found");

      const { data, error } = await supabase.functions.invoke("create-paddle-checkout", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // required for function
        },
        body: { plan },
      });

      if (error) throw new Error(error.message || "Failed to create checkout");
      if (data?.error) throw new Error(data.error);

      if (data?.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast({
          title: "Checkout opened",
          description: "Complete your subscription in the new tab",
        });
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Subscription error",
        description: err.message || "Failed to create subscription",
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
