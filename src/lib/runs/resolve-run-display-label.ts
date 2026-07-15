export type RunDisplayLabelInput = {
  runId: string;
  name?: string | null;
  titleKeywords?: string | null;
  locations?: string | null;
};

export function resolveRunDisplayLabel(input: RunDisplayLabelInput): string {
  const trimmedName = input.name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const titleKeywords = input.titleKeywords?.trim();
  const locations = input.locations?.trim();
  if (titleKeywords && locations) {
    return `${titleKeywords} – ${locations}`;
  }

  return `Run ${input.runId.slice(0, 8)}`;
}
