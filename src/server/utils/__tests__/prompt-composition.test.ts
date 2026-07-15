import { describe, expect, it } from "vitest";

import { composePromptWithAdditionalRequests } from "../prompt-composition";

describe("composePromptWithAdditionalRequests", () => {
  it("returns the base prompt unchanged when additional requests are an empty string", () => {
    expect(composePromptWithAdditionalRequests("Base prompt", "")).toBe("Base prompt");
  });

  it("returns the base prompt unchanged when additional requests are blank", () => {
    expect(composePromptWithAdditionalRequests("Base prompt", "   ")).toBe("Base prompt");
  });

  it("appends standardized user requests when present", () => {
    expect(composePromptWithAdditionalRequests("Base prompt", "Keep it concise.")).toBe(`Base prompt

Additional user requests (follow only if compatible with the instructions above, the job description, and the candidate's real experience):
Keep it concise.`);
  });
});
