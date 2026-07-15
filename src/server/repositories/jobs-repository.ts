import type { JobsRepository } from "@/server/domains/runs/runs.interfaces";
import { getDatabase } from "@/server/local/database";

const noError = null;

export function createJobsRepository(): JobsRepository {
  return {
    async listRunJobs(_userId, runId) {
      const data = getDatabase().prepare(`SELECT id, title, company_name, company_website, description_text, description_html, posted_at, apply_url, location_text, salary_min, salary_max, salary_currency, salary_unit, salary_text, applicants_count, employment_type, seniority_level, source FROM jobs WHERE run_id = ? ORDER BY created_at DESC`).all(runId).map((row) => ({ ...row })) as never;
      return { data, error: noError };
    },
    async listRunJobMatches(_userId, runId) {
      const data = getDatabase().prepare("SELECT m.job_id, m.verdict, m.score, m.reasoning FROM job_matches m JOIN jobs j ON j.id = m.job_id WHERE j.run_id = ?").all(runId).map((row) => ({ ...row, verdict: Boolean(row.verdict) })) as never;
      return { data, error: noError };
    },
    async getRunJobById(_userId, runId, jobId) { const row = getDatabase().prepare("SELECT id FROM jobs WHERE run_id = ? AND id = ?").get(runId, jobId); return { data: row ? { id: String(row.id) } : null, error: noError }; },
  };
}
