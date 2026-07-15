"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query/query-keys";
import type { RunsDashboardResponseDto } from "@/types/output/runs.dto";

export function useRunsDashboardQuery(initialData?: RunsDashboardResponseDto) {
  return useQuery({
    queryKey: queryKeys.runs.dashboard(),
    queryFn: () => fetchJson<RunsDashboardResponseDto>("/api/runs"),
    initialData,
  });
}
