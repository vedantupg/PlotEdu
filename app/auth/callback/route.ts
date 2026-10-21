import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/** OAuth return: exchange the code, then route first-timers through onboarding. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/sign-in?error=exchange", origin));

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("id", data.user.id)
    .maybeSingle<{ onboarded_at: string | null }>();

  const target = profile?.onboarded_at ? next : `/onboarding?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(target, origin));
}
