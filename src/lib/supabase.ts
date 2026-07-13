import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Whether both Supabase env vars are present. Use this to gate any feature
 * that needs Supabase so the app can build and render without credentials.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
);

let client: SupabaseClient | null = null;

/**
 * Lazily create the Supabase client.
 *
 * Creating the client at module top-level with empty credentials throws
 * ("supabaseUrl is required") during build/prerender. Creating it lazily means
 * importing this module never crashes the build; we only construct the client
 * the first time a configured feature actually needs it.
 *
 * Returns null when Supabase is not configured, so callers can degrade
 * gracefully instead of throwing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Supabase-backed features."
      );
    }
    return null;
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}
