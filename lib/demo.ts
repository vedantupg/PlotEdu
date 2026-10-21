/**
 * Demo fixtures used only when Supabase is not configured, so the UI can be
 * clicked through locally and on preview deploys without a database.
 */
import type { ClassSession, Enrollment, Note, Profile } from "@/lib/data/types";
import { COURSE_ONE } from "@/lib/content/course";
import { istDay, istMidnight } from "@/lib/calendar";

export const DEMO_BATCH_ID = "demo-batch-nov-2026";

export const DEMO_PROFILE: Profile = {
  id: "demo-user",
  fullName: "Demo Student",
  email: "demo@plotedu.in",
  avatarUrl: null,
  role: "student",
  collegeOrFirm: "Studio Demo",
  city: "Pune",
  onboardedAt: new Date().toISOString(),
};

export const DEMO_ENROLLMENT: Enrollment = {
  id: "demo-enrollment",
  batchId: DEMO_BATCH_ID,
  status: "approved",
  paymentStatus: "paid",
  appliedAt: new Date().toISOString(),
};

const mod = (slug: string): ClassSession["module"] => {
  const m = COURSE_ONE.modules.find((x) => x.slug === slug);
  return m ? { order: m.order, title: m.title, slug: m.slug } : null;
};

/**
 * Sessions on days relative to today, always at 7:00 PM IST (a realistic class
 * slot), so every card state is reachable via the /home?demo= switch.
 */
export function demoSessions(now: Date): ClassSession[] {
  const today = istDay(now);
  const sevenPmToday = istMidnight(today.year, today.month, today.day).getTime() + 19 * 3_600_000;
  const make = (n: number, dayOffset: number, title: string, module: string, agenda: string[]): ClassSession => ({
    id: `demo-session-${n}`,
    batchId: DEMO_BATCH_ID,
    number: n,
    title,
    agenda,
    startsAt: new Date(sevenPmToday + dayOffset * 86_400_000),
    durationMin: 90,
    cancelled: false,
    recordingUrl: null,
    module: mod(module),
    professorName: "Ar. Kajal",
  });

  const d = 1;
  return [
    make(1, -6 * d, "Reading a plot before you draw", "foundation", [
      "Title, 7/12 extract and property card",
      "Locating the plot on the Development Plan",
      "Zone, reservations and proposed roads",
    ]),
    make(2, -4 * d, "Zoning and road width", "foundation", [
      "What a zone permits as of right",
      "Why road width drives everything",
      "Road widening and the new boundary",
    ]),
    make(3, -1 * d, "Reservations, amenity and open space", "foundation", [
      "Reading reservations on the DP",
      "Amenity space and ROS thresholds",
    ]),
    make(4, 2 * d, "FSI from first principles", "udcpr", [
      "Basic FSI vs premium vs TDR",
      "What counts in built-up area, and what does not",
      "Worked example on a 1,000 sq m plot",
      "Q&A",
    ]),
    make(5, 4 * d, "Setbacks and the building envelope", "udcpr", [
      "Front, side and rear marginal distances",
      "Drawing the envelope before the building",
      "Common scrutiny objections",
    ]),
    make(6, 6 * d, "Parking: counting what the rules ask for", "udcpr", ["Parking norms by use", "Mechanical parking"]),
    make(7, 8 * d, "Layouts and subdivision", "practical-planning", ["Plot sizes and frontage", "Internal roads"]),
    make(8, 10 * d, "From drawings to sanction", "professional-practice", ["Scrutiny checklist", "NOCs map"]),
    make(9, 13 * d, "Handling a real project, end to end", "professional-practice", ["Case study", "Q&A"]),
  ];
}

export function demoNotes(): Note[] {
  const m = (slug: string): Note["module"] => mod(slug);
  return [
    {
      id: "demo-note-1",
      title: "Glossary starter: 25 planning terms",
      description: "A printable sheet of the terms used through the course.",
      mime: "application/pdf",
      sizeBytes: 820_000,
      access: "public",
      batchIds: [],
      sessionId: null,
      module: m("foundation"),
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-note-2",
      title: "Reading a Development Plan sheet",
      description: "Legend, zones and reservations with a marked-up DP excerpt.",
      mime: "application/pdf",
      sizeBytes: 2_516_582,
      access: "members",
      batchIds: [],
      sessionId: "demo-session-1",
      module: m("foundation"),
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-note-3",
      title: "FSI worksheet — Session 04",
      description: "Step-by-step FSI calculation template with exemptions checklist.",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      sizeBytes: 5_400_000,
      access: "batch",
      batchIds: [DEMO_BATCH_ID],
      sessionId: "demo-session-4",
      module: m("udcpr"),
      createdAt: new Date().toISOString(),
    },
  ];
}
