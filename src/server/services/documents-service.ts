import type { DocumentsService, ListUserDocumentsForRunInput } from "@/server/domains/documents/documents.interfaces";
import { documentsStoragePolicy, type UserDocumentSummary } from "@/server/domains/documents/documents.models";
import { createDocumentsRepository } from "@/server/repositories/documents-repository";
import { logEvent } from "@/server/shared/observability/logger";
import { infra, notFound, ok, type Result } from "@/server/shared/result";

type DocumentsRepository = ReturnType<typeof createDocumentsRepository>;
type DocumentRecord = NonNullable<Awaited<ReturnType<DocumentsRepository["getDocument"]>>["data"]>;
type RunDocuments = NonNullable<Awaited<ReturnType<DocumentsRepository["listRunDocuments"]>>["data"]>;
type UserDocumentsForRunResult = Awaited<ReturnType<DocumentsRepository["listUserDocumentsForRun"]>>["data"];
type UserDocument = NonNullable<UserDocumentsForRunResult>["documents"][number];
type BatchDocuments = NonNullable<Awaited<ReturnType<DocumentsRepository["getDocumentsByIds"]>>["data"]>;
type DeletedDocuments = NonNullable<Awaited<ReturnType<DocumentsRepository["deleteDocumentsByIds"]>>["data"]>;

function toDocumentRunSummary(run: {
  run_id: string;
  run_name: string | null;
  document_count: number;
  newest_created_at: string;
}) {
  return {
    runId: run.run_id,
    runName: run.run_name,
    documentCount: run.document_count,
    newestCreatedAt: run.newest_created_at,
  };
}

function toUserDocumentSummary(document: UserDocument): UserDocumentSummary {
  return {
    id: document.id,
    runId: document.run_id,
    runName: document.run_name,
    type: document.type,
    title: document.title,
    createdAt: document.created_at,
    jobTitle: document.job_title,
    companyName: document.company_name,
    applyUrl: document.apply_url,
    jobLink: document.job_link,
  };
}

function buildStorageState(usedBytes: number) {
  const percentUsed = Math.min(999, Math.round((usedBytes / documentsStoragePolicy.limitBytes) * 100));
  const status =
    usedBytes >= documentsStoragePolicy.limitBytes
      ? "over_limit"
      : usedBytes >= documentsStoragePolicy.warningThresholdBytes
        ? "warning"
        : "ok";

  return {
    usedBytes,
    limitBytes: documentsStoragePolicy.limitBytes,
    warningThresholdBytes: documentsStoragePolicy.warningThresholdBytes,
    percentUsed,
    status,
  } as const;
}

function collectStoragePaths(documents: DeletedDocuments) {
  return Array.from(
    new Set(
      documents
        .flatMap((document) => [document.storage_path, document.docx_storage_path])
        .filter((path): path is string => Boolean(path)),
    ),
  );
}

async function cleanupDeletedDocumentFiles(input: {
  documentsRepository: DocumentsRepository;
  storagePaths: string[];
  userId: string;
  runIds: string[];
}) {
  if (input.storagePaths.length === 0) {
    return;
  }

  try {
    const { error } = await input.documentsRepository.removeStorageObjects(input.storagePaths);

    if (!error) {
      return;
    }

    logEvent({
      level: "warn",
      message: "Document storage cleanup failed after database delete",
      userId: input.userId,
      runId: input.runIds[0],
      error: error.message,
      metadata: {
        runIds: input.runIds,
        storagePaths: input.storagePaths,
      },
    });
  } catch (error) {
    logEvent({
      level: "warn",
      message: "Document storage cleanup failed after database delete",
      userId: input.userId,
      runId: input.runIds[0],
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        runIds: input.runIds,
        storagePaths: input.storagePaths,
      },
    });
  }
}

