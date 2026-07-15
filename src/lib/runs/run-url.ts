import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { APP_ROUTES } from "@/lib/app-routes";

type RunHrefParams = {
  jobId?: string;
  docId?: string;
  filter?: JobListFilter;
};

export function buildRunHref(runId: string, params: RunHrefParams = {}): string {
  const p = new URLSearchParams();
  if (params.jobId) p.set("job", params.jobId);
  if (params.docId) p.set("doc", params.docId);
  if (params.filter && params.filter !== "all") p.set("filter", params.filter);
  const query = p.toString();
  const href = `${APP_ROUTES.runs}/${runId}`;
  return query ? `${href}?${query}` : href;
}
