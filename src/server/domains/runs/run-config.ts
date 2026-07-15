import { isJobSearchPlatform, type JobSearchPlatform } from "@/types/job-search-platform";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  isResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/shared/document-template";

const ALLOWED_DAYS_FILTERS = new Set([1, 3, 7]);
const LINKEDIN_MIN_RESULTS = 100;
const LINKEDIN_MAX_RESULTS = 1000;

export type RunConfigOverride = {
  titleKeywords: string;
  locations: string;
  daysFilter: number;
  platforms: JobSearchPlatform[];
  linkedinResultsLimit: number | null;
  indeedResultsLimit: number | null;
  jobMatcherRequests: string;
  resumeWriterRequests: string;
  coverLetterWriterRequests: string;
  includeProfilePicture: boolean;
  resumeTemplate: ResumeTemplateId;
};

export type CreateRunCommand = {
  userId: string;
  name?: string | null;
  configOverride?: RunConfigOverride;
};

type ParseRunConfigResult =
  | { ok: true; configOverride?: RunConfigOverride }
  | { ok: false; error: "INVALID_CONFIG" };

function parseOptionalPositiveInt(value: unknown): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return Math.trunc(parsed);
}

function parseOptionalIntInRange(value: unknown, min: number, max: number): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.trunc(parsed);
  if (normalized < min || normalized > max) {
    return null;
  }

  return normalized;
}

function parsePlatforms(value: unknown): JobSearchPlatform[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 0 || normalized.some((item) => !isJobSearchPlatform(item))) {
    return null;
  }

  return Array.from(new Set(normalized)) as JobSearchPlatform[];
}

export function parseRunConfigOverrideInput(input: unknown): ParseRunConfigResult {
  if (!input || typeof input !== "object") {
    return { ok: true };
  }

  if (!("config" in input) || typeof (input as { config?: unknown }).config === "undefined") {
    return { ok: true };
  }

  const config = (input as { config?: unknown }).config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, error: "INVALID_CONFIG" };
  }

  const rawConfig = config as Record<string, unknown>;
  const titleKeywords = String(rawConfig.titleKeywords ?? "").trim();
  const locations = String(rawConfig.locations ?? "").trim();
  const daysFilter = Number(rawConfig.daysFilter ?? Number.NaN);
  const platforms = parsePlatforms(rawConfig.platforms);
  const linkedinResultsLimit = parseOptionalIntInRange(
    rawConfig.linkedinResultsLimit,
    LINKEDIN_MIN_RESULTS,
    LINKEDIN_MAX_RESULTS,
  );
  const indeedResultsLimit = parseOptionalPositiveInt(rawConfig.indeedResultsLimit);
  const jobMatcherRequests = String(rawConfig.jobMatcherRequests ?? "").trim();
  const resumeWriterRequests = String(rawConfig.resumeWriterRequests ?? "").trim();
  const coverLetterWriterRequests = String(rawConfig.coverLetterWriterRequests ?? "").trim();
  const includeProfilePicture = rawConfig.includeProfilePicture === true;
  const rawResumeTemplate = String(rawConfig.resumeTemplate ?? "").trim();
  const resumeTemplate = isResumeTemplateId(rawResumeTemplate)
    ? rawResumeTemplate
    : DEFAULT_RESUME_TEMPLATE_ID;

  if (!titleKeywords || !locations || !ALLOWED_DAYS_FILTERS.has(daysFilter) || !platforms?.length) {
    return { ok: false, error: "INVALID_CONFIG" };
  }

  if (platforms.includes("linkedin") && linkedinResultsLimit === null) {
    return { ok: false, error: "INVALID_CONFIG" };
  }

  if (platforms.includes("indeed") && indeedResultsLimit === null) {
    return { ok: false, error: "INVALID_CONFIG" };
  }

  return {
    ok: true,
    configOverride: {
      titleKeywords,
      locations,
      daysFilter,
      platforms,
      linkedinResultsLimit: platforms.includes("linkedin") ? linkedinResultsLimit : null,
      indeedResultsLimit: platforms.includes("indeed") ? indeedResultsLimit : null,
      jobMatcherRequests,
      resumeWriterRequests,
      coverLetterWriterRequests,
      includeProfilePicture,
      resumeTemplate,
    },
  };
}
