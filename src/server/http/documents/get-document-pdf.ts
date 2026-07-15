import {
  downloadStoredDocument,
  getDownloadableDocument,
} from "@/server/http/documents/download-stored-document";

// fallow-ignore-next-line code-duplication
export async function GET(
  _: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const result = await getDownloadableDocument(documentId);
  if (!result.ok) {
    return result.response;
  }
  const document = result.document;

  return downloadStoredDocument({
    storagePath: document.storage_path,
    title: document.title,
    extension: "pdf",
    contentType: "application/pdf",
    missingMessage: "Document is still processing or has no PDF file available",
    failedLabel: "PDF",
  });
}
