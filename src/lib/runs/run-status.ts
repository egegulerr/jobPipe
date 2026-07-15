type RunFailureShape = {
  status: string;
};

export function canRetryRun(run: RunFailureShape): boolean {
  return run.status === "failed";
}
