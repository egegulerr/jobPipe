import { getDatabase } from "./database";

const DEFAULT_LINKEDIN_ACTOR = "curious_coder/linkedin-jobs-scraper";
const DEFAULT_INDEED_ACTOR = "valig/indeed-jobs-scraper";
const DEFAULT_MATCHING_MODEL = "google/gemini-2.5-flash";
const DEFAULT_WRITING_MODEL = "google/gemini-2.5-flash";

export type LocalConfig = {
  apifyApiToken: string;
  openRouterApiKey: string;
  linkedinActor: string;
  indeedActor: string;
  matchingModel: string;
  writingModel: string;
};

const defaults: LocalConfig = {
  apifyApiToken: "",
  openRouterApiKey: "",
  linkedinActor: DEFAULT_LINKEDIN_ACTOR,
  indeedActor: DEFAULT_INDEED_ACTOR,
  matchingModel: DEFAULT_MATCHING_MODEL,
  writingModel: DEFAULT_WRITING_MODEL,
};

export function getLocalConfig(): LocalConfig {
  const values = Object.fromEntries(
    getDatabase().prepare("SELECT key, value FROM app_config").all().map((row) => [String(row.key), String(row.value)]),
  );
  return {
    apifyApiToken: process.env.APIFY_API_TOKEN || values.apifyApiToken || "",
    openRouterApiKey: process.env.OPENROUTER_API_KEY || values.openRouterApiKey || "",
    linkedinActor: process.env.APIFY_LINKEDIN_ACTOR || values.linkedinActor || defaults.linkedinActor,
    indeedActor: process.env.APIFY_INDEED_ACTOR || values.indeedActor || defaults.indeedActor,
    matchingModel: process.env.OPENROUTER_MATCHING_MODEL || values.matchingModel || defaults.matchingModel,
    writingModel: process.env.OPENROUTER_WRITING_MODEL || values.writingModel || defaults.writingModel,
  };
}

export function updateLocalConfig(values: Partial<LocalConfig>) {
  const statement = getDatabase().prepare(`
    INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" && value.trim()) statement.run(key, value.trim(), now);
  }
}

export function publicLocalConfig() {
  const config = getLocalConfig();
  return {
    apifyConfigured: Boolean(config.apifyApiToken),
    openRouterConfigured: Boolean(config.openRouterApiKey),
    linkedinActor: config.linkedinActor,
    indeedActor: config.indeedActor,
    matchingModel: config.matchingModel,
    writingModel: config.writingModel,
    complete: Boolean(config.apifyApiToken && config.openRouterApiKey),
  };
}
