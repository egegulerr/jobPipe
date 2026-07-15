"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { resolveJobStatus } from "@/lib/runs/job-status";
import { buildRunHref } from "@/lib/runs/run-url";
import { safeExternalUrl } from "@/lib/utils/safe-external-url";
import { cn } from "@/lib/utils";

import { formatPercentValue, resolveSourceBranding, type RunJobDto } from "./helpers";

type JobCardProps = {
  job: RunJobDto;
  runId: string;
  isSelected: boolean;
  selectedDocId?: string;
  selectedFilter: JobListFilter;
};

export function JobCard({ job, runId, isSelected, selectedDocId, selectedFilter }: JobCardProps) {
  const status = resolveJobStatus(job);
  const matchScore = formatPercentValue(job.match_score);
  const applyUrl = safeExternalUrl(job.apply_url);
  const source = resolveSourceBranding(job.source);
  const jobHref = buildRunHref(runId, {
    jobId: isSelected ? undefined : job.id,
    docId: isSelected ? undefined : selectedDocId,
    filter: selectedFilter,
  });

  return (
    <article
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[1.35rem] border p-5 transition-all duration-200",
        isSelected
          ? "border-primary/30 bg-linear-to-br from-surface-container to-surface-container-high shadow-[0_18px_80px_rgba(18,16,49,0.35)]"
          : "border-white/5 bg-surface-container-low/70 hover:border-white/10 hover:bg-surface-container/85",
      )}
    >
      <Link
        href={jobHref}
        scroll={false}
        className="block rounded-[1.1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={isSelected ? `Close details for ${job.title}` : `View details for ${job.title}`}
      >
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {source ? (
            <div
              aria-label={source.label}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white font-bold text-slate-700"
            >
              {source.mark}
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-surface-container-highest">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                {job.source.slice(0, 2)}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-headline text-lg font-extrabold tracking-tight text-white sm:text-xl">{job.title}</h3>
            <p className="mt-1 break-words text-sm text-on-surface-variant">
              {[job.company_name, job.location_text].filter(Boolean).join(" • ") || "Location unavailable"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em]",
                  status.variant === "default"
                    ? "bg-secondary/10 text-secondary"
                    : status.variant === "outline"
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-primary/10 text-primary",
                )}
              >
                {status.label}
              </span>

              {job.match_verdict ? (
                <span className="inline-flex items-center rounded-md bg-primary/12 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  Ready to Apply
                </span>
              ) : null}

              {!job.match_verdict && job.match_reasoning ? (
                <span className="inline-flex items-center rounded-md bg-surface-container-high px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Needs Review
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className={cn("font-headline text-3xl font-black tracking-tight sm:text-4xl", isSelected ? "text-secondary" : "text-on-surface-variant")}>
              {matchScore ?? "—"}
            </p>
            <p className="font-label text-[9px] uppercase tracking-[0.28em] text-on-surface-variant">Match Score</p>
          </div>
        </div>

        <div className="mt-4 h-[2px] overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className={cn("h-full rounded-full transition-all", job.match_verdict ? "bg-secondary" : "bg-on-surface-variant/40")}
            style={{ width: matchScore ?? "24%" }}
          />
        </div>
      </Link>

      {applyUrl ? (
        <div className="relative z-10 mt-4 flex justify-end">
          <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-white" asChild>
            <a href={applyUrl} target="_blank" rel="noopener noreferrer">
              Apply
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      ) : null}
    </article>
  );
}
