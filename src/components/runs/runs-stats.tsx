"use client";

import { useMemo } from "react";
import { BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import type { RunDto } from "@/types/output/runs.dto";

type RunsStatsProps = {
  jobsProcessed: number;
  runs: Pick<RunDto, "status" | "jobs_total" | "jobs_matched">[];
};

function computeJobMatchingRate(runs: RunsStatsProps["runs"]): number {
  let total = 0;
  let matched = 0;
  for (const r of runs) {
    if (r.status !== "completed") continue;
    total += r.jobs_total ?? 0;
    matched += r.jobs_matched ?? 0;
  }
  if (total === 0) return 0;
  return Math.round((matched / total) * 100);
}

export function RunsStats({
  jobsProcessed,
  runs,
}: RunsStatsProps) {
  const jobMatchingRate = useMemo(() => computeJobMatchingRate(runs), [runs]);
  const filledBars = Math.floor(jobMatchingRate / 25);

  return (
    <section className="grid grid-cols-12 gap-6 mb-16">
      <div className="col-span-12 lg:col-span-4 p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_12px_#4edea3]" />
        <BarChart3 className="size-6 text-secondary mb-4" />
        <p className="text-4xl font-black font-headline text-white mb-1">
          {jobMatchingRate}%
        </p>
        <p className="text-on-surface-variant text-sm font-medium">
          Average Job Matching Rate
        </p>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full", i < filledBars ? "bg-secondary" : "bg-secondary/30")}
            />
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 p-8 rounded-3xl bg-surface-container border border-outline-variant/10 flex items-center justify-between">
        <div>
          <Sparkles className="size-6 text-primary mb-4" />
          <p className="text-4xl font-black font-headline text-white mb-1">
            {jobsProcessed.toLocaleString()}
          </p>
          <p className="text-on-surface-variant text-sm font-medium">
            Jobs Analyzed
          </p>
        </div>
        <div className="flex -space-x-3" aria-hidden="true">
          <div className="w-12 h-12 rounded-full border-4 border-surface-container bg-surface-variant flex items-center justify-center text-xs font-bold">
            LI
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-surface-container bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
            IN
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-surface-container bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold">
            GL
          </div>
        </div>
      </div>
    </section>
  );
}
