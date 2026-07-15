import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";
import type { RunStatusResponse } from "@/types/output/runs.dto";

const runsService = createRunsService();

export async function GET(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const result = await runsService.getRunStatus(runId, LOCAL_OWNER_ID);
  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  const run = result.data.run;
  return okJson<RunStatusResponse>({
    id: run.id,
    status: run.status,
    stage: run.stage,
    lastStageMessage: run.stage_message,
    jobsTotal: run.jobs_total ?? 0,
    jobsProcessed: run.jobs_processed ?? 0,
    jobsMatched: run.jobs_matched ?? 0,
    jobsFailed: run.jobs_failed ?? 0,
    documentsGenerated: run.documents_generated ?? 0,
    hasWarnings: (run.jobs_failed ?? 0) > 0,
    startedAt: run.started_at,
    finishedAt: run.finished_at,
    errorMessage: run.error_message,
    createdAt: run.created_at,
  });
}
