import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Paddle webhook received:", body);

    // Handle subscription events
    if (body.event_type === "subscription.activated" || 
        body.event_type === "subscription.updated" ||
        body.event_type === "transaction.completed") {
      
      const customData = body.data?.custom_data;
      const userId = customData?.user_id;
      
      if (!userId) {
        console.error("No user_id found in webhook data");
        return new Response("No user_id found", { status: 400 });
      }

      // Calculate subscription end date (monthly or yearly)
      const now = new Date();
      const isYearly = body.data?.billing_cycle?.interval === "year";
      const subscriptionEndDate = new Date(now);
      subscriptionEndDate.setMonth(now.getMonth() + (isYearly ? 12 : 1));

      // Update user profile to pro
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          subscription_end_date: subscriptionEndDate.toISOString(),
          storage_limit: null, // Unlimited storage for pro
          storage_used: null // Reset storage tracking for pro users
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        return new Response("Database update failed", { status: 500 });
      }

      console.log(`User ${userId} upgraded to pro successfully`);
    }

    // Handle subscription cancellation
    if (body.event_type === "subscription.canceled" || 
        body.event_type === "subscription.paused") {
      
      const customData = body.data?.custom_data;
      const userId = customData?.user_id;
      
      if (userId) {
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            storage_limit: 6442450944, // Back to 6GB limit
            storage_used: null // Keep current storage usage
          })
          .eq('id', userId);

        if (error) {
          console.error("Error downgrading profile:", error);
        } else {
          console.log(`User ${userId} downgraded to free successfully`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});