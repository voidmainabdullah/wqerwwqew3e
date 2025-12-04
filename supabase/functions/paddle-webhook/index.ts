import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Paddle webhook received:", JSON.stringify(body, null, 2));

    // Paddle sends different event formats
    // For hosted checkout, look for alert_name or event_type
    const eventType = body.alert_name || body.event_type;
    console.log("Event type:", eventType);

    // Parse passthrough data (contains user_id)
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Try to get user info from passthrough (hosted checkout)
    if (body.passthrough) {
      try {
        const passthrough = typeof body.passthrough === 'string' 
          ? JSON.parse(body.passthrough) 
          : body.passthrough;
        userId = passthrough.user_id;
        userEmail = passthrough.user_email;
        console.log("Parsed passthrough - userId:", userId, "email:", userEmail);
      } catch (e) {
        console.error("Failed to parse passthrough:", e);
      }
    }

    // Also check custom_data (API checkout)
    if (!userId && body.data?.custom_data) {
      userId = body.data.custom_data.user_id;
      userEmail = body.data.custom_data.user_email;
      console.log("Got userId from custom_data:", userId);
    }

    // Handle subscription/payment success events
    const successEvents = [
      // Hosted checkout events
      "subscription_created",
      "subscription_updated", 
      "subscription_payment_succeeded",
      "payment_succeeded",
      // API events
      "subscription.activated",
      "subscription.updated",
      "transaction.completed"
    ];

    if (successEvents.includes(eventType)) {
      if (!userId) {
        console.error("No user_id found in webhook data");
        // Try to find user by email as fallback
        if (userEmail || body.email) {
          const email = userEmail || body.email;
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
          
          if (profile) {
            userId = profile.id;
            console.log("Found userId by email:", userId);
          }
        }
      }

      if (!userId) {
        console.error("Could not identify user for upgrade");
        return new Response(
          JSON.stringify({ error: "Could not identify user" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Calculate subscription end date
      const now = new Date();
      const billingInterval = body.billing_cycle?.interval || body.data?.billing_cycle?.interval;
      const isYearly = billingInterval === "year";
      const subscriptionEndDate = new Date(now);
      subscriptionEndDate.setMonth(now.getMonth() + (isYearly ? 12 : 1));

      // Get Paddle IDs
      const paddleCustomerId = body.user_id || body.customer_id || body.data?.customer_id;
      const paddleSubscriptionId = body.subscription_id || body.data?.subscription_id || body.data?.id;

      // Update user profile to pro
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          subscription_end_date: subscriptionEndDate.toISOString(),
          storage_limit: null, // Unlimited storage for pro
          daily_upload_limit: null, // Unlimited uploads for pro
          paddle_customer_id: paddleCustomerId,
          paddle_subscription_id: paddleSubscriptionId
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        return new Response(
          JSON.stringify({ error: "Database update failed", details: error.message }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log(`User ${userId} upgraded to pro successfully!`);
    }

    // Handle subscription cancellation events
    const cancelEvents = [
      "subscription_cancelled",
      "subscription_canceled", 
      "subscription_paused",
      "subscription.canceled",
      "subscription.paused"
    ];

    if (cancelEvents.includes(eventType)) {
      if (userId) {
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            storage_limit: 5368709120, // Back to 5GB limit for free
            daily_upload_limit: 999999999,
          })
          .eq('id', userId);

        if (error) {
          console.error("Error downgrading profile:", error);
        } else {
          console.log(`User ${userId} downgraded to free`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, event: eventType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
