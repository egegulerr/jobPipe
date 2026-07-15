import { describe, expect, it } from "vitest";

import { inferCompanyName } from "@/components/documents/documents-library-utils";

describe("inferCompanyName", () => {
  it("extracts company names from Lever apply URLs", () => {
    expect(
      inferCompanyName({
        id: "doc-1",
        runId: "run-1",
        type: "resume",
        title: "Resume",
        createdAt: "2026-04-12T08:00:00.000Z",
        jobTitle: "Engineer",
        companyName: null,
        applyUrl: "https://jobs.lever.co/acme-inc/123",
        jobLink: null,
      }),
    ).toBe("Acme Inc");
  });

  it("extracts company names from Greenhouse job links", () => {
    expect(
      inferCompanyName({
        id: "doc-2",
        runId: "run-1",
        type: "cover_letter",
        title: "Cover Letter",
        createdAt: "2026-04-12T08:00:00.000Z",
        jobTitle: "Designer",
        companyName: null,
        applyUrl: null,
        jobLink: "https://boards.greenhouse.io/example-company/jobs/123",
      }),
    ).toBe("Example Company");
  });

  it("falls back to unknown company for generic ATS hosts without a company slug", () => {
    expect(
      inferCompanyName({
        id: "doc-3",
        runId: "run-1",
        type: "resume",
        title: "Resume",
        createdAt: "2026-04-12T08:00:00.000Z",
        jobTitle: "Engineer",
        companyName: null,
        applyUrl: "https://boards.greenhouse.io/",
        jobLink: null,
      }),
    ).toBe("Unknown Company");
  });

  it("prefers real backend company names over URL inference", () => {
    expect(
      inferCompanyName({
        id: "doc-4",
        runId: "run-1",
        type: "resume",
        title: "Resume",
        createdAt: "2026-04-12T08:00:00.000Z",
        jobTitle: "Engineer",
        companyName: "Real Company GmbH",
        applyUrl: "https://jobs.lever.co/fake-company/123",
        jobLink: null,
      }),
    ).toBe("Real Company GmbH");
  });
});
