import { errorJson, okJson } from "@/server/http/api-response";
import { buildSettingsProfileDtoForContext } from "@/server/http/settings/build-settings-profile-dto";
import { getLocalOwner } from "@/server/local/owner";
import { createSettingsService } from "@/server/services/settings-service";

export async function GET() {
  const context = getLocalOwner();

  const settingsService = createSettingsService();
  const result = await settingsService.getUserSettings(context.userId);

  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  const settings = result.data;
  const profile = await buildSettingsProfileDtoForContext({
    profile: settings.profile,
    context,
    settingsService,
  });

  const response = {
    profile,
    experiences: settings.experiences,
    skills: settings.skills,
    languages: settings.languages,
    technologies: settings.technologies,
    certifications: settings.certifications,
  };

  return okJson(response);
}
