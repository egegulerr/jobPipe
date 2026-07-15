import type {
  SettingsCertificationInput,
  SettingsExperienceInput,
  SettingsLanguageInput,
  SettingsSkillInput,
  SettingsTechnologyInput,
} from "@/server/domains/settings/settings.interfaces";

export type UpdateSettingsRequestDto = {
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
  };
  experiences?: SettingsExperienceInput[];
  skills?: SettingsSkillInput[];
  languages?: SettingsLanguageInput[];
  technologies?: SettingsTechnologyInput[];
  certifications?: SettingsCertificationInput[];
};
