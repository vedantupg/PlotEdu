"use client";

import { pad2, splitRemaining } from "@/lib/time";
import { cn } from "@/lib/utils";

/** Each digit re-mounts on change so it rolls in (disabled under reduced motion). */
function RollingNumber({ value }: { value: string }) {
  return (
    <span className="inline-flex overflow-hidden">
      {value.split("").map((ch, i) => (
        <span key={`${i}-${ch}`} className="animate-digit inline-block">
          {ch}
        </span>
      ))}
    </span>
  );
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Countdown as four compact tiles (days, hours, minutes, seconds), plus a polite
 * live region that changes at most once a minute so screen readers aren't flooded.
 */
export function Countdown({ msRemaining, className }: { msRemaining: number; className?: string }) {
  const r = splitRemaining(msRemaining);
  const units: [string, number][] = [
    ["days", r.days],
    ["hrs", r.hours],
    ["min", r.minutes],
    ["sec", r.seconds],
  ];
  const spoken =
    r.days > 0
      ? `Starts in ${plural(r.days, "day")}, ${plural(r.hours, "hour")}`
      : `Starts in ${plural(r.hours, "hour")}, ${plural(r.minutes, "minute")}`;

  return (
    <div className={className}>
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {units.map(([label, v]) => (
          <div key={label} className="rounded-[10px] bg-surface-2 px-2 py-2 text-center">
            <div
              className={cn(
                "tabular text-[1.625rem] font-semibold leading-none tracking-[-0.03em]",
                label === "sec" && "text-muted",
              )}
            >
              <RollingNumber value={pad2(v)} />
            </div>
            <div className="mt-1 text-[0.6875rem] font-medium text-muted">{label}</div>
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>
    </div>
  );
}
