"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { getRunDetailsViewModel, type DetailTab } from "@/components/runs/runDetails/helpers";
import { RunDetailsHeader } from "@/components/runs/runDetails/run-details-header";
import { RunJobDetailContent } from "@/components/runs/runDetails/run-job-detail-content";
import { RunJobDetailEmptyState } from "@/components/runs/runDetails/run-job-detail-empty-state";
import { RunJobDetailPanel } from "@/components/runs/runDetails/run-job-detail-panel";
import { RunSidebar } from "@/components/runs/runDetails/run-sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useManualGenerateDocumentsMutation } from "@/hooks/mutations/use-manual-generate-documents-mutation";
import { useRetryRunMutation } from "@/hooks/mutations/use-retry-run-mutation";
import { useIsLgViewport } from "@/hooks/use-is-lg-viewport";
import { useRunDetailsQuery } from "@/hooks/queries/use-run-details-query";
import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { canRetryRun } from "@/lib/runs/run-status";
import type { RunDetailsResponseDto } from "@/types/output/runs.dto";

type RunDetailsPageClientProps = {
  runId: string;
  selectedDoc: string | undefined;
  selectedJob: string | undefined;
  selectedFilter: JobListFilter;
  initialData: RunDetailsResponseDto;
};

export function RunDetailsPageClient({
  runId,
  selectedDoc,
  selectedJob,
  selectedFilter,
  initialData,
}: RunDetailsPageClientProps) {
  const selectedDocKey = selectedDoc ?? null;
  const selectedJobKey = selectedJob ?? null;
  const isLgViewport = useIsLgViewport();
  const [tabState, setTabState] = useState<{
    sourceDoc: string | null;
    sourceJob: string | null;
    manualTab: DetailTab | null;
  }>(() => ({
    sourceDoc: selectedDocKey,
    sourceJob: selectedJobKey,
    manualTab: null,
  }));
  const [showSettings, setShowSettings] = useState(false);

  const runDetailsQuery = useRunDetailsQuery(runId, { initialData });
  const retryMutation = useRetryRunMutation(runId);
  const manualGenerationMutation = useManualGenerateDocumentsMutation();
  const data = runDetailsQuery.data ?? initialData;

  const {
    activeDocument,
    counts,
    description,
    documentsForSelectedJob,
    filteredJobs,
    insights,
    jobsMatched,
    jobsTotal,
    normalizedReasoning,
    percentComplete,
    runHeadline,
    sanitizedDescriptionHtml,
    selectedDocId,
    selectedJobApplyUrl,
    selectedJobData,
    selectedJobId,
    statusTone,
  } = useMemo(
    () =>
      getRunDetailsViewModel({
        data,
        selectedDoc,
        selectedFilter,
        selectedJob,
      }),
    [data, selectedDoc, selectedFilter, selectedJob],
  );

  const selectedJobAwaitingDocuments = runDetailsQuery.isJobAwaitingManualDocuments(selectedJobId);
  const { trackManualDocumentGeneration } = runDetailsQuery;

  const canRetryFailedStage = canRetryRun(data.run);
  const resolvedTabState =
    tabState.sourceDoc === selectedDocKey && tabState.sourceJob === selectedJobKey
      ? tabState
      : {
          sourceDoc: selectedDocKey,
          sourceJob: selectedJobKey,
          manualTab: null,
        };
  const shouldDefaultToDocuments = Boolean(selectedDoc) && tabState.sourceJob === selectedJobKey;
  const activeTab = resolvedTabState.manualTab ?? (shouldDefaultToDocuments ? "documents" : "intel");

  const handleTabChange = useCallback((tab: DetailTab) => {
    setTabState({
      sourceDoc: selectedDocKey,
      sourceJob: selectedJobKey,
      manualTab: tab,
    });
  }, [selectedDocKey, selectedJobKey]);

  const handleOpenDocuments = useCallback(() => {
    handleTabChange("documents");
  }, [handleTabChange]);

  const handleManualGenerate = useCallback(async () => {
    if (!selectedJobId) {
      return;
    }

    await manualGenerationMutation.mutateAsync({ runId, jobId: selectedJobId });
    trackManualDocumentGeneration(selectedJobId);
  }, [manualGenerationMutation, runId, selectedJobId, trackManualDocumentGeneration]);

  if (runDetailsQuery.isError) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{runDetailsQuery.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const jobDetailContent = selectedJobData ? (
    <RunJobDetailContent
      activeTab={activeTab}
      runId={runId}
      job={selectedJobData}
      jobs={data.jobs}
      normalizedReasoning={normalizedReasoning}
      insights={insights}
      sanitizedDescriptionHtml={sanitizedDescriptionHtml}
      descriptionParagraphs={description.paragraphs}
      selectedJobApplyUrl={selectedJobApplyUrl}
      documentsForSelectedJob={documentsForSelectedJob}
      activeDocument={activeDocument}
      selectedJobId={selectedJobId}
      selectedFilter={selectedFilter}
      runStatus={data.run.status}
      documentsHint={data.documentsHint}
      onOpenDocuments={handleOpenDocuments}
      onManualGenerate={selectedJobId ? handleManualGenerate : undefined}
      manualGenerationPending={manualGenerationMutation.isPending}
      manualGenerationAwaiting={selectedJobAwaitingDocuments}
      manualGenerationError={manualGenerationMutation.isError ? manualGenerationMutation.error.message : null}
      otherJobsGeneratingDocumentsCount={runDetailsQuery.countOtherAwaitingManualDocumentJobs(selectedJobId)}
    />
  ) : null;

  const jobDetailPanel = jobDetailContent ? (
    <RunJobDetailPanel activeTab={activeTab} onTabChange={handleTabChange} variant={isLgViewport ? "default" : "inline"}>
      {jobDetailContent}
    </RunJobDetailPanel>
  ) : null;

  const mobileJobDetail = !isLgViewport ? jobDetailPanel : undefined;
  const showMobileEmptyState = !isLgViewport && !selectedJobData;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden bg-surface-container-lowest">
      <RunDetailsHeader
        canRetryFailedStage={canRetryFailedStage}
        retryPending={retryMutation.isPending}
        retryError={retryMutation.isError ? retryMutation.error.message : null}
        onRetry={() => retryMutation.mutate()}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((value) => !value)}
        settings={data.settings}
      />

      <div className="grid min-h-[calc(100vh-8.5rem)] min-w-0 lg:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.98fr)]">
        <RunSidebar
          runId={runId}
          run={data.run}
          statusTone={statusTone}
          percentComplete={percentComplete}
          runHeadline={runHeadline}
          jobsTotal={jobsTotal}
          jobsMatched={jobsMatched}
          documents={data.documents}
          selectedJobId={selectedJobId}
          selectedDocId={selectedDocId}
          selectedFilter={selectedFilter}
          counts={counts}
          filteredJobs={filteredJobs}
          mobileJobDetail={mobileJobDetail}
          showMobileEmptyState={showMobileEmptyState}
        />

        {isLgViewport ? (
          <section className="min-w-0 bg-surface-container-lowest">
            <div className="flex h-full min-w-0 flex-col">
              {jobDetailPanel ?? (
                <div className="min-w-0 px-6 py-8 lg:px-10">
                  <RunJobDetailEmptyState />
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
