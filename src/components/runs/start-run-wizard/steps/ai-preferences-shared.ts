import {
  buildPromptOverridesFromRunConfig,
  type PromptOverrideState,
} from "@/components/runs/start-run-dialog.helpers";
import type { DocumentToneValue } from "@/components/settings/document-tone";
import type { EngineSettingsFormValue } from "@/components/settings/sections/engine-config-section";
import type { RunConfigDto } from "@/types/output/runs.dto";
import { resolveRunEngineFromConfig } from "@/lib/runs/engine-defaults";
import {
  buildDocumentToneOverride,
  buildJobMatcherOverride,
  ENGINE_OVERRIDE_MARKER,
  parseDocumentToneOverride,
} from "@/lib/runs/engine-overrides";

export {
  buildDocumentToneOverride,
  buildJobMatcherOverride,
  ENGINE_OVERRIDE_MARKER,
  parseDocumentToneOverride,
};

const codeDefaults = resolveRunEngineFromConfig({});

export const DEFAULT_ENGINE_SETTINGS: EngineSettingsFormValue = {
  matchThreshold: codeDefaults.match_threshold,
  defaultTone: codeDefaults.default_tone,
  jobMatcherInstructions: codeDefaults.job_matcher_instructions ?? "",
  toneInstructions: codeDefaults.tone_instructions ?? "",
};

export function getDefaultDocumentTone(): DocumentToneValue {
  return {
    defaultTone: DEFAULT_ENGINE_SETTINGS.defaultTone,
    toneInstructions: DEFAULT_ENGINE_SETTINGS.toneInstructions,
  };
}

export function parseResumeToneSettings(promptOverrides: PromptOverrideState): DocumentToneValue {
  return parseDocumentToneOverride(promptOverrides.resume_writer, getDefaultDocumentTone());
}

export function parseCoverLetterToneSettings(promptOverrides: PromptOverrideState): DocumentToneValue {
  return parseDocumentToneOverride(
    promptOverrides.cover_letter_writer,
    getDefaultDocumentTone(),
  );
}

function parseEngineSettings(promptOverrides: PromptOverrideState): EngineSettingsFormValue {
  const resolved = resolveRunEngineFromConfig({
    job_matcher_requests: promptOverrides.job_matcher,
    resume_writer_requests: promptOverrides.resume_writer,
    cover_letter_writer_requests: promptOverrides.cover_letter_writer,
  });
  const resumeTone = parseResumeToneSettings(promptOverrides);

  return {
    matchThreshold: resolved.match_threshold,
    defaultTone: resumeTone.defaultTone,
    toneInstructions: resumeTone.toneInstructions,
    jobMatcherInstructions: resolved.job_matcher_instructions,
  };
}

export function parseAiPreferences(promptOverrides: PromptOverrideState) {
  return {
    engineSettings: parseEngineSettings(promptOverrides),
    coverLetterTone: parseCoverLetterToneSettings(promptOverrides),
  };
}

export function parseRunAiPreferencesFromConfig(runConfig: RunConfigDto) {
  const promptOverrides = buildPromptOverridesFromRunConfig(runConfig);

  return {
    promptOverrides,
    ...parseAiPreferences(promptOverrides),
  };
}
