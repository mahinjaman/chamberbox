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

    // Verify user
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

    // Check admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Schema export requested by ${user.email}`);

    let sql = "";
    sql += "-- ==============================================\n";
    sql += "-- ChamberBox Database Schema Export\n";
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Exported by: ${user.email}\n`;
    sql += "-- This file contains SCHEMA ONLY (no data)\n";
    sql += "-- Import directly in Supabase SQL Editor\n";
    sql += "-- ==============================================\n\n";

    // 1. Get custom ENUM types
    const { data: enums } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT t.typname, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as labels
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        GROUP BY t.typname
        ORDER BY t.typname;
      `,
    });

    if (enums && enums.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- CUSTOM ENUM TYPES\n";
      sql += "-- ==========================================\n\n";
      for (const e of enums) {
        const labels = e.labels.split(", ").map((l: string) => `'${l}'`).join(", ");
        sql += `DO $$ BEGIN\n  CREATE TYPE public.${e.typname} AS ENUM (${labels});\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;\n\n`;
      }
    }

    // 2. Get all tables with full CREATE TABLE statements
    const { data: tables } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (tables && tables.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- TABLES\n";
      sql += "-- ==========================================\n\n";

      for (const t of tables) {
        const tableName = t.table_name;

        // Get columns
        const { data: columns } = await adminClient.rpc("exec_sql", {
          query: `
            SELECT 
              column_name,
              data_type,
              udt_name,
              is_nullable,
              column_default,
              character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${tableName}'
            ORDER BY ordinal_position;
          `,
        });

        sql += `-- Table: ${tableName}\n`;
        sql += `CREATE TABLE IF NOT EXISTS public."${tableName}" (\n`;

        const colDefs: string[] = [];
        for (const col of columns || []) {
          let typeName = col.data_type;
          
          // Map types
          if (col.data_type === "uuid") typeName = "UUID";
          else if (col.data_type === "text") typeName = "TEXT";
          else if (col.data_type === "boolean") typeName = "BOOLEAN";
          else if (col.data_type === "integer") typeName = "INTEGER";
          else if (col.data_type === "numeric") typeName = "NUMERIC";
          else if (col.data_type === "jsonb") typeName = "JSONB";
          else if (col.data_type === "date") typeName = "DATE";
          else if (col.data_type === "timestamp with time zone") typeName = "TIMESTAMPTZ";
          else if (col.data_type === "timestamp without time zone") typeName = "TIMESTAMP";
          else if (col.data_type === "time without time zone") typeName = "TIME";
          else if (col.data_type === "character varying") typeName = col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : "VARCHAR";
          else if (col.data_type === "ARRAY") typeName = "TEXT[]";
          else if (col.data_type === "USER-DEFINED") typeName = `public.${col.udt_name}`;

          let def = `  "${col.column_name}" ${typeName}`;
          if (col.is_nullable === "NO") def += " NOT NULL";
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          colDefs.push(def);
        }

        // Get primary key
        const { data: pks } = await adminClient.rpc("exec_sql", {
          query: `
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
              AND tc.table_name = '${tableName}'
              AND tc.constraint_type = 'PRIMARY KEY';
          `,
        });

        if (pks && pks.length > 0) {
          const pkCols = pks.map((p: any) => `"${p.column_name}"`).join(", ");
          colDefs.push(`  PRIMARY KEY (${pkCols})`);
        }

        sql += colDefs.join(",\n") + "\n);\n\n";
      }

      // 3. Foreign keys (separate ALTER TABLE statements)
      sql += "-- ==========================================\n";
      sql += "-- FOREIGN KEYS\n";
      sql += "-- ==========================================\n\n";

      const { data: fks } = await adminClient.rpc("exec_sql", {
        query: `
          SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
          ORDER BY tc.table_name;
        `,
      });

      for (const fk of fks || []) {
        sql += `ALTER TABLE public."${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
        sql += `FOREIGN KEY ("${fk.column_name}") REFERENCES public."${fk.foreign_table_name}"("${fk.foreign_column_name}");\n`;
      }
      sql += "\n";
    }

    // 4. Views
    const { data: views } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT table_name, view_definition 
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `,
    });

    if (views && views.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- VIEWS\n";
      sql += "-- ==========================================\n\n";
      for (const v of views) {
        sql += `CREATE OR REPLACE VIEW public."${v.table_name}" AS\n${v.view_definition};\n\n`;
      }
    }

    // 5. Functions
    const { data: funcs } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT 
          p.proname as name,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prokind = 'f'
          AND p.proname NOT LIKE 'exec_sql%'
        ORDER BY p.proname;
      `,
    });

    if (funcs && funcs.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- FUNCTIONS\n";
      sql += "-- ==========================================\n\n";
      for (const f of funcs) {
        sql += `-- Function: ${f.name}\n`;
        sql += `${f.definition};\n\n`;
      }
    }

    // 6. Enable RLS
    sql += "-- ==========================================\n";
    sql += "-- ENABLE ROW LEVEL SECURITY\n";
    sql += "-- ==========================================\n\n";

    const { data: rlsTables } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename IN (
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
          )
        ORDER BY tablename;
      `,
    });

    for (const t of rlsTables || []) {
      sql += `ALTER TABLE public."${t.tablename}" ENABLE ROW LEVEL SECURITY;\n`;
    }
    sql += "\n";

    // 7. RLS Policies
    const { data: policies } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `,
    });

    if (policies && policies.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- RLS POLICIES\n";
      sql += "-- ==========================================\n\n";

      for (const p of policies) {
        const permissive = p.permissive === "PERMISSIVE" ? "" : " AS RESTRICTIVE";
        const roles = p.roles || "{public}";
        const rolesStr = roles.replace(/[{}]/g, "");

        sql += `CREATE POLICY "${p.policyname}"\n`;
        sql += `  ON public."${p.tablename}"${permissive}\n`;
        sql += `  FOR ${p.cmd}\n`;
        sql += `  TO ${rolesStr}\n`;
        if (p.qual) sql += `  USING (${p.qual})\n`;
        if (p.with_check) sql += `  WITH CHECK (${p.with_check})\n`;
        sql += `;\n\n`;
      }
    }

    // 8. Triggers
    const { data: triggers } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT 
          trigger_name,
          event_manipulation,
          event_object_table,
          action_timing,
          action_orientation,
          action_statement
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        ORDER BY event_object_table, trigger_name;
      `,
    });

    if (triggers && triggers.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- TRIGGERS\n";
      sql += "-- ==========================================\n\n";

      // Deduplicate triggers (same trigger can appear for multiple events)
      const seen = new Set<string>();
      for (const t of triggers) {
        const key = `${t.trigger_name}_${t.event_object_table}`;
        if (seen.has(key)) continue;
        seen.add(key);

        sql += `CREATE OR REPLACE TRIGGER "${t.trigger_name}"\n`;
        sql += `  ${t.action_timing} ${t.event_manipulation}\n`;
        sql += `  ON public."${t.event_object_table}"\n`;
        sql += `  FOR EACH ${t.action_orientation}\n`;
        sql += `  ${t.action_statement};\n\n`;
      }
    }

    // 9. Indexes
    const { data: indexes } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname NOT LIKE '%_pkey'
        ORDER BY tablename, indexname;
      `,
    });

    if (indexes && indexes.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- INDEXES\n";
      sql += "-- ==========================================\n\n";
      for (const idx of indexes) {
        sql += `${idx.indexdef};\n`;
      }
      sql += "\n";
    }

    // 10. Realtime
    sql += "-- ==========================================\n";
    sql += "-- REALTIME (if needed)\n";
    sql += "-- ==========================================\n\n";

    const { data: realtimeTables } = await adminClient.rpc("exec_sql", {
      query: `
        SELECT tablename FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
        ORDER BY tablename;
      `,
    });

    for (const rt of realtimeTables || []) {
      sql += `ALTER PUBLICATION supabase_realtime ADD TABLE public."${rt.tablename}";\n`;
    }

    console.log(`Schema export complete. SQL length: ${sql.length} chars`);

    return new Response(sql, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="chamberbox_schema_${new Date().toISOString().split("T")[0]}.sql"`,
      },
    });
  } catch (error) {
    console.error("Schema export failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
