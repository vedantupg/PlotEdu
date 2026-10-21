import type { Metadata } from "next";
import { OnboardingForm } from "@/components/features/onboarding-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireViewer } from "@/lib/auth/viewer";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Your profile" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await requireViewer("/onboarding");
  const next = safeNextPath((await searchParams).next);
  const p = viewer.profile;

  return (
    <div className="max-w-[var(--container-reading)]">
      <PageHeader
        eyebrow={p.onboardedAt ? "Your profile" : "Welcome"}
        title={p.onboardedAt ? "Edit your profile" : "Tell us who you are"}
        lead="Three details, used for your batch application and certificate. You can skip this now, but you’ll need it before applying."
      />
      <div className="card p-5 sm:p-7">
        <OnboardingForm
          next={next}
          defaults={{ fullName: p.fullName ?? "", collegeOrFirm: p.collegeOrFirm ?? "", city: p.city ?? "" }}
        />
      </div>
    </div>
  );
}
