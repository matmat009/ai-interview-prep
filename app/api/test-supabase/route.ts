import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

// Temporary sanity-check route: GET /api/test-supabase confirms the server
// client can actually reach Supabase with the secret key. Remove once real
// Supabase usage is wired up. `force-dynamic` keeps it out of build-time
// evaluation (which would run without env vars).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // A real network call that also validates the secret key has admin access
    // (schema-agnostic — doesn't depend on any tables existing yet).
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      connected: true,
      userCount: data.users.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
