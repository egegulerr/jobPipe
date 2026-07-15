export const documentsStoragePolicy = {
  limitBytes: 50 * 1024 * 1024,
  warningThresholdBytes: 40 * 1024 * 1024,
  defaultPageSize: 24,
  defaultRunsPageSize: 10,
  maxPageSize: 100,
} as const;
