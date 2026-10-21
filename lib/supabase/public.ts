import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Anonymous client with no cookies, for public catalogue reads (course, glossary,
 * open batches). Keeps those pages static/ISR; RLS treats it as `anon`.
 */
export function createSupabasePublicClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
