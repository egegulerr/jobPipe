import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

export function invalidateDocumentsQueries(queryClient: QueryClient, runIds: string[]) {
  const affectedRunIds = new Set(runIds);

  return queryClient.invalidateQueries({
    queryKey: queryKeys.documents.all,
    predicate: (query) => {
      const key = query.queryKey;

      if (key[1] === "dashboard") {
        return true;
      }

      if (key[1] === "run" && typeof key[2] === "string") {
        return affectedRunIds.has(key[2]);
      }

      return false;
    },
  });
}
