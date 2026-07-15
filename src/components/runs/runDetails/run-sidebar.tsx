"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";

import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { buildRunHref } from "@/lib/runs/run-url";
import { cn } from "@/lib/utils";
import type { RunDetailsDocumentDto, RunDto, RunJobDto } from "@/types/output/runs.dto";

import { jobFilters, resolveStageLabel } from "./helpers";
import { JobCard } from "./job-card";
import { MobileJobDetailReveal } from "./mobile-job-detail-reveal";
import { RunJobDetailEmptyState } from "./run-job-detail-empty-state";
import { RunStatusPill, type StatusTone } from "./run-status-pill";

type RunSidebarProps = {
  runId: string;
  run: RunDto;
  statusTone: StatusTone;
  percentComplete: number;
  runHeadline: string;
  jobsTotal: number;
  jobsMatched: number;
  documents: RunDetailsDocumentDto[];
  selectedJobId?: string;
  selectedDocId?: string;
  selectedFilter: JobListFilter;
  counts: Record<JobListFilter, number>;
  filteredJobs: RunJobDto[];
  mobileJobDetail?: ReactNode;
  showMobileEmptyState?: boolean;
};

export function RunSidebar({
  runId,
  run,
  statusTone,
  percentComplete,
  runHeadline,
  jobsTotal,
  jobsMatched,
  documents,
  selectedJobId,
  selectedDocId,
  selectedFilter,
  counts,
  filteredJobs,
  mobileJobDetail,
  showMobileEmptyState = false,
}: RunSidebarProps) {
  return (
    <section className="min-w-0 border-b border-white/5 lg:border-r lg:border-b-0">
      <div className="flex h-full min-w-0 flex-col">
        <div className="border-b border-white/5 bg-surface-container-lowest px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="font-label text-[11px] uppercase tracking-[0.32em] text-secondary">Active Pipeline</span>
                <h1 className="mt-3 break-words font-headline text-3xl font-black tracking-tight text-white sm:text-4xl">{runHeadline}</h1>
              </div>
              <div className="shrink-0 pt-2 text-right">
                <RunStatusPill
                  tone={statusTone}
                  animate={run.status !== "failed"}
                  className="border-0 px-4 py-2 text-[11px]"
                />
              </div>
            </div>

            <div>
              <div className="relative h-2 overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    run.status === "failed"
                      ? "bg-linear-to-r from-destructive to-tertiary"
                      : "bg-linear-to-r from-primary to-secondary shadow-[0_0_20px_rgba(192,193,255,0.35)]",
                  )}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                <span>{resolveStageLabel(run)}</span>
                <span className="font-bold text-white">{percentComplete}% Complete</span>
              </div>
              {run.stage_message && run.status !== "completed" ? <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">{run.stage_message}</p> : null}
              {run.error_message && run.status === "failed" ? <p className="mt-3 max-w-2xl text-sm text-destructive">{run.error_message}</p> : null}
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              <StatCard label="Jobs Parsed" value={jobsTotal} valueClassName="text-white" />
              <StatCard label="Matched Roles" value={jobsMatched} valueClassName="text-secondary" />
              <StatCard label="Documents" value={documents.length} valueClassName="text-white" />
            </div>
          </div>
        </div>

        <div className="min-w-0 border-b border-white/5 px-6 py-4 lg:px-10">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {jobFilters.map((filterOption) => (
              <Link
                key={filterOption.key}
                href={buildRunHref(runId, { jobId: selectedJobId, docId: selectedDocId, filter: filterOption.key })}
                scroll={false}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.22em] transition-colors",
                  selectedFilter === filterOption.key
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-transparent bg-surface-container-low text-on-surface-variant hover:border-white/8 hover:text-white",
                )}
              >
                {filterOption.label}
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] text-on-surface">{counts[filterOption.key]}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 px-6 py-6 lg:px-10">
          <div className="min-w-0 space-y-4 lg:h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Fragment key={job.id}>
                  <JobCard
                    job={job}
                    runId={runId}
                    isSelected={selectedJobId === job.id}
                    selectedDocId={selectedDocId}
                    selectedFilter={selectedFilter}
                  />
                  {selectedJobId === job.id && mobileJobDetail ? (
                    <MobileJobDetailReveal jobId={job.id}>{mobileJobDetail}</MobileJobDetailReveal>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-surface-container-low/40 px-6 py-10 text-center text-sm text-on-surface-variant">
                No jobs match the current filter.
              </div>
            )}
            {showMobileEmptyState ? (
              <div className="min-w-0 pt-2">
                <RunJobDetailEmptyState />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, valueClassName }: { label: string; value: number; valueClassName: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-surface-container-low/80 p-4">
      <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
      <p className={cn("mt-2 font-headline text-3xl font-black", valueClassName)}>{value}</p>
    </div>
  );
}
