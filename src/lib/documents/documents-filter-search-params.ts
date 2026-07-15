export type DocumentsFilterParams = {
  search: string;
  type: string;
  recentOnly: boolean;
  page?: number;
  pageSize?: number;
  runId?: string;
};

export function buildDocumentsFilterSearchParams(filters: DocumentsFilterParams) {
  const normalizedSearch = filters.search.trim();
  const searchParams = new URLSearchParams({
    type: filters.type,
    recentOnly: String(filters.recentOnly),
  });

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  if (filters.page !== undefined) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize !== undefined) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  if (filters.runId) {
    searchParams.set("runId", filters.runId);
  }

  return searchParams;
}
