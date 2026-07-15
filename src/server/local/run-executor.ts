import { getDatabase } from "./database";
import { generateLocalJobArtifacts, startLocalPipeline } from "./pipeline";

export async function startRun(runId: string) {
  startLocalPipeline(runId);
}

export async function retryRun(runId: string) {
  getDatabase()
    .prepare(
      "UPDATE runs SET status='queued', stage='pending', error_message=NULL, finished_at=NULL WHERE id=?",
    )
    .run(runId);
  startLocalPipeline(runId);
}

export async function generateDocuments(runId: string, jobId: string) {
  await generateLocalJobArtifacts(runId, jobId);
}
