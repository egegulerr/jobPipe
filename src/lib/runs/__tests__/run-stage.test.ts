import { describe, expect, it } from "vitest";

import { resolveForwardStage } from "@/lib/runs/run-stage";

describe("resolveForwardStage", () => {
  it("keeps the furthest forward known stage", () => {
    expect(resolveForwardStage("job_analysis", "job_matching")).toBe("job_matching");
    expect(resolveForwardStage("job_matching", "job_analysis")).toBe("job_matching");
  });

  it("throws for unknown stages", () => {
    expect(() => resolveForwardStage("legacy_stage", "job_matching")).toThrow("Unknown run stage: legacy_stage");
    expect(() => resolveForwardStage("job_matching", "legacy_stage")).toThrow("Unknown run stage: legacy_stage");
  });
});
