import { errorJson, okJson } from "@/server/http/api-response";
import { documentsStoragePolicy } from "@/lib/documents/documents-storage-policy";
import { parseDocumentsFilterParams } from "@/server/http/documents/parse-documents-filter-params";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";

const documentsService = createDocumentsService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? String(documentsStoragePolicy.defaultRunsPageSize));
  const { search, type, recentOnly } = parseDocumentsFilterParams(searchParams);
  const runId = searchParams.get("runId")?.trim() ?? undefined;

  const result = await documentsService.listUserDocuments({
    userId: LOCAL_OWNER_ID,
    page: Number.isFinite(page) ? Math.trunc(page) : 1,
    pageSize: Number.isFinite(pageSize) ? Math.trunc(pageSize) : documentsStoragePolicy.defaultRunsPageSize,
    search,
    type,
    runId,
    recentOnly,
  });
  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  return okJson(result.data);
}
