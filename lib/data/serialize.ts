import type { SessionCardData } from "@/components/features/session-card";
import type { TrackItem } from "@/components/calendar/session-track";
import { sessionEndsAt } from "@/lib/session-state";
import type { ClassSession, Note } from "./types";

export function toSessionCardData(
  s: ClassSession,
  all: readonly ClassSession[],
  notes: readonly Note[],
): SessionCardData {
  return {
    id: s.id,
    number: s.number,
    totalSessions: all.filter((x) => x.batchId === s.batchId && !x.cancelled).length,
    title: s.title,
    agenda: s.agenda,
    startsAtIso: s.startsAt.toISOString(),
    durationMin: s.durationMin,
    cancelled: s.cancelled,
    recordingUrl: s.recordingUrl,
    moduleOrder: s.module?.order ?? null,
    moduleTitle: s.module?.title ?? null,
    professorName: s.professorName,
    hasNotes: notes.some((n) => n.sessionId === s.id),
  };
}

/** Journey statuses: ended sessions are attended/missed; the hero is "next". */
export function toTrackItems(
  sessions: readonly ClassSession[],
  attended: ReadonlySet<string>,
  heroId: string | null,
  now: Date,
): TrackItem[] {
  return sessions.map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    startsAt: s.startsAt,
    status: s.cancelled
      ? "cancelled"
      : s.id === heroId
        ? "next"
        : sessionEndsAt(s).getTime() <= now.getTime()
          ? attended.has(s.id)
            ? "attended"
            : "missed"
          : "upcoming",
  }));
}
