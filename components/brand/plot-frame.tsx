import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PlotFrameProps = {
  children: ReactNode;
  className?: string;
  /** Dotted inner boundary, as on the posters. */
  inset?: boolean;
  /** Draw the corners in (used when a session reaches "go" time). */
  animateCorners?: boolean;
  /** Corner marker colour: saffron marks "the one thing that matters". */
  tone?: "accent" | "muted";
  as?: "div" | "section" | "article";
};

/**
 * The plot boundary with saffron corner markers. Rule (PRD §6): never more than
 * one framed element per view; it marks the single most important thing.
 */
export function PlotFrame({
  children,
  className,
  inset = false,
  animateCorners = false,
  tone = "accent",
  as: Tag = "div",
}: PlotFrameProps) {
  const corner = cn(
    "pointer-events-none absolute size-2.5",
    tone === "accent" ? "bg-accent" : "bg-line-strong",
    animateCorners && "animate-corner",
  );
  return (
    <Tag className={cn("relative border border-fg/80", className)}>
      <span aria-hidden className={cn(corner, "-left-[5px] -top-[5px] origin-bottom-right")} />
      <span aria-hidden className={cn(corner, "-right-[5px] -top-[5px] origin-bottom-left [animation-delay:60ms]")} />
      <span aria-hidden className={cn(corner, "-bottom-[5px] -left-[5px] origin-top-right [animation-delay:120ms]")} />
      <span aria-hidden className={cn(corner, "-bottom-[5px] -right-[5px] origin-top-left [animation-delay:180ms]")} />
      {inset ? <div className="m-2 border border-dashed border-accent/45 sm:m-3">{children}</div> : children}
    </Tag>
  );
}
