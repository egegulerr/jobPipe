import { describe, expect, it } from "vitest";

import {
  buildDocumentToneOverride,
  ENGINE_OVERRIDE_MARKER,
  parseCoverLetterToneSettings,
  parseDocumentToneOverride,
  parseResumeToneSettings,
} from "@/components/runs/start-run-wizard/steps/ai-preferences-shared";

describe("ai-preferences-shared document tone", () => {
  it("builds and parses structured tone overrides", () => {
    const override = buildDocumentToneOverride({
      defaultTone: "assertive",
      toneInstructions: "Keep bullets short.",
    });

    expect(override).toContain(ENGINE_OVERRIDE_MARKER);
    expect(parseDocumentToneOverride(override, { defaultTone: "professional", toneInstructions: "" })).toEqual({
      defaultTone: "assertive",
      toneInstructions: "Keep bullets short.",
    });
  });

  it("parses resume and cover letter overrides independently", () => {
    const promptOverrides = {
      job_matcher: "",
      resume_writer: buildDocumentToneOverride({
        defaultTone: "narrative",
        toneInstructions: "",
      }),
      cover_letter_writer: buildDocumentToneOverride({
        defaultTone: "casual",
        toneInstructions: "Warm but direct.",
      }),
    };

    expect(parseResumeToneSettings(promptOverrides)).toEqual({
      defaultTone: "narrative",
      toneInstructions: "",
    });
    expect(parseCoverLetterToneSettings(promptOverrides)).toEqual({
      defaultTone: "casual",
      toneInstructions: "Warm but direct.",
    });
  });

  it("keeps legacy free-text cover letter overrides readable", () => {
    expect(
      parseCoverLetterToneSettings({
        job_matcher: "",
        resume_writer: "",
        cover_letter_writer: "Use British English spelling.",
      }),
    ).toEqual({
      defaultTone: "custom",
      toneInstructions: "Use British English spelling.",
    });
  });
});
