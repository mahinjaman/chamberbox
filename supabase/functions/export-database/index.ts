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
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;

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

    // Check if super_admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Starting full database export for user ${user.id}...`);

    // ========== PART 1: Export Schema via pg connection ==========
    const tables = [
      "profiles", "chambers", "patients", "visits", "prescriptions",
      "prescription_templates", "appointments", "availability_slots",
      "queue_sessions", "queue_tokens", "transactions", "integration_settings",
      "sms_settings", "staff_members", "staff_chamber_access", "staff_custom_permissions",
      "subscription_payments", "subscription_plans", "subscription_usage",
      "support_tickets", "support_ticket_replies", "user_roles", "admin_staff",
      "doctor_videos", "investigations", "medicines", "platform_sms_config",
      "video_tutorials",
    ];

    // Get schema information using information_schema via service role
    const schemaInfo: Record<string, any> = {};

    for (const table of tables) {
      try {
        // We'll build schema from the data itself + known structure
        const { data: sampleData } = await adminClient
          .from(table)
          .select("*")
          .limit(1);

        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]).map(col => ({
            name: col,
            sample_type: typeof sampleData[0][col],
            sample_value: sampleData[0][col],
            is_null: sampleData[0][col] === null,
          }));
          schemaInfo[table] = { columns, has_data: true };
        } else {
          schemaInfo[table] = { columns: [], has_data: false };
        }
      } catch (e) {
        console.error(`Schema info failed for ${table}:`, e);
        schemaInfo[table] = { error: e.message };
      }
    }

    // ========== PART 2: Export Data ==========
    const exportData: Record<string, unknown[]> = {};
    const errors: string[] = [];

    for (const table of tables) {
      try {
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

    // ========== PART 3: Generate SQL Restore Script ==========
    let sqlScript = `-- ChamberBox Database Backup\n-- Generated: ${new Date().toISOString()}\n-- Exported by: ${user.email}\n\n`;

    for (const table of tables) {
      const rows = exportData[table];
      if (!rows || rows.length === 0) continue;

      sqlScript += `-- ==========================================\n`;
      sqlScript += `-- Table: ${table} (${rows.length} rows)\n`;
      sqlScript += `-- ==========================================\n\n`;

      // Generate INSERT statements
      const columns = Object.keys(rows[0] as Record<string, unknown>);
      const colList = columns.map(c => `"${c}"`).join(", ");

      for (const row of rows) {
        const r = row as Record<string, unknown>;
        const values = columns.map(col => {
          const val = r[col];
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
          if (typeof val === "number") return String(val);
          if (typeof val === "object") {
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
          }
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        sqlScript += `INSERT INTO public."${table}" (${colList}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlScript += `\n`;
    }

    // ========== Build Result ==========
    const result = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      version: "2.0",
      format: "schema_and_data",
      table_count: Object.keys(exportData).length,
      row_counts: Object.fromEntries(
        Object.entries(exportData).map(([k, v]) => [k, v.length])
      ),
      total_rows: Object.values(exportData).reduce((sum, rows) => sum + rows.length, 0),
      errors: errors.length > 0 ? errors : undefined,
      schema_info: schemaInfo,
      data: exportData,
      sql_restore_script: sqlScript,
      restore_instructions: {
        supabase: [
          "1. নতুন Supabase project তৈরি করুন",
          "2. এই project এর migration files কপি করুন (টেবিল structure তৈরি হবে)",
          "3. SQL Editor এ sql_restore_script রান করুন (ডাটা insert হবে)",
          "4. RLS policies ও functions migration থেকে আসবে",
        ],
        mongodb: [
          "1. প্রতিটি টেবিলের data array আলাদা collection হিসেবে import করুন",
          "2. mongoimport --db chamberbox --collection <table_name> --jsonArray --file <table>.json",
        ],
        postgresql: [
          "1. Migration files রান করুন টেবিল তৈরি করতে",
          "2. sql_restore_script রান করুন ডাটা insert করতে",
        ],
      },
    };

    console.log(`Export complete. ${Object.keys(exportData).length} tables, ${result.total_rows} total rows.`);

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="chamberbox_full_backup_${new Date().toISOString().split("T")[0]}.json"`,
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
