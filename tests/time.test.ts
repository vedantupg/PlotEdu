import { describe, expect, it } from "vitest";
import { formatLocalHint, formatSurveyDateTime, formatISTTime, splitRemaining } from "@/lib/time";

const d = new Date("2026-10-22T13:30:00Z"); // 22 Oct, 7:00 PM IST

describe("IST formatting", () => {
  it("formats time in IST regardless of host TZ", () => {
    expect(formatISTTime(d)).toBe("7:00 PM");
  });
  it("formats survey labels", () => {
    expect(formatSurveyDateTime(d)).toBe("22 OCT · 7:00 PM IST");
  });
  it("hides the local hint for IST viewers", () => {
    expect(formatLocalHint(d, "Asia/Kolkata")).toBeNull();
    expect(formatLocalHint(d, "Asia/Calcutta")).toBeNull();
  });
  it("shows the local hint for other zones", () => {
    expect(formatLocalHint(d, "Europe/London")).toBe("(2:30 PM your time)");
  });
});

describe("splitRemaining", () => {
  it("splits into d/h/m/s", () => {
    expect(splitRemaining(((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000)).toMatchObject({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });
  it("clamps negatives", () => {
    expect(splitRemaining(-5000).totalMs).toBe(0);
  });
});
