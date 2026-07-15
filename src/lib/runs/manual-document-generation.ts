import type { RunDetailsDocumentDto } from "@/types/output/runs.dto";

const MANUAL_DOCUMENT_TYPES = ["resume", "cover_letter"] as const;

export const MANUAL_DOCUMENT_POLL_INTERVAL_MS = 3_000;

/** Stop polling for a job if generation has not finished within this window. */
const MANUAL_DOCUMENT_POLL_TIMEOUT_MS = 5 * 60 * 1_000;

/** Interval for timeout-only cleanup when query polling has stopped. */
export const MANUAL_DOCUMENT_TIMEOUT_CHECK_INTERVAL_MS = 30_000;

const EMPTY_DOCUMENT_TYPES = new Set<string>();

function documentTypesByJobId(documents: RunDetailsDocumentDto[]): Map<string, Set<string>> {
  const typesByJobId = new Map<string, Set<string>>();

  for (const document of documents) {
    if (!document.job_id) {
      continue;
    }

    const types = typesByJobId.get(document.job_id) ?? new Set<string>();
    types.add(document.type);
    typesByJobId.set(document.job_id, types);
  }

  return typesByJobId;
}

export function isManualDocumentGenerationComplete(
  documents: RunDetailsDocumentDto[],
  jobId: string,
  typesByJobId = documentTypesByJobId(documents),
): boolean {
  const types = typesByJobId.get(jobId) ?? EMPTY_DOCUMENT_TYPES;
  return MANUAL_DOCUMENT_TYPES.every((type) => types.has(type));
}

export function pruneAwaitingManualDocumentJobs(
  awaitingByJobId: ReadonlyMap<string, number>,
  documents: RunDetailsDocumentDto[],
  now = Date.now(),
): Map<string, number> | null {
  if (awaitingByJobId.size === 0) {
    return null;
  }

  const typesByJobId = documentTypesByJobId(documents);
  const next = new Map<string, number>();
  let changed = false;

  for (const [jobId, startedAt] of awaitingByJobId) {
    if (isManualDocumentGenerationComplete(documents, jobId, typesByJobId)) {
      changed = true;
      continue;
    }

    if (now - startedAt >= MANUAL_DOCUMENT_POLL_TIMEOUT_MS) {
      changed = true;
      continue;
    }

    next.set(jobId, startedAt);
  }

  return changed ? next : null;
}

export function resolveActiveAwaitingManualDocumentJobs(
  awaitingByJobId: ReadonlyMap<string, number>,
  documents: RunDetailsDocumentDto[],
  now = Date.now(),
): Map<string, number> {
  if (awaitingByJobId.size === 0) {
    return new Map();
  }

  const typesByJobId = documentTypesByJobId(documents);
  const active = new Map<string, number>();

  for (const [jobId, startedAt] of awaitingByJobId) {
    if (now - startedAt >= MANUAL_DOCUMENT_POLL_TIMEOUT_MS) {
      continue;
    }

    if (isManualDocumentGenerationComplete(documents, jobId, typesByJobId)) {
      continue;
    }

    active.set(jobId, startedAt);
  }

  return active;
}

export function shouldPollRunDetailsForManualDocuments(
  awaitingByJobId: ReadonlyMap<string, number>,
  documents: RunDetailsDocumentDto[],
  now = Date.now(),
): boolean {
  return resolveActiveAwaitingManualDocumentJobs(awaitingByJobId, documents, now).size > 0;
}

export function countOtherAwaitingManualDocumentJobs(
  activeAwaitingByJobId: ReadonlyMap<string, number>,
  selectedJobId: string | undefined,
): number {
  if (!selectedJobId) {
    return activeAwaitingByJobId.size;
  }

  return Math.max(0, activeAwaitingByJobId.size - (activeAwaitingByJobId.has(selectedJobId) ? 1 : 0));
}
