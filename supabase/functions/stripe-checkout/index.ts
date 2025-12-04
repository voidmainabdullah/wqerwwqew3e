import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// This function is deprecated - using Paddle instead
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  return new Response(
    JSON.stringify({ error: 'Stripe checkout is deprecated. Please use Paddle checkout.' }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    }
  );
});
