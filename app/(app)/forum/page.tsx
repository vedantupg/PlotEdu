import type { Metadata } from "next";
import { IconDoubt } from "@/components/brand/icons";
import { TermOfTheDay } from "@/components/features/term-card";
import { PageHeader } from "@/components/ui/page-header";
import { requireViewer } from "@/lib/auth/viewer";
import { COURSE_ONE } from "@/lib/content/course";

export const metadata: Metadata = { title: "Forum" };

// Phase 4: threads, replies, upvotes, anonymous posting, accepted answers, realtime.
export default async function ForumPage() {
  await requireViewer("/forum");
  const categories = [
    ...COURSE_ONE.modules.map((m) => ({ title: m.title, summary: m.summary })),
    { title: "General", summary: "Careers, practice, anything else." },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Forum"
        title="Doubts, answered in public"
        lead="Ask by module, anonymously if you prefer. Answers marked accepted stay pinned for the next person."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.title} className="card p-5">
            <IconDoubt className="text-muted" />
            <p className="mt-3 text-lg font-semibold tracking-[-0.01em]">{c.title}</p>
            <p className="mt-1 text-sm text-muted">{c.summary}</p>
            <p className="mt-4 text-xs font-semibold text-accent-ink">Opens with the batch</p>
          </li>
        ))}
      </ul>
      <TermOfTheDay className="mt-10" />
    </>
  );
}
