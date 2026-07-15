"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query/query-keys";

type ManualGenerateInput = {
  runId: string;
  jobId: string;
};

export function useManualGenerateDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ runId, jobId }: ManualGenerateInput) =>
      fetchJson<{ ok: boolean }>(`/api/runs/${runId}/jobs/${jobId}/manual-generate`, {
        method: "POST",
      }),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.runs.details(input.runId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.runs.dashboard() });
    },
  });
}
