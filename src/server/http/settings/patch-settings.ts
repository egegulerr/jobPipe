import { z } from "zod";
import {
  PatchCertificationSchema,
  PatchExperienceSchema,
  PatchLanguageSchema,
  PatchSkillSchema,
  PatchTechnologySchema,
  SETTINGS_LIST_MAX,
} from "@/server/domains/settings/settings.schema";
import { errorJson, okJson } from "@/server/http/api-response";
import { buildSettingsProfileDtoForContext } from "@/server/http/settings/build-settings-profile-dto";
import { getLocalOwner } from "@/server/local/owner";
import { createSettingsService } from "@/server/services/settings-service";

const updateSettingsSchema = z.object({
  profile: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      displayName: z.string().optional(),
      bio: z.string().optional(),
    })
    .optional(),
  experiences: z.array(PatchExperienceSchema).max(SETTINGS_LIST_MAX).optional(),
  skills: z.array(PatchSkillSchema).max(SETTINGS_LIST_MAX).optional(),
  languages: z.array(PatchLanguageSchema).max(SETTINGS_LIST_MAX).optional(),
  technologies: z.array(PatchTechnologySchema).max(SETTINGS_LIST_MAX).optional(),
  certifications: z.array(PatchCertificationSchema).max(SETTINGS_LIST_MAX).optional(),
});

export async function PATCH(request: Request) {
  const context = getLocalOwner();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid JSON body", 400);
  }

  const parseResult = updateSettingsSchema.safeParse(body);
  if (!parseResult.success) {
    return errorJson("Invalid settings payload", 400, parseResult.error.format());
  }

  const settingsService = createSettingsService();
  const result = await settingsService.updateUserSettings(context.userId, parseResult.data);

  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  const updatedSettings = result.data;
  const profile = await buildSettingsProfileDtoForContext({
    profile: updatedSettings.profile,
    context,
    settingsService,
  });

  const response = {
    profile,
    experiences: updatedSettings.experiences,
    skills: updatedSettings.skills,
    languages: updatedSettings.languages,
    technologies: updatedSettings.technologies,
    certifications: updatedSettings.certifications,
  };

  return okJson(response);
}
