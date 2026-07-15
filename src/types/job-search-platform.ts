export const JOB_SEARCH_PLATFORMS = ["linkedin", "indeed"] as const;

export type JobSearchPlatform = (typeof JOB_SEARCH_PLATFORMS)[number];

export function isJobSearchPlatform(value: string): value is JobSearchPlatform {
  return (JOB_SEARCH_PLATFORMS as readonly string[]).includes(value);
}

export function parseJobSearchPlatforms(formData: FormData): JobSearchPlatform[] {
  const rawValues = formData.getAll("platforms");
  const normalizedValues = rawValues
    .flatMap((value) => String(value ?? "").split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const platforms: JobSearchPlatform[] = [];
  for (const value of normalizedValues) {
    if (isJobSearchPlatform(value) && !platforms.includes(value)) {
      platforms.push(value);
    }
  }

  return platforms;
}
