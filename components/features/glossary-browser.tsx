"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { IconSearch } from "@/components/brand/icons";
import { ChipButton, ChipRow } from "@/components/ui/chip";

export type GlossaryListItem = { slug: string; term: string; shortDef: string; moduleSlug: string | null };

/** Client-side search + module filter + A–Z index over a server-rendered list. */
export function GlossaryBrowser({
  terms,
  modules,
}: {
  terms: GlossaryListItem[];
  modules: { slug: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [moduleSlug, setModuleSlug] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(
    () =>
      terms.filter(
        (t) =>
          (!moduleSlug || t.moduleSlug === moduleSlug) &&
          (!q || t.term.toLowerCase().includes(q) || t.shortDef.toLowerCase().includes(q)),
      ),
    [terms, moduleSlug, q],
  );

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryListItem[]>();
    for (const t of filtered) {
      const letter = t.term[0]?.toUpperCase() ?? "#";
      map.set(letter, [...(map.get(letter) ?? []), t]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_15rem] lg:gap-12">
      <div className="min-w-0">
        <label className="relative block">
          <span className="sr-only">Search terms</span>
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FSI, setback, TDR…"
            className="field pl-11"
          />
        </label>

        <div className="mt-4">
          <ChipRow label="Filter by module">
            {[{ slug: null, title: "All" }, ...modules].map((m) => (
              <ChipButton key={m.slug ?? "all"} active={moduleSlug === m.slug} onClick={() => setModuleSlug(m.slug)}>
                {m.title}
              </ChipButton>
            ))}
          </ChipRow>
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length} terms
        </p>

        {groups.length === 0 ? (
          <p className="mt-10 text-muted">No terms match “{query}”. Try a shorter word.</p>
        ) : (
          <div className="mt-8 space-y-10">
            {groups.map(([letter, items]) => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <h2 className="display-3 text-accent-ink">{letter}</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/glossary/${t.slug}`}
                        className="card group block h-full p-4 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
                      >
                        <span className="block font-semibold tracking-[-0.01em]">{t.term}</span>
                        <span className="mt-1 block font-serif text-[1.0625rem] leading-snug text-fg-soft">
                          {t.shortDef}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <nav aria-label="A to Z" className="hidden lg:block">
        <div className="sticky top-8">
          <p className="survey text-muted">Index</p>
          <div className="mt-3 grid grid-cols-6 gap-1">
            {groups.map(([letter]) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="grid aspect-square place-items-center rounded-md text-sm font-semibold text-fg-soft hover:bg-surface-2 hover:text-accent-ink"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
