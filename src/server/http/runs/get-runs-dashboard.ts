import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";

const runsService = createRunsService();

export async function GET() {
  const result = await runsService.listRunsDashboard(LOCAL_OWNER_ID);
  if (!result.ok || !result.data) {
    return errorJson(result.error ?? "Failed to load runs", result.status ?? 500);
  }

  return okJson(result.data);
}
