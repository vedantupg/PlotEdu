"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SITE_URL, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/** Start Google OAuth. Requests only `openid email profile` (no sensitive scopes). */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next")?.toString());
  if (!isSupabaseConfigured()) redirect(next);

  const origin = (await headers()).get("origin") ?? SITE_URL;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "openid email profile",
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect(`/sign-in?error=oauth&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}
