"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { IconArrowRight, IconNote, IconVideo } from "@/components/brand/icons";
import { PlotFrame } from "@/components/brand/plot-frame";
import { AddToCalendar } from "@/components/calendar/add-to-calendar";
import { DateLeaf } from "@/components/calendar/date-leaf";
import { ButtonAnchor, ButtonLink, buttonClass } from "@/components/ui/button";
import { Sep } from "@/components/ui/sep";
import { relativeDayLabel } from "@/lib/calendar";
import { canJoin, sessionEndsAt, sessionPhase, type SessionPhase } from "@/lib/session-state";
import { formatISTTime, formatLocalHint } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Countdown } from "./countdown";
import { useServerClock } from "./use-server-clock";

/** Serializable session shape passed from the server. */
export type SessionCardData = {
  id: string;
  number: number;
  totalSessions: number;
  title: string;
  agenda: string[];
  startsAtIso: string;
  durationMin: number;
  cancelled: boolean;
  recordingUrl: string | null;
  moduleOrder: number | null;
  moduleTitle: string | null;
  professorName: string | null;
  hasNotes: boolean;
};

const noopSubscribe = (): (() => void) => () => {};

const PHASE_PILL: Record<SessionPhase, { label: string; className: string }> = {
  far: { label: "Next session", className: "border border-line-strong text-fg-soft" },
  upcoming: { label: "Next session", className: "border border-line-strong text-fg-soft" },
  go: { label: "Starting soon", className: "bg-accent text-on-accent" },
  live: { label: "Live now", className: "bg-accent text-on-accent" },
  ended: { label: "Ended", className: "bg-surface-3 text-fg-soft" },
  cancelled: { label: "Cancelled", className: "bg-danger/15 text-danger" },
};

const weekdayLong = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long" });

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Elapsed meter for a live class: accent fill on a same-hue track. */
function LiveMeter({ startsAt, endsAt, now }: { startsAt: Date; endsAt: Date; now: number }) {
  const total = endsAt.getTime() - startsAt.getTime();
  const elapsed = Math.min(total, Math.max(0, now - startsAt.getTime()));
  const pct = (elapsed / total) * 100;
  const minsIn = Math.floor(elapsed / 60_000);
  const minsLeft = Math.max(0, Math.ceil((total - elapsed) / 60_000));
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">{minsIn} min in</span>
        <span className="text-sm text-muted">{minsLeft} min left</span>
      </div>
      <div
        role="meter"
        aria-label="Class progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(total / 60_000)}
        aria-valuenow={minsIn}
        className="mt-3 h-2 overflow-hidden rounded-full bg-accent/20"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted">
        <span>{formatISTTime(startsAt)}</span>
        <span>{formatISTTime(endsAt)}</span>
      </div>
    </div>
  );
}

/**
 * The dashboard hero (PRD 4.2). Shows only what answers "what do I do next?":
 * date, session number, title, countdown and Join. Agenda sits behind Read more.
 */
