/**
 * Client-facing mirror of the `can_access_note` SQL function, used only to render
 * lock states and reasons ("Locked, not hidden"). The database remains the
 * authority: the download route calls the SQL function before signing a URL.
 */

export type NoteAccess = "public" | "members" | "batch" | "staff";
export type Role = "admin" | "professor" | "student";
export type EnrollmentStatus = "applied" | "approved" | "rejected" | "waitlisted" | "withdrawn";
export type PaymentStatus = "unpaid" | "paid" | "waived";

export type ViewerContext = {
  signedIn: boolean;
  role: Role | null;
  /** Enrolments keyed by batch id. */
  enrollments: ReadonlyMap<string, { status: EnrollmentStatus; paymentStatus: PaymentStatus }>;
  /** Batches the viewer is staff on. */
  staffBatchIds: ReadonlySet<string>;
  /** Payment rule per batch id. */
  requirePayment: ReadonlyMap<string, boolean>;
};

export type NoteForAccess = {
  access: NoteAccess;
  batchIds: readonly string[];
};

export type AccessDecision = { allowed: true } | { allowed: false; reason: LockReason };

export type LockReason = "sign_in" | "enrol" | "pending" | "payment" | "staff_only";

export const LOCK_COPY: Record<LockReason, string> = {
  sign_in: "Sign in to download free notes",
  enrol: "Enrolled students only — apply for the next batch",
  pending: "Unlocks when your application is approved",
  payment: "Unlocks once your fee is confirmed",
  staff_only: "Staff only",
};

export function decideNoteAccess(note: NoteForAccess, viewer: ViewerContext): AccessDecision {
  if (viewer.role === "admin") return { allowed: true };

  switch (note.access) {
    case "public":
      return { allowed: true };
    case "members":
      return viewer.signedIn ? { allowed: true } : { allowed: false, reason: "sign_in" };
    case "staff":
      return viewer.role === "professor" ? { allowed: true } : { allowed: false, reason: "staff_only" };
    case "batch": {
      if (!viewer.signedIn) return { allowed: false, reason: "sign_in" };
      let best: LockReason = "enrol";
      for (const batchId of note.batchIds) {
        if (viewer.staffBatchIds.has(batchId)) return { allowed: true };
        const e = viewer.enrollments.get(batchId);
        if (!e) continue;
        if (e.status === "approved") {
          const needsPayment = viewer.requirePayment.get(batchId) ?? true;
          if (!needsPayment || e.paymentStatus !== "unpaid") return { allowed: true };
          best = "payment";
        } else if (e.status === "applied" && best === "enrol") {
          best = "pending";
        }
      }
      return { allowed: false, reason: best };
    }
  }
}
