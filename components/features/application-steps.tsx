import { IconCheck } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

export type StepState = "done" | "current" | "todo" | "blocked";
export type Step = { label: string; hint?: string; state: StepState };

/**
 * Horizontal step tracker (vertical on phones). Each state has its own shape:
 * done = filled check, current = saffron ring, todo = hollow, blocked = dashed.
 */
export function ApplicationSteps({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="grid gap-0 sm:grid-flow-col sm:auto-cols-fr" aria-label="Application progress">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.label} className="relative flex gap-3 pb-5 sm:flex-col sm:gap-2 sm:pb-0 sm:pr-3">
            {/* connector: vertical on mobile, horizontal on desktop */}
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px sm:left-7 sm:top-[13px] sm:h-px sm:w-[calc(100%-1.75rem)]",
                  s.state === "done" ? "bg-fg/70" : "bg-line-strong",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full",
                s.state === "done" && "bg-fg text-ink",
                s.state === "current" && "border-2 border-accent bg-ink",
                s.state === "todo" && "border-[1.5px] border-line-strong bg-ink",
                s.state === "blocked" && "border-[1.5px] border-dashed border-muted bg-ink",
              )}
            >
              {s.state === "done" ? <IconCheck width={14} height={14} /> : null}
              {s.state === "current" ? <span className="size-2 rounded-full bg-accent" /> : null}
            </span>
            <span className="min-w-0 pt-0.5 sm:pt-0">
              <span
                className={cn(
                  "block text-sm font-semibold",
                  s.state === "todo" && "text-muted",
                  s.state === "current" && "text-accent-ink",
                )}
              >
                {s.label}
                <span className="sr-only">
                  {" "}
                  —{" "}
                  {s.state === "done"
                    ? "done"
                    : s.state === "current"
                      ? "in progress"
                      : s.state === "blocked"
                        ? "not available"
                        : "to do"}
                </span>
              </span>
              {s.hint ? <span className="block text-xs text-muted">{s.hint}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
