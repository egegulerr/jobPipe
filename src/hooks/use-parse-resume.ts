import { useMutation } from "@tanstack/react-query";
import type { ParseResumeResponseDto } from "@/types/output/settings.dto";

async function parseResume(file: File): Promise<ParseResumeResponseDto> {
  const formData = new FormData();
  formData.set("resume", file);

  const response = await fetch("/api/settings/parse-resume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to parse resume" }));
    throw new Error(error.error ?? "Failed to parse resume");
  }

  return response.json();
}

export function useParseResume() {
  return useMutation<ParseResumeResponseDto, Error, File>({
    mutationFn: parseResume,
  });
}
