import type {
  RunsService,
  RunsRepository as RunsRepositoryType,
  JobsRepository as JobsRepositoryType,
  RunRecommendationBaselineRecord,
  RunConfigRecord,
} from "@/server/domains/runs/runs.interfaces";
import type { SettingsRepository as SettingsRepositoryType } from "@/server/domains/settings/settings.interfaces";
import type { CreateRunCommand } from "@/server/domains/runs/run-config";
import type { DocumentsRepository as DocumentsRepositoryType } from "@/server/domains/documents/documents.interfaces";
import {
  generateDocuments as defaultGenerateDocuments,
  retryRun as defaultRetryRun,
  startRun as defaultStartRun,
} from "@/server/local/run-executor";
import { defaultGeocodingClient } from "@/server/clients/geocoding/nominatim-client";
import { resolveCountryCode, type GeocodingClient } from "@/server/domains/runs/geocoding.port";
import { hasGeocodableTokens } from "@/lib/shared/location-tokens";
import { isRunProfileReady, RUN_PROFILE_REQUIREMENT_MESSAGE } from "@/lib/settings/profile-readiness";
import { createDocumentsRepository } from "@/server/repositories/documents-repository";
import { createJobsRepository } from "@/server/repositories/jobs-repository";
import { createRunsRepository } from "@/server/repositories/runs-repository";
import { createSettingsRepository } from "@/server/repositories/settings-repository";
import { infra, notFound, ok, type Result } from "@/server/shared/result";

type RunRecord = NonNullable<Awaited<ReturnType<RunsRepositoryType["getRunForUser"]>>["data"]>;
type JobsList = NonNullable<Awaited<ReturnType<JobsRepositoryType["listRunJobs"]>>["data"]>;
type DocumentsList = NonNullable<Awaited<ReturnType<DocumentsRepositoryType["listRunDocuments"]>>["data"]>;
type JobMatchesList = NonNullable<Awaited<ReturnType<JobsRepositoryType["listRunJobMatches"]>>["data"]>;
type RunsWithRunConfigList = NonNullable<
  Awaited<ReturnType<RunsRepositoryType["listRecentRunsWithRunConfig"]>>["data"]
>;

export type RunExecutor = {
  startRun: (runId: string) => Promise<void>;
  retryRun: (runId: string) => Promise<void>;
  generateDocuments: (runId: string, jobId: string) => Promise<void>;
};

export type RunsServiceDeps = {
  runsRepository?: RunsRepositoryType;
  jobsRepository?: JobsRepositoryType;
  documentsRepository?: DocumentsRepositoryType;
  settingsRepository?: SettingsRepositoryType;
  runExecutor?: RunExecutor;
  geocodingClient?: GeocodingClient;
};

function buildDocumentsHint(input: {
  runStatus: RunRecord["status"];
  jobs: Array<{ match_verdict: boolean | null; match_reasoning: string | null }>;
  documentsCount: number;
}): string | null {
  if (input.documentsCount > 0) {
    return null;
  }

  if (input.runStatus !== "completed") {
    return "No documents yet. This run is still processing.";
  }

  const matchedCount = input.jobs.filter((job) => job.match_verdict === true).length;
  const skippedJobs = input.jobs.filter((job) => (job.match_reasoning ?? "").startsWith("Skipped:"));

  if (skippedJobs.length > 0 && matchedCount === 0) {
    const exampleReason = skippedJobs[0]?.match_reasoning ?? "Skipped before document generation.";
    return `No documents were generated. ${skippedJobs.length} job(s) were skipped before AI generation. ${exampleReason}`;
  }

  if (matchedCount === 0) {
    return "No documents were generated because no jobs were marked as matches. Select a job and use manual generation if you still want tailored documents.";
  }

  return "No documents were generated even though matched jobs exist. Check the local run logs.";
}

function mapRunsWithRunConfigToDashboard(runs: RunsWithRunConfigList) {
  const runRecords: Omit<RunsWithRunConfigList[number], "run_config">[] = [];
  const runConfigs: Record<string, RunConfigRecord> = {};

  for (const run of runs) {
    const { run_config, ...runRecord } = run;
    runRecords.push(runRecord);
    if (run_config) {
      runConfigs[run.id] = run_config;
    }
  }

  return { runRecords, runConfigs };
}

function buildRecommendationBaselines(runs: RunsWithRunConfigList, limit = 5): RunRecommendationBaselineRecord[] {
  return runs
    // Only use runs that actually scraped jobs as baselines; zero-result runs
    // don't provide a meaningful comparison for duplicate-window warnings.
    .filter((run) => (run.jobs_total ?? 0) > 0)
    .flatMap((run) => {
      const runConfig = run.run_config;
      if (!runConfig) {
        return [];
      }

      return [
        {
          run_id: run.id,
          created_at: run.created_at,
          config: {
            title_keywords: runConfig.title_keywords,
            locations: runConfig.locations,
            days_filter: runConfig.days_filter,
            platforms: runConfig.platforms,
            country_code: runConfig.country_code,
          },
        },
      ];
    })
    .slice(0, limit);
}

