export type UserExperience = {
  id: string;
  type: "experience" | "education";
  title: string;
  organization: string | null;
  dateRange: string | null;
  description: string | null;
};

export type UserSkill = {
  id: string;
  name: string;
  context: string | null;
  description: string | null;
};

export type UserProfile = {
  userId: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
};

export type SettingsLanguageProficiency = "Native" | "Fluent" | "Intermediate" | "Basic";

export type UserLanguage = {
  id: string;
  name: string;
  proficiency: SettingsLanguageProficiency;
};

export type UserTechnology = {
  id: string;
  name: string;
};

export type UserCertification = {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  description: string | null;
};

export type FullUserSettings = {
  profile: UserProfile;
  experiences: UserExperience[];
  skills: UserSkill[];
  languages: UserLanguage[];
  technologies: UserTechnology[];
  certifications: UserCertification[];
};
