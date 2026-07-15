import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { UpdateSettingsRequestDto } from "@/types/input/settings.dto";
import type { SettingsResponseDto } from "@/types/output/settings.dto";

async function updateSettings(input: UpdateSettingsRequestDto): Promise<SettingsResponseDto> {
  const response = await fetch("/api/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update settings" }));
    throw new Error(error.error ?? "Failed to update settings");
  }

  return response.json();
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<SettingsResponseDto, Error, UpdateSettingsRequestDto>({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
