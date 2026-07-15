"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { cn } from "@/lib/utils";
import { resolveRunProgressPercent } from "@/lib/runs/run-progress";
import { formatRunStageLabel, getRunStageIndex } from "@/lib/runs/run-stage";

import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";
import type { RunConfigDto, RunDto } from "@/types/output/runs.dto";

type RunTableItem = Pick<
  RunDto,
  | "id"
  | "name"
  | "status"
  | "stage"
  | "stage_message"
  | "created_at"
  | "jobs_total"
  | "jobs_processed"
  | "jobs_matched"
  | "documents_generated"
>;

const defaultStatusConfig = {
  label: "Pending" as string,
  Icon: Clock,
  badgeClass: "bg-on-surface-variant/20 text-on-surface-variant border-on-surface-variant/30",
  iconClass: "text-on-surface-variant",
  iconBg: "bg-on-surface-variant/10 border-on-surface-variant/20",
  progressClass: "bg-on-surface-variant",
  progressGlow: "",
  dotActive: "bg-on-surface-variant",
  pulse: false,
  progressTextColor: "text-on-surface-variant",
};

const statusConfig: Record<RunDto["status"], typeof defaultStatusConfig> = {
  completed: {
    label: "Completed",
    Icon: CheckCircle2,
    badgeClass: "bg-secondary/20 text-secondary border-secondary/30",
    iconClass: "text-secondary",
    iconBg: "bg-secondary/10 border-secondary/20",
    progressClass: "bg-secondary",
    progressGlow: "shadow-[0_0_12px_rgba(78,222,163,0.4)]",
    dotActive: "bg-secondary",
    pulse: false,
    progressTextColor: "text-secondary",
  },
  running: {
    label: "Running",
    Icon: RefreshCw,
    badgeClass: "bg-primary/20 text-primary border-primary/30",
    iconClass: "text-primary animate-pulse",
    iconBg: "bg-primary/10 border-primary/20",
    progressClass: "bg-primary",
    progressGlow: "shadow-[0_0_12px_rgba(192,193,255,0.6)]",
    dotActive: "bg-primary",
    pulse: true,
    progressTextColor: "text-primary",
  },
  failed: {
    label: "Failed",
    Icon: XCircle,
    badgeClass: "bg-error/20 text-error border-error/30",
    iconClass: "text-error",
    iconBg: "bg-error/10 border-error/20",
    progressClass: "bg-error",
    progressGlow: "shadow-[0_0_12px_rgba(255,180,171,0.4)]",
    dotActive: "bg-error",
    pulse: false,
    progressTextColor: "text-error",
  },
  queued: defaultStatusConfig,
};

const ITEMS_PER_PAGE = 10;
const JOB_ANALYSIS_STAGE_INDEX = getRunStageIndex("job_analysis") ?? 0;
const JOB_MATCHING_STAGE_INDEX = getRunStageIndex("job_matching") ?? 0;
const ARTIFACT_STAGE_INDEX = getRunStageIndex("motivation_letter_generation") ?? 0;

function getPhaseLabel(run: RunTableItem): string {
  if (run.status === "completed") return "Pipeline Phase: Finished";
  if (run.status === "failed") {
    return `Pipeline Phase: ${run.stage_message ?? formatRunStageLabel(run.stage ?? "Error")}`;
  }
  return `Pipeline Phase: ${formatRunStageLabel(run.stage ?? "Initializing")}`;
}

function getActiveDotIndex(run: RunTableItem): number {
  if (run.status === "completed") return -1;
  const stageIndex = getRunStageIndex(run.stage ?? "pending") ?? 0;

  if (stageIndex >= ARTIFACT_STAGE_INDEX) return 3;
  if (stageIndex >= JOB_MATCHING_STAGE_INDEX) return 2;
  if (stageIndex >= JOB_ANALYSIS_STAGE_INDEX) return 1;
  return 0;
}

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);
  if (rangeStart > 2) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

type RunsTableProps = {
  runs: RunTableItem[];
  runConfigs?: Record<string, RunConfigDto>;
  onCreateRun: () => void;
};

const runsCtaButtonClass =
  "h-auto rounded-xl px-5 py-2.5 text-sm font-bold bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary";

export function RunsTable({ runs, runConfigs, onCreateRun }: RunsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(runs.length / ITEMS_PER_PAGE));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRuns = useMemo(
    () => runs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [runs, page]
  );

  function goToPage(next: number) {
    setCurrentPage(Math.min(Math.max(1, next), totalPages));
  }

  if (runs.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/5">
        <div className="w-16 h-16 rounded-2xl bg-on-surface-variant/10 flex items-center justify-center mb-4">
          <Clock className="size-8 text-on-surface-variant" />
        </div>
        <h3 className="font-bold text-white mb-1">No runs yet</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Configure your job search and start your first run
        </p>
        <Button type="button" onClick={onCreateRun} className={runsCtaButtonClass}>
          Set Up Job Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paginatedRuns.map((run) => {
          const config = statusConfig[run.status] ?? defaultStatusConfig;
          const progress = resolveRunProgressPercent(run);
          const phaseLabel = getPhaseLabel(run);
          const activeDot = getActiveDotIndex(run);
          const runConfig = runConfigs?.[run.id];
          const title = resolveRunDisplayLabel({
            runId: run.id,
            name: run.name,
            titleKeywords: runConfig?.title_keywords,
            locations: runConfig?.locations,
          });

          return (
            <div
              key={run.id}
              className="bg-surface-container-low rounded-2xl p-6 group transition-all duration-300 hover:bg-surface-container border border-outline-variant/5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border",
                      config.iconBg
                    )}
                  >
                    <config.Icon className={cn("size-6", config.iconClass)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <p className="text-xs font-label text-on-surface-variant flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        <LocalDateTime value={run.created_at} preset="shortDateTime" />
                      </p>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase tracking-wider border",
                          config.badgeClass
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:flex-1 lg:max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                      {phaseLabel}
                    </p>
                    <p className={cn("text-[10px] font-label font-bold", config.progressTextColor)}>
                      {progress}%
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        config.progressClass,
                        config.progressGlow
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          i < Math.ceil(progress / 25)
                            ? config.dotActive
                            : "bg-surface-variant",
                          i === activeDot && config.pulse && "animate-pulse"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ViewDetailsLink href={`/dashboard/runs/${run.id}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              aria-label="Previous page"
              className="size-10 rounded-lg border border-outline-variant/10 bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </Button>
            {getPageRange(page, totalPages).map((pageNum, idx) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  &hellip;
                </span>
              ) : (
                <Button
                  key={pageNum}
                  type="button"
                  variant="ghost"
                  onClick={() => goToPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                  className={cn(
                    "h-10 min-w-10 rounded-lg px-2 font-medium text-sm",
                    pageNum === page
                      ? "bg-primary font-bold text-on-primary hover:bg-primary hover:text-on-primary"
                      : "border border-outline-variant/10 bg-surface-container text-on-surface-variant hover:text-primary"
                  )}
                >
                  {pageNum}
                </Button>
              )
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              aria-label="Next page"
              className="size-10 rounded-lg border border-outline-variant/10 bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

function ViewDetailsLink({ href }: { href: string }) {
  return (
    <Button asChild className={runsCtaButtonClass}>
      <Link href={href}>View Details</Link>
    </Button>
  );
}
