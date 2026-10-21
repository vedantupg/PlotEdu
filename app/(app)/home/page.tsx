import type { Metadata } from "next";
import Link from "next/link";
import { DateLeaf } from "@/components/calendar/date-leaf";
import { SessionTrack } from "@/components/calendar/session-track";
import { WeekStrip } from "@/components/calendar/week-strip";
import { IconNote } from "@/components/brand/icons";
import { SectionHeading } from "@/components/ui/page-header";
import { Sep } from "@/components/ui/sep";
import { ApplicationStatus } from "@/components/features/application-status";
import { SessionCard } from "@/components/features/session-card";
import { TermOfTheDay } from "@/components/features/term-card";
import { isActiveStudent, requireViewer, visibleBatchIds } from "@/lib/auth/viewer";
import { getAttendedSessionIds, getNotes, getOpenBatches, getSessionsForBatches } from "@/lib/data/queries";
import { toSessionCardData, toTrackItems } from "@/lib/data/serialize";
import { pickHeroSession, pickLastSession } from "@/lib/session-state";
import { formatISTDate, requestNow } from "@/lib/time";
import { formatBytes, mimeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Home" };

/** Demo-only: shift the sample hero session so every card state can be previewed. */
const DEMO_SHIFT_MIN: Record<string, number> = { go: 10, live: -20, ended: -200 };

export default async function HomePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const viewer = await requireViewer("/home");
  const isStaff = viewer.profile.role !== "student";
  const firstName = viewer.profile.fullName?.split(" ")[0] ?? "there";

  // Demo-only: preview the member (applicant) view.
  const demoParam = viewer.demo ? (await searchParams).demo : undefined;
  const demoMember = demoParam === "member";

  // Members (no approved enrolment, not staff) get the status page.
  if (demoMember || (!isStaff && !isActiveStudent(viewer))) {
    const openBatches = await getOpenBatches();
    const latest = demoMember
      ? viewer.enrollments[0]
        ? { ...viewer.enrollments[0], status: "applied" as const }
        : null
      : (viewer.enrollments[0] ?? null);
    return (
      <div className="space-y-8">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.02em] sm:text-2xl">
          {greeting(new Date(requestNow()))}, {firstName}
        </h1>
        <ApplicationStatus
          enrollment={latest}
          openBatch={openBatches[0] ?? null}
          needsProfile={!viewer.profile.collegeOrFirm || !viewer.profile.city}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TermOfTheDay />
          <Link
            href="/notes"
            className="card flex items-center gap-4 p-5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
          >
            <IconNote className="shrink-0 text-accent" width={24} height={24} />
            <div>
              <p className="text-lg font-semibold">Free notes</p>
              <p className="text-sm text-muted">Starter material open to every member.</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  const serverNow = requestNow();
  const now = new Date(serverNow);
  const batchIds = visibleBatchIds(viewer);
  const demoShift = demoParam ? DEMO_SHIFT_MIN[demoParam] : undefined;
  const [loadedSessions, notes, attended] = await Promise.all([
    getSessionsForBatches(batchIds),
    getNotes(),
    getAttendedSessionIds(viewer.profile.id),
  ]);

  const sessions =
    demoShift === undefined
      ? loadedSessions
      : loadedSessions.map((s) =>
          s.id === "demo-session-4" ? { ...s, startsAt: new Date(serverNow + demoShift * 60_000) } : s,
        );
  const hero = pickHeroSession(sessions, now);
  const last = hero ? null : pickLastSession(sessions, now);
  const track = toTrackItems(sessions, attended, hero?.id ?? null, now);
  const batchNotes = notes
    .filter((n) => n.access !== "staff" && (n.access !== "batch" || n.batchIds.some((b) => batchIds.includes(b))))
    .slice(0, 3);

  const upNext = sessions
    .filter((s) => !s.cancelled && s.id !== hero?.id && s.startsAt.getTime() > serverNow)
    .slice(0, 1);

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="flex items-baseline justify-between gap-3 pb-1">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.02em] sm:text-2xl">
          {greeting(now)}, {firstName}
        </h1>
        <p className="text-sm text-muted">
          {formatISTDate(now)}
          <Sep />
          IST
        </p>
      </header>

      {/* Row 1: the focal pair — next class and the week it sits in */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 lg:col-span-7">
          {hero ? (
            <SessionCard session={toSessionCardData(hero, sessions, notes)} serverNowMs={serverNow} />
          ) : (
            <section className="card flex h-full items-center gap-5 p-6">
              {last ? <DateLeaf date={last.startsAt} size="md" muted /> : null}
              <div>
                <p className="text-sm font-semibold text-muted">No upcoming session</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Next session will be announced</h2>
                {last ? (
                  <Link
                    href={`/sessions/${last.id}`}
                    className="mt-2 inline-block text-sm font-medium text-fg-soft underline decoration-accent decoration-2 underline-offset-4"
                  >
                    Recap of “{last.title}”
                  </Link>
                ) : null}
              </div>
            </section>
          )}
        </div>
        <div className="min-w-0 lg:col-span-5">
          <WeekStrip sessions={sessions} now={now} upNext={upNext} />
        </div>
      </div>

      {/* Row 2: progress and today's learning */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 lg:col-span-7">
          <SessionTrack items={track} />
        </div>
        <div className="min-w-0 lg:col-span-5 [&>a]:h-full">
          <TermOfTheDay />
        </div>
      </div>

      {/* Row 3: latest notes */}
      <section aria-labelledby="notes-h" className="pt-2">
        <SectionHeading
          id="notes-h"
          action={
            <Link href="/notes" className="text-sm font-medium text-muted hover:text-fg">
              Library →
            </Link>
          }
        >
          Latest notes
        </SectionHeading>
        {batchNotes.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {batchNotes.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes#${n.id}`}
                  className="card flex h-full items-center gap-3 p-3.5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="survey grid h-11 w-9 shrink-0 place-items-end justify-center rounded-[6px] border border-line-strong bg-surface-2 pb-1 !text-[0.5rem]">
                    {mimeLabel(n.mime)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{n.title}</span>
                    <span className="block text-xs text-muted">
                      {n.module ? `${n.module.title} · ` : ""}
                      {formatBytes(n.sizeBytes)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Notes appear here after each class.</p>
        )}
      </section>
    </div>
  );
}

/** Time-of-day greeting in IST. */
function greeting(now: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
