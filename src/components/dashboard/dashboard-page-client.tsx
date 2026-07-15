"use client";

import { StartRunWizard } from "@/components/runs/start-run-wizard";
import { useStartRunDialogController } from "@/components/runs/hooks/use-start-run-dialog-controller";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentRunsCard } from "@/components/dashboard/recent-runs-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useRunsDashboardQuery } from "@/hooks/queries/use-runs-dashboard-query";
import type { RunsDashboardResponseDto } from "@/types/output/runs.dto";

type DashboardPageClientProps = {
  displayName: string;
  initialData: RunsDashboardResponseDto;
};

export function DashboardPageClient({ displayName, initialData }: DashboardPageClientProps) {
  const runsQuery = useRunsDashboardQuery(initialData);
  const startRunDialog = useStartRunDialogController();

  if (runsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{runsQuery.error.message}</AlertDescription>
      </Alert>
    );
  }

  const data = runsQuery.data ?? initialData;
  const { runs, jobsProcessed, runConfigs } = data;
  const recentRuns = runs.slice(0, 5);
  let completedRuns = 0;
  let runningRuns = 0;
  let generatedDocuments = 0;
  let runningRunId: string | undefined;

  for (const run of runs) {
    if (run.status === "completed") {
      completedRuns += 1;
    }

    if (run.status === "running" || run.status === "queued") {
      runningRuns += 1;
      runningRunId ??= run.id;
    }

    generatedDocuments += run.documents_generated ?? 0;
  }

  const runningStatusLabel = runningRuns > 0 ? "Running now" : undefined;
  const runningDescription = runningRuns > 0 ? "In Progress" : "No active runs";

  return (
    <div className="flex flex-1 flex-col space-y-12 pb-8">
      <DashboardHeader />
      <StartRunWizard
        key={startRunDialog.nonce}
        open={startRunDialog.open}
        onOpenChange={startRunDialog.setOpen}
        recommendationBaselines={data.recommendationBaselines}
      />

      <div className="px-8">
        <p className="font-label text-primary text-xs tracking-widest uppercase mb-2">System Status: Optimal</p>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
          Welcome back, {displayName}.<br />
          <span className="text-on-surface-variant">Your career pipeline is active.</span>
        </h1>
      </div>

      <div className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          value={jobsProcessed}
          description="analyzed"
          variant="default"
        />
        <StatsCard
          value={completedRuns}
          description="Completed Matches"
          variant="progress"
        />
        <StatsCard
          value={runningRuns}
          description={runningDescription}
          variant="running"
          statusLabel={runningStatusLabel}
          jobId={runningRunId ? `#JF-${runningRunId.slice(0, 4).toUpperCase()}-TECH` : undefined}
        />
        <StatsCard
          value={generatedDocuments}
          description="Generated Docs"
          variant="assets"
        />
      </div>

      <div className="px-8">
        <RecentRunsCard runs={recentRuns} runConfigs={runConfigs} onCreateRun={startRunDialog.openDialog} />
      </div>
    </div>
  );
}
