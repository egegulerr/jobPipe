import { getLocalOwner, LOCAL_OWNER_ID } from "@/server/local/owner";
import { buildSettingsProfileDtoForContext } from "@/server/http/settings/build-settings-profile-dto";
import { createSettingsService } from "@/server/services/settings-service";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const context = getLocalOwner();
  const settingsService = createSettingsService();
  const result = await settingsService.getUserSettings(LOCAL_OWNER_ID);

  if (!result.ok || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-on-surface-variant">Failed to load settings</p>
      </div>
    );
  }

  const settings = result.data;

  const initialData = {
    profile: await buildSettingsProfileDtoForContext({
      profile: {
        ...settings.profile,
        displayName: context.displayName,
        firstName: context.firstName,
        lastName: context.lastName,
        bio: settings.profile.bio ?? context.bio ?? null,
      },
      context,
      settingsService,
    }),
    experiences: settings.experiences,
    skills: settings.skills,
    languages: settings.languages,
    technologies: settings.technologies,
    certifications: settings.certifications,
  };

  return <SettingsPageClient initialData={initialData} />;
}
