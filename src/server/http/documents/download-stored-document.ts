import { NextResponse } from "next/server";

import { isDocumentRenderType } from "@/lib/shared/document-template";
import { readStoredDocument } from "@/server/local/stored-files";
import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";
import { toSafeDownloadName } from "@/server/utils/file-utils";

const documentsService = createDocumentsService();

export async function getDownloadableDocument(documentId: string) {
  const result = await documentsService.getDocumentDownload(
    documentId,
    LOCAL_OWNER_ID,
  );
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: result.error.message },
        { status: result.error.status },
      ),
    } as const;
  }

  const document = result.data.document;
  if (!isDocumentRenderType(document.type)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Unsupported document type: ${document.type}` },
        { status: 422 },
      ),
    } as const;
  }

  return { ok: true, document } as const;
}

export async function downloadStoredDocument(input: {
  storagePath: string | null;
  title: string;
  extension: "pdf" | "docx";
  contentType: string;
  missingMessage: string;
  failedLabel: string;
}) {
  if (!input.storagePath) {
    return NextResponse.json({ error: input.missingMessage }, { status: 404 });
  }

  const file = readStoredDocument(input.storagePath);
  if (!file) {
    return NextResponse.json(
      {
        error: `Failed to download ${input.failedLabel} document from local storage`,
      },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "content-type": input.contentType,
      "content-disposition": `attachment; filename=\"${toSafeDownloadName(input.title, input.extension)}\"`,
    },
  });
}
