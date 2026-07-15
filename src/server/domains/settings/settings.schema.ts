import { z } from "zod";

export const SETTINGS_LIST_MAX = 50;

export const PatchExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["experience", "education"]).optional(),
  title: z.string().min(1),
  organization: z.string().optional(),
  dateRange: z.string().optional(),
  description: z.string().optional(),
});

export const PatchSkillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  context: z.string().optional(),
  description: z.string().optional(),
});

export const PatchLanguageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  proficiency: z.enum(["Native", "Fluent", "Intermediate", "Basic"]),
});

export const PatchTechnologySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
});

export const PatchCertificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  description: z.string().optional(),
});
