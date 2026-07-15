import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";

const runsService = createRunsService();

export async function GET(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const result = await runsService.getRunDetails(runId, LOCAL_OWNER_ID);
  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  return okJson(result.data);
}
