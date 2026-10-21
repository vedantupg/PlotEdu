import Link from "next/link";
import { GLOSSARY, termOfTheDayIndex } from "@/lib/content/glossary";
import { cn } from "@/lib/utils";
import { TermDiagram } from "./term-diagram";

/**
 * "Every second teaches": term of the day, same for everyone on a given IST date.
 * Reads the static seed so it can appear in loading/empty/404 states with no I/O.
 */
export function TermOfTheDay({ className, label = "Term of the day" }: { className?: string; label?: string }) {
  const term = GLOSSARY[termOfTheDayIndex(new Date(), GLOSSARY.length)];
  if (!term) return null;
  return (
    <Link
      href={`/glossary/${term.slug}`}
      className={cn(
        "card group flex gap-5 p-5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="survey text-accent-ink">{label}</p>
        <p className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em]">{term.term}</p>
        <p className="mt-1.5 font-serif text-[1.0625rem] leading-snug text-fg-soft">{term.shortDef}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted group-hover:text-fg">
          Read the entry{" "}
          <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
      {term.diagram ? <TermDiagram kind={term.diagram} className="hidden w-28 shrink-0 self-center sm:block" /> : null}
    </Link>
  );
}
