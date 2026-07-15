import { parseRunConfigOverrideInput } from "@/server/domains/runs/run-config";
import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";

export async function POST(request: Request) {
  const formData = await request.formData();

  // Parse run config from the "config" field
  const configJson = formData.get("config") as string | null;
  let requestBody: unknown = null;
  if (configJson) {
    try {
      requestBody = JSON.parse(configJson);
    } catch {
      return errorJson("Invalid JSON in config field", 400);
    }
  }

  const parsedRequest = parseRunConfigOverrideInput(requestBody);
  if (!parsedRequest.ok) {
    return errorJson("Invalid run configuration payload", 400);
  }

  const MAX_RUN_NAME_LENGTH = 120;
  const name = (formData.get("name") as string | null)?.trim() || null;
  if (name && name.length > MAX_RUN_NAME_LENGTH) {
    return errorJson(`Run name must be at most ${MAX_RUN_NAME_LENGTH} characters`, 400);
  }

  const runsService = createRunsService();
  const result = await runsService.createRun({
    userId: LOCAL_OWNER_ID,
    name,
    configOverride: parsedRequest.configOverride,
  });

  if (!result.ok) {
    if (result.error === "MISSING_RUN_CONFIG") {
      return errorJson("No saved run configuration found. Please provide search settings.", 400);
    }

    if (result.error === "INVALID_CONFIG") {
      return errorJson("Invalid run configuration payload", 400);
    }

    return errorJson(result.error ?? "Failed to create run", result.status ?? 500);
  }

  return okJson({ runId: result.runId });
}
