import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "../middleware";

function request(method: string, origin?: string) {
  return new NextRequest("https://jobpipe.org/api/settings", {
    method,
    headers: origin ? { origin } : undefined,
  });
}

describe("middleware", () => {
  it("blocks cross-origin mutating api requests", async () => {
    const response = middleware(request("POST", "https://evil.example"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("allows same-origin mutating api requests", () => {
    const response = middleware(request("POST", "https://jobpipe.org"));

    expect(response.status).toBe(200);
  });

  it("allows server-to-server mutating api requests without origin", () => {
    const response = middleware(request("POST"));

    expect(response.status).toBe(200);
  });

  it("adds security headers to middleware responses", () => {
    const response = middleware(request("GET"));

    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("allows configured app origin behind a different request origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://jobpipe.org");

    const response = middleware(
      new NextRequest("https://internal.example/api/settings", {
        method: "POST",
        headers: { origin: "https://jobpipe.org" },
      }),
    );

    expect(response.status).toBe(200);
  });
});
