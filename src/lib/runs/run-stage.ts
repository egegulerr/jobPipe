export const RUN_STAGES = [
  "pending",
  "initializing",
  "job_scraping",
  "job_analysis",
  "job_matching",
  "motivation_letter_generation",
  "resume_content_generation",
  "document_generation",
  "completed",
  "failed",
] as const;

const STAGE_INDEX = new Map<string, number>(RUN_STAGES.map((stage, index) => [stage, index]));

export function getRunStageIndex(stage: string): number | undefined {
  return STAGE_INDEX.get(stage);
}

export function resolveForwardStage(currentStage: string | null, nextStage: string | null): string | null {
  if (!nextStage) return currentStage;
  if (!currentStage) return nextStage;

  const currentIndex = getRunStageIndex(currentStage);
  const nextIndex = getRunStageIndex(nextStage);
  if (typeof currentIndex !== "number" || typeof nextIndex !== "number") {
    throw new Error(`Unknown run stage: ${typeof currentIndex !== "number" ? currentStage : nextStage}`);
  }

  return nextIndex >= currentIndex ? nextStage : currentStage;
}

export function formatRunStageLabel(stage: string): string {
  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
