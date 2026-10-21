import type { EnrollmentStatus, NoteAccess, PaymentStatus, Role } from "@/lib/access";

export type Profile = {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: Role;
  collegeOrFirm: string | null;
  city: string | null;
  onboardedAt: string | null;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
};

export type Module = {
  id: string;
  order: number;
  slug: string;
  title: string;
  summary: string | null;
};

export type Batch = {
  id: string;
  courseId: string;
  name: string;
  startsOn: string | null;
  endsOn: string | null;
  capacity: number;
  applicationsOpen: boolean;
  requirePaymentForNotes: boolean;
};

export type Enrollment = {
  id: string;
  batchId: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  appliedAt: string;
};

export type ClassSession = {
  id: string;
  batchId: string;
  title: string;
  agenda: string[];
  startsAt: Date;
  durationMin: number;
  cancelled: boolean;
  recordingUrl: string | null;
  module: Pick<Module, "order" | "title" | "slug"> | null;
  professorName: string | null;
  /** 1-based index within the batch, for "SESSION 04" labels. */
  number: number;
};

export type Note = {
  id: string;
  title: string;
  description: string | null;
  mime: string;
  sizeBytes: number;
  access: NoteAccess;
  batchIds: string[];
  sessionId: string | null;
  module: Pick<Module, "order" | "title" | "slug"> | null;
  createdAt: string;
};

export type GlossaryTerm = {
  slug: string;
  term: string;
  shortDef: string;
  body: string | null;
  example: string | null;
  sourceRef: string | null;
  moduleSlug: string | null;
  related: { slug: string; term: string }[];
};
