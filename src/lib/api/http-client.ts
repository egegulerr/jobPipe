class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: BodyInit | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type ErrorPayload = {
  error?: string;
  details?: unknown;
};

async function parseErrorPayload(response: Response): Promise<ErrorPayload> {
  try {
    return (await response.json()) as ErrorPayload;
  } catch {
    return { error: "Request failed" };
  }
}

export async function fetchJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  if (!url.startsWith("/")) {
    throw new ApiError("Invalid API URL", 400);
  }

  // fallow-ignore-next-line security-sink
  const response = await fetch(url, {
    method: options.method ?? "GET",
    body: options.body,
    headers: options.headers,
    signal: options.signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    throw new ApiError(String(payload.error ?? "Request failed"), response.status, payload.details);
  }

  const raw = await response.text();
  if (!raw.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiError("Invalid JSON response", response.status, { body: raw.slice(0, 200) });
  }
}
