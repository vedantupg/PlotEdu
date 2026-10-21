import { describe, expect, it } from "vitest";
import { buildIcs, istDay, istMonthGrid, istWeek, monthsSpanning, relativeDayLabel } from "@/lib/calendar";

describe("istDay", () => {
  it("uses the IST date, not UTC", () => {
    // 20:00 UTC on 21 Oct is 01:30 IST on 22 Oct (a Thursday).
    expect(istDay(new Date("2026-10-21T20:00:00Z"))).toMatchObject({ key: "2026-10-22", weekday: 3 });
  });
});

describe("istWeek", () => {
  it("returns Monday → Sunday containing the date", () => {
    const week = istWeek(new Date("2026-10-21T06:00:00Z")); // Wed 21 Oct IST
    expect(week.map((d) => d.key)).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });
  it("Sunday belongs to the week that started the previous Monday", () => {
    const week = istWeek(new Date("2026-10-25T10:00:00Z"));
    expect(week[0]?.key).toBe("2026-10-19");
  });
});

describe("istMonthGrid", () => {
  it("pads so the 1st lands on its weekday (Nov 2026 starts on a Sunday)", () => {
    const grid = istMonthGrid(2026, 11);
    expect(grid.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(grid[6]?.day).toBe(1);
    expect(grid.filter(Boolean)).toHaveLength(30);
  });
});

describe("monthsSpanning", () => {
  it("lists distinct months in order", () => {
    const months = monthsSpanning([new Date("2026-12-02T13:30:00Z"), new Date("2026-11-16T13:30:00Z")]);
    expect(months).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
    ]);
  });
});

describe("relativeDayLabel", () => {
  const now = new Date("2026-10-21T15:00:00Z"); // 20:30 IST, Wed
  it("today / tomorrow by IST calendar day", () => {
    expect(relativeDayLabel(new Date("2026-10-21T17:00:00Z"), now)).toBe("Today"); // 22:30 IST
    expect(relativeDayLabel(new Date("2026-10-21T19:00:00Z"), now)).toBe("Tomorrow"); // 00:30 IST Thu
    expect(relativeDayLabel(new Date("2026-10-25T13:30:00Z"), now)).toBeNull();
  });
});

describe("buildIcs", () => {
  const ics = buildIcs({
    uid: "s1@plotedu.in",
    title: "PlotEdu · FSI, from first principles; Q&A",
    startsAt: new Date("2026-11-16T13:30:00Z"),
    durationMin: 90,
    description: "Agenda:\n1. Basic FSI",
    url: "https://plotedu.in/sessions/s1",
    now: new Date("2026-10-20T00:00:00Z"),
  });
  it("has UTC start/end and a 15 min alarm", () => {
    expect(ics).toContain("DTSTART:20261116T133000Z");
    expect(ics).toContain("DTEND:20261116T150000Z");
    expect(ics).toContain("TRIGGER:-PT15M");
  });
  it("escapes commas, semicolons and newlines", () => {
    expect(ics).toContain("SUMMARY:PlotEdu · FSI\\, from first principles\\; Q&A");
    expect(ics).toContain("DESCRIPTION:Agenda:\\n1. Basic FSI");
  });
  it("uses CRLF line endings", () => {
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
