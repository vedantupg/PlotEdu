"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

/** Singleton browser client (Realtime for the forum, sign-in redirect). */
export function getSupabaseBrowserClient(): SupabaseClient {
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}
