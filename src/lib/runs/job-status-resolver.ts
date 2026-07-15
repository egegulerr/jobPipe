export type JobStatusKey = "matched" | "skipped" | "not matched" | "pending";

export function resolveJobStatusKey(job: {
  match_verdict: boolean | null;
  match_reasoning: string | null;
}): JobStatusKey {
  if (job.match_verdict === true) {
    return "matched";
  }
  if ((job.match_reasoning ?? "").startsWith("Skipped:")) {
    return "skipped";
  }
  if (job.match_verdict === false) {
    return "not matched";
  }
  return "pending";
}
