import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/documents-repository", () => ({
  createDocumentsRepository: vi.fn(),
}));

import { createDocumentsRepository } from "@/server/repositories/documents-repository";
import { createDocumentsService } from "@/server/services/documents-service";

describe("listUserDocuments", () => {
  const documentsService = createDocumentsService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns INFRA when repository query fails", async () => {
    vi.mocked(createDocumentsRepository).mockReturnValue({
      listUserDocumentRuns: vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } }),
      getUserStorageSummary: vi.fn().mockResolvedValue({ data: { usedBytes: 0, cleanupCandidateSummary: null }, error: null }),
    } as never);

    const result = await documentsService.listUserDocuments({ userId: "user-1", page: 1, pageSize: 10 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INFRA");
      expect(result.error.status).toBe(500);
    }
  });

  it("maps repository fields into run summaries", async () => {
    vi.mocked(createDocumentsRepository).mockReturnValue({
      listUserDocumentRuns: vi.fn().mockResolvedValue({
        data: {
          runs: [
            {
              run_id: "run-1",
              run_name: "Run run-1",
              document_count: 2,
              newest_created_at: "2026-02-13T10:00:00.000Z",
            },
          ],
          totalRuns: 1,
          totalDocuments: 2,
          filterOptions: {
            types: ["resume"],
            runs: [{ value: "run-1", label: "Run run-1" }],
          },
        },
        error: null,
      }),
      getUserStorageSummary: vi.fn().mockResolvedValue({
        data: {
          usedBytes: 8 * 1024 * 1024,
          cleanupCandidateSummary: null,
        },
        error: null,
      }),
    } as never);

    const result = await documentsService.listUserDocuments({ userId: "user-1", page: 1, pageSize: 10 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.runs).toEqual([
        {
          runId: "run-1",
          runName: "Run run-1",
          documentCount: 2,
          newestCreatedAt: "2026-02-13T10:00:00.000Z",
        },
      ]);
      expect(result.data.storage.status).toBe("ok");
      expect(result.data.pagination.totalItems).toBe(1);
      expect(result.data.pagination.totalDocuments).toBe(2);
    }
  });

  it("returns storage warning notice when usage is high", async () => {
    vi.mocked(createDocumentsRepository).mockReturnValue({
      listUserDocumentRuns: vi.fn().mockResolvedValue({
        data: {
          runs: [],
          totalRuns: 0,
          totalDocuments: 0,
          filterOptions: {
            types: [],
            runs: [],
          },
        },
        error: null,
      }),
      getUserStorageSummary: vi.fn().mockResolvedValue({
        data: {
          usedBytes: 45 * 1024 * 1024,
          cleanupCandidateSummary: {
            runId: "run-1",
            createdAt: "2026-02-01T10:00:00.000Z",
            documentCount: 2,
          },
        },
        error: null,
      }),
    } as never);

    const result = await documentsService.listUserDocuments({ userId: "user-1", page: 1, pageSize: 10 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.storage.status).toBe("warning");
      expect(result.data.notice?.code).toBe("storage_warning");
    }
  });
});

describe("listUserDocumentsForRun", () => {
  const documentsService = createDocumentsService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps repository documents into summaries", async () => {
    vi.mocked(createDocumentsRepository).mockReturnValue({
      listUserDocumentsForRun: vi.fn().mockResolvedValue({
        data: {
          documents: [
            {
              id: "doc-2",
              run_id: "run-2",
              run_name: "Run run-2",
              job_id: null,
              type: "cover_letter",
              title: "Cover Letter",
              created_at: "2026-02-13T11:00:00.000Z",
              job_title: null,
              company_name: null,
              apply_url: null,
              job_link: null,
            },
          ],
        },
        error: null,
      }),
    } as never);

    const result = await documentsService.listUserDocumentsForRun({
      userId: "user-1",
      runId: "run-2",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.documents[0]?.jobTitle).toBeNull();
      expect(result.data.documents[0]?.runName).toBe("Run run-2");
    }
  });
});
