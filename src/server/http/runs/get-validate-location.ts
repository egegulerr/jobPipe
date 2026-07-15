import { errorJson, okJson } from "@/server/http/api-response";
import { createRunsService } from "@/server/services/runs-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim();

  if (!location) {
    return errorJson("Missing location parameter", 400);
  }

  const runsService = createRunsService();
  const result = await runsService.validateLocation(location);

  return okJson(result);
}
