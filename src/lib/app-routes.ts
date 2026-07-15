export const APP_ROUTES = {
  dashboard: "/dashboard",
  runs: "/dashboard/runs",
  documents: "/dashboard/documents",
  settings: "/dashboard/settings",
} as const;

export const RUNS_QUERY_PARAMS = {
  startRun: "startRun",
} as const;

export const START_RUN_EVENT = "jobpipe:start-run";

export function buildStartRunHref() {
  const params = new URLSearchParams({
    [RUNS_QUERY_PARAMS.startRun]: "true",
  });

  return `${APP_ROUTES.runs}?${params.toString()}`;
}
