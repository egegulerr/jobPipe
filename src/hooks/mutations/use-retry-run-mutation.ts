"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query/query-keys";

export function useRetryRunMutation(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchJson<{ ok: true }>(`/api/runs/${runId}/retry`, { method: "POST" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.runs.details(runId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.runs.dashboard() }),
      ]);
    },
  });
}
