import { describe, expect, it } from "vitest";

import { PROMPT_DEFINITIONS } from "@/lib/shared/prompts";

describe("job matcher prompt contract", () => {
  it("requires JSON output and second-person reasoning for matcher explanations", () => {
    const matcherPrompt = PROMPT_DEFINITIONS.job_matcher.baseSystemPrompt;

    expect(matcherPrompt).toContain(
      'Return only valid JSON: {"verdict": boolean, "score": number, "reasoning": string}.',
    );
    expect(matcherPrompt).toContain("address the applicant in second person");
    expect(matcherPrompt).toContain("you");
    expect(matcherPrompt).toContain("your");
    expect(matcherPrompt).toContain("Never refer to the applicant as 'the candidate'");
    expect(matcherPrompt).toContain("'this candidate'");
    expect(matcherPrompt).toContain("'the user'");
    expect(matcherPrompt).toContain("'User has'");
  });
});
