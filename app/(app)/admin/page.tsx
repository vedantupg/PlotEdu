import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Phase 2: Today, Courses & batches, People, Sessions, Notes, Forum, Glossary & quizzes, Announcements, Settings.
export default async function AdminPage() {
  await requireAdmin();
  return (
    <PageHeader
      eyebrow="Admin console"
      title="Today"
      lead="The console is being built next: approvals, sessions, notes and announcements."
    />
  );
}
