export const RUN_PROFILE_REQUIREMENT_MESSAGE =
  "Add and save your first name, last name, and at least one job experience to continue.";

export type RunProfileReadinessInput = {
  profile: {
    firstName?: string | null;
    lastName?: string | null;
  };
  experiences: Array<{
    title?: string | null;
  }>;
};

export function isRunProfileReady(settings: RunProfileReadinessInput | null | undefined) {
  if (!settings) {
    return false;
  }

  const hasFirstName = Boolean(settings.profile.firstName?.trim());
  const hasLastName = Boolean(settings.profile.lastName?.trim());
  const hasExperience = settings.experiences.some((experience) => Boolean(experience.title?.trim()));

  return hasFirstName && hasLastName && hasExperience;
}
