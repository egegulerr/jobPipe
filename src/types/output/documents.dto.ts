export type UserDocumentSummaryDto = {
  id: string;
  runId: string;
  runName?: string | null;
  type: string;
  title: string;
  createdAt: string;
  jobTitle: string | null;
  companyName: string | null;
  applyUrl: string | null;
  jobLink: string | null;
};

export type DocumentsStorageDto = {
  usedBytes: number;
  limitBytes: number;
  warningThresholdBytes: number;
  percentUsed: number;
  status: "ok" | "warning" | "over_limit";
};

export type DocumentsNoticeDto = {
  code: "storage_warning" | "storage_cleanup_active";
  message: string;
};

export type DocumentsPaginationDto = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  totalDocuments: number;
};

export type DocumentRunSummaryDto = {
  runId: string;
  runName: string | null;
  documentCount: number;
  newestCreatedAt: string;
};

export type DocumentsCleanupCandidateSummaryDto = {
  runId: string;
  createdAt: string;
  documentCount: number;
};

export type UserDocumentsResponseDto = {
  runs: DocumentRunSummaryDto[];
  storage: DocumentsStorageDto;
  notice: DocumentsNoticeDto | null;
  pagination: DocumentsPaginationDto;
  filters: {
    types: string[];
    runs: Array<{ value: string; label: string }>;
  };
  cleanupCandidateSummary: DocumentsCleanupCandidateSummaryDto | null;
};
