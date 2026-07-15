import type { SettingsLanguageProficiency } from "@/server/domains/settings/settings.models";

export type SettingsProfileDto = {
  userId: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  /** True when a profile picture exists in local storage. */
  hasAvatar: boolean;
};

export type SettingsExperienceDto = {
  id: string;
  type: "experience" | "education";
  title: string;
  organization: string | null;
  dateRange: string | null;
  description: string | null;
};

export type SettingsSkillDto = {
  id: string;
  name: string;
  context: string | null;
  description: string | null;
};

export type SettingsLanguageDto = {
  id: string;
  name: string;
  proficiency: SettingsLanguageProficiency;
};

export type SettingsTechnologyDto = {
  id: string;
  name: string;
};

export type SettingsCertificationDto = {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  description: string | null;
};

export type SettingsResponseDto = {
  profile: SettingsProfileDto;
  experiences: SettingsExperienceDto[];
  skills: SettingsSkillDto[];
  languages: SettingsLanguageDto[];
  technologies: SettingsTechnologyDto[];
  certifications: SettingsCertificationDto[];
};

export type ParseResumeResponseDto = {
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
  };
  experiences: Array<{
    type?: "experience" | "education";
    title: string;
    organization: string | null;
    dateRange: string | null;
    description: string | null;
  }>;
  skills: Array<{
    name: string;
    context: string | null;
    description: string | null;
  }>;
  technologies: Array<{
    name: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string | null;
    issueDate: string | null;
    description: string | null;
  }>;
  languages: Array<{
    name: string;
    proficiency: SettingsLanguageProficiency;
  }>;
};
