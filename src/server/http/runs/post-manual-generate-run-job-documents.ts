import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";

const runsService = createRunsService();

export async function POST(_: Request, { params }: { params: Promise<{ runId: string; jobId: string }> }) {
  const { runId, jobId } = await params;
  const result = await runsService.triggerManualDocumentGeneration(runId, LOCAL_OWNER_ID, jobId);
  if (!result.ok) {
    if (result.error === "RUN_NOT_FOUND" || result.error === "JOB_NOT_FOUND") {
      return errorJson("Not found", 404);
    }
    if (result.error === "RUN_STILL_ACTIVE") {
      return errorJson("Run is still active", 409);
    }

    return errorJson(result.error ?? "Failed to trigger manual generation", result.status ?? 500);
  }

  return okJson({ ok: true });
}
