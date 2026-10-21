import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/** Uptime probe: app is up, which mode it runs in, and whether Postgres answers. */
export async function GET(): Promise<NextResponse> {
  const started = Date.now();
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "demo" }, { headers: { "Cache-Control": "no-store" } });
  }
  const { error } = await createSupabasePublicClient().from("courses").select("id").limit(1);
  return NextResponse.json(
    { ok: !error, mode: "live", db: error ? "error" : "ok", ms: Date.now() - started },
    { status: error ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
