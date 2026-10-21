/**
 * Calendar math in IST (Asia/Kolkata, fixed UTC+5:30, no DST) and .ics export.
 * Pure functions so server and client agree on "which day is it".
 */

export const IST_OFFSET_MS = 330 * 60_000;
const DAY_MS = 86_400_000;

/** A calendar day in IST, as a stable key and parts. */
export type ISTDay = {
  key: string; // "2026-10-21"
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0 = Monday … 6 = Sunday
};

export function istDay(date: Date): ISTDay {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const weekday = (shifted.getUTCDay() + 6) % 7;
  const key = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  return { key, year, month, day, weekday };
}

/** Midnight IST of the given IST calendar date, as an absolute instant. */
export function istMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS);
}

/** The 7 IST days (Mon → Sun) of the week containing `date`. */
export function istWeek(date: Date): ISTDay[] {
  const today = istDay(date);
  const monday = istMidnight(today.year, today.month, today.day).getTime() - today.weekday * DAY_MS;
  return Array.from({ length: 7 }, (_, i) => istDay(new Date(monday + i * DAY_MS)));
}

/**
 * Month grid for an IST month: leading blanks (null) so the 1st lands on its
 * weekday column (Monday-first), then every day of the month.
 */
export function istMonthGrid(year: number, month: number): (ISTDay | null)[] {
  const first = istDay(istMidnight(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (ISTDay | null)[] = Array.from({ length: first.weekday }, () => null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(istDay(istMidnight(year, month, d)));
  return cells;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function monthShort(month: number): string {
  return MONTHS[month - 1] ?? "";
}
export function monthLong(month: number): string {
  return MONTHS_LONG[month - 1] ?? "";
}
export function weekdayShort(weekday: number): string {
  return WEEKDAYS[weekday] ?? "";
}

/** Distinct IST months (year, month) that contain at least one of the dates, in order. */
export function monthsSpanning(dates: readonly Date[]): { year: number; month: number }[] {
  const seen = new Map<string, { year: number; month: number }>();
  for (const d of [...dates].sort((a, b) => a.getTime() - b.getTime())) {
    const { year, month } = istDay(d);
    seen.set(`${year}-${month}`, { year, month });
  }
  return [...seen.values()];
}

/** "Today", "Tomorrow", or null — relative day names read faster than dates. */
export function relativeDayLabel(target: Date, now: Date): string | null {
  const a = istDay(target);
  const b = istDay(now);
  const diff = Math.round(
    (istMidnight(a.year, a.month, a.day).getTime() - istMidnight(b.year, b.month, b.day).getTime()) / DAY_MS,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return null;
}

// ---------------------------------------------------------------------------
// .ics (RFC 5545)
// ---------------------------------------------------------------------------

function icsDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines to 75 octets as RFC 5545 requires (approximated by characters). */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 74) parts.push((i === 0 ? "" : " ") + line.slice(i, i + 74));
  return parts.join("\r\n");
}

export type IcsEvent = {
  uid: string;
  title: string;
  startsAt: Date;
  durationMin: number;
  description: string;
  url: string;
  now: Date;
};

/**
 * One VEVENT with a 15-minute reminder. The location is the dashboard, never the
 * raw Meet link, so attendance is always logged through the join route.
 */
export function buildIcs(e: IcsEvent): string {
  const end = new Date(e.startsAt.getTime() + e.durationMin * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PlotEdu//Sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${icsDate(e.now)}`,
    `DTSTART:${icsDate(e.startsAt)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(e.title)}`,
    `DESCRIPTION:${icsEscape(e.description)}`,
    `URL:${e.url}`,
    `LOCATION:${icsEscape(e.url)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(e.title)} starts in 15 minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
