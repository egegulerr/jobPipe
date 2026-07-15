import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";
import { RunsPageClient } from "@/components/runs/runs-page-client";
import { RUNS_QUERY_PARAMS } from "@/lib/app-routes";

const runsService = createRunsService();

type RunsPageSearchParams = {
  [RUNS_QUERY_PARAMS.startRun]?: string | string[];
};

export default async function RunsPage(props: { searchParams: Promise<RunsPageSearchParams> }) {
  const searchParams = await props.searchParams;
  const startRunParam = searchParams[RUNS_QUERY_PARAMS.startRun];
  const startRun =
    (Array.isArray(startRunParam) ? startRunParam[0] : startRunParam)?.toLowerCase() ===
    "true";
  const result = await runsService.listRunsDashboard(LOCAL_OWNER_ID);
  if (!result.ok || !result.data) {
    throw new Error(result.error);
  }

  return <RunsPageClient initialData={result.data} startRun={startRun} />;
}
