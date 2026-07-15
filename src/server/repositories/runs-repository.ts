import crypto from "node:crypto";
import type { RunRecordWithRunConfig, RunsRepository } from "@/server/domains/runs/runs.interfaces";
import { getDatabase, sqliteError } from "@/server/local/database";

const noError = null;

function runRecord(row: Record<string, unknown>) {
  return {
    id: String(row.id), status: String(row.status) as "queued" | "running" | "completed" | "failed",
    stage: row.stage == null ? null : String(row.stage), stage_message: row.stage_message == null ? null : String(row.stage_message),
    jobs_total: Number(row.jobs_total ?? 0), jobs_processed: Number(row.jobs_processed ?? 0), jobs_matched: Number(row.jobs_matched ?? 0), jobs_failed: Number(row.jobs_failed ?? 0), documents_generated: Number(row.documents_generated ?? 0),
    created_at: String(row.created_at), started_at: row.started_at == null ? null : String(row.started_at), finished_at: row.finished_at == null ? null : String(row.finished_at), error_message: row.error_message == null ? null : String(row.error_message), name: row.name == null ? null : String(row.name),
  };
}

function configRecord(row: Record<string, unknown>) {
  return {
    title_keywords: String(row.title_keywords), locations: String(row.locations), days_filter: Number(row.days_filter),
    platforms: JSON.parse(String(row.platforms)), country_code: row.country_code == null ? null : String(row.country_code),
    linkedin_results_limit: row.linkedin_results_limit == null ? null : Number(row.linkedin_results_limit), indeed_results_limit: row.indeed_results_limit == null ? null : Number(row.indeed_results_limit),
    job_matcher_requests: String(row.job_matcher_requests ?? ""), resume_writer_requests: String(row.resume_writer_requests ?? ""), cover_letter_writer_requests: String(row.cover_letter_writer_requests ?? ""),
    include_profile_picture: Boolean(row.include_profile_picture), resume_template: (row.resume_template === "modern_sans" ? "modern_sans" : "classic") as "classic" | "modern_sans",
  };
}

const joinedSelect = `SELECT r.*, c.title_keywords, c.locations, c.days_filter, c.platforms, c.country_code,
 c.linkedin_results_limit, c.indeed_results_limit, c.job_matcher_requests, c.resume_writer_requests,
 c.cover_letter_writer_requests, c.include_profile_picture, c.resume_template
 FROM runs r JOIN run_configs c ON c.id = r.run_config_id`;

export function createRunsRepository(): RunsRepository {
  return {
    async getLatestRunConfig() { const row = getDatabase().prepare("SELECT id FROM run_configs ORDER BY created_at DESC LIMIT 1").get(); return { data: row ? { id: String(row.id) } : null, error: noError }; },
    async createRunConfig(input) {
      try { const id = crypto.randomUUID(); getDatabase().prepare(`INSERT INTO run_configs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, input.titleKeywords, input.locations, input.daysFilter, JSON.stringify(input.platforms), input.countryCode, input.linkedinResultsLimit, input.indeedResultsLimit, input.jobMatcherRequests, input.resumeWriterRequests, input.coverLetterWriterRequests, input.includeProfilePicture ? 1 : 0, input.resumeTemplate, new Date().toISOString()); return { data: { id }, error: noError }; }
      catch (error) { return { data: null, error: sqliteError(error) }; }
    },
    async createRun(input) {
      try { const id = crypto.randomUUID(); const now = new Date().toISOString(); getDatabase().prepare(`INSERT INTO runs (id, run_config_id, name, status, stage, stage_message, created_at) VALUES (?, ?, ?, 'queued', 'pending', ?, ?)`)
        .run(id, input.runConfigId, input.name ?? null, "Run accepted for local processing.", now); return { data: { id }, error: noError }; }
      catch (error) { return { data: null, error: sqliteError(error) }; }
    },
    async updateRunStatus(input) {
      try { const map = { errorMessage: "error_message", startedAt: "started_at", finishedAt: "finished_at", stage: "stage", stageMessage: "stage_message", jobsTotal: "jobs_total", jobsProcessed: "jobs_processed", jobsMatched: "jobs_matched", jobsFailed: "jobs_failed", documentsGenerated: "documents_generated" } as const;
        getDatabase().prepare("UPDATE runs SET status = ? WHERE id = ?").run(input.status, input.runId);
        for (const [key, column] of Object.entries(map)) { const value = input[key as keyof typeof input]; if (value !== undefined) getDatabase().prepare(`UPDATE runs SET ${column} = ? WHERE id = ?`).run(value, input.runId); }
        return { data: null, error: noError }; } catch (error) { return { data: null, error: sqliteError(error) }; }
    },
    async getRunForUser(runId) { const row = getDatabase().prepare("SELECT * FROM runs WHERE id = ?").get(runId); return { data: row ? runRecord(row) : null, error: noError }; },
    async listRecentRuns(_userId, limit = 20) { return { data: getDatabase().prepare("SELECT * FROM runs ORDER BY created_at DESC LIMIT ?").all(limit).map(runRecord), error: noError }; },
    async listRecentRunsWithRunConfig(_userId, limit = 20) { const data = getDatabase().prepare(`${joinedSelect} ORDER BY r.created_at DESC LIMIT ?`).all(limit).map((row) => ({ ...runRecord(row), run_config: configRecord(row) })) as RunRecordWithRunConfig[]; return { data, error: noError }; },
    async getJobsProcessedCount() { const row = getDatabase().prepare("SELECT COUNT(*) count FROM jobs").get()!; return { data: Number(row.count), error: noError }; },
    async getRunWithRunConfigForUser(runId) { const row = getDatabase().prepare(`${joinedSelect} WHERE r.id = ?`).get(runId); return { data: row ? ({ ...runRecord(row), run_config: configRecord(row) } as RunRecordWithRunConfig) : null, error: noError }; },
  };
}
