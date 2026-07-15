import path from "node:path";
import type {
  SettingsService,
  SettingsRepository,
  UpdateUserSettingsInput,
} from "@/server/domains/settings/settings.interfaces";
import type { FullUserSettings } from "@/server/domains/settings/settings.models";
import { createSettingsRepository } from "@/server/repositories/settings-repository";
import { fail, infra, notFound, ok } from "@/server/shared/result";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function defaultProfile(userId: string) {
  return {
    userId,
    displayName: "",
    firstName: null,
    lastName: null,
    email: "",
    bio: null,
    avatarUrl: null,
  };
}

function buildAvatarStoragePath(userId: string, contentType: string) {
  return `user/${userId}/avatars/profile.${AVATAR_EXTENSIONS[contentType]}`;
}

function localAvatarUrl(storagePath: string) {
  return `/api/local-file?name=${encodeURIComponent(path.basename(storagePath))}`;
}

export function createSettingsService(
  deps: { settingsRepository?: SettingsRepository } = {},
): SettingsService {
  const settingsRepository = deps.settingsRepository ?? createSettingsRepository();

  async function getUserSettings(userId: string) {
    const { data, error } = await settingsRepository.getFullUserSettings(userId);

    if (error) {
      return infra(error.message);
    }

    if (!data) {
      return ok({
        profile: defaultProfile(userId),
        experiences: [],
        skills: [],
        languages: [],
        technologies: [],
        certifications: [],
      } satisfies FullUserSettings);
    }

    return ok(data);
  }

  async function updateUserSettings(userId: string, input: UpdateUserSettingsInput) {
    const hasPatch =
      input.profile !== undefined ||
      input.experiences !== undefined ||
      input.skills !== undefined ||
      input.languages !== undefined ||
      input.technologies !== undefined ||
      input.certifications !== undefined;

    if (!hasPatch) {
      return getUserSettings(userId);
    }

    const { error } = await settingsRepository.patchUserSettings(userId, {
      profile: input.profile
        ? {
            first_name: input.profile.firstName,
            last_name: input.profile.lastName,
            display_name: input.profile.displayName,
            bio: input.profile.bio,
          }
        : undefined,
      experiences: input.experiences,
      skills: input.skills,
      languages: input.languages,
      technologies: input.technologies,
      certifications: input.certifications,
    });

    if (error) {
      return infra(error.message ? `Failed to update settings: ${error.message}` : "Failed to update settings");
    }

    return getUserSettings(userId);
  }

  async function uploadAvatar(userId: string, file: File) {
    if (file.size > MAX_AVATAR_SIZE) {
      return fail("VALIDATION", "Avatar file exceeds 2MB size limit", 400);
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      return fail("VALIDATION", "Avatar must be a JPEG, PNG, or WebP image", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const storagePath = buildAvatarStoragePath(userId, file.type);

    const { error: uploadError } = await settingsRepository.uploadAvatar(
      userId,
      storagePath,
      buffer,
      file.type,
    );

    if (uploadError) {
      return infra(uploadError.message);
    }

    const { error: updateError } = await settingsRepository.updateUserProfile(userId, {
      avatarUrl: storagePath,
    });

    if (updateError) {
      return infra(updateError.message);
    }

    return ok({ avatarUrl: localAvatarUrl(storagePath) });
  }

  async function getAvatarUrl(userId: string) {
    const { data, error } = await settingsRepository.getUserProfile(userId);

    if (error) {
      return infra(error.message);
    }
    if (!data?.avatarUrl) return notFound("Avatar not found");

    return ok({ url: localAvatarUrl(data.avatarUrl) });
  }

  return {
    getUserSettings,
    updateUserSettings,
    uploadAvatar,
    getAvatarUrl,
  };
}
