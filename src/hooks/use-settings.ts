import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { SettingsResponseDto } from "@/types/output/settings.dto";

async function fetchSettings(): Promise<SettingsResponseDto> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }
  return response.json();
}

export function useSettings(options?: Pick<UseQueryOptions<SettingsResponseDto, Error>, "enabled">) {
  return useQuery<SettingsResponseDto, Error>({
    queryKey: queryKeys.settings.all,
    queryFn: fetchSettings,
    ...options,
  });
}
