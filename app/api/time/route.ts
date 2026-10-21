import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Server clock for countdown resync (a sleeping phone's clock may drift). */
export function GET(): NextResponse {
  return NextResponse.json({ now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
