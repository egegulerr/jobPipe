import { describe, expect, it } from "vitest";

import { buildRunHref } from "@/lib/runs/run-url";

describe("buildRunHref", () => {
  const runId = "run-1";

  it("returns base path with no params", () => {
    expect(buildRunHref(runId)).toBe("/dashboard/runs/run-1");
  });

  it("includes job param", () => {
    expect(buildRunHref(runId, { jobId: "j1" })).toBe("/dashboard/runs/run-1?job=j1");
  });

  it("includes doc param", () => {
    expect(buildRunHref(runId, { docId: "d1" })).toBe("/dashboard/runs/run-1?doc=d1");
  });

  it("includes filter when not 'all'", () => {
    expect(buildRunHref(runId, { filter: "matched" })).toBe("/dashboard/runs/run-1?filter=matched");
  });

  it("omits filter when 'all'", () => {
    expect(buildRunHref(runId, { filter: "all" })).toBe("/dashboard/runs/run-1");
  });

  it("combines all params", () => {
    const href = buildRunHref(runId, { jobId: "j1", docId: "d1", filter: "unmatched" });
    expect(href).toBe("/dashboard/runs/run-1?job=j1&doc=d1&filter=unmatched");
  });

  it("omits undefined params", () => {
    expect(buildRunHref(runId, { jobId: "j1", docId: undefined, filter: "all" })).toBe(
      "/dashboard/runs/run-1?job=j1",
    );
  });
});