export function SessionCard({
  session,
  serverNowMs,
  expanded = false,
}: {
  session: SessionCardData;
  serverNowMs: number;
  /** Session detail page shows the agenda inline instead of behind Read more. */
  expanded?: boolean;
}) {
  const now = useServerClock(serverNowMs);
  const startsAt = new Date(session.startsAtIso);
  const endsAt = sessionEndsAt({ startsAt, durationMin: session.durationMin });
  const phase = sessionPhase(
    { startsAt, durationMin: session.durationMin, cancelled: session.cancelled },
    new Date(now),
  );
  const joinable = canJoin(phase);
  const relative = relativeDayLabel(startsAt, new Date(now));
  // Server renders as IST; the client swaps in the viewer's zone after hydration.
  const viewerTz = useSyncExternalStore(
    noopSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "Asia/Kolkata",
  );
  const localHint = formatLocalHint(startsAt, viewerTz);
  const pill = PHASE_PILL[phase];
  const hot = phase === "go" || phase === "live";

  const [open, setOpen] = useState(expanded);
  const detailsId = `session-${session.id}-details`;

  const details = (
    <div id={detailsId} className="grid gap-5 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:gap-8">
      {session.agenda.length > 0 ? (
        <ol className="space-y-1.5">
          {session.agenda.map((item, i) => (
            <li key={item} className="flex gap-3 text-[0.9375rem]">
              <span className="survey tabular pt-[0.3rem] text-accent-ink">{pad(i + 1)}</span>
              <span className="text-fg-soft">{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">The agenda will be shared before class.</p>
      )}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-1">
        {session.professorName ? (
          <div>
            <dt className="text-muted">Taught by</dt>
            <dd className="font-medium">{session.professorName}</dd>
          </div>
        ) : null}
        {session.moduleTitle ? (
          <div>
            <dt className="text-muted">Module</dt>
            <dd className="font-medium">
              {pad(session.moduleOrder ?? 0)} · {session.moduleTitle}
            </dd>
          </div>
        ) : null}
        {localHint ? (
          <div>
            <dt className="text-muted">Your time</dt>
            <dd className="font-medium">{localHint.replace(/[()]/g, "").replace(" your time", "")}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );

  return (
    <PlotFrame
      as="section"
      animateCorners={phase === "go"}
      tone={hot ? "accent" : "muted"}
      className={cn(
        "h-full bg-surface shadow-[var(--shadow)] transition-[box-shadow,border-color] duration-200",
        phase === "go" && "animate-go border-accent",
        phase === "live" && "border-accent",
      )}
    >
      <div className="flex h-full flex-col gap-5 p-5 sm:p-6" aria-labelledby={`session-${session.id}-title`}>
        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                pill.className,
              )}
            >
              {phase === "live" ? (
                <span aria-hidden className="animate-live size-1.5 rounded-full bg-on-accent" />
              ) : null}
              {pill.label}
            </span>
            <span className="survey text-muted">
              Session {pad(session.number)}
              <span className="opacity-60"> / {pad(session.totalSessions)}</span>
            </span>
          </div>
          {!expanded ? (
            <Link href={`/sessions/${session.id}`} className="shrink-0 text-sm font-medium text-muted hover:text-fg">
              Details →
            </Link>
          ) : null}
        </div>

        {/* Identity: date leaf + title + time */}
        <div className="flex min-w-0 items-center gap-4">
          <DateLeaf date={startsAt} size="md" highlight={hot} muted={phase === "cancelled"} />
          <div className="min-w-0">
            <h2
              id={`session-${session.id}-title`}
              className={cn(
                "text-[1.375rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[1.625rem]",
                phase === "cancelled" && "line-through decoration-danger/70",
              )}
            >
              {session.title}
            </h2>
            <p className="mt-1 text-[0.9375rem] text-fg-soft">
              <time dateTime={session.startsAtIso} className="font-semibold text-fg">
                {relative ?? weekdayLong.format(startsAt)}
                <Sep />
                <span className="whitespace-nowrap">{formatISTTime(startsAt)} IST</span>
              </time>
              <Sep />
              <span className="whitespace-nowrap">{session.durationMin} min</span>
            </p>
          </div>
        </div>

        {/* The one hero figure */}
        {phase === "far" || phase === "upcoming" || phase === "go" ? (
          <Countdown msRemaining={startsAt.getTime() - now} />
        ) : phase === "live" ? (
          <LiveMeter startsAt={startsAt} endsAt={endsAt} now={now} />
        ) : null}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {phase === "cancelled" ? (
            <p className="text-sm text-muted">Cancelled. Watch for an announcement with the new date.</p>
          ) : phase === "ended" ? (
            <>
              {session.recordingUrl ? (
                <a
                  href={session.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: "inverse", size: "md" })}
                >
                  <IconVideo width={18} height={18} /> Watch recording
                </a>
              ) : null}
              <ButtonLink href={`/notes?session=${session.id}`} variant="secondary" size="md">
                <IconNote width={18} height={18} />
                {session.hasNotes ? "Session notes" : "Notes coming soon"}
              </ButtonLink>
            </>
          ) : (
            <>
              {joinable ? (
                // Plain anchor: the join route logs attendance then redirects to Meet.
                <ButtonAnchor
                  href={`/s/${session.id}/join`}
                  size="md"
                  className={cn(phase === "live" && "animate-live")}
                >
                  <IconVideo width={18} height={18} /> Join class <IconArrowRight width={16} height={16} />
                </ButtonAnchor>
              ) : (
                <span
                  aria-disabled
                  className={buttonClass({
                    variant: "secondary",
                    size: "md",
                    className: "cursor-not-allowed text-muted",
                  })}
                >
                  <IconVideo width={18} height={18} /> Join opens 15 min before
                </span>
              )}
              <AddToCalendar
                sessionId={session.id}
                title={session.title}
                startsAt={startsAt}
                durationMin={session.durationMin}
                size="md"
              />
            </>
          )}
          {!expanded ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-fg-soft hover:bg-surface-2 hover:text-fg sm:ml-auto"
            >
              {open ? "Show less" : "Read more"}
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                width={12}
                height={12}
                className={cn("transition-transform duration-150", open && "rotate-180")}
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ) : null}
        </div>

        {open ? <div className="animate-fade-up">{details}</div> : null}
      </div>
    </PlotFrame>
  );
}
