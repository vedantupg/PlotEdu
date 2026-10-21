/**
 * Next Session card state machine (PRD 4.2). Pure so it runs identically on the
 * server (first paint) and in the client ticker.
 */

export const JOIN_WINDOW_MS = 15 * 60_000;
export const FAR_THRESHOLD_MS = 24 * 60 * 60_000;

export type SessionPhase =
  | "far" // > 24h away: countdown + Add to calendar
  | "upcoming" // between 15 min and 24h: countdown
  | "go" // < 15 min: saffron glow, Join active
  | "live" // started, not ended: Live now pulse, Join
  | "ended" // finished: recording + notes
  | "cancelled";

export type SessionTiming = {
  startsAt: Date;
  durationMin: number;
  cancelled?: boolean;
};

export function sessionEndsAt(s: SessionTiming): Date {
  return new Date(s.startsAt.getTime() + s.durationMin * 60_000);
}

export function sessionPhase(s: SessionTiming, now: Date): SessionPhase {
  if (s.cancelled) return "cancelled";
  const start = s.startsAt.getTime();
  const end = sessionEndsAt(s).getTime();
  const t = now.getTime();

  if (t >= end) return "ended";
  if (t >= start) return "live";
  const until = start - t;
  if (until <= JOIN_WINDOW_MS) return "go";
  if (until > FAR_THRESHOLD_MS) return "far";
  return "upcoming";
}

/** Join is tappable from 15 minutes before start until the end. */
export function canJoin(phase: SessionPhase): boolean {
  return phase === "go" || phase === "live";
}

/**
 * Pick the hero session: the live one if any, otherwise the soonest one that has
 * not ended. Falls back to null (card shows "Next session will be announced").
 */
export function pickHeroSession<T extends SessionTiming>(sessions: readonly T[], now: Date): T | null {
  const active = sessions
    .filter((s) => !s.cancelled && sessionEndsAt(s).getTime() > now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return active[0] ?? null;
}

/** Most recent ended session, for the "last session recap" when nothing is upcoming. */
export function pickLastSession<T extends SessionTiming>(sessions: readonly T[], now: Date): T | null {
  const ended = sessions
    .filter((s) => !s.cancelled && sessionEndsAt(s).getTime() <= now.getTime())
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  return ended[0] ?? null;
}

/** Google Calendar "add event" template link (no OAuth needed on the student side). */
export function googleCalendarTemplateUrl(params: {
  title: string;
  startsAt: Date;
  durationMin: number;
  details: string;
}): string {
  const fmt = (d: Date): string =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = new Date(params.startsAt.getTime() + params.durationMin * 60_000);
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${fmt(params.startsAt)}/${fmt(end)}`);
  url.searchParams.set("details", params.details);
  url.searchParams.set("ctz", "Asia/Kolkata");
  return url.toString();
}
