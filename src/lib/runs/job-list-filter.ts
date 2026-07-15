import { resolveJobStatusKey } from "@/lib/runs/job-status-resolver";

export type JobListFilter = "all" | "matched" | "unmatched";

type FilterableJob = {
  match_verdict: boolean | null;
  match_reasoning: string | null;
};

export function parseJobListFilter(value: string | undefined): JobListFilter {
  return value === "matched" || value === "unmatched" ? value : "all";
}

export function matchesJobListFilter(job: FilterableJob, filter: JobListFilter): boolean {
  if (filter === "all") {
    return true;
  }

  const status = resolveJobStatusKey(job);
  if (filter === "matched") {
    return status === "matched";
  }

  return status !== "matched";
}

export function countJobsForFilter(jobs: FilterableJob[], filter: JobListFilter): number {
  return jobs.filter((job) => matchesJobListFilter(job, filter)).length;
}
