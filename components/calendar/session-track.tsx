import Link from "next/link";
import { istDay, monthShort } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export type TrackStatus = "attended" | "missed" | "next" | "upcoming" | "cancelled";

export type TrackItem = {
  id: string;
  number: number;
  title: string;
  startsAt: Date;
  status: TrackStatus;
};

const STATUS_LABEL: Record<TrackStatus, string> = {
  attended: "Attended",
  missed: "Missed",
  next: "Next",
  upcoming: "Upcoming",
  cancelled: "Cancelled",
};

/**
 * Each status has its own shape, so the track reads without colour (CVD, print).
 * Only "next" uses saffron: it is the "now" of the course.
 */
function Marker({ status, className }: { status: TrackStatus; className?: string }) {
  switch (status) {
    case "attended":
      return <span aria-hidden className={cn("block size-3 rounded-[3px] bg-fg", className)} />;
    case "missed":
      return (
        <span aria-hidden className={cn("relative block size-3 rounded-[3px] border-[1.5px] border-muted", className)}>
          <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[15px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted" />
        </span>
      );
    case "next":
      return (
        <span
          aria-hidden
          className={cn("grid size-4 place-items-center rounded-[4px] border-2 border-accent bg-ink", className)}
        >
          <span className="size-1.5 rounded-[1px] bg-accent" />
        </span>
      );
    case "upcoming":
      return (
        <span
          aria-hidden
          className={cn("block size-3 rounded-[3px] border-[1.5px] border-line-strong bg-ink", className)}
        />
      );
    case "cancelled":
      return <span aria-hidden className={cn("block size-2 rotate-45 bg-line-strong", className)} />;
  }
}

/**
 * Course journey drawn as a dimension line: one marker per session, measured
 * from the first to the last class. Replaces a generic progress bar (PRD §6).
 */
export function SessionTrack({ items, compact = false }: { items: readonly TrackItem[]; compact?: boolean }) {
  const held = items.filter((i) => i.status !== "cancelled");
  const attended = held.filter((i) => i.status === "attended").length;
  const done = held.filter((i) => i.status === "attended" || i.status === "missed").length;
  const nextItem = items.find((i) => i.status === "next");
  const legend: TrackStatus[] = ["attended", "next", "upcoming", "missed"];

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="journey-h" className={cn(!compact && "card h-full p-4 sm:p-5")}>
      {!compact ? (
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="journey-h" className="text-[0.9375rem] font-semibold">
              Course journey
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {done} of {held.length} sessions held
            </p>
          </div>
          <p className="text-right">
            <span className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">{attended}</span>
            <span className="text-sm text-muted"> / {held.length} attended</span>
          </p>
        </div>
      ) : (
        <h2 id="journey-h" className="sr-only">
          Course journey
        </h2>
      )}

      <ol
        className="relative flex items-center justify-between px-1"
        aria-label={`${attended} of ${held.length} sessions attended`}
      >
        {/* dimension line with end ticks */}
        <span aria-hidden className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
        <span aria-hidden className="absolute left-1 top-1/2 h-3 w-px -translate-y-1/2 bg-fg/60" />
        <span aria-hidden className="absolute right-1 top-1/2 h-3 w-px -translate-y-1/2 bg-fg/60" />
        {items.map((i) => {
          const d = istDay(i.startsAt);
          const label = `Session ${i.number}: ${i.title}, ${d.day} ${monthShort(d.month)} — ${STATUS_LABEL[i.status]}`;
          return (
            <li key={i.id} className="relative z-10">
              <Link
                href={`/sessions/${i.id}`}
                aria-label={label}
                title={label}
                className="group grid size-8 place-items-center rounded-lg hover:bg-surface-2"
              >
                <Marker status={i.status} className="transition-transform duration-150 group-hover:scale-125" />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Selective direct labels: first, next, last. */}
      <div className="mt-1 flex justify-between px-1 text-[0.6875rem] font-medium text-muted">
        <span>S{items[0]?.number.toString().padStart(2, "0")}</span>
        {nextItem ? (
          <span className="text-accent-ink">
            Next · S{nextItem.number.toString().padStart(2, "0")} · {istDay(nextItem.startsAt).day}{" "}
            {monthShort(istDay(nextItem.startsAt).month)}
          </span>
        ) : null}
        <span>S{items[items.length - 1]?.number.toString().padStart(2, "0")}</span>
      </div>

      {!compact ? (
        <ul
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-muted"
          aria-label="Legend"
        >
          {legend.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <Marker status={s} className={s === "next" ? "!size-3 border-[1.5px]" : undefined} />
              {STATUS_LABEL[s]}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
