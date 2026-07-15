import { describe, expect, it } from "vitest";

import { renderTemplate } from "@/server/utils/template";

describe("prompt-renderer", () => {
  it("replaces all known template placeholders", () => {
    const rendered = renderTemplate("Resume: {{resume}} | Job: {{job_description}}", {
        resume: "My Resume",
        job_description: "Backend role",
    });

    expect(rendered).toBe("Resume: My Resume | Job: Backend role");
  });
});
