"use client";

import { DocumentsTab } from "@/components/runs/runDetails/documents-tab";
import type { DetailTab, InsightBuckets, RunDetailsDocumentDto, RunDto, RunJobDto } from "@/components/runs/runDetails/helpers";
import { JobIntelTab } from "@/components/runs/runDetails/job-intel-tab";
import type { JobListFilter } from "@/lib/runs/job-list-filter";

type RunJobDetailContentProps = {
  activeTab: DetailTab;
  runId: string;
  job: RunJobDto;
  jobs: RunJobDto[];
  normalizedReasoning: string | null;
  insights: InsightBuckets;
  sanitizedDescriptionHtml: string | null;
  descriptionParagraphs: string[];
  selectedJobApplyUrl: string | null;
  documentsForSelectedJob: RunDetailsDocumentDto[];
  activeDocument?: RunDetailsDocumentDto;
  selectedJobId?: string;
  selectedFilter: JobListFilter;
  runStatus: RunDto["status"];
  documentsHint?: string | null;
  onOpenDocuments: () => void;
  onManualGenerate?: () => Promise<void>;
  manualGenerationPending: boolean;
  manualGenerationAwaiting: boolean;
  manualGenerationError: string | null;
  otherJobsGeneratingDocumentsCount?: number;
};

export function RunJobDetailContent({
  activeTab,
  runId,
  job,
  jobs,
  normalizedReasoning,
  insights,
  sanitizedDescriptionHtml,
  descriptionParagraphs,
  selectedJobApplyUrl,
  documentsForSelectedJob,
  activeDocument,
  selectedJobId,
  selectedFilter,
  runStatus,
  documentsHint,
  onOpenDocuments,
  onManualGenerate,
  manualGenerationPending,
  manualGenerationAwaiting,
  manualGenerationError,
  otherJobsGeneratingDocumentsCount = 0,
}: RunJobDetailContentProps) {
  if (activeTab === "intel") {
    return (
      <JobIntelTab
        job={job}
        normalizedReasoning={normalizedReasoning}
        insights={insights}
        sanitizedDescriptionHtml={sanitizedDescriptionHtml}
        descriptionParagraphs={descriptionParagraphs}
        selectedJobApplyUrl={selectedJobApplyUrl}
        onOpenDocuments={onOpenDocuments}
      />
    );
  }

  return (
    <DocumentsTab
      runId={runId}
      documents={documentsForSelectedJob}
      jobs={jobs}
      activeDocument={activeDocument}
      selectedJobId={selectedJobId}
      selectedFilter={selectedFilter}
      selectedJob={job}
      runStatus={runStatus}
      hint={documentsHint}
      onManualGenerate={onManualGenerate}
      manualGenerationPending={manualGenerationPending}
      manualGenerationAwaiting={manualGenerationAwaiting}
      manualGenerationError={manualGenerationError}
      otherJobsGeneratingDocumentsCount={otherJobsGeneratingDocumentsCount}
    />
  );
}
