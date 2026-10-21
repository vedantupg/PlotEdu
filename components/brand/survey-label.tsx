import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurveyLabelProps = {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "accent" | "fg";
  /** Trailing hairline rule, as in "COURSE 01 ————". */
  rule?: boolean;
  as?: "span" | "p" | "div" | "h2" | "h3";
};

/** Mono uppercase metadata: `MODULE 02 · FSI`, `NOTE · PDF · 2.4 MB`. */
export function SurveyLabel({ children, className, tone = "muted", rule = false, as: Tag = "span" }: SurveyLabelProps) {
  return (
    <Tag
      className={cn(
        "survey",
        tone === "muted" && "text-muted",
        tone === "accent" && "text-accent-ink",
        tone === "fg" && "text-fg",
        rule && "flex items-center gap-3 after:h-px after:flex-1 after:bg-line",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
