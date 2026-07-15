export type AppErrorCode =
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "INFRA"
  | "INTERNAL";

export type AppError = {
  code: AppErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AppError;
    };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(code: AppErrorCode, message: string, status: number, details?: unknown): Result<never> {
  return { ok: false, error: { code, message, status, details } };
}

export function infra(message = "Infrastructure failure", details?: unknown): Result<never> {
  return fail("INFRA", message, 500, details);
}

export function notFound(message = "Not found"): Result<never> {
  return fail("NOT_FOUND", message, 404);
}
