import Link from "next/link";
import { istDay, istMonthGrid, monthLong } from "@/lib/calendar";
import type { ClassSession } from "@/lib/data/types";
import { formatISTTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const HEAD = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** One IST month with class days marked; class days link to their session. */
export function MonthCalendar({
  year,
  month,
  sessions,
  now,
  nextId,
}: {
  year: number;
  month: number;
  sessions: readonly ClassSession[];
  now: Date;
  nextId: string | null;
}) {
  const today = istDay(now).key;
  const byDay = new Map<string, ClassSession>();
  for (const s of sessions) byDay.set(istDay(s.startsAt).key, s);

  return (
    <figure className="card p-4">
      <figcaption className="mb-3 flex items-baseline justify-between">
        <span className="font-semibold">{monthLong(month)}</span>
        <span className="text-sm text-muted">{year}</span>
      </figcaption>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`${monthLong(month)} ${year}`}>
        {HEAD.map((h, i) => (
          <span key={`${h}-${i}`} role="columnheader" className="pb-1 text-[0.6875rem] font-medium text-muted">
            {h}
          </span>
        ))}
        {istMonthGrid(year, month).map((d, i) => {
          if (!d) return <span key={`blank-${i}`} role="gridcell" />;
          const s = byDay.get(d.key);
          const isToday = d.key === today;
          const past = d.key < today;
          const base = "relative grid aspect-square place-items-center rounded-lg text-sm";
          if (!s) {
            return (
              <span
                key={d.key}
                role="gridcell"
                className={cn(
                  base,
                  past ? "text-muted/60" : "text-fg-soft",
                  isToday && "ring-1 ring-fg font-semibold text-fg",
                )}
              >
                {d.day}
              </span>
            );
          }
          const isNext = s.id === nextId;
          return (
            <Link
              key={d.key}
              role="gridcell"
              href={`/sessions/${s.id}`}
              aria-label={`${d.day} ${monthLong(month)}: Session ${s.number}, ${s.title}, ${formatISTTime(s.startsAt)}${s.cancelled ? " (cancelled)" : ""}`}
              className={cn(
                base,
                "font-semibold transition-colors duration-150",
                s.cancelled
                  ? "text-muted line-through"
                  : isNext
                    ? "bg-accent text-on-accent hover:bg-accent-hover"
                    : past
                      ? "bg-surface-3 text-fg-soft hover:bg-line-strong"
                      : "border border-accent/70 text-fg hover:bg-surface-2",
                isToday && !isNext && "ring-1 ring-fg",
              )}
            >
              {d.day}
            </Link>
          );
        })}
      </div>
    </figure>
  );
}
