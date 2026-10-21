import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  // Saffron is reserved for action and "now" (PRD §6).
  primary:
    "bg-accent text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_2px_rgb(0_0_0/0.25)] hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface/60 text-fg hover:border-fg/40 hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  inverse: "bg-fg text-ink shadow-[0_1px_2px_rgb(0_0_0/0.25)] hover:bg-fg-soft",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-[0.9375rem]",
  lg: "min-h-12 px-6 text-base",
};

/** Shared button styling so every CTA has the same radius, weight and states. */
export function buttonClass({
  variant = "primary",
  size = "lg",
  full = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold tracking-[-0.005em]",
    "transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    full ? "w-full" : "w-full sm:w-auto",
    className,
  );
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string; children: ReactNode };

export function Button({ variant, size, full, className, ...props }: Common & ComponentProps<"button">) {
  return <button className={buttonClass({ variant, size, full, className })} {...props} />;
}

export function ButtonLink({ variant, size, full, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size, full, className })} {...props} />;
}

/** For routes that must be a full navigation (join → Meet, downloads). */
export function ButtonAnchor({ variant, size, full, className, ...props }: Common & ComponentProps<"a">) {
  return <a className={buttonClass({ variant, size, full, className })} {...props} />;
}
