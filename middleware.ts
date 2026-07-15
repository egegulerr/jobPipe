import { NextResponse, type NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/") || !MUTATING_METHODS.has(request.method)) {
    return withSecurityHeaders(NextResponse.next());
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return withSecurityHeaders(NextResponse.next());
  }

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : request.nextUrl.origin;

  if (origin === request.nextUrl.origin || origin === appOrigin) {
    return withSecurityHeaders(NextResponse.next());
  }

  return withSecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
}
