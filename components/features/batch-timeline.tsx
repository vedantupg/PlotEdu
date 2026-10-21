import type { Module } from "@/lib/data/types";
import { istDay, monthShort } from "@/lib/calendar";
import { moduleCode } from "@/lib/utils";

/**
 * The batch drawn as a measured plot edge: start and end ticks with dates, and
 * the modules laid along it in order. Segments stay neutral (saffron is reserved
 * for action and "now"); order is carried by position and numbering.
 */
export function BatchTimeline({
  modules,
  startsOn,
  endsOn,
  durationLabel,
}: {
  modules: readonly Pick<Module, "id" | "order" | "title">[];
  startsOn: string | null;
  endsOn: string | null;
  durationLabel: string;
}) {
  const fmt = (iso: string | null): string => {
    if (!iso) return "TBA";
    const d = istDay(new Date(`${iso}T12:00:00+05:30`));
    return `${d.day} ${monthShort(d.month)}`;
  };

  return (
    <figure>
      <div className="flex items-end justify-between text-sm">
        <span>
          <span className="block text-xs text-muted">Starts</span>
          <span className="font-semibold">{fmt(startsOn)}</span>
        </span>
        <span className="pb-0.5 text-sm font-semibold text-accent-ink">{durationLabel}</span>
        <span className="text-right">
          <span className="block text-xs text-muted">Ends</span>
          <span className="font-semibold">{fmt(endsOn)}</span>
        </span>
      </div>

      {/* dimension line */}
      <div aria-hidden className="relative mt-2 h-3">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
        <span className="absolute left-0 top-0 h-full w-px bg-fg/70" />
        <span className="absolute right-0 top-0 h-full w-px bg-fg/70" />
      </div>

      <ol className="mt-2 flex gap-[2px] overflow-hidden rounded-[8px]">
        {modules.map((m) => (
          <li key={m.id} className="min-w-0 flex-1 bg-surface-3 px-3 py-3">
            <span className="survey block text-accent-ink">{moduleCode(m.order).replace("MODULE ", "M")}</span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-fg">{m.title}</span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-2 text-xs text-muted">Modules run in this order across the batch.</figcaption>
    </figure>
  );
}
