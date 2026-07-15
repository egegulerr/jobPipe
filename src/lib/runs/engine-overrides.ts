export const ENGINE_OVERRIDE_MARKER = "[Run engine override]";

export type DocumentToneValue = {
  defaultTone: string;
  toneInstructions: string;
};

export type JobMatcherOverrideInput = {
  matchThreshold: number;
  jobMatcherInstructions?: string | null;
};

export function buildJobMatcherOverride(settings: JobMatcherOverrideInput): string {
  const lines = [ENGINE_OVERRIDE_MARKER, `Minimum match threshold: ${settings.matchThreshold}%`];

  if (settings.jobMatcherInstructions?.trim()) {
    lines.push("", "Matcher instructions:", settings.jobMatcherInstructions.trim());
  }

  return lines.join("\n");
}

export function buildDocumentToneOverride(tone: DocumentToneValue): string {
  const lines = [ENGINE_OVERRIDE_MARKER, `Default tone: ${tone.defaultTone}`];

  if (tone.toneInstructions.trim()) {
    lines.push("", "Tone instructions:", tone.toneInstructions.trim());
  }

  return lines.join("\n");
}

export function parseMatchThresholdOverride(value: string): number | null {
  const match = value.match(/Minimum match threshold:\s*(\d{1,3})%/i);
  if (!match) {
    return null;
  }

  return Math.min(100, Math.max(0, Number(match[1])));
}

function containsEngineOverride(value: string): boolean {
  return value.includes(ENGINE_OVERRIDE_MARKER);
}

export function parseMatcherInstructionsOverride(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (!containsEngineOverride(trimmed)) {
    return trimmed;
  }

  const matcherInstructionsMatch = trimmed.match(/Matcher instructions:\s*([\s\S]*)$/i);
  return matcherInstructionsMatch?.[1]?.trim() ?? "";
}

export function parseDocumentToneOverride(
  overrideText: string,
  base: DocumentToneValue,
): DocumentToneValue {
  const trimmed = overrideText.trim();
  if (!trimmed) {
    return base;
  }

  const toneMatch = trimmed.match(/Default tone:\s*(\S+)/i);
  const toneInstructionsMatch = trimmed.match(/Tone instructions:\s*([\s\S]*)$/i);

  return {
    defaultTone: toneMatch ? toneMatch[1].toLowerCase() : "custom",
    toneInstructions: containsEngineOverride(trimmed)
      ? (toneInstructionsMatch?.[1]?.trim() ?? "")
      : trimmed,
  };
}

/** Resolves writer tone instructions from stored run-config text. */
export function parseToneRequestOverride(value: string): string {
  const trimmed = value.trim();
  if (!containsEngineOverride(trimmed)) {
    return trimmed;
  }

  const toneInstructionsMatch = trimmed.match(/Tone instructions:\s*([\s\S]*)$/i);
  if (toneInstructionsMatch?.[1]?.trim()) {
    return toneInstructionsMatch[1].trim();
  }

  const toneMatch = trimmed.match(/Default tone:\s*(\S+)/i);
  return toneMatch?.[1] ? `Write in a ${toneMatch[1].toLowerCase()} tone.` : "";
}

export function formatToneRequest(input: {
  default_tone: string | null | undefined;
  tone_instructions: string | null | undefined;
}): string {
  const instructions = input.tone_instructions?.trim();
  if (instructions) {
    return instructions;
  }

  const defaultTone = input.default_tone?.trim();
  return defaultTone ? `Write in a ${defaultTone} tone.` : "";
}
