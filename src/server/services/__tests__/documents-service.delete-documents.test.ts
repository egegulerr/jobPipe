import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRemove, mockLogEvent } = vi.hoisted(() => ({
  mockRemove: vi.fn(),
  mockLogEvent: vi.fn(),
}));

vi.mock("@/server/repositories/documents-repository", () => ({
  createDocumentsRepository: vi.fn(),
}));

vi.mock("@/server/shared/observability/logger", () => ({
  logEvent: mockLogEvent,
}));

import { createDocumentsRepository } from "@/server/repositories/documents-repository";
import { createDocumentsService } from "@/server/services/documents-service";

describe("deleteDocuments", () => {
  const documentsService = createDocumentsService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes document rows before attempting storage cleanup", async () => {
    const deleteDocumentsByIds = vi.fn().mockResolvedValue({
      data: [
        {
          id: "f95f9f74-b44c-4c74-a8bc-6cd9cb17e625",
          run_id: "run-1",
          storage_path: "user/user-1/resume.pdf",
          docx_storage_path: "user/user-1/resume.docx",
        },
      ],
      error: null,
    });
    const removeStorageObjects = vi.fn().mockImplementation(async (paths: string[]) => {
      const result = await mockRemove(paths);
      return result ?? { data: null, error: null };
    });

    vi.mocked(createDocumentsRepository).mockReturnValue({
      deleteDocumentsByIds,
      removeStorageObjects,
    } as never);
    mockRemove.mockResolvedValue({ data: null, error: null });

    const result = await documentsService.deleteDocuments(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );

    expect(deleteDocumentsByIds.mock.invocationCallOrder[0]).toBeLessThan(removeStorageObjects.mock.invocationCallOrder[0]);
    expect(removeStorageObjects).toHaveBeenCalledWith([
      "user/user-1/resume.pdf",
      "user/user-1/resume.docx",
    ]);
    expect(deleteDocumentsByIds).toHaveBeenCalledWith(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );
    expect(result).toEqual({
      ok: true,
      data: {
        deletedCount: 1,
        deletedIds: ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
        runIds: ["run-1"],
      },
    });
  });

  it("still succeeds when storage cleanup fails after the database delete", async () => {
    const deleteDocumentsByIds = vi.fn().mockResolvedValue({
      data: [
        {
          id: "f95f9f74-b44c-4c74-a8bc-6cd9cb17e625",
          run_id: "run-1",
          storage_path: "user/user-1/resume.pdf",
          docx_storage_path: "user/user-1/resume.docx",
        },
      ],
      error: null,
    });
    const removeStorageObjects = vi.fn().mockImplementation(async (paths: string[]) => {
      const result = await mockRemove(paths);
      return result ?? { data: null, error: null };
    });

    vi.mocked(createDocumentsRepository).mockReturnValue({
      deleteDocumentsByIds,
      removeStorageObjects,
    } as never);
    mockRemove.mockResolvedValue({
      data: null,
      error: { message: "storage cleanup failed" },
    });

    const result = await documentsService.deleteDocuments(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );

    expect(deleteDocumentsByIds).toHaveBeenCalledWith(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "warn",
        message: "Document storage cleanup failed after database delete",
        userId: "user-1",
        runId: "run-1",
        error: "storage cleanup failed",
      }),
    );
    expect(result).toEqual({
      ok: true,
      data: {
        deletedCount: 1,
        deletedIds: ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
        runIds: ["run-1"],
      },
    });
  });

  it("still succeeds when storage cleanup throws after the database delete", async () => {
    const deleteDocumentsByIds = vi.fn().mockResolvedValue({
      data: [
        {
          id: "f95f9f74-b44c-4c74-a8bc-6cd9cb17e625",
          run_id: "run-1",
          storage_path: "user/user-1/resume.pdf",
          docx_storage_path: "user/user-1/resume.docx",
        },
      ],
      error: null,
    });
    const removeStorageObjects = vi.fn().mockImplementation(async (paths: string[]) => {
      await mockRemove(paths);
      return { data: null, error: null };
    });

    vi.mocked(createDocumentsRepository).mockReturnValue({
      deleteDocumentsByIds,
      removeStorageObjects,
    } as never);
    mockRemove.mockRejectedValue(new Error("storage cleanup threw"));

    const result = await documentsService.deleteDocuments(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );

    expect(deleteDocumentsByIds).toHaveBeenCalledWith(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "warn",
        message: "Document storage cleanup failed after database delete",
        userId: "user-1",
        runId: "run-1",
        error: "storage cleanup threw",
      }),
    );
    expect(result).toEqual({
      ok: true,
      data: {
        deletedCount: 1,
        deletedIds: ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
        runIds: ["run-1"],
      },
    });
  });

  it("returns not found when a requested document is missing", async () => {
    vi.mocked(createDocumentsRepository).mockReturnValue({
      deleteDocumentsByIds: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "One or more documents were not found", code: "P0002" },
      }),
      removeStorageObjects: vi.fn(),
    } as never);

    const result = await documentsService.deleteDocuments(
      ["f95f9f74-b44c-4c74-a8bc-6cd9cb17e625"],
      "user-1",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.status).toBe(404);
    }
  });
});
