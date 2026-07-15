import { describe, expect, it } from "vitest";

import {
  filterDocumentsForJob,
  formatApplicantsCount,
  formatMatchScore,
  formatSalarySummary,
  formatRunDocumentChipLabel,
  resolveSelectedDocId,
  resolveSelectedJobId,
} from "@/lib/runs/run-details-view-model";

describe("run-details view model", () => {
  const jobs = [
    { id: "job-1", company_name: "Acme" },
    { id: "job-2", company_name: "Globex" },
  ];

  const documents = [
    { id: "doc-1", job_id: "job-1", type: "resume", title: "Resume-Acme" },
    { id: "doc-2", job_id: "job-1", type: "cover_letter", title: "Cover-Letter-Acme" },
    { id: "doc-3", job_id: "job-2", type: "resume", title: "Resume-Globex" },
  ];

  it("shows all documents when no job is selected", () => {
    const selectedJobId = resolveSelectedJobId(undefined, jobs);
    const filtered = filterDocumentsForJob(documents, selectedJobId);
    expect(filtered).toHaveLength(3);
  });

  it("filters documents to selected job", () => {
    const selectedJobId = resolveSelectedJobId("job-1", jobs);
    const filtered = filterDocumentsForJob(documents, selectedJobId);
    expect(filtered.map((document) => document.id)).toEqual(["doc-1", "doc-2"]);
  });

  it("falls back to first filtered document when selected doc is invalid for active filter", () => {
    const selectedJobId = resolveSelectedJobId("job-1", jobs);
    const filtered = filterDocumentsForJob(documents, selectedJobId);
    const selectedDocId = resolveSelectedDocId("doc-3", filtered);

    expect(selectedDocId).toBe("doc-1");
  });

  it("formats labels as type and company when company is available", () => {
    const label = formatRunDocumentChipLabel(documents[0], new Map(jobs.map((job) => [job.id, job])));
    expect(label).toBe("Resume - Acme");
  });

  it("formats fractional match score as an integer percentage", () => {
    expect(formatMatchScore(0.85)).toBe("Score 85%");
    expect(formatMatchScore(0.1)).toBe("Score 10%");
  });

  it("formats absolute match score as an integer percentage", () => {
    expect(formatMatchScore(82.4)).toBe("Score 82%");
  });

  it("clamps out-of-range match scores", () => {
    expect(formatMatchScore(120)).toBe("Score 100%");
    expect(formatMatchScore(-5)).toBe("Score 0%");
  });

  it("returns null for missing or invalid match scores", () => {
    expect(formatMatchScore(null)).toBeNull();
    expect(formatMatchScore(undefined)).toBeNull();
    expect(formatMatchScore(Number.NaN)).toBeNull();
  });

  it("formats salary summary with range, currency, and unit", () => {
    expect(
      formatSalarySummary({
        salary_min: 175000,
        salary_max: 250000,
        salary_currency: "USD",
        salary_unit: "YEAR",
        salary_text: null,
      }),
    ).toBe("USD 175,000 - 250,000 / YEAR");
  });

  it("falls back to salary text when numeric salary is missing", () => {
    expect(
      formatSalarySummary({
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        salary_unit: null,
        salary_text: "Competitive compensation",
      }),
    ).toBe("Competitive compensation");
  });

  it("formats applicants count", () => {
    expect(formatApplicantsCount(200)).toBe("200 applicants");
  });
});
