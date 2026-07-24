import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

// Temporary schema-check route: GET /api/verify-schema confirms the profiles and
// sessions tables exist and reports RLS status. Run the migration first.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TABLES = ["profiles", "sessions"] as const;

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Existence: a real `select ... limit 1` returns PGRST205 if the table is
    // missing. (A head/count select does NOT reliably error — it can false-
    // positive, so don't use it here.) The service key bypasses RLS.
    const tables: Record<string, { exists: boolean; error?: string }> = {};
    for (const table of TABLES) {
      const { error } = await supabase.from(table).select("*").limit(1);
      tables[table] = error
        ? { exists: false, error: error.message }
        : { exists: true };
    }

    // RLS status via the optional helper function (may be absent).
    let rls: unknown = null;
    let rlsNote: string | undefined;
    const { data, error } = await supabase.rpc("schema_health");
    if (error) {
      rlsNote =
        "schema_health() not found — run the migration's optional helper to report RLS via API.";
    } else {
      rls = data;
    }

    const allExist = TABLES.every((t) => tables[t].exists);
    return NextResponse.json({ ok: allExist, tables, rls, rlsNote });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
