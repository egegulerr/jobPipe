"use client";

import { useMemo } from "react";

import { DocumentsLibraryGroupSection } from "@/components/documents/documents-library-group-section";
import { runSummaryToDocumentGroup, toDocumentViewModel } from "@/components/documents/documents-library-utils";
import { useDocumentsRunQuery } from "@/hooks/queries/use-documents-run-query";
import type { DocumentRunSummaryDto } from "@/types/output/documents.dto";

type DocumentsLibraryRunGroupProps = {
  run: DocumentRunSummaryDto;
  index: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedIds: Set<string>;
  onToggleDocument: (documentId: string, checked: boolean) => void;
  onToggleGroup: (documentIds: string[], checked: boolean) => void;
  onDeleteDocument: (documentId: string, documentTitle: string) => void;
  isDeletingDocument: boolean;
  search: string;
  selectedType: string;
  recentOnly: boolean;
};

export function DocumentsLibraryRunGroup({
  run,
  index,
  isOpen,
  onToggleOpen,
  selectedIds,
  onToggleDocument,
  onToggleGroup,
  onDeleteDocument,
  isDeletingDocument,
  search,
  selectedType,
  recentOnly,
}: DocumentsLibraryRunGroupProps) {
  const runDocumentsQuery = useDocumentsRunQuery(
    {
      runId: run.runId,
      search,
      type: selectedType,
      recentOnly,
    },
    isOpen,
  );

  const group = useMemo(() => {
    const documents = (runDocumentsQuery.data?.documents ?? []).map(toDocumentViewModel);
    return runSummaryToDocumentGroup(run, index, documents);
  }, [index, run, runDocumentsQuery.data?.documents]);

  return (
    <DocumentsLibraryGroupSection
      group={group}
      selectedIds={selectedIds}
      onToggleDocument={onToggleDocument}
      onToggleGroup={onToggleGroup}
      isOpen={isOpen}
      onToggleOpen={onToggleOpen}
      onDeleteDocument={onDeleteDocument}
      isDeletingDocument={isDeletingDocument}
      isLoadingDocuments={isOpen && runDocumentsQuery.isLoading}
      documentsError={
        runDocumentsQuery.isError
          ? runDocumentsQuery.error instanceof Error
            ? runDocumentsQuery.error.message
            : "Failed to load documents"
          : null
      }
    />
  );
}
