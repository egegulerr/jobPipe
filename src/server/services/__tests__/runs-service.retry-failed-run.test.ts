import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRunsService, type RunExecutor } from "@/server/services/runs-service";

describe("retryFailedRun", () => {
  const getRunForUser = vi.fn();
  const retryRun = vi.fn();

  const runsService = createRunsService({
    runsRepository: { getRunForUser } as never,
    settingsRepository: {} as never,
    runExecutor: {
      startRun: vi.fn(),
      retryRun,
      generateDocuments: vi.fn(),
    } satisfies RunExecutor,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not found when the run does not exist", async () => {
    getRunForUser.mockResolvedValue({ data: null, error: null });

    await expect(runsService.retryFailedRun("run-1", "user-1")).resolves.toEqual({
      ok: false,
      status: 404,
      error: "RUN_NOT_FOUND",
    });
  });

  it("rejects a run that has not failed", async () => {
    getRunForUser.mockResolvedValue({ data: { status: "running" }, error: null });

    await expect(runsService.retryFailedRun("run-1", "user-1")).resolves.toEqual({
      ok: false,
      status: 409,
      error: "RUN_NOT_FAILED",
    });
  });

  it("restarts any failed local run", async () => {
    getRunForUser.mockResolvedValue({ data: { status: "failed" }, error: null });

    await expect(runsService.retryFailedRun("run-1", "user-1")).resolves.toEqual({ ok: true });
    expect(retryRun).toHaveBeenCalledWith("run-1");
  });

  it("returns a typed failure when restarting fails", async () => {
    getRunForUser.mockResolvedValue({ data: { status: "failed" }, error: null });
    retryRun.mockRejectedValue(new Error("restart failed"));

    await expect(runsService.retryFailedRun("run-1", "user-1")).resolves.toEqual({
      ok: false,
      status: 502,
      error: "RETRY_TRIGGER_FAILED",
    });
  });
});
