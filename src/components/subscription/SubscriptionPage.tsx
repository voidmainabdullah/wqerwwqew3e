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

  // Paddle checkout handler
  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in first to subscribe",
      });
      // Redirect link suggestion
      window.location.href = "/auth";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-paddle-checkout", {
        // Client should not send session token; server uses API key
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
        throw new Error("No checkout URL received from server");
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
    free: [
      "2GB storage limit",
      "500MB per file",
      "Basic file sharing",
      "Community support",
    ],
    basic: [
      "5GB storage limit",
      "2GB per file upload",
      "Files auto-delete after 24 hours",
      "3-day link expiry",
      "Email support",
    ],
    pro: [
      "Unlimited storage",
      "10GB per file upload",
      "No auto-deletion",
      "Custom expiry dates",
      "Download limits & analytics",
      "Password protection",
      "Virus scanning",
      "Team file sharing",
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
              Because Your Files Deserve Better!
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <PriceCard
              title="Free"
              price="$0"
              period="forever"
              description="Perfect for trying out"
              features={features.free}
              onSubscribe={() =>
                toast({
                  title: "Already on Free plan",
                  description: "You're currently using the free plan",
                })
              }
            />
            <PriceCard
              title="Basic"
              price="$0"
              period="forever"
              description="Basic usage with limits"
              features={features.basic}
              onSubscribe={() =>
                toast({
                  title: "Basic Plan",
                  description: "Basic plan is free with auto-deletion",
                })
              }
            />
            <PriceCard
              title="Pro"
              price="$9.99"
              period="month"
              description="Unlimited everything"
              features={features.pro}
              isPopular={true}
              onSubscribe={() => handleSubscribe("monthly")}
            />
          </div>

          {/* Why Upgrade Section */}
          <Card className="max-w-4xl mx-auto brand-card border-brand-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-heading">
                Why Upgrade to Pro?
              </CardTitle>
              <CardDescription className="font-body">
                Unlock premium features to supercharge your file sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-heading font-medium">Unlimited Daily Uploads</h4>
                    <p className="text-sm font-body text-muted-foreground">
                      Never worry about hitting limits. Share as much as you need.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-heading font-medium">Custom Expiry Dates</h4>
                    <p className="text-sm font-body text-muted-foreground">
                      Set file expiry on your terms — days, months, or forever.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-heading font-medium">Password Protection</h4>
                    <p className="text-sm font-body text-muted-foreground">
                      Add a layer of security to your sensitive files.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-heading font-medium">Download Analytics</h4>
                    <p className="text-sm font-body text-muted-foreground">
                      Know when and how your files are accessed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
