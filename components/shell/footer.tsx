import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[var(--container-content)] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted">
          <span className="font-semibold text-fg">PlotEdu</span> — Learn the industry. Master the practice.
        </p>
        <nav aria-label="Legal" className="flex gap-5 text-sm text-muted">
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-fg">
            Terms
          </Link>
          <a href="mailto:hello@plotedu.in" className="hover:text-fg">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
