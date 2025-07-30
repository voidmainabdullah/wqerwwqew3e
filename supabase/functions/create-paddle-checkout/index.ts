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
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not configured");
    }

    // Get user from request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { plan } = await req.json();
    
    // Define price IDs for monthly and yearly plans
    const priceIds = {
      monthly: Deno.env.get("PADDLE_PRICE_ID_MONTHLY") || "pri_01jgy7z8vcd7md8vwj8xhqhmpb",
      yearly: Deno.env.get("PADDLE_PRICE_ID_YEARLY") || "pri_01jgy80a1vcd7md8vwj8xhqhmpb"
    };

    if (!priceIds[plan as keyof typeof priceIds]) {
      throw new Error("Invalid plan selected");
    }

    // Create transaction data
    const transactionData = {
      items: [
        {
          price_id: priceIds[plan as keyof typeof priceIds],
          quantity: 1
        }
      ],
      customer_email: user.email,
      checkout: {
        url: `${req.headers.get("origin")}/subscription-success`
      },
      billing_address: {
        country_code: "US" // Default, will be overridden in checkout
      },
      custom_data: {
        user_id: user.id
      }
    };

    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1",
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Paddle API error: ${response.status} - ${errorData}`);
    }

    const transaction = await response.json();

    return new Response(
      JSON.stringify({ 
        checkout_url: transaction.data.checkout?.url || `https://www.paddle.com/checkout?txn=${transaction.data.id}`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating Paddle checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});