import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClass } from "@/components/ui/button";
import { COURSE_ONE } from "@/lib/content/course";

/** Signed-out top bar: Course, Glossary, Free notes, Sign in. Static (no cookie reads). */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--container-content)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="PlotEdu home" className="text-2xl">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href={`/courses/${COURSE_ONE.slug}`}
            className="hidden rounded-lg px-3 py-2 font-medium text-fg-soft hover:text-fg sm:block"
          >
            Course
          </Link>
          <Link href="/glossary" className="rounded-lg px-3 py-2 font-medium text-fg-soft hover:text-fg">
            Glossary
          </Link>
          <Link href="/notes" className="hidden rounded-lg px-3 py-2 font-medium text-fg-soft hover:text-fg sm:block">
            Free notes
          </Link>
          <Link href="/sign-in" className={buttonClass({ variant: "inverse", size: "md", className: "ml-1 !w-auto" })}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
