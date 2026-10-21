import Link from "next/link";
import { DateLeaf } from "@/components/calendar/date-leaf";
import { istDay, istWeek, monthShort, relativeDayLabel, weekdayShort } from "@/lib/calendar";
import type { ClassSession } from "@/lib/data/types";
import { formatISTTime } from "@/lib/time";
import { cn } from "@/lib/utils";

/**
 * This week at a glance (IST, Mon → Sun). Today is a filled circle; class days
 * carry a saffron marker and the start time. Each class day links to its session.
 */
export function WeekStrip({
  sessions,
  now,
  upNext = [],
}: {
  sessions: readonly ClassSession[];
  now: Date;
  /** Sessions after the hero, listed under the strip ("Coming up"). */
  upNext?: readonly ClassSession[];
}) {
  const week = istWeek(now);
  const today = istDay(now).key;
  const byDay = new Map<string, ClassSession>();
  for (const s of sessions) {
    if (!s.cancelled) byDay.set(istDay(s.startsAt).key, s);
  }
  const first = week[0];
  const last = week[6];

  return (
    <section aria-labelledby="week-h" className="card flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="week-h" className="text-[0.9375rem] font-semibold">
          This week
        </h2>
        {first && last ? (
          <span className="text-sm text-muted">
            {first.day} {monthShort(first.month)} – {last.day} {monthShort(last.month)}
          </span>
        ) : null}
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {week.map((d) => {
          const s = byDay.get(d.key);
          const isToday = d.key === today;
          const past = d.key < today;
          const cell = (
            <>
              <span className={cn("text-[0.6875rem] font-medium", isToday ? "text-fg" : "text-muted")}>
                {weekdayShort(d.weekday).slice(0, 1)}
                <span className="sr-only">{weekdayShort(d.weekday).slice(1)}</span>
              </span>
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-[0.9375rem] font-semibold",
                  isToday ? "bg-fg text-ink" : past ? "text-muted" : "text-fg",
                )}
              >
                {d.day}
              </span>
              <span className="flex h-8 flex-col items-center justify-start gap-1">
                {s ? (
                  <>
                    <span aria-hidden className={cn("size-1.5 rounded-[2px]", past ? "bg-muted" : "bg-accent")} />
                    <span
                      className={cn(
                        "text-[0.625rem] font-semibold leading-none",
                        past ? "text-muted" : "text-accent-ink",
                      )}
                    >
                      {formatISTTime(s.startsAt).replace(":00", "").replace(" ", "")}
                    </span>
                  </>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={d.key}>
              {s ? (
                <Link
                  href={`/sessions/${s.id}`}
                  aria-label={`${weekdayShort(d.weekday)} ${d.day}: ${s.title} at ${formatISTTime(s.startsAt)}`}
                  className="flex flex-col items-center gap-1 rounded-[10px] py-1.5 transition-colors duration-150 hover:bg-surface-2"
                >
                  {cell}
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-1 py-1.5">{cell}</div>
              )}
            </li>
          );
        })}
      </ol>

      {upNext.length > 0 ? (
        <div className="mt-4 border-t border-line pt-4">
          <h3 className="mb-2 text-sm font-semibold text-muted">Coming up</h3>
          <ul className="-mx-2 space-y-0.5">
            {upNext.map((s) => {
              const rel = relativeDayLabel(s.startsAt, now);
              return (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2"
                  >
                    <DateLeaf date={s.startsAt} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.title}</span>
                      <span className="block text-xs text-muted">
                        {rel ? `${rel} · ` : ""}
                        {formatISTTime(s.startsAt)} · Session {s.number.toString().padStart(2, "0")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
