import { describe, expect, it } from "vitest";

import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_DESIGNS,
  isResumeTemplateId,
  resolveResumeTemplate,
  type ResumeTemplateId,
} from "@/lib/shared/document-template";

describe("isResumeTemplateId", () => {
  it("accepts registered design ids", () => {
    expect(isResumeTemplateId("classic")).toBe(true);
    expect(isResumeTemplateId("modern_sans")).toBe(true);
  });

  it("rejects unknown ids and non-strings", () => {
    expect(isResumeTemplateId("elegant_serif")).toBe(false);
    expect(isResumeTemplateId("sidebar")).toBe(false);
    expect(isResumeTemplateId("")).toBe(false);
    expect(isResumeTemplateId(null)).toBe(false);
    expect(isResumeTemplateId(undefined)).toBe(false);
    expect(isResumeTemplateId(123)).toBe(false);
  });
});

describe("resolveResumeTemplate", () => {
  it("returns the matching design", () => {
    expect(resolveResumeTemplate("modern_sans").id).toBe("modern_sans");
  });

  it("falls back to the default for unknown or missing ids", () => {
    expect(resolveResumeTemplate("elegant_serif").id).toBe(DEFAULT_RESUME_TEMPLATE_ID);
    expect(resolveResumeTemplate("unknown").id).toBe(DEFAULT_RESUME_TEMPLATE_ID);
    expect(resolveResumeTemplate(null).id).toBe(DEFAULT_RESUME_TEMPLATE_ID);
    expect(resolveResumeTemplate(undefined).id).toBe(DEFAULT_RESUME_TEMPLATE_ID);
  });
});

describe("RESUME_DESIGNS", () => {
  it("registers the default plus the modern sans design", () => {
    const ids = Object.keys(RESUME_DESIGNS) as ResumeTemplateId[];
    expect(ids).toEqual(["classic", "modern_sans"]);
  });

  it("keeps the classic design aligned with the previous default", () => {
    // Regression guard: classic must stay the historical layout so existing
    // runs (and runs that never selected a template) render identically.
    const classic = RESUME_DESIGNS.classic.template;
    expect(classic.bodyFont).toBe("Times New Roman");
    expect(classic.headingFont).toBe("Times-Bold");
    expect(classic.heading2DividerWidthPt).toBeGreaterThan(0);
  });
});
