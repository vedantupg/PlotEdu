/** Time helpers. Store UTC, always display IST (Asia/Kolkata) for this course. */

export const IST_TZ = "Asia/Kolkata";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const surveyDateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TZ,
  day: "2-digit",
  month: "short",
});

/** "Thu, 22 Oct" */
export function formatISTDate(date: Date): string {
  return dateFmt.format(date);
}

/** "7:00 pm" -> normalised to "7:00 PM" */
export function formatISTTime(date: Date): string {
  return timeFmt.format(date).toUpperCase().replace(/\s+/g, " ");
}

/** Survey-label style: "22 OCT · 7:00 PM IST" */
export function formatSurveyDateTime(date: Date): string {
  return `${surveyDateFmt.format(date).toUpperCase()} · ${formatISTTime(date)} IST`;
}

/**
 * Viewer's local time in brackets when they are not on IST, e.g. "(2:30 PM your time)".
 * Returns null when the viewer is on IST.
 */
export function formatLocalHint(date: Date, viewerTimeZone: string): string | null {
  if (viewerTimeZone === IST_TZ || viewerTimeZone === "Asia/Calcutta") return null;
  const local = new Intl.DateTimeFormat("en-IN", {
    timeZone: viewerTimeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
  return `(${local} your time)`;
}

export type Remaining = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Split a positive duration into countdown parts. Negative input clamps to zero. */
export function splitRemaining(ms: number): Remaining {
  const totalMs = Math.max(0, ms);
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Request-time clock for server components (one read per render, passed down). */
export function requestNow(): number {
  return Date.now();
}
