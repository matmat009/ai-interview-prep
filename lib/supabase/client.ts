import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client — uses the public URL + anon key, which are safe
// to expose to the browser (NEXT_PUBLIC_* are inlined into the client bundle).
// Use this from client components. For elevated/server access, use
// lib/supabase/server.ts instead (never import that into client code).

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — add them to .env.local.",
      );
    }
    browserClient = createClient(url, anonKey);
  }
  return browserClient;
}
