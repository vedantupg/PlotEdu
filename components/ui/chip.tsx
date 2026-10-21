import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function chipClass(active: boolean, className?: string): string {
  return cn(
    "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150",
    active ? "border-fg/80 bg-fg text-ink" : "border-line-strong text-fg-soft hover:border-fg/40 hover:text-fg",
    className,
  );
}

/** Filter pill. Rendered as a link (URL-driven filters) or a button (client filters). */
export function ChipLink({
  active,
  children,
  ...props
}: { active: boolean; children: ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link aria-current={active ? "true" : undefined} className={chipClass(active)} {...props}>
      {children}
    </Link>
  );
}

export function ChipButton({
  active,
  children,
  ...props
}: { active: boolean; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button type="button" aria-pressed={active} className={chipClass(active)} {...props}>
      {children}
    </button>
  );
}

export function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {children}
    </div>
  );
}
