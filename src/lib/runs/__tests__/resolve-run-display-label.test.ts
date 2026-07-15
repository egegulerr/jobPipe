import { describe, expect, it } from "vitest";

import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";

describe("resolveRunDisplayLabel", () => {
  it("prefers a trimmed run name", () => {
    expect(
      resolveRunDisplayLabel({
        runId: "abcdef12-3456-7890-abcd-ef1234567890",
        name: "  Q2 UX Sourcing  ",
        titleKeywords: "Designer",
        locations: "Remote",
      }),
    ).toBe("Q2 UX Sourcing");
  });

  it("falls back to keywords and locations", () => {
    expect(
      resolveRunDisplayLabel({
        runId: "abcdef12-3456-7890-abcd-ef1234567890",
        name: "   ",
        titleKeywords: "Platform Engineer",
        locations: "Berlin",
      }),
    ).toBe("Platform Engineer – Berlin");
  });

  it("falls back to a short run id", () => {
    expect(
      resolveRunDisplayLabel({
        runId: "abcdef12-3456-7890-abcd-ef1234567890",
      }),
    ).toBe("Run abcdef12");
  });
});
