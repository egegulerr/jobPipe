import { describe, expect, it } from "vitest";
import { formatLetterDate } from "../letter-date";

describe("formatLetterDate", () => {
  it("formats a fixed date in long English form", () => {
    expect(formatLetterDate(new Date(Date.UTC(2026, 3, 6, 12, 0, 0)))).toMatch(/April 6, 2026/);
  });

  it("defaults to UTC instead of the runtime's local timezone", () => {
    const instant = new Date("2026-04-06T00:30:00.000Z");
    expect(formatLetterDate(instant)).toBe("April 6, 2026");
    expect(formatLetterDate(instant, "America/Los_Angeles")).toBe("April 5, 2026");
  });
});
