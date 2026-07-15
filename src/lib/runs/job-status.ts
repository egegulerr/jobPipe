import { CheckCircle, Clock, XCircle } from "lucide-react";

import { resolveJobStatusKey } from "@/lib/runs/job-status-resolver";

const jobStatusConfig = {
  matched: { label: "Matched", variant: "default" as const, icon: CheckCircle },
  skipped: { label: "Skipped", variant: "secondary" as const, icon: Clock },
  "not matched": { label: "Not Matched", variant: "outline" as const, icon: XCircle },
  pending: { label: "Pending", variant: "outline" as const, icon: Clock },
};

export function resolveJobStatus(job: { match_verdict: boolean | null; match_reasoning: string | null }) {
  return jobStatusConfig[resolveJobStatusKey(job)];
}
