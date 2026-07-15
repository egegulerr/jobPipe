import type { RunDto } from "@/types/output/runs.dto";

/** Run statuses where local processing may still be in progress. */
export const ACTIVE_RUN_STATUSES = new Set<RunDto["status"]>(["queued", "running"]);
