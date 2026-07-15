import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";

const runsService = createRunsService();

function mapRetryErrorMessage(code: string | undefined): string {
  if (code === "RUN_NOT_FOUND") {
    return "Run not found.";
  }

  if (code === "RUN_NOT_FAILED") {
    return "Only failed runs can be retried.";
  }

  if (code === "RETRY_TRIGGER_FAILED") {
    return "Failed to restart the run. Please try again.";
  }

  return "Failed to retry run.";
}

export async function POST(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const result = await runsService.retryFailedRun(runId, LOCAL_OWNER_ID);

  if (!result.ok) {
    return errorJson(mapRetryErrorMessage(result.error), result.status ?? 500, {
      code: result.error ?? "UNKNOWN",
    });
  }

  return okJson({ ok: true });
}