export function createRunsService(deps: RunsServiceDeps = {}) {
  const runsRepository = deps.runsRepository ?? createRunsRepository();
  const jobsRepository = deps.jobsRepository ?? createJobsRepository();
  const documentsRepository = deps.documentsRepository ?? createDocumentsRepository();
  const settingsRepository = deps.settingsRepository ?? createSettingsRepository();
  const runExecutor: RunExecutor = deps.runExecutor ?? {
    startRun: defaultStartRun,
    retryRun: defaultRetryRun,
    generateDocuments: defaultGenerateDocuments,
  };
  const geocodingClient: GeocodingClient = deps.geocodingClient ?? defaultGeocodingClient;

  async function createRun(input: CreateRunCommand) {
    const { data: profileSettings, error: profileSettingsError } =
      await settingsRepository.getRunProfileReadiness(input.userId);
    if (profileSettingsError) {
      return { ok: false, status: 500, error: profileSettingsError.message } as const;
    }
    if (!isRunProfileReady(profileSettings)) {
      return { ok: false, status: 400, error: RUN_PROFILE_REQUIREMENT_MESSAGE } as const;
    }

    const providedConfig = input.configOverride;
    const configResult = providedConfig
      ? await (async () => {
          const countryCode = await resolveCountryCode(providedConfig.locations, geocodingClient);

          if (!countryCode) {
            return { data: null, error: { message: "GEOCODING_FAILED" } };
          }

          return runsRepository.createRunConfig({
            userId: input.userId,
            titleKeywords: providedConfig.titleKeywords,
            locations: providedConfig.locations,
            daysFilter: providedConfig.daysFilter,
            platforms: providedConfig.platforms,
            countryCode,
            linkedinResultsLimit: providedConfig.linkedinResultsLimit,
            indeedResultsLimit: providedConfig.indeedResultsLimit,
            jobMatcherRequests: providedConfig.jobMatcherRequests,
            resumeWriterRequests: providedConfig.resumeWriterRequests,
            coverLetterWriterRequests: providedConfig.coverLetterWriterRequests,
            includeProfilePicture: providedConfig.includeProfilePicture,
            resumeTemplate: providedConfig.resumeTemplate,
          });
        })()
      : await runsRepository.getLatestRunConfig(input.userId);

    if (configResult.error) {
      return { ok: false, status: 500, error: configResult.error.message } as const;
    }

    const config = configResult.data;
    if (!config?.id) {
      return { ok: false, status: 400, error: "MISSING_RUN_CONFIG" } as const;
    }

    const { data: run, error: runError } = await runsRepository.createRun({
      userId: input.userId,
      runConfigId: config.id,
      name: input.name,
    });

    if (runError || !run) {
      return { ok: false, status: 500, error: runError?.message ?? "Failed to create run" } as const;
    }

    try {
      await runExecutor.startRun(run.id);
    } catch (error) {
      await runsRepository.updateRunStatus({
        userId: input.userId,
        runId: run.id,
        status: "failed",
        stage: "failed",
        stageMessage: "Failed to start the local run.",
        errorMessage: String(error),
        finishedAt: new Date().toISOString(),
      });
      return { ok: false, status: 502, error: String(error) } as const;
    }

    return { ok: true, runId: run.id } as const;
  }

  async function getRunStatus(runId: string, userId: string): Promise<Result<{ run: RunRecord }>> {
    const { data: run, error } = await runsRepository.getRunForUser(runId, userId);

    if (error) {
      return infra(error.message);
    }

    if (!run) {
      return notFound("Run not found");
    }

    return ok({ run });
  }

  async function getRunDetails(
    runId: string,
    userId: string,
  ): Promise<
    Result<{
      run: RunRecord;
      jobs: Array<
        JobsList[number] & { match_verdict: boolean | null; match_score: number | null; match_reasoning: string | null }
      >;
      documents: DocumentsList;
      documentsHint: string | null;
      settings: {
        runConfig: RunConfigRecord | null;
      } | null;
    }>
  > {
    const [
      { data: runWithConfig, error: runError },
      { data: jobs, error: jobsError },
      { data: jobMatches, error: jobMatchesError },
      { data: documents, error: documentsError },
    ] = await Promise.all([
      runsRepository.getRunWithRunConfigForUser(runId, userId),
      jobsRepository.listRunJobs(userId, runId),
      jobsRepository.listRunJobMatches(userId, runId),
      documentsRepository.listRunDocuments(userId, runId),
    ]);

    if (runError || jobsError || jobMatchesError || documentsError) {
      return infra(
        runError?.message ??
          jobsError?.message ??
          jobMatchesError?.message ??
          documentsError?.message ??
          "Failed to load run details",
      );
    }

    if (!runWithConfig) {
      return notFound("Run not found");
    }

    const { run_config: runConfig, ...run } = runWithConfig;

    const matchesByJobId = new Map((jobMatches ?? []).map((item: JobMatchesList[number]) => [item.job_id, item]));
    const jobsWithMatch = (jobs ?? []).map((job) => {
      const match = matchesByJobId.get(job.id);
      return {
        ...job,
        match_verdict: typeof match?.verdict === "boolean" ? match.verdict : null,
        match_score: typeof match?.score === "number" ? match.score : null,
        match_reasoning: match?.reasoning ?? null,
      };
    });

    const documentsList = documents ?? [];
    const documentsHint = buildDocumentsHint({
      runStatus: run.status,
      jobs: jobsWithMatch,
      documentsCount: documentsList.length,
    });

    return ok({
      run,
      jobs: jobsWithMatch,
      documents: documentsList,
      documentsHint,
      settings: { runConfig: runConfig ?? null },
    });
  }

  async function listRunsDashboard(userId: string) {
    const [
      { data: runsWithRunConfig, error: runsWithRunConfigError },
      { data: jobsProcessed, error: jobsProcessedError },
    ] = await Promise.all([
      runsRepository.listRecentRunsWithRunConfig(userId, 20),
      runsRepository.getJobsProcessedCount(),
    ]);

    if (jobsProcessedError) {
      return {
        ok: false,
        status: 500,
        error: jobsProcessedError.message ?? "Failed to load runs",
      } as const;
    }

    let { runRecords: runs, runConfigs } = runsWithRunConfig
      ? mapRunsWithRunConfigToDashboard(runsWithRunConfig)
      : { runRecords: [] as Omit<RunsWithRunConfigList[number], "run_config">[], runConfigs: {} as Record<string, RunConfigRecord> };
    let recommendationBaselines = runsWithRunConfig ? buildRecommendationBaselines(runsWithRunConfig, 5) : [];

    if (runsWithRunConfigError) {
      console.warn(
        "[runs-service] Failed to load recommendation baselines; falling back to runs-only dashboard data",
        runsWithRunConfigError,
      );
      const { data: fallbackRuns, error: fallbackRunsError } = await runsRepository.listRecentRuns(userId, 20);

      if (fallbackRunsError) {
        return {
          ok: false,
          status: 500,
          error: fallbackRunsError.message ?? "Failed to load runs",
        } as const;
      }

      runs = fallbackRuns ?? [];
      runConfigs = {};
      recommendationBaselines = [];
    }

    return {
      ok: true,
      data: {
        runs,
        jobsProcessed: jobsProcessed ?? 0,
        recommendationBaselines,
        runConfigs,
      },
    } as const;
  }

  async function retryFailedRun(runId: string, userId: string) {
    const { data: run, error } = await runsRepository.getRunForUser(runId, userId);

    if (error) {
      return { ok: false, status: 500, error: error.message } as const;
    }
    if (!run) {
      return { ok: false, status: 404, error: "RUN_NOT_FOUND" } as const;
    }
    if (run.status !== "failed") {
      return { ok: false, status: 409, error: "RUN_NOT_FAILED" } as const;
    }

    try {
      await runExecutor.retryRun(runId);
    } catch {
      return { ok: false, status: 502, error: "RETRY_TRIGGER_FAILED" } as const;
    }

    return { ok: true } as const;
  }

  async function triggerManualDocumentGeneration(runId: string, userId: string, jobId: string) {
    const { data: run, error: runError } = await runsRepository.getRunForUser(runId, userId);

    if (runError) {
      return { ok: false, status: 500, error: runError.message } as const;
    }
    if (!run) {
      return { ok: false, status: 404, error: "RUN_NOT_FOUND" } as const;
    }
    if (run.status === "queued" || run.status === "running") {
      return { ok: false, status: 409, error: "RUN_STILL_ACTIVE" } as const;
    }

    const { data: job, error: jobError } = await jobsRepository.getRunJobById(userId, runId, jobId);
    if (jobError) {
      return { ok: false, status: 500, error: jobError.message } as const;
    }
    if (!job?.id) {
      return { ok: false, status: 404, error: "JOB_NOT_FOUND" } as const;
    }

    try {
      await runExecutor.generateDocuments(runId, jobId);
    } catch (error) {
      return { ok: false, status: 502, error: String(error) } as const;
    }

    return { ok: true } as const;
  }

  async function validateLocation(location: string) {
    if (!hasGeocodableTokens(location)) {
      return {
        resolved: false,
        countryCode: null,
        displayName: null,
        failureReason: "missing_concrete_city",
      } as const;
    }

    const result = await geocodingClient.resolveLocation(location);
    if (!result) {
      return {
        resolved: false,
        countryCode: null,
        displayName: null,
        failureReason: "not_found",
      } as const;
    }

    return {
      resolved: true,
      countryCode: result.countryCode,
      displayName: result.displayName,
    } as const;
  }

  const runsService: RunsService = {
    createRun,
    getRunStatus,
    getRunDetails,
    listRunsDashboard,
    retryFailedRun,
    triggerManualDocumentGeneration,
  };

  return {
    ...runsService,
    validateLocation,
  };
}
