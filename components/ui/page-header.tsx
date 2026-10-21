import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One header pattern for every page: mono eyebrow with a hairline, expanded
 * display title, serif lead. Optional actions sit right on desktop.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 sm:mb-10", className)}>
      <p className="survey flex items-center gap-3 text-accent-ink after:h-px after:flex-1 after:bg-line">{eyebrow}</p>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="display-2">{title}</h1>
          {lead ? <p className="lead mt-4 max-w-2xl">{lead}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

/** Section heading: sans semibold with an optional count and trailing action. */
export function SectionHeading({
  children,
  count,
  action,
  id,
  className,
}: {
  children: ReactNode;
  count?: number;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-baseline justify-between gap-4", className)}>
      <h2 id={id} className="text-[0.9375rem] font-semibold tracking-[-0.005em] text-fg">
        {children}
        {count !== undefined ? <span className="ml-2 font-normal text-muted tabular">{count}</span> : null}
      </h2>
      {action}
    </div>
  );
}
