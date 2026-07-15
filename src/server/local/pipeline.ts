import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { normalizeIndeedJob, normalizeLinkedInJob } from "@/server/utils/jobs";
import { renderDocumentPdfBuffer } from "@/server/document-artifacts/render-document-pdf";
import { renderDocumentDocxBuffer } from "@/server/document-artifacts/render-document-docx";
import { documentsDir, getDatabase, transaction } from "./database";
import { openRouterText } from "./openrouter";
import { runApifyActor } from "./apify";
import { resolveRunEngineFromConfig } from "@/lib/runs/engine-defaults";

const matchSchema = z.object({ verdict: z.boolean(), score: z.number().min(0).max(100).nullable(), reasoning: z.string() });
const activeRuns = new Set<string>();

function updateRun(runId: string, values: Record<string, string | number | null>) {
  for (const [column, value] of Object.entries(values)) getDatabase().prepare(`UPDATE runs SET ${column} = ? WHERE id = ?`).run(value, runId);
}

function profileText() {
  const profile = getDatabase().prepare("SELECT * FROM profile WHERE id=1").get()!;
  const sections = [profile.bio ? `Summary: ${profile.bio}` : ""];
  for (const row of getDatabase().prepare("SELECT * FROM profile_experiences ORDER BY sort_order").all()) sections.push(`${row.type}: ${row.title}, ${row.organization ?? ""}, ${row.date_range ?? ""}\n${row.description ?? ""}`);
  const skills = getDatabase().prepare("SELECT name FROM profile_skills ORDER BY sort_order").all().map((row) => row.name).join(", ");
  if (skills) sections.push(`Skills: ${skills}`);
  return { name: String(profile.display_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Candidate"), text: sections.filter(Boolean).join("\n\n") };
}

async function generateArtifacts(runId: string, jobId: string, title: string, company: string, description: string, resumeTemplate: "classic" | "modern_sans", resumeTone: string, coverLetterTone: string) {
  const candidate = profileText();
  const resume = await openRouterText({ kind: "writing", system: `Write a truthful, ATS-friendly tailored resume in Markdown. Never invent experience, skills, employers, dates, or qualifications. ${resumeTone} Return only Markdown.`, user: `Candidate profile:\n${candidate.text}\n\nTarget role: ${title} at ${company}\nJob description:\n${description}\n\nStart with '# ${candidate.name}'.` });
  const letter = await openRouterText({ kind: "writing", system: `Write a concise, truthful motivation letter in Markdown using only facts in the candidate profile. ${coverLetterTone} Return only the letter.`, user: `Candidate: ${candidate.name}\n${candidate.text}\n\nRole: ${title} at ${company}\n${description}` });

  for (const [type, markdown] of [["resume", resume], ["cover_letter", letter]] as const) {
    const base = `${jobId}-${type}`;
    const pdfPath = path.join(documentsDir, `${base}.pdf`);
    const docxPath = path.join(documentsDir, `${base}.docx`);
    const renderInput = { type, title: type === "resume" ? `Resume — ${title}` : `Motivation Letter — ${title}`, markdown, resumeTemplateId: resumeTemplate };
    fs.writeFileSync(pdfPath, await renderDocumentPdfBuffer(renderInput), { mode: 0o600 });
    fs.writeFileSync(docxPath, await renderDocumentDocxBuffer(renderInput), { mode: 0o600 });
    getDatabase().prepare(`INSERT INTO documents (id, run_id, job_id, type, title, storage_path, docx_storage_path) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(job_id, type) DO UPDATE SET title=excluded.title, storage_path=excluded.storage_path, docx_storage_path=excluded.docx_storage_path`).run(crypto.randomUUID(), runId, jobId, type, renderInput.title, pdfPath, docxPath);
  }
}

async function runLocalPipeline(runId: string) {
  if (activeRuns.has(runId)) return;
  activeRuns.add(runId);
  const startedAt = new Date().toISOString();
  try {
    updateRun(runId, { status: "running", stage: "job_scraping", stage_message: "Collecting jobs from Apify.", started_at: startedAt, error_message: null });
    const config = getDatabase().prepare("SELECT c.* FROM run_configs c JOIN runs r ON r.run_config_id=c.id WHERE r.id=?").get(runId);
    if (!config) throw new Error("Run configuration not found.");
    const platforms = JSON.parse(String(config.platforms)) as Array<"linkedin" | "indeed">;
    const engine = resolveRunEngineFromConfig({
      job_matcher_requests: String(config.job_matcher_requests ?? ""),
      resume_writer_requests: String(config.resume_writer_requests ?? ""),
      cover_letter_writer_requests: String(config.cover_letter_writer_requests ?? ""),
    });
    const search = { titleKeywords: String(config.title_keywords), locations: String(config.locations), daysFilter: Number(config.days_filter), countryCode: config.country_code == null ? null : String(config.country_code), linkedinResultsLimit: config.linkedin_results_limit == null ? null : Number(config.linkedin_results_limit), indeedResultsLimit: config.indeed_results_limit == null ? null : Number(config.indeed_results_limit) };

    for (const source of platforms) {
      const result = await runApifyActor(source, search, (externalRunId) => getDatabase().prepare("INSERT OR REPLACE INTO scraper_executions (run_id, source, status, external_run_id, started_at, updated_at) VALUES (?, ?, 'running', ?, ?, ?)").run(runId, source, externalRunId, new Date().toISOString(), new Date().toISOString()));
      const normalized = result.items.map((item) => source === "linkedin" ? normalizeLinkedInJob(item) : normalizeIndeedJob(item)).filter((job) => job.external_id && job.title);
      transaction(() => {
        const insert = getDatabase().prepare(`INSERT OR IGNORE INTO jobs (id, run_id, external_id, source, title, company_name, company_website, description_text, description_html, posted_at, job_link, apply_url, location_text, salary_min, salary_max, salary_currency, salary_unit, salary_text, applicants_count, employment_type, seniority_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const job of normalized) insert.run(crypto.randomUUID(), runId, job.external_id, job.source, job.title, job.company_name, job.company_website, job.description_text, job.description_html, job.posted_at, job.link, job.apply_url, job.location_text, job.salary_min, job.salary_max, job.salary_currency, job.salary_unit, job.salary_text, job.applicants_count, job.employment_type, job.seniority_level);
      });
      getDatabase().prepare("UPDATE scraper_executions SET status='completed', dataset_id=?, completed_at=?, updated_at=? WHERE run_id=? AND source=?").run(result.datasetId, new Date().toISOString(), new Date().toISOString(), runId, source);
    }

    const jobs = getDatabase().prepare("SELECT * FROM jobs WHERE run_id=?").all(runId);
    updateRun(runId, { stage: "job_matching", stage_message: `Matching ${jobs.length} jobs with OpenRouter.`, jobs_total: jobs.length });
    let processed = 0, matched = 0, failed = 0, documents = 0;
    for (const job of jobs) {
      try {
        const description = String(job.description_text ?? "");
        const candidate = profileText();
        const raw = await openRouterText({ kind: "matching", json: true, system: "Evaluate whether the candidate matches the job. Return JSON: {verdict:boolean, score:number|null, reasoning:string}. Be strict and truthful.", user: `Candidate:\n${candidate.text}\n\nJob: ${job.title} at ${job.company_name ?? ""}\n${description}${engine.job_matcher_instructions ? `\n\nAdditional matching instructions:\n${engine.job_matcher_instructions}` : ""}` });
        const match = matchSchema.parse(JSON.parse(raw));
        const verdict = match.verdict && (match.score == null || match.score >= engine.match_threshold);
        const reasoning = verdict === match.verdict ? match.reasoning : `${match.reasoning} (Score ${match.score}% is below the configured ${engine.match_threshold}% threshold.)`;
        getDatabase().prepare("INSERT OR REPLACE INTO job_matches VALUES (?, ?, ?, ?)").run(job.id, verdict ? 1 : 0, match.score, reasoning);
        if (verdict) { matched += 1; await generateArtifacts(runId, String(job.id), String(job.title), String(job.company_name ?? ""), description, config.resume_template === "modern_sans" ? "modern_sans" : "classic", engine.resume_tone_request, engine.cover_letter_tone_request); documents += 2; }
      } catch { failed += 1; }
      processed += 1; updateRun(runId, { jobs_processed: processed, jobs_matched: matched, jobs_failed: failed, documents_generated: documents });
    }
    updateRun(runId, { status: "completed", stage: "completed", stage_message: `Completed ${processed} jobs.`, finished_at: new Date().toISOString(), documents_generated: documents });
  } catch (error) {
    updateRun(runId, { status: "failed", stage: "failed", stage_message: "Local run failed.", error_message: String(error), finished_at: new Date().toISOString() });
  } finally { activeRuns.delete(runId); }
}

export function startLocalPipeline(runId: string) { void runLocalPipeline(runId); }

export async function generateLocalJobArtifacts(runId: string, jobId: string) {
  const row = getDatabase().prepare(`SELECT j.title, j.company_name, j.description_text, c.resume_template,
    c.resume_writer_requests, c.cover_letter_writer_requests
    FROM jobs j JOIN runs r ON r.id=j.run_id JOIN run_configs c ON c.id=r.run_config_id
    WHERE j.run_id=? AND j.id=?`).get(runId, jobId);
  if (!row) throw new Error("Job not found.");

  const engine = resolveRunEngineFromConfig({
    resume_writer_requests: String(row.resume_writer_requests ?? ""),
    cover_letter_writer_requests: String(row.cover_letter_writer_requests ?? ""),
  });
  await generateArtifacts(
    runId,
    jobId,
    String(row.title),
    String(row.company_name ?? ""),
    String(row.description_text ?? ""),
    row.resume_template === "modern_sans" ? "modern_sans" : "classic",
    engine.resume_tone_request,
    engine.cover_letter_tone_request,
  );
  getDatabase().prepare("UPDATE runs SET documents_generated=(SELECT COUNT(*) FROM documents WHERE run_id=?) WHERE id=?").run(runId, runId);
}
