import { describe, expect, it } from "vitest";

import { resolveApplyLink } from "@/components/documents/resolve-apply-link";

describe("resolveApplyLink", () => {
  it("prefers applyUrl when both URLs exist", () => {
    expect(
      resolveApplyLink({
        applyUrl: "https://apply.example.com/job",
        jobLink: "https://jobs.example.com/job",
      }),
    ).toBe("https://apply.example.com/job");
  });

  it("falls back to jobLink when applyUrl is missing", () => {
    expect(
      resolveApplyLink({
        applyUrl: null,
        jobLink: "https://jobs.example.com/job",
      }),
    ).toBe("https://jobs.example.com/job");
  });

  it("returns null when both links are missing", () => {
    expect(
      resolveApplyLink({
        applyUrl: null,
        jobLink: null,
      }),
    ).toBeNull();
  });

  it("ignores invalid or unsafe URLs", () => {
    expect(
      resolveApplyLink({
        applyUrl: "javascript:alert(1)",
        jobLink: "notaurl",
      }),
    ).toBeNull();
  });
});
