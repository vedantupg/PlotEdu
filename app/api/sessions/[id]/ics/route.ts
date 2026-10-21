import { NextResponse, type NextRequest } from "next/server";
import { getViewer, visibleBatchIds } from "@/lib/auth/viewer";
import { buildIcs } from "@/lib/calendar";
import { getSessionsForBatches } from "@/lib/data/queries";
import { SITE_URL } from "@/lib/env";

/**
 * Calendar file for one session (Apple Calendar, Outlook). Access follows the
 * sessions RLS via the viewer's client; the event links to the session page,
 * never to Meet, so attendance is always logged through the join route.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/sessions/[id]/ics">): Promise<NextResponse> {
  const { id } = await ctx.params;
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const sessions = await getSessionsForBatches(visibleBatchIds(viewer));
  const s = sessions.find((x) => x.id === id);
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = `${SITE_URL}/sessions/${s.id}`;
  const agenda = s.agenda.map((a, i) => `${i + 1}. ${a}`).join("\n");
  const body = buildIcs({
    uid: `${s.id}@plotedu.in`,
    title: `PlotEdu · Session ${s.number}: ${s.title}`,
    startsAt: s.startsAt,
    durationMin: s.durationMin,
    description: `${agenda ? `Agenda:\n${agenda}\n\n` : ""}Join from PlotEdu (attendance is logged): ${url}`,
    url,
    now: new Date(),
  });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="plotedu-session-${s.number}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
