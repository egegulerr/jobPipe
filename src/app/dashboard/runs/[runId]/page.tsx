import { notFound } from "next/navigation";

import { LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";
import { RunDetailsPageClient } from "@/components/runs/run-details-page-client";
import { parseJobListFilter } from "@/lib/runs/job-list-filter";

const runsService = createRunsService();

export default async function RunDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ doc?: string; job?: string; filter?: string }>;
}) {
  const { runId } = await params;
  const query = await searchParams;
  const result = await runsService.getRunDetails(runId, LOCAL_OWNER_ID);
  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") {
      notFound();
    }
    throw new Error(result.error.message);
  }

  return (
    <RunDetailsPageClient
      runId={runId}
      selectedDoc={query.doc}
      selectedJob={query.job}
      selectedFilter={parseJobListFilter(query.filter)}
      initialData={result.data}
    />
  );
}
