"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Download, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { buildRunHref } from "@/lib/runs/run-url";
import { cn } from "@/lib/utils";

import {
  ACTIVE_RUN_STATUSES,
  formatRunDocumentChipLabel,
  type RunDetailsDocumentDto,
  type RunDto,
  type RunJobDto,
} from "./helpers";

type DocumentsTabProps = {
  runId: string;
  documents: RunDetailsDocumentDto[];
  jobs: RunJobDto[];
  activeDocument?: RunDetailsDocumentDto;
  selectedJobId?: string;
  selectedFilter: JobListFilter;
  selectedJob?: RunJobDto;
  runStatus: RunDto["status"];
  onManualGenerate?: () => Promise<void>;
  manualGenerationPending: boolean;
  manualGenerationAwaiting: boolean;
  manualGenerationError: string | null;
  otherJobsGeneratingDocumentsCount?: number;
  hint?: string | null;
};

export function DocumentsTab({
  runId,
  documents,
  jobs,
  activeDocument,
  selectedJobId,
  selectedFilter,
  selectedJob,
  runStatus,
  onManualGenerate,
  manualGenerationPending,
  manualGenerationAwaiting,
  manualGenerationError,
  otherJobsGeneratingDocumentsCount = 0,
  hint,
}: DocumentsTabProps) {
  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const runIsActive = ACTIVE_RUN_STATUSES.has(runStatus);
  const manualGenerationInFlight = manualGenerationPending || manualGenerationAwaiting;
  const otherJobsGeneratingMessage =
    otherJobsGeneratingDocumentsCount > 0
      ? `${otherJobsGeneratingDocumentsCount} other job${otherJobsGeneratingDocumentsCount === 1 ? "" : "s"} still generating in the background.`
      : null;
  const generatingBanner = manualGenerationAwaiting ? (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-left">
      <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">Generating tailored resume and cover letter</p>
        <p className="mt-1 text-xs text-on-surface-variant">New documents will appear here automatically. This usually takes a minute.</p>
        {otherJobsGeneratingMessage ? <p className="mt-2 text-xs text-on-surface-variant">{otherJobsGeneratingMessage}</p> : null}
      </div>
    </div>
  ) : null;

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/6 bg-surface-container-low/55 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-extrabold tracking-tight text-white">Generated Documents</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {selectedJob ? `Assets tailored for ${selectedJob.company_name ?? "the selected company"}.` : "Choose a job to inspect or generate documents."}
            </p>
          </div>
          <Badge variant="outline" className="border-white/10 bg-surface-container-high px-3 py-1 text-xs text-on-surface">
            {documents.length}
          </Badge>
        </div>

        {documents.length > 0 ? (
          <>
            {generatingBanner}
            <div className="mt-6 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="grid gap-3 min-w-0">
              {documents.map((document) => {
                const isActive = document.id === activeDocument?.id;
                const href = buildRunHref(runId, {
                  jobId: selectedJobId,
                  docId: document.id,
                  filter: selectedFilter,
                });

                return (
                  <Link
                    key={document.id}
                    href={href}
                    scroll={false}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      isActive
                        ? "border-primary/25 bg-primary/10"
                        : "border-white/6 bg-surface-container-high/40 hover:border-white/10 hover:bg-surface-container-high/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{formatRunDocumentChipLabel(document, jobsById)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-on-surface-variant">
                          {document.format} • {document.type.replace("_", " ")}
                        </p>
                        <p className="mt-2 text-xs text-on-surface-variant">
                          Created <LocalDateTime value={document.created_at} preset="shortDateTime" />
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {activeDocument ? (
              <div className="rounded-2xl border border-white/6 bg-surface-container-high/35 p-5">
                <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary">Selected Document</p>
                <h4 className="mt-2 font-headline text-xl font-bold text-white">{activeDocument.title}</h4>
                <p className="mt-1 text-sm text-on-surface-variant">Download or review the generated artifact for this role.</p>

                <div className="mt-5 grid gap-3">
                  <Button className="justify-between rounded-xl bg-white text-slate-950 hover:bg-slate-200" asChild>
                    <a href={`/api/documents/${activeDocument.id}/pdf`}>
                      Export PDF
                      <Download className="size-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-between rounded-xl border-white/10 bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                    asChild
                  >
                    <a href={`/api/documents/${activeDocument.id}/docx`}>
                      Export Word
                      <Download className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-surface-container-high/20 p-6 text-center">
            {manualGenerationAwaiting ? (
              <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            ) : (
              <FileText className="mx-auto size-8 text-on-surface-variant" />
            )}
            <p className="mt-3 text-sm text-on-surface-variant">
              {manualGenerationAwaiting
                ? "Generating tailored resume and cover letter. This usually takes a minute."
                : (hint ?? "No documents generated yet.")}
            </p>
            {!selectedJobId ? (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-on-surface-variant/80">Select a job to enable generation.</p>
            ) : null}
            {otherJobsGeneratingMessage ? <p className="mt-2 text-xs text-on-surface-variant">{otherJobsGeneratingMessage}</p> : null}

            {selectedJobId && onManualGenerate ? (
              <div className="mt-5 space-y-3">
                {runIsActive ? (
                  <p className="text-xs text-on-surface-variant">Manual generation becomes available after the run finishes.</p>
                ) : manualGenerationAwaiting ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-white/10 bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                    onClick={() => {
                      void onManualGenerate();
                    }}
                    disabled={manualGenerationInFlight}
                  >
                    {manualGenerationPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Queueing document generation...
                      </>
                    ) : (
                      "Generate documents for selected job"
                    )}
                  </Button>
                )}

                {manualGenerationError ? <p className="text-sm text-destructive">{manualGenerationError}</p> : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
