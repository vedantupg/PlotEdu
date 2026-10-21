import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Privacy policy" };

// DRAFT: placeholder until legal copy is supplied (required at launch, PRD §9).
export default function Page() {
  return (
    <main className="mx-auto max-w-[var(--container-content)] px-4 py-14 sm:px-6 md:py-20">
      <PageHeader eyebrow="Draft" title="Privacy policy" />
      <div className="prose-plan">
        <p>
          PlotEdu collects only your name, email, college or firm and city. We never sell your data. You can delete your
          account at any time; your forum posts are anonymised rather than removed.
        </p>
        <p>The full document will be published before launch.</p>
      </div>
    </main>
  );
}
