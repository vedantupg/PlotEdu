import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

type JoinResult =
  | { status: "ok"; url: string }
  | { status: "too_early"; starts_at: string }
  | { status: "ended" | "cancelled" | "forbidden" | "no_link" | "unauthenticated" };

/**
 * One tap to class: join_session() checks membership, logs attendance inside the
 * window and returns the Meet link, which is never exposed to the client otherwise.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/s/[id]/join">): Promise<NextResponse> {
  const { id } = await ctx.params;
  const origin = request.nextUrl.origin;
  const back = (reason: string): NextResponse =>
    NextResponse.redirect(new URL(`/sessions/${id}?join=${reason}`, origin), { status: 303 });

  if (!uuidSchema.safeParse(id).success) {
    if (!isSupabaseConfigured()) return NextResponse.redirect(new URL("/home?demo_join=1", origin), { status: 303 });
    return NextResponse.redirect(new URL("/sessions", origin), { status: 303 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("join_session", { p_session_id: id });
  if (error) return back("error");

  const result = data as JoinResult;
  switch (result.status) {
    case "ok": {
      const target = new URL(result.url);
      if (target.protocol !== "https:") return back("error");
      return NextResponse.redirect(target, { status: 303 });
    }
    case "unauthenticated":
      return NextResponse.redirect(new URL(`/sign-in?next=/s/${id}/join`, origin), { status: 303 });
    case "forbidden":
      return NextResponse.redirect(new URL("/home", origin), { status: 303 });
    default:
      return back(result.status);
  }
}
