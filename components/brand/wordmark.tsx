import { cn } from "@/lib/utils";

/** "Plot" in cream, "Edu" in saffron, heavy grotesk — as on the posters. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display font-extrabold tracking-[-0.035em] [font-variation-settings:'wdth'_112]", className)}
    >
      <span className="text-fg">Plot</span>
      <span className="text-accent">Edu</span>
    </span>
  );
}
