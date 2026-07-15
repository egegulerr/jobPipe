import type { RunConfigOverride } from "@/server/domains/runs/run-config";

import type { RunConfigRecord, RunRecommendationBaselineRecord } from "@/server/domains/runs/runs.interfaces";

export type RunRecommendationBaselineDto = RunRecommendationBaselineRecord;

export type RunStatusResponseDto = {
  id: string;
  status: string;
  stage: string | null;
  lastStageMessage: string | null;
  jobsTotal: number;
  jobsProcessed: number;
  jobsMatched: number;
  jobsFailed: number;
  documentsGenerated: number;
  hasWarnings: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type RunDocumentSummaryDto = {
  id: string;
  jobId: string | null;
  type: string;
  title: string;
  createdAt: string;
};

// Backwards compatible aliases
export type RunStatusResponse = RunStatusResponseDto;
export type RunDocumentSummary = RunDocumentSummaryDto;

export type RunDto = {
  id: string;
  name: string | null;
  status: "queued" | "running" | "completed" | "failed";
  stage: string | null;
  stage_message: string | null;
  jobs_total: number | null;
  jobs_processed: number | null;
  jobs_matched: number | null;
  jobs_failed: number | null;
  documents_generated: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

export type RunJobDto = {
  id: string;
  title: string;
  company_name: string | null;
  company_website: string | null;
  description_text: string | null;
  description_html: string | null;
  posted_at: string | null;
  apply_url: string | null;
  location_text: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_unit: string | null;
  salary_text: string | null;
  applicants_count: number | null;
  employment_type: string | null;
  seniority_level: string | null;
  source: string;
  match_verdict: boolean | null;
  match_score: number | null;
  match_reasoning: string | null;
};

export type RunDetailsDocumentDto = {
  id: string;
  job_id: string | null;
  type: string;
  format: string;
  title: string;
  storage_path: string | null;
  created_at: string;
};

export type RunsDashboardResponseDto = {
  runs: RunDto[];
  jobsProcessed: number;
  recommendationBaselines: RunRecommendationBaselineDto[];
  runConfigs: Record<string, RunConfigDto>;
};

export type RunConfigDto = Omit<RunConfigRecord, "platforms"> & { platforms: string[] };

export type RunSettingsDto = {
  runConfig: RunConfigDto | null;
};

export type RunDetailsResponseDto = {
  run: RunDto;
  jobs: RunJobDto[];
  documents: RunDetailsDocumentDto[];
  documentsHint: string | null;
  settings: RunSettingsDto | null;
};


export type CreateRunResponseDto = {
  runId: string;
};

export type CreateRunRequestDto = {
  config?: RunConfigOverride;
};

export type ValidateLocationResponseDto = {
  resolved: boolean;
  countryCode: string | null;
  displayName: string | null;
  failureReason?: "missing_concrete_city" | "not_found";
};
