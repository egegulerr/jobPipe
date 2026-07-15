import { errorJson, okJson } from "@/server/http/api-response";
import { parseDocumentsFilterParams } from "@/server/http/documents/parse-documents-filter-params";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";

const documentsService = createDocumentsService();

export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { searchParams } = new URL(request.url);
  const { search, type, recentOnly } = parseDocumentsFilterParams(searchParams);

  const result = await documentsService.listUserDocumentsForRun({
    userId: LOCAL_OWNER_ID,
    runId,
    search,
    type,
    recentOnly,
  });

  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  return okJson(result.data);
}
