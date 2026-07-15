import { describe, expect, it } from "vitest";

import { aggregateDocumentRuns, paginateItems } from "@/lib/documents/aggregate-document-runs";

describe("aggregateDocumentRuns", () => {
  it("groups rows by run and keeps the newest createdAt", () => {
    const runs = aggregateDocumentRuns([
      { run_id: "run-a", created_at: "2026-05-01T10:00:00.000Z" },
      { run_id: "run-a", created_at: "2026-05-02T10:00:00.000Z" },
      { run_id: "run-b", created_at: "2026-05-03T10:00:00.000Z" },
    ]);

    expect(runs).toEqual([
      {
        runId: "run-b",
        documentCount: 1,
        newestCreatedAt: "2026-05-03T10:00:00.000Z",
      },
      {
        runId: "run-a",
        documentCount: 2,
        newestCreatedAt: "2026-05-02T10:00:00.000Z",
      },
    ]);
  });
});

describe("paginateItems", () => {
  it("returns the requested page slice", () => {
    expect(paginateItems([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });
});
