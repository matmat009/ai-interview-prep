import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { destinationForUser } from "@/features/auth/post-auth-redirect";

export const dynamic = "force-dynamic";

// OAuth (Google) redirect target. Exchanges the auth code for a session, then
// routes by onboarding status using the same rule as email login.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // Same completion check as email login — reused, not duplicated.
  const dest = await destinationForUser(supabase, data.user.id);
  return NextResponse.redirect(`${origin}${dest}`);
}