export function createDocumentsService(): DocumentsService {
  async function getUniqueDocumentsByIds<TDocument>(
    input: {
      documentIds: string[];
      userId: string;
      fetcher: (documentIds: string[], userId: string) => Promise<{ data: TDocument[] | null; error: { message: string } | null }>;
    },
  ): Promise<Result<{ documentIds: string[]; documents: TDocument[] }>> {
    const uniqueIds = Array.from(new Set(input.documentIds.filter(Boolean)));

    if (uniqueIds.length === 0) {
      return ok({ documentIds: [], documents: [] });
    }

    const { data: documents, error } = await input.fetcher(uniqueIds, input.userId);

    if (error) {
      return infra(error.message);
    }

    if ((documents ?? []).length !== uniqueIds.length) {
      return notFound("One or more documents were not found");
    }

    return ok({ documentIds: uniqueIds, documents: documents ?? [] });
  }

  async function getDocumentDownload(documentId: string, userId: string): Promise<Result<{ document: DocumentRecord }>> {
    const documentsRepository = createDocumentsRepository();
    const { data: document, error } = await documentsRepository.getDocument(documentId, userId);

    if (error) {
      return infra(error.message);
    }

    if (!document) {
      return notFound("Document not found");
    }

    return ok({ document });
  }

  async function listRunDocuments(runId: string, userId: string): Promise<Result<{ documents: RunDocuments }>> {
    const documentsRepository = createDocumentsRepository();
    const { data: documents, error } = await documentsRepository.listRunDocuments(userId, runId);

    if (error) {
      return infra(error.message);
    }

    return ok({ documents: documents ?? [] });
  }

  async function listUserDocuments(input: {
    userId: string;
    page: number;
    pageSize: number;
    search?: string;
    type?: string;
    runId?: string;
    recentOnly?: boolean;
  }): ReturnType<DocumentsService["listUserDocuments"]> {
    const documentsRepository = createDocumentsRepository();
    const normalizedPage = Math.max(1, input.page);
    const normalizedPageSize = Math.max(1, Math.min(input.pageSize, documentsStoragePolicy.maxPageSize));
    const [{ data: runsResult, error }, { data: storageSummary, error: storageError }] = await Promise.all([
      documentsRepository.listUserDocumentRuns({
        userId: input.userId,
        page: normalizedPage,
        pageSize: normalizedPageSize,
        search: input.search,
        type: input.type,
        runId: input.runId,
        recentOnly: input.recentOnly,
      }),
      documentsRepository.getUserStorageSummary(input.userId),
    ]);

    if (error) {
      return infra(error.message);
    }

    if (storageError) {
      return infra(storageError.message);
    }

    const storage = buildStorageState(storageSummary?.usedBytes ?? 0);
    const totalItems = runsResult?.totalRuns ?? 0;
    const totalDocuments = runsResult?.totalDocuments ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
    const notice =
      storage.status === "over_limit"
        ? {
            code: "storage_cleanup_active" as const,
            message:
              "Your document storage is above the current limit. Oldest completed-run artifacts are eligible for automatic cleanup until usage returns below the cap.",
          }
        : storage.status === "warning"
          ? {
              code: "storage_warning" as const,
              message:
                "You are nearing your document storage limit. If you exceed the cap, oldest completed-run artifacts will be removed automatically.",
            }
          : null;

    return ok({
      runs: (runsResult?.runs ?? []).map((run) => toDocumentRunSummary(run)),
      storage,
      notice,
      pagination: {
        page: normalizedPage,
        pageSize: normalizedPageSize,
        totalItems,
        totalPages,
        totalDocuments,
      },
      filters: runsResult?.filterOptions ?? { types: [], runs: [] },
      cleanupCandidateSummary: storageSummary?.cleanupCandidateSummary ?? null,
    });
  }

  async function listUserDocumentsForRun(
    input: ListUserDocumentsForRunInput,
  ): Promise<Result<{ documents: UserDocumentSummary[] }>> {
    const documentsRepository = createDocumentsRepository();
    const { data: documentsResult, error } = await documentsRepository.listUserDocumentsForRun(input);

    if (error) {
      return infra(error.message);
    }

    return ok({
      documents: (documentsResult?.documents ?? []).map((document) => toUserDocumentSummary(document)),
    });
  }

  async function getBatchDownloadDocuments(documentIds: string[], userId: string): Promise<Result<{ documents: BatchDocuments }>> {
    const documentsRepository = createDocumentsRepository();
    const result = await getUniqueDocumentsByIds<BatchDocuments[number]>({
      documentIds,
      userId,
      fetcher: documentsRepository.getDocumentsByIds,
    });

    if (!result.ok) {
      return result;
    }

    return ok({ documents: result.data.documents });
  }

  async function deleteDocuments(
    documentIds: string[],
    userId: string,
  ): Promise<Result<{ deletedCount: number; deletedIds: string[]; runIds: string[] }>> {
    const documentsRepository = createDocumentsRepository();
    const uniqueIds = Array.from(new Set(documentIds.filter(Boolean)));

    if (uniqueIds.length === 0) {
      return ok({ deletedCount: 0, deletedIds: [], runIds: [] });
    }

    const { data: deletedDocuments, error: deleteError } = await documentsRepository.deleteDocumentsByIds(uniqueIds, userId);

    if (deleteError) {
      if (deleteError.code === "P0002") {
        return notFound("One or more documents were not found");
      }

      return infra(deleteError.message);
    }

    const documents = deletedDocuments ?? [];
    const storagePaths = collectStoragePaths(documents);
    const runIds = Array.from(new Set(documents.map((document) => document.run_id)));

    await cleanupDeletedDocumentFiles({
      documentsRepository,
      storagePaths,
      userId,
      runIds,
    });

    return ok({
      deletedCount: documents.length,
      deletedIds: documents.map((document) => document.id),
      runIds,
    });
  }

  return {
    deleteDocuments,
    getDocumentDownload,
    getBatchDownloadDocuments,
    listRunDocuments,
    listUserDocuments,
    listUserDocumentsForRun,
  };
}
