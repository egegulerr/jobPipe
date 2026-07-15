"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { fetchJson } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query/query-keys";
import type { CreateRunResponseDto } from "@/types/output/runs.dto";

export function useCreateRunMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) =>
      fetchJson<CreateRunResponseDto>("/api/runs", {
        method: "POST",
        body: formData,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.runs.dashboard() });
      router.push(`/dashboard/runs/${data.runId}`);
    },
  });
}
