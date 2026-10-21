import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SurveyLabel } from "@/components/brand/survey-label";
import { TermDiagram } from "@/components/features/term-diagram";
import { JsonLd } from "@/components/json-ld";
import { COURSE_ONE } from "@/lib/content/course";
import { GLOSSARY } from "@/lib/content/glossary";
import { getGlossaryTerm } from "@/lib/data/queries";
import { SITE_URL } from "@/lib/env";

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const t = await getGlossaryTerm((await params).term);
  if (!t) return {};
  return {
    title: `${t.term} — meaning`,
    description: t.shortDef,
    alternates: { canonical: `/glossary/${t.slug}` },
  };
}

export default async function TermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term: slug } = await params;
  const t = await getGlossaryTerm(slug);
  if (!t) notFound();
  const diagram = GLOSSARY.find((g) => g.slug === t.slug)?.diagram;
  const termModule = COURSE_ONE.modules.find((m) => m.slug === t.moduleSlug);

  return (
    <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: t.term,
          description: t.shortDef,
          url: `${SITE_URL}/glossary/${t.slug}`,
          inDefinedTermSet: { "@type": "DefinedTermSet", name: "PlotEdu Glossary", url: `${SITE_URL}/glossary` },
        }}
      />
      <div className="min-w-0 max-w-[var(--container-reading)]">
        <Link href="/glossary" className="text-sm font-medium text-muted hover:text-fg">
          ← Glossary
        </Link>
        <p className="survey mt-8 flex items-center gap-3 text-accent-ink after:h-px after:flex-1 after:bg-line">
          Term{termModule ? ` · ${termModule.title}` : ""}
        </p>
        <h1 className="display-2 mt-5">{t.term}</h1>
        {/* The definition reads like a reference-book entry. */}
        <p className="mt-6 font-serif text-[clamp(1.375rem,2.6vw,1.75rem)] leading-[1.35] text-fg">{t.shortDef}</p>

        {t.body ? (
          <div className="prose-plan mt-8">
            <p>{t.body}</p>
          </div>
        ) : null}

        {t.example ? (
          <aside className="card mt-8 border-l-2 border-l-accent p-5">
            <SurveyLabel as="p">Example</SurveyLabel>
            <p className="mt-2 font-serif text-lg italic leading-relaxed text-fg-soft">{t.example}</p>
          </aside>
        ) : null}

        {t.sourceRef ? <p className="survey mt-8 text-muted">Source · {t.sourceRef}</p> : null}
      </div>

      <aside className="space-y-6 lg:pt-24">
        {diagram ? (
          <figure className="card p-5">
            <TermDiagram kind={diagram} className="mx-auto h-auto w-full" />
            <figcaption className="survey mt-3 text-muted">Fig. — {t.term}</figcaption>
          </figure>
        ) : null}
        {t.related.length > 0 ? (
          <section>
            <h2 className="text-[0.9375rem] font-semibold">Related terms</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {t.related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-fg-soft hover:border-fg/40 hover:text-fg"
                  >
                    {r.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </article>
  );
}
