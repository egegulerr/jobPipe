import type { DocumentRenderType } from "@/lib/shared/document-template";
import { isNormalizedResumeExperienceH2, normalizeResumeH2Key } from "./document-constants";

/** Normalized `##` key for resume section tracking, or null when not applicable. */
export function resumeH2NormalizedKey(
  type: DocumentRenderType,
  headingDepth: number,
  headingText: string,
): string | null {
  if (type !== "resume" || headingDepth !== 2) return null;
  return normalizeResumeH2Key(headingText);
}

/** Strip **strong** inside bullets only under work-history-style section headings. */
export function resumeExperienceBulletSuppressStrong(
  type: DocumentRenderType,
  resumeLastH2TitleLower: string | null,
): boolean {
  return type === "resume" && isNormalizedResumeExperienceH2(resumeLastH2TitleLower);
}

/**
 * Detects job/education header lines (`**Role** *dates*` on one or two lines).
 * Returns merged markdown for inline rendering and how many following lines to skip.
 */
export function parseResumeRoleDateHeader(
  lines: readonly string[],
  lineIndex: number,
): { mergedMarkdown: string; extraLineSkips: number } | null {
  const line = lines[lineIndex]?.trim() ?? "";
  const boldOnlyMatch = line.match(/^\*\*([^*]+)\*\*$/);
  const nextTrimmed = lines[lineIndex + 1]?.trim() ?? "";
  const nextEmOnlyMatch = nextTrimmed.match(/^\*([^*]+)\*$/);
  if (boldOnlyMatch && nextEmOnlyMatch) {
    return {
      mergedMarkdown: `**${boldOnlyMatch[1]}** *${nextEmOnlyMatch[1]}*`,
      extraLineSkips: 1,
    };
  }
  const resumeHeaderMatch = line.match(/^\*\*([^*]+)\*\*\s+\*([^*]+)\*$/);
  if (resumeHeaderMatch) {
    return {
      mergedMarkdown: `**${resumeHeaderMatch[1]}** *${resumeHeaderMatch[2]}*`,
      extraLineSkips: 0,
    };
  }
  return null;
}
