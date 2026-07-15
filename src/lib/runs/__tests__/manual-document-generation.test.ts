import { describe, expect, it } from "vitest";

import {
  countOtherAwaitingManualDocumentJobs,
  isManualDocumentGenerationComplete,
  pruneAwaitingManualDocumentJobs,
  shouldPollRunDetailsForManualDocuments,
} from "@/lib/runs/manual-document-generation";

describe("manual document generation polling", () => {
  const documents = [
    { id: "doc-1", job_id: "job-1", type: "resume", format: "pdf", title: "Resume", storage_path: null, created_at: "" },
    { id: "doc-2", job_id: "job-1", type: "cover_letter", format: "pdf", title: "Cover", storage_path: null, created_at: "" },
    { id: "doc-3", job_id: "job-2", type: "resume", format: "pdf", title: "Resume 2", storage_path: null, created_at: "" },
  ];

  it("treats generation as complete only when resume and cover letter exist", () => {
    expect(isManualDocumentGenerationComplete(documents, "job-1")).toBe(true);
    expect(isManualDocumentGenerationComplete(documents, "job-2")).toBe(false);
  });

  it("keeps polling while any tracked job is still incomplete", () => {
    expect(shouldPollRunDetailsForManualDocuments(new Map([
      ["job-1", Date.now()],
      ["job-2", Date.now()],
    ]), documents)).toBe(true);
    expect(shouldPollRunDetailsForManualDocuments(new Map([["job-1", Date.now()]]), documents)).toBe(false);
  });

  it("stops polling for timed-out tracked jobs", () => {
    const now = 1_000_000;

    expect(shouldPollRunDetailsForManualDocuments(new Map([["job-2", now - 6 * 60 * 1_000]]), documents, now)).toBe(false);
  });

  it("prunes completed and timed-out jobs from the awaiting map", () => {
    const now = 1_000_000;
    const pruned = pruneAwaitingManualDocumentJobs(
      new Map([
        ["job-1", now - 1_000],
        ["job-2", now - 6 * 60 * 1_000],
        ["job-3", now - 1_000],
      ]),
      documents,
      now,
    );

    expect(pruned).not.toBeNull();
    expect([...pruned!.keys()]).toEqual(["job-3"]);
  });

  it("returns null when the awaiting map does not change", () => {
    const awaiting = new Map([["job-3", Date.now()]]);
    expect(pruneAwaitingManualDocumentJobs(awaiting, documents)).toBeNull();
  });

  it("counts other active awaiting jobs excluding the selected job", () => {
    const activeAwaiting = new Map([["job-2", Date.now()]]);

    expect(countOtherAwaitingManualDocumentJobs(activeAwaiting, "job-1")).toBe(1);
    expect(countOtherAwaitingManualDocumentJobs(activeAwaiting, "job-2")).toBe(0);
    expect(countOtherAwaitingManualDocumentJobs(activeAwaiting, undefined)).toBe(1);
  });
});
