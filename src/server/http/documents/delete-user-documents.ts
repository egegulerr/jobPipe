import { z } from "zod";

import { errorJson, okJson } from "@/server/http/api-response";
import { selectedDocumentIdsSchema } from "@/server/http/documents/shared";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";

const documentsService = createDocumentsService();

const deleteDocumentsSchema = z.object({
  documentIds: selectedDocumentIdsSchema,
});

export async function DELETE(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = deleteDocumentsSchema.safeParse(payload);

  if (!parsed.success) {
    return errorJson("Invalid delete documents request", 400);
  }

  const result = await documentsService.deleteDocuments(parsed.data.documentIds, LOCAL_OWNER_ID);
  if (!result.ok) {
    return errorJson(result.error.message, result.error.status);
  }

  return okJson(result.data);
}
