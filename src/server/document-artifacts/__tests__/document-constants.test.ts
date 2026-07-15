import { describe, expect, it } from "vitest";
import {
  isNormalizedResumeExperienceH2,
  isNormalizedTwoColumnResumeH2Key,
  isResumeExperienceSectionHeading,
  normalizeResumeH2Key,
} from "../document-constants";

describe("normalizeResumeH2Key", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeResumeH2Key("  Professional   Experience  ")).toBe("professional experience");
  });
});

describe("isNormalizedResumeExperienceH2", () => {
  it("matches pre-normalized keys without redundant work", () => {
    expect(isNormalizedResumeExperienceH2("professional experience")).toBe(true);
    expect(isNormalizedResumeExperienceH2(null)).toBe(false);
  });
});

describe("isNormalizedTwoColumnResumeH2Key", () => {
  it("matches normalized key from a typical heading", () => {
    expect(isNormalizedTwoColumnResumeH2Key(normalizeResumeH2Key("Technical Skills"))).toBe(true);
    expect(isNormalizedTwoColumnResumeH2Key("technical skills")).toBe(true);
  });

  it("returns false for null and unrelated headings", () => {
    expect(isNormalizedTwoColumnResumeH2Key(null)).toBe(false);
    expect(isNormalizedTwoColumnResumeH2Key("professional experience")).toBe(false);
  });
});

describe("isResumeExperienceSectionHeading", () => {
  it("returns true for common work-history section titles", () => {
    expect(isResumeExperienceSectionHeading("Professional Experience")).toBe(true);
    expect(isResumeExperienceSectionHeading("Work Experience")).toBe(true);
    expect(isResumeExperienceSectionHeading("  employment history  ")).toBe(true);
  });

  it("returns false for other sections", () => {
    expect(isResumeExperienceSectionHeading("Education")).toBe(false);
    expect(isResumeExperienceSectionHeading("Technical Skills")).toBe(false);
    expect(isResumeExperienceSectionHeading("Additional Information")).toBe(false);
  });
});
