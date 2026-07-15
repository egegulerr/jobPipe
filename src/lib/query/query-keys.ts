export const queryKeys = {
  runs: {
    all: ["runs"] as const,
    dashboard: () => [...queryKeys.runs.all, "dashboard"] as const,
    details: (runId: string) => [...queryKeys.runs.all, "details", runId] as const,
  },
  documents: {
    all: ["documents"] as const,
    dashboard: (params: {
      page: number;
      pageSize: number;
      search: string;
      type: string;
      runId: string;
      recentOnly: boolean;
    }) => [...queryKeys.documents.all, "dashboard", params] as const,
    run: (
      runId: string,
      params: {
        search: string;
        type: string;
        recentOnly: boolean;
      },
    ) => [...queryKeys.documents.all, "run", runId, params] as const,
  },
  settings: {
    all: ["settings"] as const,
    prompts: () => [...queryKeys.settings.all, "prompts"] as const,
  },
};
