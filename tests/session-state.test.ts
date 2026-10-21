import { describe, expect, it } from "vitest";
import {
  canJoin,
  googleCalendarTemplateUrl,
  pickHeroSession,
  pickLastSession,
  sessionPhase,
} from "@/lib/session-state";

const start = new Date("2026-11-16T13:30:00Z"); // 7:00 PM IST
const s = { startsAt: start, durationMin: 90 };
const at = (offsetMin: number): Date => new Date(start.getTime() + offsetMin * 60_000);

describe("sessionPhase", () => {
  it.each([
    [-(24 * 60 + 1), "far"],
    [-(24 * 60), "upcoming"],
    [-16, "upcoming"],
    [-15, "go"],
    [-1, "go"],
    [0, "live"],
    [89, "live"],
    [90, "ended"],
    [500, "ended"],
  ] as const)("at %i min from start is %s", (offset, expected) => {
    expect(sessionPhase(s, at(offset))).toBe(expected);
  });

  it("cancelled wins over time", () => {
    expect(sessionPhase({ ...s, cancelled: true }, at(5))).toBe("cancelled");
  });

  it("join only in go and live", () => {
    expect(canJoin("go")).toBe(true);
    expect(canJoin("live")).toBe(true);
    expect(canJoin("upcoming")).toBe(false);
    expect(canJoin("ended")).toBe(false);
  });
});

describe("pickHeroSession", () => {
  const a = { id: "a", startsAt: at(-200), durationMin: 90 }; // ended
  const b = { id: "b", startsAt: at(-30), durationMin: 90 }; // live
  const c = { id: "c", startsAt: at(60 * 24), durationMin: 90 };
  const d = { id: "d", startsAt: at(10), durationMin: 90, cancelled: true };

  it("prefers the live session over later ones", () => {
    expect(pickHeroSession([c, a, b, d], at(0))?.id).toBe("b");
  });
  it("skips cancelled and ended", () => {
    expect(pickHeroSession([a, d, c], at(0))?.id).toBe("c");
  });
  it("returns null when nothing upcoming", () => {
    expect(pickHeroSession([a], at(0))).toBeNull();
  });
  it("last session is the most recent ended one", () => {
    expect(pickLastSession([a, b, c], at(100))?.id).toBe("b");
  });
});

describe("googleCalendarTemplateUrl", () => {
  it("encodes UTC start and end", () => {
    const url = new URL(googleCalendarTemplateUrl({ title: "FSI", startsAt: start, durationMin: 90, details: "x" }));
    expect(url.searchParams.get("dates")).toBe("20261116T133000Z/20261116T150000Z");
  });
});
