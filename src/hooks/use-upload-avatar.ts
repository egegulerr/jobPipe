import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.set("avatar", file);

  const response = await fetch("/api/settings/avatar", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to upload avatar" }));
    throw new Error(error.error ?? "Failed to upload avatar");
  }

  return response.json();
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation<{ avatarUrl: string }, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
