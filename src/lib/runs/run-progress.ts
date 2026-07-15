import type { RunDto } from "@/types/output/runs.dto";

import { RUN_STAGES, getRunStageIndex } from "@/lib/runs/run-stage";

export type RunProgressInput = Pick<
  RunDto,
  "status" | "stage" | "jobs_total" | "jobs_processed" | "jobs_matched" | "documents_generated"
>;

const PRE_JOB_STAGES = RUN_STAGES.slice(0, getRunStageIndex("job_analysis") ?? 0);
const PRE_JOB_UNIT_COUNT = PRE_JOB_STAGES.length;
const MATCHING_STAGE_INDEX = getRunStageIndex("job_matching") ?? 0;
const LETTER_STAGE_INDEX = getRunStageIndex("motivation_letter_generation") ?? 0;
const RESUME_STAGE_INDEX = getRunStageIndex("resume_content_generation") ?? 0;

const JOB_PROCESSING_UNITS_PER_JOB = 2;
const ARTIFACT_UNITS_PER_MATCHED_JOB = 4;

function currentStageIndex(run: RunProgressInput): number {
  return getRunStageIndex(run.stage ?? "pending") ?? 0;
}

function countPreJobUnitsCompleted(run: RunProgressInput): number {
  const stageIdx = currentStageIndex(run);
  let completed = 0;

  for (const stage of PRE_JOB_STAGES) {
    const stageIndex = getRunStageIndex(stage);
    if (typeof stageIndex !== "number") {
      continue;
    }

    if (stageIdx > stageIndex) {
      completed += 1;
      continue;
    }

    if (stageIdx === stageIndex && stage === "job_scraping" && (run.jobs_total ?? 0) > 0) {
      completed += 1;
    }

    break;
  }

  return completed;
}

function countJobProcessingUnitsCompleted(run: RunProgressInput): number {
  const jobsTotal = run.jobs_total ?? 0;
  if (jobsTotal <= 0) {
    return 0;
  }

  const jobsProcessed = run.jobs_processed ?? 0;
  const stageIdx = currentStageIndex(run);
  let completed = Math.max(0, Math.min(jobsTotal, jobsProcessed));

  if (stageIdx > MATCHING_STAGE_INDEX) {
    completed += jobsTotal;
  }

  return completed;
}

function countMatchedArtifactUnitsCompleted(run: RunProgressInput): number {
  const jobsMatched = run.jobs_matched ?? 0;
  if (jobsMatched <= 0) {
    return 0;
  }

  const documentsGenerated = run.documents_generated ?? 0;
  const stageIdx = currentStageIndex(run);
  let contentUnitsCompleted = 0;

  if (stageIdx > LETTER_STAGE_INDEX) {
    contentUnitsCompleted += jobsMatched;
  }

  if (stageIdx > RESUME_STAGE_INDEX) {
    contentUnitsCompleted += jobsMatched;
  }

  return Math.min(
    jobsMatched * ARTIFACT_UNITS_PER_MATCHED_JOB,
    contentUnitsCompleted + Math.max(0, Math.min(jobsMatched * 2, documentsGenerated)),
  );
}

function estimateTotalWorkUnits(run: RunProgressInput): number {
  const jobsTotal = run.jobs_total ?? 0;
  if (jobsTotal <= 0) {
    return PRE_JOB_UNIT_COUNT;
  }

  const jobsMatched = run.jobs_matched ?? 0;

  return (
    PRE_JOB_UNIT_COUNT +
    jobsTotal * JOB_PROCESSING_UNITS_PER_JOB +
    Math.max(0, jobsMatched) * ARTIFACT_UNITS_PER_MATCHED_JOB
  );
}

function estimateCompletedWorkUnits(run: RunProgressInput): number {
  const jobsTotal = run.jobs_total ?? 0;
  const preJobUnits = countPreJobUnitsCompleted(run);

  if (jobsTotal <= 0) {
    return preJobUnits;
  }

  return preJobUnits + countJobProcessingUnitsCompleted(run) + countMatchedArtifactUnitsCompleted(run);
}

/**
 * Derives run completion from pipeline stage order and persisted counters.
 * No fixed per-stage percentage table; 100% only when the run status is terminal.
 */
export function resolveRunProgressPercent(run: RunProgressInput): number {
  if (run.status === "completed" || run.status === "failed") {
    return 100;
  }

  const totalUnits = estimateTotalWorkUnits(run);
  if (totalUnits <= 0) {
    return 0;
  }

  const completedUnits = estimateCompletedWorkUnits(run);
  return Math.min(99, Math.round((completedUnits / totalUnits) * 100));
}
