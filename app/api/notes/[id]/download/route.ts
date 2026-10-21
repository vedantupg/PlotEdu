import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Note download: can_access_note() runs as the viewer (RLS-aware); only then does
 * the service client sign a 60-second URL and log the download. Watermarking will
 * plug in here as a step before signing (PRD 4.4), currently off.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/notes/[id]/download">): Promise<NextResponse> {
  const { id } = await ctx.params;
  const origin = request.nextUrl.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Downloads need Supabase configured (demo mode)." }, { status: 503 });
  }
  if (!uuidSchema.safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const [{ data: allowed, error }, { data: claims }] = await Promise.all([
    supabase.rpc("can_access_note", { p_note_id: id }),
    supabase.auth.getClaims(),
  ]);
  if (error) return NextResponse.json({ error: "Could not check access" }, { status: 500 });

  const userId = claims?.claims?.sub ?? null;
  if (!allowed) {
    if (!userId)
      return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent("/notes")}`, origin), { status: 303 });
    return NextResponse.redirect(new URL(`/notes?locked=${id}`, origin), { status: 303 });
  }

  const service = createSupabaseServiceClient();
  const { data: note } = await service
    .from("notes")
    .select("storage_path, title")
    .eq("id", id)
    .single<{ storage_path: string; title: string }>();
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: signed, error: signError } = await service.storage
    .from("notes")
    .createSignedUrl(note.storage_path, SIGNED_URL_TTL_SECONDS, { download: note.title });
  if (signError || !signed) return NextResponse.json({ error: "Could not prepare download" }, { status: 500 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  await service.from("note_downloads").insert({
    note_id: id,
    user_id: userId,
    ip_hash: ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null,
  });

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
