import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function execSql(adminClient: any, query: string): Promise<any[]> {
  const { data, error } = await adminClient.rpc("exec_sql", { query });
  if (error) {
    console.error("exec_sql error:", error.message, "Query:", query.slice(0, 100));
    return [];
  }
  return data || [];
}

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

    // 1. ENUM types
    const enums = await execSql(adminClient, `
      SELECT t.typname, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as labels
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    if (enums.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- CUSTOM ENUM TYPES\n";
      sql += "-- ==========================================\n\n";
      for (const e of enums) {
        const labels = e.labels.split(", ").map((l: string) => `'${l}'`).join(", ");
        sql += `DO $$ BEGIN\n  CREATE TYPE public.${e.typname} AS ENUM (${labels});\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;\n\n`;
      }
    }

    // 2. Tables
    const tables = await execSql(adminClient, `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`Found ${tables.length} tables`);

    if (tables.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- TABLES\n";
      sql += "-- ==========================================\n\n";

      for (const t of tables) {
        const tableName = t.table_name;
        
        const columns = await execSql(adminClient, `
          SELECT 
            column_name,
            data_type,
            udt_name,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `);

        sql += `-- Table: ${tableName}\n`;
        sql += `CREATE TABLE IF NOT EXISTS public."${tableName}" (\n`;

        const colDefs: string[] = [];
        for (const col of columns) {
          let typeName = col.data_type;
          if (col.data_type === "uuid") typeName = "UUID";
          else if (col.data_type === "text") typeName = "TEXT";
          else if (col.data_type === "boolean") typeName = "BOOLEAN";
          else if (col.data_type === "integer") typeName = "INTEGER";
          else if (col.data_type === "bigint") typeName = "BIGINT";
          else if (col.data_type === "smallint") typeName = "SMALLINT";
          else if (col.data_type === "numeric") typeName = "NUMERIC";
          else if (col.data_type === "real") typeName = "REAL";
          else if (col.data_type === "double precision") typeName = "DOUBLE PRECISION";
          else if (col.data_type === "jsonb") typeName = "JSONB";
          else if (col.data_type === "json") typeName = "JSON";
          else if (col.data_type === "date") typeName = "DATE";
          else if (col.data_type === "timestamp with time zone") typeName = "TIMESTAMPTZ";
          else if (col.data_type === "timestamp without time zone") typeName = "TIMESTAMP";
          else if (col.data_type === "time without time zone") typeName = "TIME";
          else if (col.data_type === "character varying") typeName = col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : "VARCHAR";
          else if (col.data_type === "ARRAY") typeName = `${col.udt_name.replace(/^_/, '')}[]`;
          else if (col.data_type === "USER-DEFINED") typeName = `public.${col.udt_name}`;

          let def = `  "${col.column_name}" ${typeName}`;
          if (col.is_nullable === "NO") def += " NOT NULL";
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          colDefs.push(def);
        }

        const pks = await execSql(adminClient, `
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public' 
            AND tc.table_name = '${tableName}'
            AND tc.constraint_type = 'PRIMARY KEY'
        `);

        if (pks.length > 0) {
          const pkCols = pks.map((p: any) => `"${p.column_name}"`).join(", ");
          colDefs.push(`  PRIMARY KEY (${pkCols})`);
        }

        // Unique constraints
        const uqs = await execSql(adminClient, `
          SELECT tc.constraint_name, string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public' 
            AND tc.table_name = '${tableName}'
            AND tc.constraint_type = 'UNIQUE'
          GROUP BY tc.constraint_name
        `);

        for (const uq of uqs) {
          const uqCols = uq.columns.split(", ").map((c: string) => `"${c.trim()}"`).join(", ");
          colDefs.push(`  CONSTRAINT "${uq.constraint_name}" UNIQUE (${uqCols})`);
        }

        sql += colDefs.join(",\n") + "\n);\n\n";
      }

      // 3. Foreign keys
      sql += "-- ==========================================\n";
      sql += "-- FOREIGN KEYS\n";
      sql += "-- ==========================================\n\n";

      const fks = await execSql(adminClient, `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
          AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `);

      for (const fk of fks) {
        const refSchema = fk.foreign_table_schema === 'public' ? 'public' : fk.foreign_table_schema;
        sql += `ALTER TABLE public."${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
        sql += `FOREIGN KEY ("${fk.column_name}") REFERENCES ${refSchema}."${fk.foreign_table_name}"("${fk.foreign_column_name}")`;
        if (fk.delete_rule && fk.delete_rule !== "NO ACTION") sql += ` ON DELETE ${fk.delete_rule}`;
        if (fk.update_rule && fk.update_rule !== "NO ACTION") sql += ` ON UPDATE ${fk.update_rule}`;
        sql += `;\n`;
      }
      sql += "\n";
    }

    // 4. Views
    const views = await execSql(adminClient, `
      SELECT table_name, view_definition 
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (views.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- VIEWS\n";
      sql += "-- ==========================================\n\n";
      for (const v of views) {
        sql += `CREATE OR REPLACE VIEW public."${v.table_name}" AS\n${v.view_definition};\n\n`;
      }
    }

    // 5. Functions
    const funcs = await execSql(adminClient, `
      SELECT 
        p.proname as name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        AND p.proname NOT LIKE 'exec_sql%'
      ORDER BY p.proname
    `);

    if (funcs.length > 0) {
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

    for (const t of tables) {
      sql += `ALTER TABLE public."${t.table_name}" ENABLE ROW LEVEL SECURITY;\n`;
    }
    sql += "\n";

    // 7. RLS Policies
    const policies = await execSql(adminClient, `
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
      ORDER BY tablename, policyname
    `);

    if (policies.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- RLS POLICIES\n";
      sql += "-- ==========================================\n\n";

      for (const p of policies) {
        const permissive = p.permissive === "PERMISSIVE" ? "" : " AS RESTRICTIVE";
        const roles = p.roles || "{public}";
        const rolesStr = Array.isArray(roles) ? roles.join(", ") : String(roles).replace(/[{}]/g, "");

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
    const triggers = await execSql(adminClient, `
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_timing,
        action_orientation,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    if (triggers.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- TRIGGERS\n";
      sql += "-- ==========================================\n\n";

      const seen = new Set<string>();
      for (const t of triggers) {
        const key = `${t.trigger_name}_${t.event_object_table}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Get all events for this trigger
        const events = triggers
          .filter((tr: any) => tr.trigger_name === t.trigger_name && tr.event_object_table === t.event_object_table)
          .map((tr: any) => tr.event_manipulation);
        const eventStr = [...new Set(events)].join(" OR ");

        sql += `CREATE OR REPLACE TRIGGER "${t.trigger_name}"\n`;
        sql += `  ${t.action_timing} ${eventStr}\n`;
        sql += `  ON public."${t.event_object_table}"\n`;
        sql += `  FOR EACH ${t.action_orientation}\n`;
        sql += `  ${t.action_statement};\n\n`;
      }
    }

    // 9. Indexes
    const indexes = await execSql(adminClient, `
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_key'
      ORDER BY tablename, indexname
    `);

    if (indexes.length > 0) {
      sql += "-- ==========================================\n";
      sql += "-- INDEXES\n";
      sql += "-- ==========================================\n\n";
      for (const idx of indexes) {
        const def = idx.indexdef.replace(/^CREATE INDEX/, "CREATE INDEX IF NOT EXISTS")
          .replace(/^CREATE UNIQUE INDEX/, "CREATE UNIQUE INDEX IF NOT EXISTS");
        sql += `${def};\n`;
      }
      sql += "\n";
    }

    // 10. Realtime
    sql += "-- ==========================================\n";
    sql += "-- REALTIME (if needed)\n";
    sql += "-- ==========================================\n\n";

    const realtimeTables = await execSql(adminClient, `
      SELECT tablename FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
      ORDER BY tablename
    `);

    for (const rt of realtimeTables) {
      sql += `ALTER PUBLICATION supabase_realtime ADD TABLE public."${rt.tablename}";\n`;
    }

    console.log(`Schema export complete. SQL length: ${sql.length} chars, Tables: ${tables.length}, Functions: ${funcs.length}, Policies: ${policies.length}`);

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
