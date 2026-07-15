import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

const localDataDir = process.env.NODE_ENV === "test"
  ? path.join(os.tmpdir(), `jobpipe-test-${crypto.randomUUID()}`)
  : process.env.JOBPIPE_DATA_DIR
  ? path.resolve(/* turbopackIgnore: true */ process.env.JOBPIPE_DATA_DIR)
  : path.join(process.cwd(), ".jobpipe");
export const documentsDir = path.join(localDataDir, "documents");
export const assetsDir = path.join(localDataDir, "assets");

let database: DatabaseSync | undefined;

function openDatabase() {
  fs.mkdirSync(documentsDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(assetsDir, { recursive: true, mode: 0o700 });

  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  const connection = new DatabaseSync(path.join(localDataDir, "jobpipe.sqlite"));
  connection.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");

  connection.exec(`
  CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    email TEXT,
    bio TEXT,
    avatar_path TEXT,
    match_threshold INTEGER DEFAULT 60,
    default_tone TEXT,
    job_matcher_instructions TEXT,
    tone_instructions TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  INSERT OR IGNORE INTO profile (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS profile_experiences (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'experience',
    title TEXT NOT NULL,
    organization TEXT,
    date_range TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS profile_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    context TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS profile_languages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    proficiency TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS profile_technologies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS profile_certifications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    issuer TEXT,
    issue_date TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS run_configs (
    id TEXT PRIMARY KEY,
    title_keywords TEXT NOT NULL,
    locations TEXT NOT NULL,
    days_filter INTEGER NOT NULL,
    platforms TEXT NOT NULL,
    country_code TEXT,
    linkedin_results_limit INTEGER,
    indeed_results_limit INTEGER,
    job_matcher_requests TEXT NOT NULL DEFAULT '',
    resume_writer_requests TEXT NOT NULL DEFAULT '',
    cover_letter_writer_requests TEXT NOT NULL DEFAULT '',
    include_profile_picture INTEGER NOT NULL DEFAULT 0,
    resume_template TEXT NOT NULL DEFAULT 'classic',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    run_config_id TEXT NOT NULL REFERENCES run_configs(id),
    name TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    stage TEXT NOT NULL DEFAULT 'pending',
    stage_message TEXT,
    jobs_total INTEGER NOT NULL DEFAULT 0,
    jobs_processed INTEGER NOT NULL DEFAULT 0,
    jobs_matched INTEGER NOT NULL DEFAULT 0,
    jobs_failed INTEGER NOT NULL DEFAULT 0,
    documents_generated INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS scraper_executions (
    run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    external_run_id TEXT,
    dataset_id TEXT,
    started_at TEXT,
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    error_message TEXT,
    PRIMARY KEY (run_id, source)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    company_name TEXT,
    company_website TEXT,
    description_text TEXT,
    description_html TEXT,
    posted_at TEXT,
    job_link TEXT,
    apply_url TEXT,
    location_text TEXT,
    salary_min REAL,
    salary_max REAL,
    salary_currency TEXT,
    salary_unit TEXT,
    salary_text TEXT,
    applicants_count INTEGER,
    employment_type TEXT,
    seniority_level TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (run_id, source, external_id)
  );

  CREATE TABLE IF NOT EXISTS job_matches (
    job_id TEXT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    verdict INTEGER NOT NULL,
    score REAL,
    reasoning TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'pdf',
    title TEXT NOT NULL,
    storage_path TEXT,
    docx_storage_path TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, type)
  );
`);

  return connection;
}

export function getDatabase() {
  database ??= openDatabase();
  return database;
}

export function sqliteError(error: unknown) {
  return { message: error instanceof Error ? error.message : String(error) };
}

export function transaction<T>(work: () => T): T {
  const connection = getDatabase();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    connection.exec("COMMIT");
    return result;
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}
