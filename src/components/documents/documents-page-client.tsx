"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeleteDocumentsMutation } from "@/hooks/mutations/use-delete-documents-mutation";
import { useDocumentsDashboardQuery } from "@/hooks/queries/use-documents-dashboard-query";
import { documentsStoragePolicy } from "@/lib/documents/documents-storage-policy";
import type { UserDocumentsResponseDto } from "@/types/output/documents.dto";
import { DocumentsLibraryFooter } from "@/components/documents/documents-library-footer";
import { DocumentsLibraryRunGroup } from "@/components/documents/documents-library-run-group";
import { DocumentsLibraryHeader } from "@/components/documents/documents-library-header";
import { DocumentsLibraryToolbar } from "@/components/documents/documents-library-toolbar";
import { formatDocumentType } from "@/components/documents/documents-library-utils";

type DocumentsPageClientProps = {
  initialData: UserDocumentsResponseDto;
};

const RUNS_PER_PAGE = documentsStoragePolicy.defaultRunsPageSize;

function resolveOpenGroupKey(groupKeys: string[], openGroupKey: string | null | undefined) {
  if (openGroupKey === undefined) {
    return groupKeys[0] ?? null;
  }

  if (openGroupKey === null) {
    return null;
  }

  return groupKeys.includes(openGroupKey) ? openGroupKey : (groupKeys[0] ?? null);
}

