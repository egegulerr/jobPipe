"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { buildDocumentsFilterSearchParams } from "@/lib/documents/documents-filter-search-params";
import { queryKeys } from "@/lib/query/query-keys";
import type { UserDocumentsResponseDto } from "@/types/output/documents.dto";

type DocumentsDashboardQueryInput = {
  page: number;
  pageSize: number;
  search: string;
  type: string;
  runId: string;
  recentOnly: boolean;
};

export function useDocumentsDashboardQuery(params: DocumentsDashboardQueryInput, initialData?: UserDocumentsResponseDto) {
  const normalizedSearch = params.search.trim();

  return useQuery({
    queryKey: queryKeys.documents.dashboard({
      ...params,
      search: normalizedSearch,
    }),
    queryFn: () => {
      const searchParams = buildDocumentsFilterSearchParams({
        search: normalizedSearch,
        page: params.page,
        pageSize: params.pageSize,
        type: params.type,
        runId: params.runId,
        recentOnly: params.recentOnly,
      });

      return fetchJson<UserDocumentsResponseDto>(`/api/documents?${searchParams.toString()}`);
    },
    initialData,
    staleTime: initialData ? 30_000 : 0,
    refetchOnMount: initialData ? false : undefined,
  });
}
