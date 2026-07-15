import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createSettingsService } from "@/server/services/settings-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const avatarFile = formData.get("avatar") as File | null;

  if (!avatarFile || avatarFile.size === 0) {
    return errorJson("Avatar file is required", 400);
  }

  const settingsService = createSettingsService();
  const result = await settingsService.uploadAvatar(LOCAL_OWNER_ID, avatarFile);

  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  return okJson({ avatarUrl: result.data.avatarUrl });
}
