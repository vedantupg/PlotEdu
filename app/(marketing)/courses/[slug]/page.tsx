import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconArrowRight } from "@/components/brand/icons";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/page-header";
import { BatchTimeline } from "@/components/features/batch-timeline";
import { JsonLd } from "@/components/json-ld";
import { COURSE_ONE } from "@/lib/content/course";
import { getCourse } from "@/lib/data/queries";
import { SITE_URL } from "@/lib/env";
import { moduleCode } from "@/lib/utils";

export const revalidate = 300;

export function generateStaticParams(): { slug: string }[] {
  return [{ slug: COURSE_ONE.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const detail = await getCourse((await params).slug);
  if (!detail) return {};
  return {
    title: detail.course.title,
    description: detail.course.subtitle ?? undefined,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getCourse(slug);
  if (!detail) notFound();
  const { course, modules, openBatch } = detail;
  const isCourseOne = slug === COURSE_ONE.slug;

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description ?? course.subtitle,
          url: `${SITE_URL}/courses/${course.slug}`,
          provider: {
            "@type": "Organization",
            name: "PlotEdu",
            sameAs: SITE_URL,
          },
          inLanguage: "en-IN",
        }}
      />
      <section className="border-b border-line">
        <div className="mx-auto max-w-[var(--container-content)] px-4 py-14 sm:px-6 md:py-20">
          <p className="survey flex items-center gap-3 text-accent-ink after:h-px after:flex-1 after:bg-line">
            {isCourseOne ? COURSE_ONE.code : "Course"}
          </p>
          <h1 className="display-2 mt-6 max-w-4xl">{course.title}</h1>
          {course.subtitle ? <p className="lead mt-5 max-w-2xl">{course.subtitle}</p> : null}
          {course.description ? <p className="mt-6 max-w-2xl text-fg-soft">{course.description}</p> : null}

          {openBatch ? (
            <div className="card-raised mt-10 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="survey text-muted">Next batch</p>
                  <p className="display-3 mt-1.5 !text-[1.75rem]">{openBatch.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {isCourseOne ? `${COURSE_ONE.batch.durationLabel} · ` : ""}
                    Live on Google Meet · Limited to {openBatch.capacity} students
                  </p>
                </div>
                <ButtonLink href={`/apply/${openBatch.id}`}>
                  Apply with Google <IconArrowRight width={18} height={18} />
                </ButtonLink>
              </div>
              <div className="mt-6 border-t border-line pt-6">
                <BatchTimeline
                  modules={modules}
                  startsOn={openBatch.startsOn}
                  endsOn={openBatch.endsOn}
                  durationLabel={isCourseOne ? COURSE_ONE.batch.durationLabel : ""}
                />
              </div>
            </div>
          ) : (
            <p className="mt-10 text-muted">
              Applications are closed. Sign in to join the waitlist for the next batch.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-content)] px-4 py-16 sm:px-6">
        <SectionHeading count={modules.length}>Modules</SectionHeading>
        <ol className="grid gap-3 md:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id} className="card p-6">
              <p className="survey text-accent-ink">{moduleCode(m.order)}</p>
              <h3 className="display-4 mt-2">{m.title}</h3>
              {m.summary ? <p className="mt-2 text-fg-soft">{m.summary}</p> : null}
            </li>
          ))}
        </ol>

        {isCourseOne ? (
          <>
            <SectionHeading className="mt-14">You will be able to</SectionHeading>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {COURSE_ONE.outcomes.map((o, i) => (
                <li key={o} className="flex gap-4 border-t border-line py-5">
                  <span className="survey pt-1 text-accent-ink">{(i + 1).toString().padStart(2, "0")}</span>
                  <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em]">{o}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </main>
  );
}
