import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, serviceRoleKey } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS. Allowed in exactly three places (PRD 7):
 * calendar sync, cron reminders, and signed-URL issue for note downloads.
 */
export function createSupabaseServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
