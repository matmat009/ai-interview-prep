import type { SupabaseClient } from "@supabase/supabase-js";

// Where a just-authenticated user should land: their interview home if they've
// completed onboarding, else the onboarding wizard. Single source of truth
// shared by email login and the OAuth callback (no second copy of this rule).
export async function destinationForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<"/interview" | "/onboarding"> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
  return profile?.onboarding_completed === true ? "/interview" : "/onboarding";
}
