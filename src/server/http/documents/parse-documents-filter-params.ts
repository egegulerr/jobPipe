export function parseDocumentsFilterParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get("search")?.trim() ?? undefined,
    type: searchParams.get("type")?.trim() ?? undefined,
    recentOnly: searchParams.get("recentOnly") === "true",
  };
}
