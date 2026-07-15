import { describe, expect, it } from "vitest";

import { resolveRunProgressPercent } from "@/lib/runs/run-progress";

describe("resolveRunProgressPercent", () => {
  it("returns 100 for completed and failed runs", () => {
    expect(
      resolveRunProgressPercent({
        status: "completed",
        stage: "completed",
        jobs_total: 10,
        jobs_processed: 10,
        jobs_matched: 4,
        documents_generated: 8,
      }),
    ).toBe(100);

    expect(
      resolveRunProgressPercent({
        status: "failed",
        stage: "job_matching",
        jobs_total: 10,
        jobs_processed: 5,
        jobs_matched: 0,
        documents_generated: 0,
      }),
    ).toBe(100);
  });

  it("stays below 100 while running even when all jobs are processed", () => {
    const percent = resolveRunProgressPercent({
      status: "running",
      stage: "document_generation",
      jobs_total: 10,
      jobs_processed: 10,
      jobs_matched: 4,
      documents_generated: 8,
    });

    expect(percent).toBe(99);
  });

  it("increases as analysis jobs complete", () => {
    const early = resolveRunProgressPercent({
      status: "running",
      stage: "job_analysis",
      jobs_total: 10,
      jobs_processed: 2,
      jobs_matched: 0,
      documents_generated: 0,
    });
    const later = resolveRunProgressPercent({
      status: "running",
      stage: "job_analysis",
      jobs_total: 10,
      jobs_processed: 8,
      jobs_matched: 0,
      documents_generated: 0,
    });

    expect(early).toBe(22);
    expect(later).toBe(48);
  });

  it("increases as documents are generated for matched jobs", () => {
    const beforeDocs = resolveRunProgressPercent({
      status: "running",
      stage: "document_generation",
      jobs_total: 10,
      jobs_processed: 10,
      jobs_matched: 4,
      documents_generated: 0,
    });
    const afterDocs = resolveRunProgressPercent({
      status: "running",
      stage: "document_generation",
      jobs_total: 10,
      jobs_processed: 10,
      jobs_matched: 4,
      documents_generated: 4,
    });

    expect(beforeDocs).toBe(79);
    expect(afterDocs).toBe(90);
  });

  it("does not budget artifact work for unmatched jobs", () => {
    expect(
      resolveRunProgressPercent({
        status: "running",
        stage: "motivation_letter_generation",
        jobs_total: 10,
        jobs_processed: 10,
        jobs_matched: 0,
        documents_generated: 0,
      }),
    ).toBe(99);
  });

  it("derives the same concrete value for dashboard and details shaped inputs", () => {
    const dashboardRun = {
      status: "running" as const,
      stage: "document_generation",
      jobs_total: 10,
      jobs_processed: 10,
      jobs_matched: 3,
      documents_generated: 2,
    };
    const detailsRun = { id: "run-1", name: null, stage_message: null, ...dashboardRun };

    expect(resolveRunProgressPercent(dashboardRun)).toBe(89);
    expect(resolveRunProgressPercent(detailsRun)).toBe(89);
  });
});
