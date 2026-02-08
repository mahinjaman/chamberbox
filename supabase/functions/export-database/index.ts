import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user is authenticated
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to export all data
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const tables = [
      "profiles",
      "chambers",
      "patients",
      "visits",
      "prescriptions",
      "prescription_templates",
      "appointments",
      "availability_slots",
      "queue_sessions",
      "queue_tokens",
      "transactions",
      "integration_settings",
      "sms_settings",
      "staff_members",
      "staff_chamber_access",
      "staff_custom_permissions",
      "subscription_payments",
      "subscription_plans",
      "subscription_usage",
      "support_tickets",
      "support_ticket_replies",
      "user_roles",
      "admin_staff",
      "doctor_videos",
      "investigations",
      "medicines",
      "platform_sms_config",
      "video_tutorials",
    ];

    console.log(`Starting database export for user ${user.id}...`);

    const exportData: Record<string, unknown[]> = {};
    const errors: string[] = [];

    for (const table of tables) {
      try {
        // Fetch all rows (handle pagination for large tables)
        let allRows: unknown[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await adminClient
            .from(table)
            .select("*")
            .range(from, from + batchSize - 1);

          if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            errors.push(`${table}: ${error.message}`);
            break;
          }

          if (data && data.length > 0) {
            allRows = [...allRows, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        exportData[table] = allRows;
        console.log(`Exported ${table}: ${allRows.length} rows`);
      } catch (e) {
        console.error(`Failed to export ${table}:`, e);
        errors.push(`${table}: ${e.message}`);
      }
    }

    const result = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      table_count: Object.keys(exportData).length,
      row_counts: Object.fromEntries(
        Object.entries(exportData).map(([k, v]) => [k, v.length])
      ),
      errors: errors.length > 0 ? errors : undefined,
      data: exportData,
    };

    console.log(`Export complete. ${Object.keys(exportData).length} tables exported.`);

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="chamberbox_backup_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
