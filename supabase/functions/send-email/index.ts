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
    const { recipientEmail, subject, shareUrl, fileName } = await req.json();

    if (!recipientEmail || !shareUrl || !fileName) {
      throw new Error("Missing required fields");
    }

    // Get RESEND_API_KEY from environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailData = {
      from: "SecureShare <noreply@yourdomain.com>", // Replace with your domain
      to: [recipientEmail],
      subject: subject || `File shared: ${fileName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've received a file!</h2>
          <p>Someone has shared a file with you:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>File:</strong> ${fileName}<br>
            <strong>Access Link:</strong> <a href="${shareUrl}" style="color: #007bff;">${shareUrl}</a>
          </div>
          <p>Click the link above to access and download the file.</p>
          <p style="color: #666; font-size: 14px;">
            This link may expire based on the sender's settings. Download the file soon to ensure access.
          </p>
        </div>
      `,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Email service error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});