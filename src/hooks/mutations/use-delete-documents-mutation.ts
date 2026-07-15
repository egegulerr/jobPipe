"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api/http-client";
import { invalidateDocumentsQueries } from "@/lib/documents/invalidate-documents-queries";
import { queryKeys } from "@/lib/query/query-keys";

type DeleteDocumentsInput = {
  documentIds: string[];
};

type DeleteDocumentsResponse = {
  deletedCount: number;
  deletedIds: string[];
  runIds: string[];
};

export function useDeleteDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentIds }: DeleteDocumentsInput) =>
      fetchJson<DeleteDocumentsResponse>("/api/documents", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ documentIds }),
      }),
    onSuccess: async (result) => {
      await Promise.all([
        invalidateDocumentsQueries(queryClient, result.runIds),
        queryClient.invalidateQueries({ queryKey: queryKeys.runs.dashboard() }),
        ...result.runIds.map((runId) =>
          queryClient.invalidateQueries({ queryKey: queryKeys.runs.details(runId) }),
        ),
      ]);
    },
  });
}
