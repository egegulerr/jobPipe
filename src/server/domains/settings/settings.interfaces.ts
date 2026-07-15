import type { Result } from "@/server/shared/result";
import type { DatabaseError } from "@/types/error/database-error";
import type {
  FullUserSettings,
  SettingsLanguageProficiency,
  UserProfile,
} from "./settings.models";

export type { SettingsLanguageProficiency };

export type SettingsService = {
  getUserSettings: (userId: string) => Promise<Result<FullUserSettings>>;
  updateUserSettings: (
    userId: string,
    input: UpdateUserSettingsInput,
  ) => Promise<Result<FullUserSettings>>;
  uploadAvatar: (
    userId: string,
    file: File,
  ) => Promise<Result<{ avatarUrl: string }>>;
  getAvatarUrl: (userId: string) => Promise<Result<{ url: string }>>;
};

export type UpdateUserSettingsInput = {
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

export type SettingsExperienceInput = {
  id?: string;
  type?: "experience" | "education";
  title: string;
  organization?: string | null;
  dateRange?: string | null;
  description?: string | null;
};

export type SettingsSkillInput = {
  id?: string;
  name: string;
  context?: string | null;
  description?: string | null;
};

export type SettingsLanguageInput = {
  id?: string;
  name: string;
  proficiency: SettingsLanguageProficiency;
};

export type SettingsTechnologyInput = {
  id?: string;
  name: string;
};

export type SettingsCertificationInput = {
  id?: string;
  name: string;
  issuer?: string | null;
  issueDate?: string | null;
  description?: string | null;
};

export type RunProfileReadiness = {
  profile: {
    firstName: string | null;
    lastName: string | null;
  };
  experiences: Array<{
    title: string | null;
  }>;
};

export type SettingsRepository = {
  getUserProfile: (userId: string) => Promise<{
    data: UserProfile | null;
    error: DatabaseError;
  }>;
  updateUserProfile: (
    userId: string,
    input: Partial<Pick<UserProfile, "firstName" | "lastName" | "displayName" | "bio" | "avatarUrl">>,
  ) => Promise<{ data: UserProfile | null; error: DatabaseError }>;
  uploadAvatar: (
    userId: string,
    storagePath: string,
    buffer: Buffer,
    contentType: string,
  ) => Promise<{ data: { path: string } | null; error: DatabaseError }>;
  getFullUserSettings: (userId: string) => Promise<{
    data: FullUserSettings | null;
    error: DatabaseError;
  }>;
  getRunProfileReadiness: (userId: string) => Promise<{
    data: RunProfileReadiness | null;
    error: DatabaseError;
  }>;
  patchUserSettings: (
    userId: string,
    input: {
      profile?: Record<string, string | null | undefined> | null;
      experiences?: SettingsExperienceInput[] | null;
      skills?: SettingsSkillInput[] | null;
      languages?: SettingsLanguageInput[] | null;
      technologies?: SettingsTechnologyInput[] | null;
      certifications?: SettingsCertificationInput[] | null;
    },
  ) => Promise<{ error: DatabaseError }>;
};
