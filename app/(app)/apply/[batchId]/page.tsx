import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ApplyForm } from "@/components/features/apply-form";
import { requireViewer } from "@/lib/auth/viewer";
import { getOpenBatches } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Apply" };

export default async function ApplyPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const viewer = await requireViewer(`/apply/${batchId}`);
  const batch = (await getOpenBatches()).find((b) => b.id === batchId);
  if (!batch) notFound();

  const existing = viewer.enrollments.find((e) => e.batchId === batchId);
  if (
    existing &&
    (existing.status === "applied" || existing.status === "approved" || existing.status === "waitlisted")
  ) {
    redirect("/home");
  }
  const p = viewer.profile;
  if (!p.fullName || !p.collegeOrFirm || !p.city) {
    redirect(`/onboarding?next=${encodeURIComponent(`/apply/${batchId}`)}`);
  }

  return (
    <div className="mx-auto max-w-[var(--container-reading)]">
      <PageHeader
        eyebrow={`Application · ${batch.name}`}
        title={batch.courseTitle}
        lead={`${batch.capacity} seats. Kajal reviews every application; you’ll get an email with the decision. Fees are collected offline after approval.`}
      />

      <div className="card p-5 sm:p-7">
        <h2 className="text-[0.9375rem] font-semibold">Your details</h2>
        <dl className="mt-3 divide-y divide-line">
          {[
            ["Name", p.fullName],
            ["Email", p.email],
            ["College or firm", p.collegeOrFirm],
            ["City", p.city],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <Link
          href={`/onboarding?next=${encodeURIComponent(`/apply/${batchId}`)}`}
          className="mt-2 inline-block text-sm font-medium text-muted hover:text-fg"
        >
          Edit details
        </Link>
        <ApplyForm batchId={batch.id} />
      </div>
    </div>
  );
}
