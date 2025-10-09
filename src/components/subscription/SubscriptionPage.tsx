import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield, Lightning, Upload, ChartLineUp } from "phosphor-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
export const SubscriptionPage: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to subscribe"
      });
      return;
    }
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No valid session found");
      const {
        data,
        error
      } = await supabase.functions.invoke("create-paddle-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          plan
        }
      });
      if (error) throw new Error(error.message || "Failed to create checkout");
      if (data?.error) throw new Error(data.error);
      if (data?.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast({
          title: "Checkout opened",
          description: "Complete your subscription in the new tab"
        });
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Subscription error",
        description: err.message || "Failed to create subscription"
      });
    }
  };
  const features = {
    free: ["10 uploads per day", "Basic file sharing", "7-day link expiry", "Community support"],
    pro: ["Unlimited uploads", "Password protection", "Custom expiry dates", "Download analytics", "Priority support", "Custom branding", "API access"]
  };
  return <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="relative z-10 bg-background/70 backdrop-blur-sm min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-heading font-bold tracking-tight">Get More In Your Control </h1>
            <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">Because Your Files Deserves Better !</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <PriceCard title="Free" price="$0" period="forever" description="Perfect for getting started" features={features.free} onSubscribe={() => toast({
            title: "Already on Free plan",
            description: "You're currently using the free plan"
          })} />
            <PriceCard title="Pro Monthly" price="$6.99" period="month" description="Full access with monthly billing" features={features.pro} onSubscribe={() => handleSubscribe("monthly")} />
            <PriceCard title="Pro Yearly" price="$69.99" period="year" description="Save 17% with annual billing" features={features.pro} isPopular={true} onSubscribe={() => handleSubscribe("yearly")} />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <Card className="analytics-card analytics-card-green">
              <CardHeader className="text-center">
                <div className="icon-container icon-container-green mx-auto mb-4">
                  <span className="material-icons md-24 analytics-icon analytics-icon-green">upload</span>
                </div>
                <CardTitle className="text-lg font-heading">Unlimited Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-body text-muted-foreground text-center">
                  Upload without daily restrictions and focus on your work.
                </p>
              </CardContent>
            </Card>
            <Card className="analytics-card analytics-card-red">
              <CardHeader className="text-center">
                <div className="icon-container icon-container-red mx-auto mb-4">
                  <span className="material-icons md-24 analytics-icon analytics-icon-red">security</span>
                </div>
                <CardTitle className="text-lg font-heading">Advanced Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-body text-muted-foreground text-center">
                  Protect files with passwords and custom expiry dates.
                </p>
              </CardContent>
            </Card>
            <Card className="analytics-card analytics-card-purple">
              <CardHeader className="text-center">
                <div className="icon-container icon-container-purple mx-auto mb-4">
                  <span className="material-icons md-24 analytics-icon analytics-icon-purple">analytics</span>
                </div>
                <CardTitle className="text-lg font-heading">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-body text-muted-foreground text-center">
                  Get insights on downloads and file performance.
                </p>
              </CardContent>
            </Card>
            <Card className="analytics-card analytics-card-yellow">
              <CardHeader className="text-center">
                <div className="icon-container icon-container-yellow mx-auto mb-4">
                  <span className="material-icons md-24 analytics-icon analytics-icon-yellow">support_agent</span>
                </div>
                <CardTitle className="text-lg font-heading">Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-body text-muted-foreground text-center">
                  Faster response times with dedicated support.
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="max-w-4xl mx-auto brand-card border-brand-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-heading">
                <div className="icon-container icon-container-yellow mr-3">
                  <span className="material-icons md-18 analytics-icon analytics-icon-yellow">crown</span>
                </div>
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
                      Never worry about hitting limits. Share as much as you
                      need.
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
    </div>;
};