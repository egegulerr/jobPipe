import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ assetsDir: "" }));

vi.mock("@/server/local/database", () => ({
  get assetsDir() {
    return state.assetsDir;
  },
}));

import { GET } from "./route";

describe("GET /api/local-file", () => {
  beforeEach(() => {
    state.assetsDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobpipe-assets-test-"));
  });

  afterEach(() => {
    fs.rmSync(state.assetsDir, { recursive: true, force: true });
  });

  it("serves a local image by basename and detected content type", async () => {
    fs.writeFileSync(path.join(state.assetsDir, "profile.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]));

    const response = await GET(new Request("http://localhost/api/local-file?name=profile.png"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("rejects path traversal", async () => {
    const response = await GET(new Request("http://localhost/api/local-file?name=..%2Fsecret"));

    expect(response.status).toBe(400);
  });

  it("does not serve arbitrary local files", async () => {
    fs.writeFileSync(path.join(state.assetsDir, "notes.txt"), "private");

    const response = await GET(new Request("http://localhost/api/local-file?name=notes.txt"));

    expect(response.status).toBe(415);
  });
});
