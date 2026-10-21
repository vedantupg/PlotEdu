import "server-only";
import { COURSE_ONE } from "@/lib/content/course";
import { GLOSSARY } from "@/lib/content/glossary";
import { demoNotes, demoSessions } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapBatch } from "@/lib/auth/viewer";
import type { Batch, ClassSession, Course, GlossaryTerm, Module, Note } from "./types";

// ---------------------------------------------------------------------------
// Catalogue (public)
// ---------------------------------------------------------------------------

export type CourseDetail = { course: Course; modules: Module[]; openBatch: Batch | null };

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  if (!isSupabaseConfigured()) {
    if (slug !== COURSE_ONE.slug) return null;
    return {
      course: {
        id: "demo-course",
        slug: COURSE_ONE.slug,
        title: COURSE_ONE.title,
        subtitle: COURSE_ONE.subtitle,
        description: COURSE_ONE.description,
      },
      modules: COURSE_ONE.modules.map((m) => ({ id: m.slug, ...m })),
      openBatch: {
        id: "demo-batch-nov-2026",
        courseId: "demo-course",
        name: COURSE_ONE.batch.name,
        startsOn: "2026-11-16",
        endsOn: "2026-12-06",
        capacity: COURSE_ONE.batch.capacity,
        applicationsOpen: true,
        requirePaymentForNotes: true,
      },
    };
  }

  const supabase = createSupabasePublicClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, description")
    .eq("slug", slug)
    .maybeSingle<Course>();
  if (!course) return null;

  const [modulesRes, batchRes] = await Promise.all([
    supabase.from("modules").select("id, order, slug, title, summary").eq("course_id", course.id).order("order"),
    supabase
      .from("batches")
      .select("id, course_id, name, starts_on, ends_on, capacity, applications_open, require_payment_for_notes")
      .eq("course_id", course.id)
      .eq("applications_open", true)
      .order("starts_on")
      .limit(1),
  ]);

  return {
    course,
    modules: (modulesRes.data ?? []) as Module[],
    openBatch: batchRes.data?.[0] ? mapBatch(batchRes.data[0]) : null,
  };
}

type TermRow = {
  id: string;
  slug: string;
  term: string;
  short_def: string;
  body_md: string | null;
  example_md: string | null;
  source_ref: string | null;
  related: string[];
  module: { slug: string } | null;
};

function staticGlossary(): GlossaryTerm[] {
  const bySlug = new Map(GLOSSARY.map((t) => [t.slug, t]));
  return GLOSSARY.map((t) => ({
    slug: t.slug,
    term: t.term,
    shortDef: t.shortDef,
    body: t.body,
    example: t.example ?? null,
    sourceRef: t.sourceRef ?? null,
    moduleSlug: t.module,
    related: t.related.flatMap((s) => {
      const r = bySlug.get(s);
      return r ? [{ slug: r.slug, term: r.term }] : [];
    }),
  })).sort((a, b) => a.term.localeCompare(b.term));
}

