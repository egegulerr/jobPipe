import { describe, expect, it } from "vitest";

import { toSafeDownloadName } from "@/server/utils/file-utils";

describe("toSafeDownloadName", () => {
  it("normalizes unsafe characters", () => {
    expect(toSafeDownloadName("A/B C:D", "pdf")).toBe("A-B-C-D.pdf");
  });

  it("falls back to document when empty", () => {
    expect(toSafeDownloadName("   ", "md")).toBe("document.md");
  });
});
