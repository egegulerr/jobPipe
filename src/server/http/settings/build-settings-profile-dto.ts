import type { UserProfile } from "@/server/domains/settings/settings.models";
import type { SettingsService } from "@/server/domains/settings/settings.interfaces";
import type { SettingsProfileDto } from "@/types/output/settings.dto";

type AuthProfileContext = {
  userId: string;
  email: string;
  avatarUrl: string | null;
};

export function resolveAvatarStoragePath(
  profileAvatarUrl: string | null | undefined,
  contextAvatarUrl: string | null | undefined,
): string | null {
  const path = profileAvatarUrl ?? contextAvatarUrl ?? null;
  return path?.trim() ? path.trim() : null;
}

export function buildSettingsProfileDto(input: {
  profile: UserProfile;
  userId: string;
  email: string;
  avatarStoragePath: string | null;
  resolvedAvatarUrl: string | null;
}): SettingsProfileDto {
  return {
    ...input.profile,
    userId: input.userId,
    email: input.email,
    avatarUrl: input.resolvedAvatarUrl,
    hasAvatar: Boolean(input.avatarStoragePath),
  };
}

export async function buildSettingsProfileDtoForContext(input: {
  profile: UserProfile;
  context: AuthProfileContext;
  settingsService: Pick<SettingsService, "getAvatarUrl">;
}): Promise<SettingsProfileDto> {
  const avatarStoragePath = resolveAvatarStoragePath(
    input.profile.avatarUrl,
    input.context.avatarUrl,
  );

  let resolvedAvatarUrl: string | null = null;
  if (avatarStoragePath) {
    const avatarUrlResult = await input.settingsService.getAvatarUrl(
      input.context.userId,
    );
    if (avatarUrlResult.ok && avatarUrlResult.data) {
      resolvedAvatarUrl = avatarUrlResult.data.url;
    }
  }

  return buildSettingsProfileDto({
    profile: input.profile,
    userId: input.context.userId,
    email: input.context.email,
    avatarStoragePath,
    resolvedAvatarUrl,
  });
}
