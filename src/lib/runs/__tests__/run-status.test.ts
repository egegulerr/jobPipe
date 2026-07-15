import { describe, expect, it } from "vitest";

import { canRetryRun } from "@/lib/runs/run-status";

describe("run-status", () => {
  it("allows failed runs to restart", () => {
    expect(canRetryRun({ status: "failed" })).toBe(true);
  });

  it("returns false for non-failed runs", () => {
    expect(
      canRetryRun({ status: "running" }),
    ).toBe(false);
  });
});
