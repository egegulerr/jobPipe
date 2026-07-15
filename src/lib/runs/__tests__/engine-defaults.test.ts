import { describe, expect, it } from "vitest";

import {
  DEFAULT_DEFAULT_TONE,
  DEFAULT_MATCH_THRESHOLD,
  resolveRunEngineFromConfig,
} from "@/lib/runs/engine-defaults";
import {
  buildDocumentToneOverride,
  buildJobMatcherOverride,
} from "@/lib/runs/engine-overrides";

describe("resolveRunEngineFromConfig", () => {
  it("returns code defaults when run config request fields are empty", () => {
    const resolved = resolveRunEngineFromConfig({});

    expect(resolved.match_threshold).toBe(DEFAULT_MATCH_THRESHOLD);
    expect(resolved.default_tone).toBe(DEFAULT_DEFAULT_TONE);
    expect(resolved.job_matcher_instructions).toBe("");
    expect(resolved.resume_tone_request).toBe("Write in a professional tone.");
    expect(resolved.cover_letter_tone_request).toBe("Write in a professional tone.");
  });

  it("parses matcher threshold and instructions from structured override text", () => {
    const resolved = resolveRunEngineFromConfig({
      job_matcher_requests: buildJobMatcherOverride({
        matchThreshold: 70,
        jobMatcherInstructions: "Prefer staff-level scope.",
      }),
    });

    expect(resolved.match_threshold).toBe(70);
    expect(resolved.job_matcher_instructions).toBe("Prefer staff-level scope.");
  });

  it("treats unstructured job matcher text as instructions", () => {
    const resolved = resolveRunEngineFromConfig({
      job_matcher_requests: "Prioritize staff-level scope.",
    });

    expect(resolved.match_threshold).toBe(DEFAULT_MATCH_THRESHOLD);
    expect(resolved.job_matcher_instructions).toBe("Prioritize staff-level scope.");
  });

  it("parses resume and cover letter tone overrides independently", () => {
    const resolved = resolveRunEngineFromConfig({
      resume_writer_requests: buildDocumentToneOverride({
        defaultTone: "narrative",
        toneInstructions: "",
      }),
      cover_letter_writer_requests: buildDocumentToneOverride({
        defaultTone: "custom",
        toneInstructions: "Keep it concise.",
      }),
    });

    expect(resolved.resume_tone_request).toBe("Write in a narrative tone.");
    expect(resolved.cover_letter_tone_request).toBe("Keep it concise.");
  });
});
