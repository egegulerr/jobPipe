import type { JobSearchPlatform } from "@/types/job-search-platform";
import type { Result } from "@/server/shared/result";
import type { CreateRunCommand, RunConfigOverride } from "@/server/domains/runs/run-config";
import type { DatabaseError } from "@/types/error/database-error";
import type { PromptRequestFieldName } from "@/lib/shared/prompts";
import type { ResumeTemplateId } from "@/lib/shared/document-template";

export type RunRecord = {
  id: string;
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
  name: string | null;
};

export type RunJobRecord = {
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
};

export type JobMatchRecord = {
  job_id: string;
  verdict: boolean;
  score: number | null;
  reasoning: string | null;
};

export type RunDocumentRecord = {
  id: string;
  job_id: string | null;
  type: string;
  format: string;
  title: string;
  storage_path: string | null;
  created_at: string;
};

type RunConfigPromptRequestFields = Record<PromptRequestFieldName, string>;

export type RunRecommendationBaselineRecord = {
  run_id: string;
  created_at: string;
  config: {
    title_keywords: string;
    locations: string;
    days_filter: number;
    platforms: JobSearchPlatform[];
    country_code: string | null;
  };
};

export type RunConfigRecord = {
  title_keywords: string;
  locations: string;
  days_filter: number;
  platforms: JobSearchPlatform[];
  country_code: string | null;
  linkedin_results_limit: number | null;
  indeed_results_limit: number | null;
  include_profile_picture: boolean;
  resume_template: ResumeTemplateId;
} & RunConfigPromptRequestFields;

export type RunRecordWithRunConfig = RunRecord & {
  run_config: RunConfigRecord | null;
};

export type RunsService = {
  createRun: (input: CreateRunCommand) => Promise<{ ok: boolean; status?: number; error?: string; runId?: string }>;
  getRunStatus: (runId: string, userId: string) => Promise<Result<{ run: RunRecord }>>;
  getRunDetails: (
    runId: string,
    userId: string,
  ) => Promise<
    Result<{
      run: RunRecord;
      jobs: Array<
        RunJobRecord & { match_verdict: boolean | null; match_score: number | null; match_reasoning: string | null }
      >;
      documents: RunDocumentRecord[];
      documentsHint: string | null;
      settings: {
        runConfig: RunConfigRecord | null;
      } | null;
    }>
  >;
  listRunsDashboard: (userId: string) => Promise<{
    ok: boolean;
    status?: number;
    error?: string;
    data?: {
      runs: RunRecord[];
      jobsProcessed: number;
      recommendationBaselines: RunRecommendationBaselineRecord[];
      runConfigs: Record<string, RunConfigRecord>;
    };
  }>;
  retryFailedRun: (
    runId: string,
    userId: string,
  ) => Promise<{ ok: boolean; status?: number; error?: string }>;
  triggerManualDocumentGeneration: (
    runId: string,
    userId: string,
    jobId: string,
  ) => Promise<{ ok: boolean; status?: number; error?: string }>;
};

export type RunsRepository = {
  getLatestRunConfig: (
    userId: string,
  ) => Promise<{ data: { id: string } | null; error: DatabaseError }>;
  createRunConfig: (input: {
    userId: string;
    titleKeywords: RunConfigOverride["titleKeywords"];
    locations: RunConfigOverride["locations"];
    daysFilter: RunConfigOverride["daysFilter"];
    platforms: RunConfigOverride["platforms"];
    countryCode: string | null;
    linkedinResultsLimit: RunConfigOverride["linkedinResultsLimit"];
    indeedResultsLimit: RunConfigOverride["indeedResultsLimit"];
    jobMatcherRequests: string;
    resumeWriterRequests: string;
    coverLetterWriterRequests: string;
    includeProfilePicture: boolean;
    resumeTemplate: ResumeTemplateId;
  }) => Promise<{ data: { id: string } | null; error: DatabaseError }>;
  createRun: (input: {
    userId: string;
    runConfigId: string;
    name?: string | null;
  }) => Promise<{ data: { id: string } | null; error: DatabaseError }>;
  updateRunStatus: (input: {
    userId: string;
    runId: string;
    status: "queued" | "running" | "completed" | "failed";
    errorMessage?: string | null;
    startedAt?: string;
    finishedAt?: string;
    stage?: string;
    stageMessage?: string | null;
    jobsTotal?: number;
    jobsProcessed?: number;
    jobsMatched?: number;
    jobsFailed?: number;
    documentsGenerated?: number;
  }) => Promise<{ data: unknown; error: DatabaseError }>;
  getRunForUser: (runId: string, userId: string) => Promise<{ data: RunRecord | null; error: DatabaseError }>;
  listRecentRuns: (userId: string, limit?: number) => Promise<{ data: RunRecord[] | null; error: DatabaseError }>;
  listRecentRunsWithRunConfig: (
    userId: string,
    limit?: number,
  ) => Promise<{ data: RunRecordWithRunConfig[] | null; error: DatabaseError }>;
  getJobsProcessedCount: () => Promise<{ data: number | null; error: DatabaseError }>;
  getRunWithRunConfigForUser: (
    runId: string,
    userId: string,
  ) => Promise<{ data: RunRecordWithRunConfig | null; error: DatabaseError }>;
};

export type JobsRepository = {
  listRunJobs: (userId: string, runId: string) => Promise<{ data: RunJobRecord[] | null; error: DatabaseError }>;
  listRunJobMatches: (
    userId: string,
    runId: string,
  ) => Promise<{ data: JobMatchRecord[] | null; error: DatabaseError }>;
  getRunJobById: (
    userId: string,
    runId: string,
    jobId: string,
  ) => Promise<{ data: { id: string } | null; error: DatabaseError }>;
};
