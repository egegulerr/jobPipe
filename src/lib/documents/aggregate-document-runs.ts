export type DocumentRunRow = {
  run_id: string;
  created_at: string;
};

export type DocumentRunAggregate = {
  runId: string;
  documentCount: number;
  newestCreatedAt: string;
};

export function aggregateDocumentRuns(rows: DocumentRunRow[]): DocumentRunAggregate[] {
  const runMap = new Map<string, { documentCount: number; newestCreatedAt: string }>();

  for (const row of rows) {
    const existing = runMap.get(row.run_id);

    if (!existing) {
      runMap.set(row.run_id, { documentCount: 1, newestCreatedAt: row.created_at });
      continue;
    }

    existing.documentCount += 1;

    if (row.created_at > existing.newestCreatedAt) {
      existing.newestCreatedAt = row.created_at;
    }
  }

  return Array.from(runMap.entries())
    .map(([runId, stats]) => ({
      runId,
      documentCount: stats.documentCount,
      newestCreatedAt: stats.newestCreatedAt,
    }))
    .sort((left, right) => right.newestCreatedAt.localeCompare(left.newestCreatedAt));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const from = (page - 1) * pageSize;

  return items.slice(from, from + pageSize);
}
