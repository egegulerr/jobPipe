type ExperienceRow = {
  type: string | null;
  title: string | null;
  organization: string | null;
  date_range: string | null;
  description: string | null;
};

type SkillRow = {
  name: string | null;
  context: string | null;
  description: string | null;
};

type TechnologyRow = {
  name: string | null;
};

type CertificationRow = {
  name: string | null;
  issuer: string | null;
  issue_date: string | null;
  description: string | null;
};

type LanguageRow = {
  name: string | null;
  proficiency: string | null;
};

function formatExperienceLines(experiences: ExperienceRow[]): string {
  return experiences
    .filter((experience) => experience.title?.trim())
    .map((experience) => {
      const parts = [experience.title!.trim()];
      if (experience.type) {
        parts.push(`[${experience.type === "education" ? "Education" : "Job Experience"}]`);
      }
      if (experience.organization?.trim()) {
        parts.push(`(${experience.organization.trim()})`);
      }
      if (experience.date_range?.trim()) {
        parts.push(`[${experience.date_range.trim()}]`);
      }
      if (experience.description?.trim()) {
        parts.push(`: ${experience.description.trim()}`);
      }
      return parts.join(" ");
    })
    .join("\n");
}

function formatSkillsForRunContext(skills: SkillRow[]): string {
  if (!skills.length) {
    return "";
  }

  return skills
    .filter((skill) => skill.name?.trim())
    .map((skill) => {
      const parts = [skill.name!.trim()];
      if (skill.context?.trim()) {
        parts.push(`(${skill.context.trim()})`);
      }
      if (skill.description?.trim()) {
        parts.push(`: ${skill.description.trim()}`);
      }
      return parts.join(" ");
    })
    .join("\n");
}

export function buildProfileResumeText(input: {
  bio: string | null;
  experienceText: string;
  technologies: TechnologyRow[];
  certifications: CertificationRow[];
  languages: LanguageRow[];
}): string {
  const sections: string[] = [];

  if (input.bio?.trim()) {
    sections.push(`## Summary\n${input.bio.trim()}`);
  }

  if (input.experienceText) {
    sections.push(`## Experience\n${input.experienceText}`);
  }

  const technologyNames = input.technologies
    .map((technology) => technology.name?.trim())
    .filter((name): name is string => Boolean(name));
  if (technologyNames.length > 0) {
    sections.push(`## Technologies\n${technologyNames.join(", ")}`);
  }

  const certificationLines = input.certifications
    .filter((certification) => certification.name?.trim())
    .map((certification) => {
      const parts = [certification.name!.trim()];
      if (certification.issuer?.trim()) {
        parts.push(`(${certification.issuer.trim()})`);
      }
      if (certification.issue_date?.trim()) {
        parts.push(`[${certification.issue_date.trim()}]`);
      }
      if (certification.description?.trim()) {
        parts.push(`: ${certification.description.trim()}`);
      }
      return parts.join(" ");
    });
  if (certificationLines.length > 0) {
    sections.push(`## Certifications\n${certificationLines.join("\n")}`);
  }

  const languageLines = input.languages
    .filter((language) => language.name?.trim())
    .map((language) => {
      const proficiency = language.proficiency?.trim();
      return proficiency ? `${language.name!.trim()} (${proficiency})` : language.name!.trim();
    });
  if (languageLines.length > 0) {
    sections.push(`## Languages\n${languageLines.join("\n")}`);
  }

  return sections.join("\n\n").trim();
}

export function buildRunResumeContext(input: {
  bio: string | null;
  experiences: ExperienceRow[];
  skills: SkillRow[];
  technologies: TechnologyRow[];
  certifications: CertificationRow[];
  languages: LanguageRow[];
}): {
  parsed_text: string;
  extra_skills: string | null;
  additional_experience: string | null;
} {
  const experienceText = formatExperienceLines(input.experiences);
  const parsed_text = buildProfileResumeText({
    bio: input.bio,
    experienceText,
    technologies: input.technologies,
    certifications: input.certifications,
    languages: input.languages,
  });

  const extra_skills = formatSkillsForRunContext(input.skills) || null;

  return {
    parsed_text,
    extra_skills,
    // Experiences live in parsed_text; writers use {{additional_experience}} for optional extras only.
    additional_experience: null,
  };
}
