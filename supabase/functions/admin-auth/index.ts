import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await adminClient.rpc("is_admin", {
      _user_id: caller.id,
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, doctor_id, new_email } = await req.json();

    if (action === "send_password_reset") {
      // Get doctor's email from profile
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("email, user_id, approval_status")
        .eq("id", doctor_id)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: "Doctor not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (profile.approval_status !== "approved") {
        return new Response(
          JSON.stringify({ error: "Only approved doctors can receive password reset" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!profile.email) {
        return new Response(
          JSON.stringify({ error: "Doctor has no email address" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Generate password reset link using admin API
      const { data, error } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: profile.email,
        options: {
          redirectTo: `${req.headers.get("origin") || "https://chamberbox.lovable.app"}/reset-password`,
        },
      });

      if (error) {
        console.error("Password reset error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to generate password reset link: " + error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const resetLink = data?.properties?.action_link || null;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password reset link generated for " + profile.email,
          reset_link: resetLink,
          email: profile.email,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "change_email") {
      // Check caller is super_admin
      const { data: isSuperAdmin } = await adminClient.rpc("has_role", {
        _user_id: caller.id,
        _role: "super_admin",
      });
      if (!isSuperAdmin) {
        return new Response(
          JSON.stringify({ error: "Only super admins can change doctor email" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!new_email) {
        return new Response(
          JSON.stringify({ error: "New email is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get doctor's user_id
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("id", doctor_id)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: "Doctor not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update email in auth (auto-confirms)
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        profile.user_id,
        { email: new_email, email_confirm: true }
      );

      if (authError) {
        console.error("Email change error:", authError);
        return new Response(
          JSON.stringify({ error: "Failed to change email: " + authError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update email in profiles table too
      await adminClient
        .from("profiles")
        .update({ email: new_email })
        .eq("id", doctor_id);

      return new Response(
        JSON.stringify({ success: true, message: "Email changed to " + new_email }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
