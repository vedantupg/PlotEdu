import type { Metadata } from "next";
import Link from "next/link";
import { IconCheck } from "@/components/brand/icons";
import { DateLeaf } from "@/components/calendar/date-leaf";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { TermOfTheDay } from "@/components/features/term-card";
import { PageHeader } from "@/components/ui/page-header";
import { Sep } from "@/components/ui/sep";
import { requireViewer, visibleBatchIds } from "@/lib/auth/viewer";
import { istWeek, monthShort, monthsSpanning, relativeDayLabel } from "@/lib/calendar";
import { getAttendedSessionIds, getSessionsForBatches } from "@/lib/data/queries";
import type { ClassSession } from "@/lib/data/types";
import { pickHeroSession, sessionPhase, type SessionPhase } from "@/lib/session-state";
import { formatISTTime, requestNow } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sessions" };

function StatusPill({ phase, attended, isNext }: { phase: SessionPhase; attended: boolean; isNext: boolean }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap";
  if (isNext && phase !== "live" && phase !== "go")
    return <span className={cn(base, "border border-accent text-accent-ink")}>Next</span>;
  if (phase === "cancelled") return <span className={cn(base, "bg-danger/12 text-danger")}>Cancelled</span>;
  if (phase === "live" || phase === "go")
    return <span className={cn(base, "bg-accent text-on-accent")}>{phase === "live" ? "Live" : "Soon"}</span>;
  if (phase === "ended")
    return attended ? (
      <span className={cn(base, "bg-success/12 text-success")}>
        <IconCheck width={12} height={12} /> Attended
      </span>
    ) : (
      <span className={cn(base, "text-muted")}>Missed</span>
    );
  return <span className={cn(base, "border border-line-strong text-fg-soft")}>Upcoming</span>;
}

/** Group sessions by IST week (Monday key), preserving order. */
function groupByWeek(sessions: readonly ClassSession[]): { key: string; label: string; items: ClassSession[] }[] {
  const groups = new Map<string, { key: string; label: string; items: ClassSession[] }>();
  for (const s of sessions) {
    const week = istWeek(s.startsAt);
    const first = week[0];
    const last = week[6];
    if (!first || !last) continue;
    const g = groups.get(first.key) ?? {
      key: first.key,
      label: `${first.day} ${monthShort(first.month)} – ${last.day} ${monthShort(last.month)}`,
      items: [],
    };
    g.items.push(s);
    groups.set(first.key, g);
  }
  return [...groups.values()];
}

export default async function SessionsPage() {
  const viewer = await requireViewer("/sessions");
  const batchIds = visibleBatchIds(viewer);
  const [sessions, attended] = await Promise.all([
    getSessionsForBatches(batchIds),
    getAttendedSessionIds(viewer.profile.id),
  ]);
  const now = new Date(requestNow());
  const next = pickHeroSession(sessions, now);
  const months = monthsSpanning(sessions.map((s) => s.startsAt));
  const weeks = groupByWeek(sessions);
  const thisWeekKey = istWeek(now)[0]?.key;

  if (sessions.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Schedule · IST" title="Sessions" />
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-muted">
            {batchIds.length === 0
              ? "The schedule unlocks once your batch application is approved."
              : "No sessions scheduled yet. They’ll appear here, and in your Google Calendar, as soon as they’re created."}
          </p>
          <TermOfTheDay />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Schedule · ${sessions.filter((s) => !s.cancelled).length} sessions · IST`}
        title="Sessions"
        lead="Every class in one place — the agenda before, notes and recording after."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        {/* Calendars: first on mobile (horizontal), sticky sidebar on desktop */}
        <aside className="lg:order-2">
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:sticky lg:top-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {months.map((m) => (
              <div key={`${m.year}-${m.month}`} className="w-[17rem] shrink-0 snap-start lg:w-auto">
                <MonthCalendar year={m.year} month={m.month} sessions={sessions} now={now} nextId={next?.id ?? null} />
              </div>
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted" aria-label="Calendar legend">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-[3px] bg-accent" /> Next
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-[3px] border border-accent/70" /> Upcoming
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-[3px] bg-surface-3" /> Held
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-[3px] ring-1 ring-fg" /> Today
            </li>
          </ul>
        </aside>

        <div className="min-w-0 space-y-8 lg:order-1">
          {weeks.map((w, wi) => (
            <section key={w.key} aria-labelledby={`wk-${w.key}`}>
              <h2 id={`wk-${w.key}`} className="mb-3 flex items-baseline gap-2 text-[0.9375rem] font-semibold">
                Week {wi + 1}
                <span className="font-normal text-muted">{w.label}</span>
                {w.key === thisWeekKey ? (
                  <span className="rounded-full bg-fg px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">
                    This week
                  </span>
                ) : null}
              </h2>
              <ol className="card divide-y divide-line overflow-hidden">
                {w.items.map((s) => {
                  const phase = sessionPhase(s, now);
                  const isNext = s.id === next?.id;
                  const rel = relativeDayLabel(s.startsAt, now);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/sessions/${s.id}`}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-2 sm:px-5",
                          isNext && "bg-accent/[0.06]",
                        )}
                      >
                        <DateLeaf
                          date={s.startsAt}
                          size="sm"
                          highlight={isNext}
                          muted={phase === "ended" || s.cancelled}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="survey block text-muted">
                            Session {s.number.toString().padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block truncate font-semibold tracking-[-0.01em]",
                              phase === "ended" && "text-fg-soft",
                              s.cancelled && "line-through",
                            )}
                          >
                            {s.title}
                          </span>
                          <span className="block text-sm text-muted">
                            {rel ? <span className="font-medium text-fg-soft">{rel}</span> : null}
                            {rel ? <Sep /> : null}
                            <span className="whitespace-nowrap">{formatISTTime(s.startsAt)}</span>
                            {s.module ? (
                              <>
                                <Sep />
                                {s.module.title}
                              </>
                            ) : null}
                          </span>
                          <span className="mt-1.5 block sm:hidden">
                            <StatusPill phase={phase} attended={attended.has(s.id)} isNext={isNext} />
                          </span>
                        </span>
                        <span className="hidden sm:block">
                          <StatusPill phase={phase} attended={attended.has(s.id)} isNext={isNext} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
