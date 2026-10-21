import type { Metadata } from "next";
import Link from "next/link";
import { NoteRow } from "@/components/features/note-row";
import { TermOfTheDay } from "@/components/features/term-card";
import { ChipLink, ChipRow } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { decideNoteAccess } from "@/lib/access";
import { getViewer, toAccessContext } from "@/lib/auth/viewer";
import { COURSE_ONE } from "@/lib/content/course";
import { getNotes } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Notes",
  description: "Free and course notes on UDCPR, FSI, setbacks and development permission in Maharashtra.",
};

type Filter = "all" | "free" | (typeof COURSE_ONE.modules)[number]["slug"];

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; session?: string; locked?: string }>;
}) {
  const { module: moduleParam, session, locked } = await searchParams;
  const viewer = await getViewer();
  const ctx = toAccessContext(viewer);
  const all = await getNotes();

  const filter: Filter =
    moduleParam === "free" ? "free" : (COURSE_ONE.modules.find((m) => m.slug === moduleParam)?.slug ?? "all");
  const notes = all.filter((n) => {
    if (session && n.sessionId !== session) return false;
    if (filter === "free") return n.access === "public" || n.access === "members";
    if (filter !== "all") return n.module?.slug === filter;
    return true;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "free", label: "Free" },
    ...COURSE_ONE.modules.map((m) => ({ key: m.slug as Filter, label: m.title })),
  ];

  return (
    <>
      <PageHeader
        eyebrow={`Library · ${all.length} notes`}
        title="Notes"
        lead={
          viewer
            ? "Free notes are open to every member. Course notes unlock with your batch."
            : "Free notes need a quick Google sign-in. Course notes unlock for enrolled students."
        }
      />

      <ChipRow label="Filter notes">
        {chips.map((c) => (
          <ChipLink key={c.key} active={filter === c.key} href={c.key === "all" ? "/notes" : `/notes?module=${c.key}`}>
            {c.label}
          </ChipLink>
        ))}
      </ChipRow>

      {session ? (
        <p className="mt-4 text-sm text-muted">
          Showing notes for one session ·{" "}
          <Link href="/notes" className="font-medium text-fg underline underline-offset-4">
            Show all
          </Link>
        </p>
      ) : null}

      {notes.length === 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <p className="text-muted">No notes here yet.</p>
          <TermOfTheDay />
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {notes.map((n) => (
            <NoteRow key={n.id} note={n} decision={decideNoteAccess(n, ctx)} highlight={n.id === locked} />
          ))}
        </ul>
      )}
    </>
  );
}
