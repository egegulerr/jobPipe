import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SettingsRepository } from "@/server/domains/settings/settings.interfaces";
import { createSettingsService } from "@/server/services/settings-service";

function createMockRepository(overrides: Partial<SettingsRepository> = {}): SettingsRepository {
  return {
    getUserProfile: vi.fn().mockResolvedValue({ data: null, error: null }),
    getFullUserSettings: vi.fn().mockResolvedValue({ data: null, error: null }),
    getRunProfileReadiness: vi.fn().mockResolvedValue({ data: null, error: null }),
    updateUserProfile: vi.fn(),
    patchUserSettings: vi.fn().mockResolvedValue({ error: null }),
    uploadAvatar: vi.fn(),
    ...overrides,
  };
}

describe("settings-service updateUserSettings", () => {
  const patchUserSettings = vi.fn().mockResolvedValue({ error: null });
  const getFullUserSettings = vi.fn();

  const fullSettingsFixture = {
    profile: {
      userId: "user-1",
      displayName: "ada",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      bio: null,
      avatarUrl: null,
    },
    experiences: [],
    skills: [],
    languages: [],
    technologies: [],
    certifications: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    patchUserSettings.mockResolvedValue({ error: null });
    getFullUserSettings.mockResolvedValue({
      data: fullSettingsFixture,
      error: null,
    });
  });

  function createService() {
    return createSettingsService({
      settingsRepository: createMockRepository({
        patchUserSettings,
        getFullUserSettings,
      }),
    });
  }

  it("applies all changed sections in a single patchUserSettings call", async () => {
    const service = createService();

    const result = await service.updateUserSettings("user-1", {
      profile: { firstName: "Ada", lastName: "Lovelace", displayName: "ada", bio: "Engineer" },
      experiences: [
        {
          title: "Developer",
          type: "experience",
          organization: "ACME",
          dateRange: "2020–Present",
          description: "Built things",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(patchUserSettings).toHaveBeenCalledTimes(1);
    expect(patchUserSettings).toHaveBeenCalledWith("user-1", {
      profile: {
        first_name: "Ada",
        last_name: "Lovelace",
        display_name: "ada",
        bio: "Engineer",
      },
      experiences: [
        {
          type: "experience",
          title: "Developer",
          organization: "ACME",
          dateRange: "2020–Present",
          description: "Built things",
        },
      ],
      skills: undefined,
      languages: undefined,
      technologies: undefined,
      certifications: undefined,
    });
  });

  it("does not call patchUserSettings when the payload is empty", async () => {
    const service = createService();

    const result = await service.updateUserSettings("user-1", {});

    expect(result.ok).toBe(true);
    expect(patchUserSettings).not.toHaveBeenCalled();
    expect(getFullUserSettings).toHaveBeenCalled();
  });

  it("passes row ids through to patchUserSettings when provided", async () => {
    const service = createService();

    await service.updateUserSettings("user-1", {
      experiences: [
        {
          id: "exp-uuid",
          title: "Engineer",
          type: "experience",
        },
      ],
      skills: [{ id: "skill-uuid", name: "Leadership" }],
      languages: [{ id: "lang-uuid", name: "English", proficiency: "Native" }],
      technologies: [{ id: "tech-uuid", name: "React" }],
      certifications: [{ id: "cert-uuid", name: "AWS SA" }],
    });

    expect(patchUserSettings).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        experiences: [expect.objectContaining({ id: "exp-uuid" })],
        skills: [expect.objectContaining({ id: "skill-uuid" })],
        languages: [expect.objectContaining({ id: "lang-uuid" })],
        technologies: [expect.objectContaining({ id: "tech-uuid" })],
        certifications: [expect.objectContaining({ id: "cert-uuid" })],
      }),
    );
  });

  it("returns an infra error when patchUserSettings fails", async () => {
    patchUserSettings.mockResolvedValue({ error: { message: "constraint violation" } });
    const service = createService();

    const result = await service.updateUserSettings("user-1", {
      skills: [{ name: "TypeScript" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("constraint violation");
    }
    expect(getFullUserSettings).not.toHaveBeenCalled();
  });
});
