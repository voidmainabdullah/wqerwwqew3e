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
    console.log("Starting checkout creation...");
    
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) {
      console.error("PADDLE_API_KEY is not configured");
      throw new Error("PADDLE_API_KEY is not configured");
    }
    
    // Validate API key format (should start with 'apikey_')
    if (!paddleApiKey.startsWith('apikey_')) {
      console.error("Invalid Paddle API key format - should start with 'apikey_'");
      throw new Error("Invalid Paddle API key format");
    }
    
    console.log("Paddle API key found and validated");

    // Get user from request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("No authorization header");
    }
    console.log("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    console.log("Attempting to get user from token...");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      console.error("User not found or no email:", user);
      throw new Error("User not authenticated or email not available");
    }
    console.log("User authenticated:", user.email);

    const { plan } = await req.json();
    
    // Define price IDs for monthly and yearly plans
    const priceIds = {
      monthly: Deno.env.get("PADDLE_PRICE_ID_MONTHLY") || "pri_01k1n1c47khbpnamppf3rtd52b",
      yearly: Deno.env.get("PADDLE_PRICE_ID_YEARLY") || "pri_01k1n1c47khbpnamppf3rtd52b"
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

    console.log("Transaction data being sent:", JSON.stringify(transactionData, null, 2));
    console.log("Making request to Paddle API...");
    
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1"
      },
      body: JSON.stringify(transactionData),
    });

    console.log("Paddle API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Paddle API error response:", errorData);
      throw new Error(`Paddle API error: ${response.status} - ${errorData}`);
    }

    const transaction = await response.json();
    console.log("Paddle transaction response:", JSON.stringify(transaction, null, 2));

    const checkoutUrl = transaction.data?.checkout?.url || `https://www.paddle.com/checkout?txn=${transaction.data.id}`;
    console.log("Generated checkout URL:", checkoutUrl);

    return new Response(
      JSON.stringify({ 
        checkout_url: checkoutUrl
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