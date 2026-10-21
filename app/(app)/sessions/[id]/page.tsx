import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DateLeaf } from "@/components/calendar/date-leaf";
import { SessionTrack } from "@/components/calendar/session-track";
import { SessionCard } from "@/components/features/session-card";
import { SectionHeading } from "@/components/ui/page-header";
import { requireViewer, visibleBatchIds } from "@/lib/auth/viewer";
import { getAttendedSessionIds, getNotes, getSessionsForBatches } from "@/lib/data/queries";
import { toSessionCardData, toTrackItems } from "@/lib/data/serialize";
import type { ClassSession } from "@/lib/data/types";
import { pickHeroSession } from "@/lib/session-state";
import { formatISTTime, requestNow } from "@/lib/time";
import { cn, formatBytes, mimeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Session" };

const JOIN_MESSAGES: Record<string, string> = {
  too_early: "Join opens 15 minutes before the session starts.",
  ended: "This session has ended. Notes and the recording (if any) are below.",
  cancelled: "This session was cancelled.",
  no_link: "The Meet link isn't ready yet. Kajal has been notified — please try again in a minute.",
  error: "Something went wrong joining. Please try again.",
};

function Neighbour({ s, dir }: { s: ClassSession | undefined; dir: "prev" | "next" }) {
  if (!s) return <div />;
  return (
    <Link
      href={`/sessions/${s.id}`}
      className={cn(
        "card flex items-center gap-3 p-3 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2",
        dir === "next" && "flex-row-reverse text-right",
      )}
    >
      <DateLeaf date={s.startsAt} size="sm" />
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">
          {dir === "prev"
            ? `← Session ${s.number.toString().padStart(2, "0")}`
            : `Session ${s.number.toString().padStart(2, "0")} →`}
        </span>
        <span className="block truncate text-sm font-semibold">{s.title}</span>
        <span className="block text-xs text-muted">{formatISTTime(s.startsAt)}</span>
      </span>
    </Link>
  );
}

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ join?: string }>;
}) {
  const { id } = await params;
  const { join } = await searchParams;
  const viewer = await requireViewer(`/sessions/${id}`);

  const [sessions, notes, attended] = await Promise.all([
    getSessionsForBatches(visibleBatchIds(viewer)),
    getNotes(),
    getAttendedSessionIds(viewer.profile.id),
  ]);
  const index = sessions.findIndex((s) => s.id === id);
  const session = sessions[index];
  if (!session) notFound();
  const now = new Date(requestNow());
  const hero = pickHeroSession(sessions, now);
  const sessionNotes = notes.filter((n) => n.sessionId === id);

  return (
    <div className="space-y-8">
      <Link href="/sessions" className="inline-block text-sm font-medium text-muted hover:text-fg">
        ← All sessions
      </Link>
      {join && JOIN_MESSAGES[join] ? (
        <p role="status" className="card border-l-2 border-l-accent px-4 py-3 text-sm">
          {JOIN_MESSAGES[join]}
        </p>
      ) : null}

      <SessionCard session={toSessionCardData(session, sessions, notes)} serverNowMs={now.getTime()} expanded />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SessionTrack items={toTrackItems(sessions, attended, hero?.id ?? null, now)} />

        <section aria-labelledby="session-notes" className="card p-4 sm:p-5">
          <SectionHeading id="session-notes" count={sessionNotes.length}>
            Notes for this session
          </SectionHeading>
          {sessionNotes.length === 0 ? (
            <p className="text-sm text-muted">Notes are uploaded after class.</p>
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {sessionNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes#${n.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 hover:bg-surface-2"
                  >
                    <span className="font-semibold">{n.title}</span>
                    <span className="survey shrink-0 text-muted">
                      {mimeLabel(n.mime)} · {formatBytes(n.sizeBytes)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <nav aria-label="Other sessions" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Neighbour s={sessions[index - 1]} dir="prev" />
        <Neighbour s={sessions[index + 1]} dir="next" />
      </nav>
    </div>
  );
}
