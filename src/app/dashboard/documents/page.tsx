import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import { documentsStoragePolicy } from "@/lib/documents/documents-storage-policy";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";

const documentsService = createDocumentsService();

export default async function DocumentsPage() {
  const result = await documentsService.listUserDocuments({
    userId: LOCAL_OWNER_ID,
    page: 1,
    pageSize: documentsStoragePolicy.defaultRunsPageSize,
    type: "all",
    runId: "all",
    recentOnly: false,
  });

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return <DocumentsPageClient initialData={result.data} />;
}
