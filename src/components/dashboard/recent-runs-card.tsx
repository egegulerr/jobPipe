"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { APP_ROUTES } from "@/lib/app-routes";
import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";
import { buildRunHref } from "@/lib/runs/run-url";
import type { RunConfigDto, RunDto } from "@/types/output/runs.dto";

type RecentRun = Pick<
  RunDto,
  "id" | "name" | "status" | "stage" | "created_at" | "documents_generated"
>;

type RecentRunsCardProps = {
  runs: RecentRun[];
  runConfigs?: Record<string, RunConfigDto>;
  onCreateRun: () => void;
};

export function RecentRunsCard({ runs, runConfigs, onCreateRun }: RecentRunsCardProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Recent Pipeline Activity</h2>
        <Button variant="link" size="sm" asChild className="h-auto p-0 font-label text-primary">
          <Link href={APP_ROUTES.runs}>VIEW ALL HISTORICAL DATA</Link>
        </Button>
      </div>
      <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest/50 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              <th className="px-6 py-4 font-medium">Run</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Matches</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {runs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Inbox className="size-8 text-on-surface-variant" />
                    <p className="text-on-surface-variant">No runs yet. Start your first job search!</p>
                    <Button type="button" onClick={onCreateRun}>
                      Configure & Run
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              runs.map((run) => {
                const runConfig = runConfigs?.[run.id];
                const label = resolveRunDisplayLabel({
                  runId: run.id,
                  name: run.name,
                  titleKeywords: runConfig?.title_keywords,
                  locations: runConfig?.locations,
                });

                return (
                <tr key={run.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-label text-sm text-primary">
                    {label}
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    <LocalDateTime value={run.created_at} preset="dateTime" />
                  </td>
                  <td className="px-6 py-5">
                    {run.status === "completed" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                        Completed
                      </span>
                    )}
                    {run.status === "running" && (
                      <div className="flex items-center gap-2">
                        <span className="flow-pulse w-2 h-2"></span>
                        <span className="text-xs font-medium text-primary">Running</span>
                      </div>
                    )}
                    {run.status === "queued" && (
                      <div className="flex items-center gap-2">
                        <span className="flow-pulse w-2 h-2"></span>
                        <span className="text-xs font-medium text-primary">Queued</span>
                      </div>
                    )}
                    {run.status === "failed" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm">
                    {run.status === "completed" || run.status === "failed" ? (
                      <span className="text-on-surface font-semibold">
                        {run.documents_generated ?? 0} matches
                      </span>
                    ) : (
                      <span className="text-on-surface-variant italic">Processing...</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {run.status === "running" || run.status === "queued" ? (
                      <Button type="button" size="sm" disabled className="bg-surface-container-highest text-on-surface hover:bg-surface-container-highest">
                        View
                      </Button>
                    ) : (
                      <Button size="sm" asChild className="bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary">
                        <Link href={buildRunHref(run.id)}>View</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
