import { describe, expect, it } from "vitest";
import { formatBytes, mimeLabel, moduleCode, safeNextPath } from "@/lib/utils";
import { termOfTheDayIndex } from "@/lib/content/glossary";

describe("utils", () => {
  it("formats bytes", () => {
    expect(formatBytes(2_516_582)).toBe("2.4 MB");
    expect(formatBytes(512)).toBe("512 B");
  });
  it("module code is zero padded", () => {
    expect(moduleCode(2)).toBe("MODULE 02");
  });
  it("labels mimes", () => {
    expect(mimeLabel("application/pdf")).toBe("PDF");
  });
  it.each([
    ["/notes", "/notes"],
    ["//evil.com", "/home"],
    ["/\\evil.com", "/home"],
    ["https://evil.com", "/home"],
    [null, "/home"],
  ])("safeNextPath(%s) -> %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
  it("term of the day is stable within an IST day and rolls at IST midnight", () => {
    const beforeMidnightIST = new Date("2026-10-19T18:29:00Z");
    const afterMidnightIST = new Date("2026-10-19T18:31:00Z");
    expect(termOfTheDayIndex(beforeMidnightIST, 25)).not.toBe(termOfTheDayIndex(afterMidnightIST, 25));
    expect(termOfTheDayIndex(new Date("2026-10-19T10:00:00Z"), 25)).toBe(termOfTheDayIndex(beforeMidnightIST, 25));
  });
});
