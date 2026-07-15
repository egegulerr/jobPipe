import {
  formatToneRequest,
  parseMatchThresholdOverride,
  parseMatcherInstructionsOverride,
  parseToneRequestOverride,
} from "./engine-overrides";

export const DEFAULT_MATCH_THRESHOLD = 85;
export const DEFAULT_DEFAULT_TONE = "professional";

export type ResolvedEngineSettings = {
  match_threshold: number;
  default_tone: string;
  job_matcher_instructions: string | null;
  tone_instructions: string | null;
};

function resolveEngineSettings(
  settings?: {
    match_threshold?: number | null;
    default_tone?: string | null;
    job_matcher_instructions?: string | null;
    tone_instructions?: string | null;
  } | null,
): ResolvedEngineSettings {
  return {
    match_threshold: settings?.match_threshold ?? DEFAULT_MATCH_THRESHOLD,
    default_tone: settings?.default_tone ?? DEFAULT_DEFAULT_TONE,
    job_matcher_instructions: settings?.job_matcher_instructions ?? null,
    tone_instructions: settings?.tone_instructions ?? null,
  };
}

const CODE_ENGINE_DEFAULTS = resolveEngineSettings(null);

export type RunEngineConfigText = {
  job_matcher_requests?: string | null;
  resume_writer_requests?: string | null;
  cover_letter_writer_requests?: string | null;
};

export type ResolvedRunEngine = Omit<ResolvedEngineSettings, "job_matcher_instructions"> & {
  job_matcher_instructions: string;
  resume_tone_request: string;
  cover_letter_tone_request: string;
};

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value?.trim()) {
      return value.trim();
    }
  }
  return "";
}

/** Resolves effective engine settings from run_configs text fields and code defaults. */
export function resolveRunEngineFromConfig(config: RunEngineConfigText): ResolvedRunEngine {
  const defaults = CODE_ENGINE_DEFAULTS;
  const jobMatcher = String(config.job_matcher_requests ?? "");
  const resumeWriter = String(config.resume_writer_requests ?? "");
  const coverLetter = String(config.cover_letter_writer_requests ?? "");

  const match_threshold =
    parseMatchThresholdOverride(jobMatcher) ?? defaults.match_threshold;

  const parsedMatcherInstructions = parseMatcherInstructionsOverride(jobMatcher);
  const job_matcher_instructions = parsedMatcherInstructions || "";

  const defaultToneRequest = formatToneRequest(defaults);

  return {
    match_threshold,
    default_tone: defaults.default_tone,
    job_matcher_instructions,
    tone_instructions: defaults.tone_instructions,
    resume_tone_request: firstNonEmpty(
      parseToneRequestOverride(resumeWriter),
      defaultToneRequest,
    ),
    cover_letter_tone_request: firstNonEmpty(
      parseToneRequestOverride(coverLetter),
      defaultToneRequest,
    ),
  };
}
