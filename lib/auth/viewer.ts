import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { ViewerContext } from "@/lib/access";
import type { Batch, Enrollment, Profile } from "@/lib/data/types";
import { DEMO_BATCH_ID, DEMO_ENROLLMENT, DEMO_PROFILE } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { COURSE_ONE } from "@/lib/content/course";

export type ViewerEnrollment = Enrollment & { batch: Batch };

export type Viewer = {
  profile: Profile;
  enrollments: ViewerEnrollment[];
  staffBatchIds: string[];
  demo: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: Profile["role"];
  college_or_firm: string | null;
  city: string | null;
  onboarded_at: string | null;
};

type BatchRow = {
  id: string;
  course_id: string;
  name: string;
  starts_on: string | null;
  ends_on: string | null;
  capacity: number;
  applications_open: boolean;
  require_payment_for_notes: boolean;
};

export function mapProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    avatarUrl: r.avatar_url,
    role: r.role,
    collegeOrFirm: r.college_or_firm,
    city: r.city,
    onboardedAt: r.onboarded_at,
  };
}

export function mapBatch(r: BatchRow): Batch {
  return {
    id: r.id,
    courseId: r.course_id,
    name: r.name,
    startsOn: r.starts_on,
    endsOn: r.ends_on,
    capacity: r.capacity,
    applicationsOpen: r.applications_open,
    requirePaymentForNotes: r.require_payment_for_notes,
  };
}

const DEMO_VIEWER: Viewer = {
  profile: DEMO_PROFILE,
  enrollments: [
    {
      ...DEMO_ENROLLMENT,
      batch: {
        id: DEMO_BATCH_ID,
        courseId: "demo-course",
        name: COURSE_ONE.batch.name,
        startsOn: "2026-11-16",
        endsOn: "2026-12-06",
        capacity: COURSE_ONE.batch.capacity,
        applicationsOpen: true,
        requirePaymentForNotes: true,
      },
    },
  ],
  staffBatchIds: [],
  demo: true,
};

/**
 * The current viewer, read once per request. Returns null when signed out.
 * In demo mode (no Supabase env) returns an approved demo student.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured()) return DEMO_VIEWER;

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const [profileRes, enrollRes, staffRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, college_or_firm, city, onboarded_at")
      .eq("id", userId)
      .single<ProfileRow>(),
    supabase
      .from("enrollments")
      .select(
        "id, batch_id, status, payment_status, applied_at, batch:batches(id, course_id, name, starts_on, ends_on, capacity, applications_open, require_payment_for_notes)",
      )
      .eq("user_id", userId)
      .order("applied_at", { ascending: false }),
    supabase.from("batch_staff").select("batch_id").eq("user_id", userId),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  type EnrollRow = {
    id: string;
    batch_id: string;
    status: Enrollment["status"];
    payment_status: Enrollment["paymentStatus"];
    applied_at: string;
    batch: BatchRow;
  };

  return {
    profile: mapProfile(profileRes.data),
    enrollments: ((enrollRes.data ?? []) as unknown as EnrollRow[]).map((e) => ({
      id: e.id,
      batchId: e.batch_id,
      status: e.status,
      paymentStatus: e.payment_status,
      appliedAt: e.applied_at,
      batch: mapBatch(e.batch),
    })),
    staffBatchIds: (staffRes.data ?? []).map((r: { batch_id: string }) => r.batch_id),
    demo: false,
  };
});

/** Batches whose sessions this viewer can see (approved student, staff, or all for admin). */
export function visibleBatchIds(viewer: Viewer): string[] {
  const approved = viewer.enrollments.filter((e) => e.status === "approved").map((e) => e.batchId);
  return [...new Set([...approved, ...viewer.staffBatchIds])];
}

export function isActiveStudent(viewer: Viewer): boolean {
  return viewer.enrollments.some((e) => e.status === "approved");
}

export function toAccessContext(viewer: Viewer | null): ViewerContext {
  if (!viewer) {
    return {
      signedIn: false,
      role: null,
      enrollments: new Map(),
      staffBatchIds: new Set(),
      requirePayment: new Map(),
    };
  }
  return {
    signedIn: true,
    role: viewer.profile.role,
    enrollments: new Map(
      viewer.enrollments.map((e) => [e.batchId, { status: e.status, paymentStatus: e.paymentStatus }]),
    ),
    staffBatchIds: new Set(viewer.staffBatchIds),
    requirePayment: new Map(viewer.enrollments.map((e) => [e.batchId, e.batch.requirePaymentForNotes])),
  };
}

export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return viewer;
}

/** Admin routes 404 for everyone else, so the console's existence is not advertised. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer("/admin");
  if (viewer.profile.role !== "admin") notFound();
  return viewer;
}
