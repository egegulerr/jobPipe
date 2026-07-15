export type LogLevel = "info" | "warn" | "error";

export type StructuredLogEvent = {
  message: string;
  level?: LogLevel;
  endpoint?: string;
  requestId?: string;
  userId?: string;
  runId?: string;
  status?: number;
  error?: string;
  metadata?: Record<string, unknown>;
};

export function logEvent(event: StructuredLogEvent) {
  const line = {
    ts: new Date().toISOString(),
    level: event.level ?? "info",
    message: event.message,
    endpoint: event.endpoint,
    requestId: event.requestId,
    userId: event.userId,
    runId: event.runId,
    status: event.status,
    error: event.error,
    ...event.metadata,
  };

  const serialized = JSON.stringify(line);
  if ((event.level ?? "info") === "error") {
    console.error(serialized);
    return;
  }

  if ((event.level ?? "info") === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}
