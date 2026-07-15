import { NextResponse } from "next/server";

export function okJson<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: init?.headers });
}

export function errorJson(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status },
  );
}
