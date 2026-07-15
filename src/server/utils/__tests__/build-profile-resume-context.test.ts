import { describe, expect, it } from "vitest";

import { isRunProfileReady } from "@/lib/settings/profile-readiness";

import {
  buildProfileResumeText,
  buildRunResumeContext,
} from "../build-profile-resume-context";

describe("build-profile-resume-context", () => {
  it("builds resume text from saved profile sections", () => {
    const text = buildProfileResumeText({
      bio: "Platform engineer",
      experienceText:
        "Senior Engineer [Job Experience] (Acme) [2020 - Present] : Built APIs",
      technologies: [{ name: "TypeScript" }],
      certifications: [{ name: "AWS SA", issuer: "Amazon", issue_date: "2024", description: null }],
      languages: [{ name: "English", proficiency: "Fluent" }],
    });

    expect(text).toContain("## Summary");
    expect(text).toContain("Platform engineer");
    expect(text).toContain("Senior Engineer");
    expect(text).toContain("## Technologies");
    expect(text).toContain("TypeScript");
  });

  it("maps skills to extra_skills for prompt templates", () => {
    const context = buildRunResumeContext({
      bio: null,
      experiences: [
        {
          type: "experience",
          title: "Engineer",
          organization: null,
          date_range: null,
          description: null,
        },
      ],
      skills: [{ name: "Contract work", context: "Side project", description: null }],
      technologies: [],
      certifications: [],
      languages: [],
    });

    expect(context.parsed_text).toContain("Engineer");
    expect(context.extra_skills).toContain("Contract work");
    expect(context.additional_experience).toBeNull();
  });

  it("requires first name, last name, and experience for run readiness", () => {
    expect(isRunProfileReady(null)).toBe(false);
    expect(
      isRunProfileReady({
        profile: { firstName: "Ada", lastName: "Lovelace" },
        experiences: [],
      }),
    ).toBe(false);
    expect(
      isRunProfileReady({
        profile: { firstName: "Ada", lastName: "Lovelace" },
        experiences: [{ title: "Engineer" }],
      }),
    ).toBe(true);
  });
});
