import { describe, expect, it } from "vitest";

import {
  buildSettingsProfileDto,
  resolveAvatarStoragePath,
} from "@/server/http/settings/build-settings-profile-dto";

const baseProfile = {
  userId: "local",
  email: "user@example.com",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  bio: null,
  avatarUrl: null,
};

describe("buildSettingsProfileDto", () => {
  it("sets hasAvatar from storage even when no avatar URL is available", () => {
    const profile = buildSettingsProfileDto({
      profile: baseProfile,
      userId: "local",
      email: "user@example.com",
      avatarStoragePath: "user/user-1/avatars/profile",
      resolvedAvatarUrl: null,
    });

    expect(profile.hasAvatar).toBe(true);
    expect(profile.avatarUrl).toBeNull();
  });

  it("sets hasAvatar false when no storage path exists", () => {
    const profile = buildSettingsProfileDto({
      profile: {
        ...baseProfile,
        firstName: null,
        lastName: null,
      },
      userId: "local",
      email: "user@example.com",
      avatarStoragePath: null,
      resolvedAvatarUrl: null,
    });

    expect(profile.hasAvatar).toBe(false);
  });
});

describe("resolveAvatarStoragePath", () => {
  it("prefers profile path over context path", () => {
    expect(
      resolveAvatarStoragePath("user/a/avatars/profile", "user/b/avatars/profile"),
    ).toBe("user/a/avatars/profile");
  });

  it("returns null for blank paths", () => {
    expect(resolveAvatarStoragePath("  ", null)).toBeNull();
  });
});
