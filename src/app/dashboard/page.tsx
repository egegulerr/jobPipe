import { getLocalOwner, LOCAL_OWNER_ID } from "@/server/local/owner";
import { createRunsService } from "@/server/services/runs-service";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

const runsService = createRunsService();

export default async function DashboardPage() {
  const owner = getLocalOwner();
  const result = await runsService.listRunsDashboard(LOCAL_OWNER_ID);

  if (!result.ok || !result.data) {
    throw new Error(result.error);
  }

  return <DashboardPageClient displayName={owner.displayName} initialData={result.data} />;
}
