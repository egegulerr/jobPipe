import { z } from "zod";

const ParsedProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
});

const ParsedExperienceSchema = z.object({
  type: z.enum(["experience", "education"]).optional(),
  title: z.string(),
  organization: z.string().nullable(),
  dateRange: z.string().nullable(),
  description: z.string().nullable(),
});

const ParsedSkillSchema = z.object({
  name: z.string(),
  context: z.string().nullable(),
  description: z.string().nullable(),
});

const ParsedLanguageSchema = z.object({
  name: z.string(),
  proficiency: z.enum(["Native", "Fluent", "Intermediate", "Basic"]),
});

const ParsedCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().nullable(),
  issueDate: z.string().nullable(),
  description: z.string().nullable(),
});

const ParsedTechnologySchema = z.object({
  name: z.string(),
});

export const ParsedResumeSchema = z.object({
  profile: ParsedProfileSchema,
  experiences: z.array(ParsedExperienceSchema),
  skills: z.array(ParsedSkillSchema),
  technologies: z.array(ParsedTechnologySchema),
  certifications: z.array(ParsedCertificationSchema),
  languages: z.array(ParsedLanguageSchema),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
