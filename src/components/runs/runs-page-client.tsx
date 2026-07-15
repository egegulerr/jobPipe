"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { StartRunWizard } from "@/components/runs/start-run-wizard";
import { RunsHeader } from "@/components/runs/runs-header";
import { RunsStats } from "@/components/runs/runs-stats";
import { RunsTable } from "@/components/runs/runs-table";
import { useStartRunDialogController } from "@/components/runs/hooks/use-start-run-dialog-controller";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRunsDashboardQuery } from "@/hooks/queries/use-runs-dashboard-query";
import { APP_ROUTES, START_RUN_EVENT } from "@/lib/app-routes";
import type { RunsDashboardResponseDto } from "@/types/output/runs.dto";

type RunsPageClientProps = {
  initialData: RunsDashboardResponseDto;
  startRun?: boolean;
};

export function RunsPageClient({ initialData, startRun = false }: RunsPageClientProps) {
  const runsQuery = useRunsDashboardQuery(initialData);
  const startRunDialog = useStartRunDialogController();
  const { openDialog } = startRunDialog;

  useEffect(() => {
    if (startRun) {
      openDialog();
      window.history.replaceState(null, "", APP_ROUTES.runs);
    }
  }, [startRun, openDialog]);

  useEffect(() => {
    window.addEventListener(START_RUN_EVENT, openDialog);
    return () => window.removeEventListener(START_RUN_EVENT, openDialog);
  }, [openDialog]);

  if (runsQuery.isError) {
    return (
      <div className="px-10 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{runsQuery.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = runsQuery.data ?? initialData;
  return (
    <div className="px-10 py-8">
      <RunsHeader
        onCreateRun={startRunDialog.openDialog}
      />

      <StartRunWizard
        key={startRunDialog.nonce}
        open={startRunDialog.open}
        onOpenChange={startRunDialog.setOpen}
        recommendationBaselines={data.recommendationBaselines}
      />

      <RunsStats
        jobsProcessed={data.jobsProcessed}
        runs={data.runs}
      />

      <RunsTable
        runs={data.runs}
        runConfigs={data.runConfigs}
        onCreateRun={startRunDialog.openDialog}
      />
    </div>
  );
}
