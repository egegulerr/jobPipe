import JSZip from "jszip";
import { NextResponse } from "next/server";
import { z } from "zod";

import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createDocumentsService } from "@/server/services/documents-service";
import { selectedDocumentIdsSchema } from "@/server/http/documents/shared";
import { readStoredDocument } from "@/server/local/stored-files";
import { toSafeDownloadName } from "@/server/utils/file-utils";

const documentsService = createDocumentsService();

const batchDownloadSchema = z.object({
  documentIds: selectedDocumentIdsSchema,
  formats: z.array(z.enum(["pdf", "docx"])).min(1).max(2),
});

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  limit: number,
  worker: (item: TInput) => Promise<TOutput>,
) {
  const results: TOutput[] = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

function buildZipEntryName(input: {
  title: string;
  documentId: string;
  format: "pdf" | "docx";
}) {
  return toSafeDownloadName(`${input.title}-${input.documentId.slice(0, 8)}`, input.format);
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = batchDownloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid batch download request" }, { status: 400 });
  }

  const result = await documentsService.getBatchDownloadDocuments(parsed.data.documentIds, LOCAL_OWNER_ID);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }

  const documentsById = new Map(result.data.documents.map((document) => [document.id, document]));
  const zip = new JSZip();

  const jobs = parsed.data.documentIds.flatMap((documentId) => {
    const document = documentsById.get(documentId);

    if (!document) {
      return [];
    }

    return parsed.data.formats.map((format) => ({
      document,
      format,
      storagePath: format === "pdf" ? document.storage_path : document.docx_storage_path,
    }));
  });

  let addedFileCount = 0;

  await mapWithConcurrency(jobs, 4, async (job) => {
    if (!job.storagePath) {
      return null;
    }

    const file = readStoredDocument(job.storagePath);
    if (!file) {
      throw new Error(`Failed to download ${job.format.toUpperCase()} for ${job.document.title}`);
    }

    zip.file(
      buildZipEntryName({
        title: job.document.title,
        documentId: job.document.id,
        format: job.format,
      }),
      file,
    );
    addedFileCount += 1;
    return null;
  });

  if (addedFileCount === 0) {
    return NextResponse.json({ error: "No files available for the selected documents" }, { status: 404 });
  }

  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new NextResponse(Buffer.from(archive), {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="job-pipe-documents-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}
