import { getLocalConfig } from "./config";

type Source = "linkedin" | "indeed";
type SearchConfig = { titleKeywords: string; locations: string; daysFilter: number; countryCode: string | null; linkedinResultsLimit: number | null; indeedResultsLimit: number | null };

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function actorInput(source: Source, config: SearchConfig) {
  if (source === "linkedin") {
    const params = new URLSearchParams({ keywords: config.titleKeywords, location: config.locations, f_TPR: `r${Math.max(1, config.daysFilter) * 86400}`, origin: "JOB_SEARCH_PAGE_JOB_FILTER", refresh: "true", sortBy: "R" });
    return { count: config.linkedinResultsLimit ?? 100, scrapeCompany: true, urls: [`https://www.linkedin.com/jobs/search/?${params}`] };
  }
  return { country: config.countryCode, datePosted: config.daysFilter <= 1 ? "1" : config.daysFilter <= 3 ? "3" : config.daysFilter <= 7 ? "7" : "14", limit: config.indeedResultsLimit ?? 100, location: config.locations, title: config.titleKeywords };
}

export async function runApifyActor(source: Source, search: SearchConfig, onStarted?: (runId: string) => void) {
  const config = getLocalConfig();
  if (!config.apifyApiToken) throw new Error("Apify is not configured. Open /setup first.");
  const actor = source === "linkedin" ? config.linkedinActor : config.indeedActor;
  const actorRef = actor.replace("/", "~");
  const start = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorRef)}/runs`, {
    method: "POST",
    headers: { authorization: `Bearer ${config.apifyApiToken}`, "content-type": "application/json" },
    body: JSON.stringify(actorInput(source, search)),
  });
  if (!start.ok) throw new Error(`Could not start ${source} actor (${start.status}): ${await start.text()}`);
  const started = await start.json() as { data?: { id?: string } };
  const runId = started.data?.id;
  if (!runId) throw new Error(`Apify did not return a run id for ${source}.`);
  onStarted?.(runId);

  const deadline = Date.now() + 15 * 60_000;
  while (Date.now() < deadline) {
    await pause(3_000);
    const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${encodeURIComponent(runId)}`, { headers: { authorization: `Bearer ${config.apifyApiToken}` } });
    if (!statusResponse.ok) throw new Error(`Could not read Apify run ${runId}.`);
    const status = await statusResponse.json() as { data?: { status?: string; defaultDatasetId?: string } };
    if (status.data?.status === "SUCCEEDED" && status.data.defaultDatasetId) {
      const dataset = await fetch(`https://api.apify.com/v2/datasets/${encodeURIComponent(status.data.defaultDatasetId)}/items?clean=true`, { headers: { authorization: `Bearer ${config.apifyApiToken}` } });
      if (!dataset.ok) throw new Error(`Could not download Apify dataset (${dataset.status}).`);
      return { runId, datasetId: status.data.defaultDatasetId, items: await dataset.json() as Record<string, unknown>[] };
    }
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status.data?.status ?? "")) throw new Error(`${source} actor finished with status ${status.data?.status}.`);
  }
  throw new Error(`${source} actor did not finish within 15 minutes.`);
}
