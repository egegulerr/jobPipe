import type { Result } from "@/server/shared/result";
import type { UserDocumentSummary } from "@/server/domains/documents/documents.models";
import type { DatabaseError } from "@/types/error/database-error";

type RunDocumentRecord = {
  id: string;
  job_id: string | null;
  type: string;
  format: string;
  title: string;
  storage_path: string | null;
  docx_storage_path: string | null;
  created_at: string;
};

type UserDocumentRecord = {
  id: string;
  run_id: string;
  run_name: string | null;
  job_id: string | null;
  type: string;
  title: string;
  created_at: string;
  job_title: string | null;
  company_name: string | null;
  apply_url: string | null;
  job_link: string | null;
};

type DownloadDocumentRecord = {
  id: string;
  user_id: string;
  type: string;
  format: string;
  title: string;
  storage_path: string | null;
  docx_storage_path: string | null;
};

type DocumentFilterOptions = {
  types: string[];
  runs: Array<{ value: string; label: string }>;
};

type ListUserDocumentRunsRepositoryResult = {
  runs: Array<{
    run_id: string;
    run_name: string | null;
    document_count: number;
    newest_created_at: string;
  }>;
  totalRuns: number;
  totalDocuments: number;
  filterOptions: DocumentFilterOptions;
};

type ListUserDocumentsForRunRepositoryResult = {
  documents: UserDocumentRecord[];
};

export type ListUserDocumentsInput = {
  userId: string;
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
  runId?: string;
  recentOnly?: boolean;
};

export type ListUserDocumentsForRunInput = Omit<ListUserDocumentsInput, "page" | "pageSize"> & {
  runId: string;
};

type UserStorageSummaryRecord = {
  usedBytes: number;
  cleanupCandidateSummary: {
    runId: string;
    createdAt: string;
    documentCount: number;
  } | null;
};

type BatchDownloadDocumentRecord = {
  id: string;
  type: string;
  title: string;
  storage_path: string | null;
  docx_storage_path: string | null;
};

type DeletableDocumentRecord = {
  id: string;
  run_id: string;
  storage_path: string | null;
  docx_storage_path: string | null;
};

export type DocumentsService = {
  listRunDocuments: (
    runId: string,
    userId: string,
  ) => Promise<Result<{ documents: RunDocumentRecord[] }>>;
  listUserDocumentsForRun: (
    input: ListUserDocumentsForRunInput,
  ) => Promise<Result<{ documents: UserDocumentSummary[] }>>;
  listUserDocuments: (
    input: Omit<ListUserDocumentsInput, "userId"> & { userId: string },
  ) => Promise<
    Result<{
      storage: {
        usedBytes: number;
        limitBytes: number;
        warningThresholdBytes: number;
        percentUsed: number;
        status: "ok" | "warning" | "over_limit";
      };
      notice: {
        code: "storage_warning" | "storage_cleanup_active";
        message: string;
      } | null;
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        totalDocuments: number;
      };
      runs: Array<{
        runId: string;
        runName: string | null;
        documentCount: number;
        newestCreatedAt: string;
      }>;
      filters: {
        types: string[];
        runs: Array<{ value: string; label: string }>;
      };
      cleanupCandidateSummary: UserStorageSummaryRecord["cleanupCandidateSummary"];
    }>
  >;
  getDocumentDownload: (
    documentId: string,
    userId: string,
  ) => Promise<Result<{ document: DownloadDocumentRecord }>>;
  getBatchDownloadDocuments: (
    documentIds: string[],
    userId: string,
  ) => Promise<Result<{ documents: BatchDownloadDocumentRecord[] }>>;
  deleteDocuments: (
    documentIds: string[],
    userId: string,
  ) => Promise<Result<{ deletedCount: number; deletedIds: string[]; runIds: string[] }>>;
};

export type DocumentsRepository = {
  listRunDocuments: (
    userId: string,
    runId: string,
  ) => Promise<{ data: RunDocumentRecord[] | null; error: DatabaseError }>;
  listUserDocumentRuns: (
    input: ListUserDocumentsInput,
  ) => Promise<{ data: ListUserDocumentRunsRepositoryResult | null; error: DatabaseError }>;
  listUserDocumentsForRun: (
    input: ListUserDocumentsForRunInput,
  ) => Promise<{ data: ListUserDocumentsForRunRepositoryResult | null; error: DatabaseError }>;
  getDocument: (
    documentId: string,
    userId: string,
  ) => Promise<{ data: DownloadDocumentRecord | null; error: DatabaseError }>;
  getDocumentsByIds: (
    documentIds: string[],
    userId: string,
  ) => Promise<{ data: BatchDownloadDocumentRecord[] | null; error: DatabaseError }>;
  deleteDocumentsByIds: (
    documentIds: string[],
    userId: string,
  ) => Promise<{ data: DeletableDocumentRecord[] | null; error: DatabaseError }>;
  removeStorageObjects: (
    storagePaths: string[],
  ) => Promise<{ data: null; error: DatabaseError }>;
  getUserStorageSummary: (
    userId: string,
  ) => Promise<{ data: UserStorageSummaryRecord | null; error: DatabaseError }>;
};
