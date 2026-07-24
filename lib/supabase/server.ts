// `server-only` makes the build fail if this module is ever imported into a
// client component — hard guarantee that SUPABASE_SECRET_KEY never ships to the
// browser. Use this only in API routes / server components.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secretKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY — add them to .env.local.",
      );
    }
    // Elevated (service) access. No session persistence/refresh on the server.
    serverClient = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
}
