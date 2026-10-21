import { IconArrowRight } from "@/components/brand/icons";
import { ButtonLink } from "@/components/ui/button";
import type { ViewerEnrollment } from "@/lib/auth/viewer";
import { istDay, monthShort } from "@/lib/calendar";
import type { Batch } from "@/lib/data/types";
import { ApplicationSteps, type Step } from "./application-steps";

type Props = {
  enrollment: ViewerEnrollment | null;
  openBatch: (Batch & { courseTitle: string }) | null;
  needsProfile: boolean;
};

function startsLabel(batch: Batch): string | undefined {
  if (!batch.startsOn) return undefined;
  const d = istDay(new Date(`${batch.startsOn}T12:00:00+05:30`));
  return `${d.day} ${monthShort(d.month)}`;
}

const HEADLINE = {
  applied: {
    title: "We’re reviewing your application",
    body: "You’ll get an email the moment Kajal decides. This page then turns into your class dashboard.",
  },
  waitlisted: {
    title: "You’re on the waitlist",
    body: "The batch is full for now. If a seat opens you hear first — and you’re first in line for the next batch.",
  },
  rejected: {
    title: "This batch didn’t work out — the next one can",
    body: "Glossary, free notes and the forum stay open to you. Apply again when the next batch opens.",
  },
  withdrawn: { title: "You withdrew your application", body: "You can apply again any time applications are open." },
} as const;

/** Member status (signed in, no approved enrolment): a step tracker, never a dead end. */
export function ApplicationStatus({ enrollment, openBatch, needsProfile }: Props) {
  const batch = enrollment?.batch ?? openBatch;
  const status = enrollment && enrollment.status !== "approved" ? enrollment.status : null;

  const steps: Step[] = [
    { label: "Signed in", state: "done" },
    { label: "Profile", hint: needsProfile ? "3 quick details" : undefined, state: needsProfile ? "current" : "done" },
    {
      label: "Applied",
      hint: enrollment
        ? `${istDay(new Date(enrollment.appliedAt)).day} ${monthShort(istDay(new Date(enrollment.appliedAt)).month)}`
        : undefined,
      state: status ? "done" : needsProfile ? "todo" : "current",
    },
    {
      label: status === "waitlisted" ? "Waitlisted" : status === "rejected" ? "Not this batch" : "Approved",
      hint: status === "applied" ? "Usually within 48 h" : undefined,
      state: status === "applied" ? "current" : status === "waitlisted" || status === "rejected" ? "blocked" : "todo",
    },
    { label: "Classes begin", hint: batch ? startsLabel(batch) : undefined, state: "todo" },
  ];

  const copy = status ? HEADLINE[status] : null;
  const canApply = openBatch && (!status || status === "rejected" || status === "withdrawn");
  const applyHref = openBatch
    ? needsProfile
      ? `/onboarding?next=${encodeURIComponent(`/apply/${openBatch.id}`)}`
      : `/apply/${openBatch.id}`
    : "/";

  return (
    <section className="card-raised p-5 sm:p-8">
      <p className="text-sm font-semibold text-muted">{batch ? `${batch.name} batch` : "Between batches"}</p>
      <h2 className="mt-1 text-[clamp(1.5rem,3.4vw,2rem)] font-semibold leading-tight tracking-[-0.025em]">
        {copy ? copy.title : openBatch ? `Join the ${openBatch.name} batch` : "The next batch will be announced soon"}
      </h2>
      <p className="mt-2 max-w-xl text-fg-soft">
        {copy
          ? copy.body
          : openBatch
            ? `Live classes on Google Meet, notes, quizzes and a forum. Limited to ${openBatch.capacity} students.`
            : "Meanwhile, the glossary and free notes are open to you."}
      </p>

      <div className="mt-7 border-t border-line pt-6">
        <ApplicationSteps steps={steps} />
      </div>

      {canApply ? (
        <ButtonLink href={applyHref} className="mt-7">
          {needsProfile ? "Complete profile & apply" : status ? `Apply for ${openBatch.name}` : "Apply now"}{" "}
          <IconArrowRight width={18} height={18} />
        </ButtonLink>
      ) : null}
    </section>
  );
}