export async function getGlossary(): Promise<GlossaryTerm[]> {
  if (!isSupabaseConfigured()) return staticGlossary();

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("id, slug, term, short_def, body_md, example_md, source_ref, related, module:modules(slug)")
    .order("term");
  const rows = (data ?? []) as unknown as TermRow[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  return rows.map((r) => ({
    slug: r.slug,
    term: r.term,
    shortDef: r.short_def,
    body: r.body_md,
    example: r.example_md,
    sourceRef: r.source_ref,
    moduleSlug: r.module?.slug ?? null,
    related: r.related.flatMap((id) => {
      const t = byId.get(id);
      return t ? [{ slug: t.slug, term: t.term }] : [];
    }),
  }));
}

export async function getGlossaryTerm(slug: string): Promise<GlossaryTerm | null> {
  const all = await getGlossary();
  return all.find((t) => t.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Sessions (RLS: approved students, batch staff, admin)
// ---------------------------------------------------------------------------

type SessionRow = {
  id: string;
  batch_id: string;
  title: string;
  agenda: unknown;
  starts_at: string;
  duration_min: number;
  status: string;
  recording_url: string | null;
  professor_id: string | null;
  module: { order: number; title: string; slug: string } | null;
};

const SESSION_COLUMNS =
  "id, batch_id, title, agenda, starts_at, duration_min, status, recording_url, professor_id, module:modules(order, title, slug)";

function mapSessions(rows: SessionRow[], professorNames: ReadonlyMap<string, string>): ClassSession[] {
  const counters = new Map<string, number>();
  return rows
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((r) => {
      const n = (counters.get(r.batch_id) ?? 0) + (r.status === "cancelled" ? 0 : 1);
      counters.set(r.batch_id, n);
      return {
        id: r.id,
        batchId: r.batch_id,
        title: r.title,
        agenda: Array.isArray(r.agenda) ? r.agenda.filter((x): x is string => typeof x === "string") : [],
        startsAt: new Date(r.starts_at),
        durationMin: r.duration_min,
        cancelled: r.status === "cancelled",
        recordingUrl: r.recording_url,
        module: r.module,
        professorName: r.professor_id ? (professorNames.get(r.professor_id) ?? null) : null,
        number: n,
      };
    });
}

export async function getSessionsForBatches(batchIds: readonly string[]): Promise<ClassSession[]> {
  if (!isSupabaseConfigured()) return demoSessions(new Date());
  if (batchIds.length === 0) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .in("batch_id", batchIds)
    .order("starts_at");
  if (error) throw new Error(`Failed to load sessions: ${error.message}`);
  const rows = (data ?? []) as unknown as SessionRow[];

  const professorIds = [...new Set(rows.flatMap((r) => (r.professor_id ? [r.professor_id] : [])))];
  const names = new Map<string, string>();
  if (professorIds.length > 0) {
    const { data: staff } = await supabase.from("staff_directory").select("id, full_name").in("id", professorIds);
    for (const p of (staff ?? []) as { id: string; full_name: string | null }[]) {
      if (p.full_name) names.set(p.id, p.full_name);
    }
  }
  return mapSessions(rows, names);
}

/** Session ids the viewer has attended. */
export async function getAttendedSessionIds(userId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set(["demo-session-1", "demo-session-3"]);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("attendance").select("session_id").eq("user_id", userId);
  return new Set((data ?? []).map((r: { session_id: string }) => r.session_id));
}

// ---------------------------------------------------------------------------
// Notes (metadata public; files via the download route)
// ---------------------------------------------------------------------------

type NoteRow = {
  id: string;
  title: string;
  description: string | null;
  mime: string;
  size_bytes: number;
  access: Note["access"];
  session_id: string | null;
  created_at: string;
  module: { order: number; title: string; slug: string } | null;
  note_batches: { batch_id: string }[];
};

export async function getNotes(): Promise<Note[]> {
  if (!isSupabaseConfigured()) return demoNotes();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, title, description, mime, size_bytes, access, session_id, created_at, module:modules(order, title, slug), note_batches(batch_id)",
    )
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load notes: ${error.message}`);

  return ((data ?? []) as unknown as NoteRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    mime: r.mime,
    sizeBytes: r.size_bytes,
    access: r.access,
    batchIds: r.note_batches.map((b) => b.batch_id),
    sessionId: r.session_id,
    module: r.module,
    createdAt: r.created_at,
  }));
}

export async function getOpenBatches(): Promise<(Batch & { courseTitle: string })[]> {
  if (!isSupabaseConfigured()) {
    const detail = await getCourse(COURSE_ONE.slug);
    return detail?.openBatch ? [{ ...detail.openBatch, courseTitle: COURSE_ONE.title }] : [];
  }
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("batches")
    .select(
      "id, course_id, name, starts_on, ends_on, capacity, applications_open, require_payment_for_notes, course:courses(title)",
    )
    .eq("applications_open", true)
    .order("starts_on");
  type Row = Parameters<typeof mapBatch>[0] & { course: { title: string } | null };
  return ((data ?? []) as unknown as Row[]).map((r) => ({ ...mapBatch(r), courseTitle: r.course?.title ?? "" }));
}
