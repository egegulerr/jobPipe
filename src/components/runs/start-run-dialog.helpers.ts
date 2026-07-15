"use client";

import type { JobSearchPlatform } from "@/types/job-search-platform";
import type { CreateRunRequestDto, RunConfigDto } from "@/types/output/runs.dto";
import { DEFAULT_RESUME_TEMPLATE_ID, type ResumeTemplateId } from "@/lib/shared/document-template";
import { PROMPT_REQUEST_FIELDS, type PromptType } from "@/lib/shared/prompts";

export const LINKEDIN_LIMIT_OPTIONS = [100, 150, 200] as const;

export const DAYS_FILTER_LABELS: Record<string, string> = {
  "1": "Last 24 hours",
  "3": "Last 3 days",
  "7": "Last 7 days",
};

export type PromptOverrideState = Record<PromptType, string>;

export type RunConfigState = {
  runName: string;
  titleKeywords: string;
  locations: string;
  daysFilter: string;
  linkedinResultsLimit: string;
  indeedResultsLimit: string;
  platforms: Set<JobSearchPlatform>;
  promptOverrides: PromptOverrideState;
  includeProfilePicture: boolean;
  resumeTemplate: ResumeTemplateId;
};

const EMPTY_PROMPT_OVERRIDES: PromptOverrideState = {
  job_matcher: "",
  resume_writer: "",
  cover_letter_writer: "",
};

export function buildEmptyPromptOverrides(): PromptOverrideState {
  return { ...EMPTY_PROMPT_OVERRIDES };
}

export function hasPromptOverrides(promptOverrides: PromptOverrideState) {
  return Object.values(promptOverrides).some((value) => value.trim().length > 0);
}

export function buildPromptOverridesFromRunConfig(
  runConfig: RunConfigDto | null | undefined,
): PromptOverrideState {
  if (!runConfig) {
    return buildEmptyPromptOverrides();
  }

  return Object.fromEntries(
    (Object.keys(PROMPT_REQUEST_FIELDS) as PromptType[]).map((type) => [
      type,
      runConfig[PROMPT_REQUEST_FIELDS[type]] ?? "",
    ]),
  ) as PromptOverrideState;
}

export function buildEmptyRunConfigState(): RunConfigState {
  return {
    runName: "",
    titleKeywords: "",
    locations: "",
    daysFilter: "",
    linkedinResultsLimit: "100",
    indeedResultsLimit: "50",
    platforms: new Set<JobSearchPlatform>(),
    promptOverrides: buildEmptyPromptOverrides(),
    includeProfilePicture: false,
    resumeTemplate: DEFAULT_RESUME_TEMPLATE_ID,
  };
}

export function canSubmitRunConfig(state: RunConfigState) {
  const isLinkedinEnabled = state.platforms.has("linkedin");
  const isIndeedEnabled = state.platforms.has("indeed");

  return (
    Boolean(state.titleKeywords.trim()) &&
    Boolean(state.locations.trim()) &&
    Boolean(state.daysFilter) &&
    state.platforms.size > 0 &&
    (!isLinkedinEnabled || Boolean(state.linkedinResultsLimit)) &&
    (!isIndeedEnabled || Boolean(state.indeedResultsLimit))
  );
}

export function buildCreateRunPayload(state: RunConfigState): CreateRunRequestDto {
  const isLinkedinEnabled = state.platforms.has("linkedin");
  const isIndeedEnabled = state.platforms.has("indeed");

  return {
    config: {
      titleKeywords: state.titleKeywords.trim(),
      locations: state.locations.trim(),
      daysFilter: Number(state.daysFilter),
      platforms: Array.from(state.platforms),
      linkedinResultsLimit: isLinkedinEnabled ? Number(state.linkedinResultsLimit) : null,
      indeedResultsLimit: isIndeedEnabled ? Number(state.indeedResultsLimit) : null,
      jobMatcherRequests: state.promptOverrides.job_matcher.trim(),
      resumeWriterRequests: state.promptOverrides.resume_writer.trim(),
      coverLetterWriterRequests: state.promptOverrides.cover_letter_writer.trim(),
      includeProfilePicture: state.includeProfilePicture,
      resumeTemplate: state.resumeTemplate,
    },
  };
}

export function shouldIncludeProfilePicture(input: {
  includeProfilePicture: boolean;
  hasAvatar: boolean | undefined;
}) {
  return input.includeProfilePicture && Boolean(input.hasAvatar);
}

export function getProfilePictureReviewSummary(input: {
  includeProfilePicture: boolean;
  hasAvatar: boolean | undefined;
}): { included: boolean; label: string } {
  if (shouldIncludeProfilePicture(input)) {
    return {
      included: true,
      label: "Included on generated resumes (top-right)",
    };
  }

  if (!input.hasAvatar) {
    return {
      included: false,
      label: "Not included — no profile photo uploaded",
    };
  }

  return {
    included: false,
    label: "Not included on generated resumes",
  };
}

export function buildRunFormData(input: { state: RunConfigState }): FormData {
  const formData = new FormData();
  const config = buildCreateRunPayload(input.state);
  formData.set("config", JSON.stringify(config));

  if (input.state.runName.trim()) {
    formData.set("name", input.state.runName.trim());
  }

  return formData;
}
