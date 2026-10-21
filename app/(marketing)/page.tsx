import Link from "next/link";
import { IconArrowRight } from "@/components/brand/icons";
import { PlotFrame } from "@/components/brand/plot-frame";
import { Wordmark } from "@/components/brand/wordmark";
import { PlotStory } from "@/components/features/plot-story";
import { TermOfTheDay } from "@/components/features/term-card";
import { ButtonLink } from "@/components/ui/button";
import { COURSE_ONE } from "@/lib/content/course";

export const revalidate = 3600;

export default function LandingPage() {
  const courseHref = `/courses/${COURSE_ONE.slug}`;
  return (
    <main>
      {/* Hero — the poster, made functional. The only surface with the blueprint grid. */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="plan-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-[var(--container-content)] gap-14 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:pb-28 md:pt-24">
          <div>
            <p className="display-caps text-[0.8125rem] tracking-[0.32em] text-fg-soft">Introducing</p>
            <div className="survey mt-6 flex items-center gap-3 text-muted">
              <span aria-hidden className="h-3 w-px bg-muted" />
              <span aria-hidden className="h-px flex-1 bg-line-strong" />
              <span>Land · Planning · Regulations</span>
              <span aria-hidden className="h-px flex-1 bg-line-strong" />
              <span aria-hidden className="h-3 w-px bg-muted" />
            </div>

            <PlotFrame inset className="mt-5">
              <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-7">
                <span className="survey text-muted">Plot No. 01</span>
                <h1 className="display-1 mt-4">
                  <Wordmark />
                  <span className="sr-only"> — Where Knowledge Meets Real-World Practice</span>
                </h1>
                <span className="survey mt-5 block text-right text-muted">Real Estate · Built Environment</span>
              </div>
            </PlotFrame>

            <p className="mt-10 max-w-xl text-[clamp(1.375rem,2.6vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em]">
              Where knowledge meets real‑world practice.
            </p>
            <p className="lead mt-3 max-w-xl">
              Practical courses for Maharashtra&apos;s architects, graduates and development-control professionals —
              plot first, regulation second, design third.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={courseHref}>
                See Course 01 <IconArrowRight width={18} height={18} />
              </ButtonLink>
              <ButtonLink href="/glossary" variant="secondary">
                Browse the glossary
              </ButtonLink>
            </div>
          </div>

          <PlotStory className="mx-auto w-full max-w-md md:max-w-none" />
        </div>
      </section>

      {/* Course 01 — mirrors poster two */}
      <section className="mx-auto max-w-[var(--container-content)] px-4 py-20 sm:px-6 md:py-28">
        <p className="survey flex items-center gap-3 text-accent-ink after:h-px after:flex-1 after:bg-line">
          {COURSE_ONE.code}
        </p>
        <h2 className="display-2 mt-6 max-w-3xl">{COURSE_ONE.title}</h2>
        <p className="lead mt-5 max-w-2xl">{COURSE_ONE.subtitle}</p>

        <ol className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_ONE.outcomes.map((o, i) => (
            <li key={o} className="flex gap-4 border-t border-line py-5">
              <span className="survey pt-1 text-accent-ink">{(i + 1).toString().padStart(2, "0")}</span>
              <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em]">{o}</p>
            </li>
          ))}
        </ol>

        <dl className="card mt-12 grid grid-cols-1 overflow-hidden sm:grid-cols-3">
          {[
            ["Starting", COURSE_ONE.batch.startsLabel],
            ["Duration", COURSE_ONE.batch.durationLabel],
            ["Limited to", `${COURSE_ONE.batch.capacity} Students`],
          ].map(([k, v], i) => (
            <div key={k} className={i > 0 ? "border-t border-line p-6 sm:border-l sm:border-t-0" : "p-6"}>
              <dt className="survey text-muted">{k}</dt>
              <dd className="display-3 mt-2 !text-[1.75rem]">{v}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={courseHref}
          className="group mt-4 flex flex-col gap-3 rounded-[var(--radius-card)] bg-accent px-6 py-6 text-on-accent transition-colors duration-150 hover:bg-accent-hover sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <span>
            <span className="survey block opacity-75">Applications open</span>
            <span className="display-3 mt-1 block">November 2026 batch</span>
          </span>
          <span className="inline-flex items-center gap-2 font-semibold">
            View course &amp; apply
            <IconArrowRight
              width={18}
              height={18}
              className="transition-transform duration-150 group-hover:translate-x-1"
            />
          </span>
        </Link>
      </section>

      {/* Funnel: every visit teaches */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto grid max-w-[var(--container-content)] gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="survey text-accent-ink">Free to everyone</p>
            <h2 className="display-3 mt-4">Start with the vocabulary.</h2>
            <p className="lead mt-4 max-w-md">
              FSI, TDR, setbacks, building envelope — every term in plain words, with the regulation it comes from.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/glossary" variant="secondary">
                Open the glossary
              </ButtonLink>
              <ButtonLink href="/notes" variant="ghost">
                Free notes <IconArrowRight width={16} height={16} />
              </ButtonLink>
            </div>
          </div>
          <TermOfTheDay />
        </div>
      </section>
    </main>
  );
}
