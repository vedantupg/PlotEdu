import { istDay, monthShort, weekdayShort } from "@/lib/calendar";
import { cn } from "@/lib/utils";

type DateLeafProps = {
  date: Date;
  size?: "sm" | "md" | "lg";
  /** Accent outline: the session that is "now" or next. */
  highlight?: boolean;
  muted?: boolean;
  className?: string;
};

const SIZES = {
  sm: { box: "w-12", band: "h-4 text-[0.5625rem]", day: "text-xl", wd: "text-[0.625rem] pb-1" },
  md: { box: "w-16", band: "h-5 text-[0.625rem]", day: "text-[1.75rem]", wd: "text-[0.6875rem] pb-1.5" },
  lg: { box: "w-[5.5rem]", band: "h-6 text-[0.6875rem]", day: "text-[2.75rem]", wd: "text-xs pb-2" },
} as const;

/**
 * A tear-off calendar leaf (always IST): month band, day number, weekday.
 * Faster to read than "Wed, 21 Oct" and anchors every session to a date.
 */
export function DateLeaf({ date, size = "md", highlight = false, muted = false, className }: DateLeafProps) {
  const d = istDay(date);
  const s = SIZES[size];
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-[10px] border bg-surface-2 text-center",
        highlight ? "border-accent" : "border-line-strong",
        muted && "opacity-60",
        s.box,
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          "survey grid place-items-center !tracking-[0.14em]",
          highlight ? "bg-accent text-on-accent" : "bg-surface-3 text-fg-soft",
          s.band,
        )}
      >
        {monthShort(d.month)}
      </span>
      <span className={cn("pt-1 font-sans font-semibold leading-none tracking-[-0.03em] text-fg", s.day)}>{d.day}</span>
      <span className={cn("font-medium text-muted", s.wd)}>{weekdayShort(d.weekday)}</span>
    </div>
  );
}
