import { describe, expect, it } from "vitest";
import {
  isJobSearchPlatform,
  JOB_SEARCH_PLATFORMS,
  parseJobSearchPlatforms,
} from "@/types/job-search-platform";

describe("job-search-platform", () => {
  it("exports the supported platform list", () => {
    expect(JOB_SEARCH_PLATFORMS).toEqual(["linkedin", "indeed"]);
  });

  it("validates known platform values", () => {
    expect(isJobSearchPlatform("linkedin")).toBe(true);
    expect(isJobSearchPlatform("indeed")).toBe(true);
    expect(isJobSearchPlatform("monster")).toBe(false);
  });

  it("parses repeated checkbox values", () => {
    const formData = new FormData();
    formData.append("platforms", "linkedin");
    formData.append("platforms", "indeed");

    expect(parseJobSearchPlatforms(formData)).toEqual(["linkedin", "indeed"]);
  });

  it("parses comma-separated legacy value", () => {
    const formData = new FormData();
    formData.set("platforms", "linkedin,indeed");

    expect(parseJobSearchPlatforms(formData)).toEqual(["linkedin", "indeed"]);
  });

  it("filters invalid and duplicate values", () => {
    const formData = new FormData();
    formData.append("platforms", "linkedin");
    formData.append("platforms", "linkedin");
    formData.append("platforms", "invalid");

    expect(parseJobSearchPlatforms(formData)).toEqual(["linkedin"]);
  });
});