export function DocumentsPageClient({ initialData }: DocumentsPageClientProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRun, setSelectedRun] = useState("all");
  const [recentOnly, setRecentOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openGroupKey, setOpenGroupKey] = useState<string | null | undefined>(undefined);
  const [batchDownloadError, setBatchDownloadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const deleteDocumentsMutation = useDeleteDocumentsMutation();

  const deferredSearch = useDeferredValue(search);
  const documentsQuery = useDocumentsDashboardQuery(
    {
      page: currentPage,
      pageSize: RUNS_PER_PAGE,
      search: deferredSearch,
      type: selectedType,
      runId: selectedRun,
      recentOnly,
    },
    !search && selectedType === "all" && selectedRun === "all" && !recentOnly && currentPage === 1 ? initialData : undefined,
  );
  const data = documentsQuery.data ?? initialData;
  const runs = data.runs;
  const notice = data.notice;

  const typeOptions = useMemo(
    () => data.filters.types.map((type) => ({ value: type, label: formatDocumentType(type) })),
    [data.filters.types],
  );
  const runOptions = data.filters.runs;
  const groupKeys = useMemo(() => runs.map((run) => run.runId), [runs]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activeOpenGroupKey = resolveOpenGroupKey(groupKeys, openGroupKey);

  useEffect(() => {
    if (currentPage > data.pagination.totalPages) {
      setCurrentPage(data.pagination.totalPages);
    }
  }, [currentPage, data.pagination.totalPages]);

  useEffect(() => {
    setSelectedIds([]);
  }, [deferredSearch, selectedType, selectedRun, recentOnly, currentPage]);

  function handleToggleDocument(documentId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(documentId);
      } else {
        next.delete(documentId);
      }

      return Array.from(next);
    });
  }

  function handleToggleGroup(documentIds: string[], checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);

      for (const documentId of documentIds) {
        if (checked) {
          next.add(documentId);
        } else {
          next.delete(documentId);
        }
      }

      return Array.from(next);
    });
  }

  async function handleBatchDownload() {
    try {
      setBatchDownloadError(null);
      setIsBatchDownloading(true);
      const response = await fetch("/api/documents/batch-download", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedSet),
          formats: ["pdf", "docx"],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: "Batch download failed" }))) as { error?: string };
        throw new Error(payload.error ?? "Batch download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `job-pipe-documents-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setBatchDownloadError(error instanceof Error ? error.message : "Batch download failed");
    } finally {
      setIsBatchDownloading(false);
    }
  }

  async function handleDeleteDocuments(documentIdsToDelete: string[], prompt: string) {
    if (documentIdsToDelete.length === 0) {
      return;
    }

    if (!window.confirm(prompt)) {
      return;
    }

    try {
      setDeleteError(null);
      const result = await deleteDocumentsMutation.mutateAsync({ documentIds: documentIdsToDelete });

      setSelectedIds((current) => current.filter((documentId) => !result.deletedIds.includes(documentId)));
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
    }
  }

  function handleDeleteSingleDocument(documentId: string, documentTitle: string) {
    return handleDeleteDocuments([documentId], `Delete "${documentTitle}"? This action cannot be undone.`);
  }

  function handleBatchDelete() {
    return handleDeleteDocuments(
      Array.from(selectedSet),
      `Delete ${selectedSet.size} selected document${selectedSet.size === 1 ? "" : "s"}? This action cannot be undone.`,
    );
  }

  return (
    <div className="min-h-full bg-fixed bg-[radial-gradient(circle_at_top_left,rgba(128,131,255,0.12),transparent_34%),linear-gradient(180deg,#11141c_0%,#10131a_55%,#0d1017_100%)] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <DocumentsLibraryHeader totalDocuments={data.pagination.totalDocuments} storage={data.storage} />

        {documentsQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{documentsQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {batchDownloadError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{batchDownloadError}</AlertDescription>
          </Alert>
        ) : null}

        {deleteError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        ) : null}

        <DocumentsLibraryToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          selectedType={selectedType}
          onTypeChange={(value) => {
            setSelectedType(value);
            setCurrentPage(1);
          }}
          selectedRun={selectedRun}
          onRunChange={(value) => {
            setSelectedRun(value);
            setCurrentPage(1);
          }}
          recentOnly={recentOnly}
          onRecentToggle={() => {
            setRecentOnly((current) => !current);
            setCurrentPage(1);
          }}
          typeOptions={typeOptions}
          runOptions={runOptions}
          selectedCount={selectedSet.size}
          onBatchDownload={handleBatchDownload}
          isBatchDownloading={isBatchDownloading}
          onBatchDelete={handleBatchDelete}
          isBatchDeleting={deleteDocumentsMutation.isPending}
        />

        {notice ? (
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-tertiary/20 bg-tertiary/5 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
            <AlertTriangle className="size-5 text-tertiary" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-on-surface">Storage Maintenance Notice</p>
              <p className="text-sm leading-6 text-on-surface-variant">{notice.message}</p>
            </div>
          </div>
        ) : null}

        {runs.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-outline-variant/30 bg-surface-container-low px-6 py-16 text-center">
            <p className="font-headline text-2xl font-bold tracking-[-0.03em] text-on-surface">
              No documents match the current filters
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Try a broader search, clear a filter, or generate a new run to repopulate the library.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {runs.map((run, index) => (
              <DocumentsLibraryRunGroup
                key={run.runId}
                run={run}
                index={index}
                selectedIds={selectedSet}
                onToggleDocument={handleToggleDocument}
                onToggleGroup={handleToggleGroup}
                isOpen={activeOpenGroupKey === run.runId}
                onToggleOpen={() =>
                  setOpenGroupKey((current) => {
                    const currentOpenGroupKey = resolveOpenGroupKey(groupKeys, current);
                    return currentOpenGroupKey === run.runId ? null : run.runId;
                  })
                }
                onDeleteDocument={handleDeleteSingleDocument}
                isDeletingDocument={deleteDocumentsMutation.isPending}
                search={deferredSearch}
                selectedType={selectedType}
                recentOnly={recentOnly}
              />
            ))}
          </div>
        )}

        <DocumentsLibraryFooter
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          visibleItems={runs.length}
          totalDocuments={data.pagination.totalDocuments}
          onPageChange={(nextPage) => setCurrentPage(Math.max(1, Math.min(nextPage, data.pagination.totalPages)))}
        />
      </div>
    </div>
  );
}
