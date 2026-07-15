import { errorJson, okJson } from "@/server/http/api-response";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";
import type { RunDocumentSummary } from "@/types/output/runs.dto";

const documentsService = createDocumentsService();

export async function GET(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const result = await documentsService.listRunDocuments(runId, LOCAL_OWNER_ID);
  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }
  const documents = result.data.documents;

  return okJson<RunDocumentSummary[]>(
    (documents ?? []).map((document) => ({
      id: document.id,
      jobId: document.job_id,
      type: document.type,
      title: document.title,
      createdAt: document.created_at,
    })),
  );
}
