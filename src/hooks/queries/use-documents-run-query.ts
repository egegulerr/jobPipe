"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { buildDocumentsFilterSearchParams } from "@/lib/documents/documents-filter-search-params";
import { queryKeys } from "@/lib/query/query-keys";
import type { UserDocumentSummaryDto } from "@/types/output/documents.dto";

type DocumentsRunQueryInput = {
  runId: string;
  search: string;
  type: string;
  recentOnly: boolean;
};

type DocumentsRunQueryResponse = {
  documents: UserDocumentSummaryDto[];
};

export function useDocumentsRunQuery(params: DocumentsRunQueryInput, enabled: boolean) {
  const normalizedSearch = params.search.trim();

  return useQuery({
    queryKey: queryKeys.documents.run(params.runId, {
      search: normalizedSearch,
      type: params.type,
      recentOnly: params.recentOnly,
    }),
    queryFn: () => {
      const searchParams = buildDocumentsFilterSearchParams({
        search: normalizedSearch,
        type: params.type,
        runId: params.runId,
        recentOnly: params.recentOnly,
      });

      return fetchJson<DocumentsRunQueryResponse>(
        `/api/documents/runs/${params.runId}?${searchParams.toString()}`,
      );
    },
    enabled: enabled && Boolean(params.runId),
  });
}
