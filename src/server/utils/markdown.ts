import type { DocumentRenderType } from "@/lib/shared/document-template";
import {
  stripInlineMarkdown,
  decodeHtmlEntitiesOnly,
  CONTROL_CHARS_REGEX,
  RENDER_LIMITS,
} from "@/server/document-artifacts/markdown-inline";

const WRAPPED_CODE_BLOCK_REGEX = /^```[^\n`]*\n?([\s\S]*?)\n?```$/;
const FIRST_CODE_BLOCK_REGEX = /```[^\n`]*\n?([\s\S]*?)\n?```/;
const THEMATIC_BREAK_REGEX = /^(?:-{3,}|\*{3,}|_{3,})$/;
const CODE_FENCE_LINE_REGEX = /^```/;

function cleanPlainForCoverLetter(value: string): string {
  return decodeHtmlEntitiesOnly(value).replace(CONTROL_CHARS_REGEX, " ");
}

/**
 * Normalizes motivation/cover letter markdown to plain letter styling: no ATX headings,
 * list markers, or inline bold/italic/code — matching the PDF/DOCX renderer's plain-text letter layout.
 */
export function normalizeCoverLetterMarkdown(input: string): string {
  if (input.length > RENDER_LIMITS.MAX_MARKDOWN_LENGTH) {
    throw new Error(
      `Markdown content exceeds maximum allowed length of ${RENDER_LIMITS.MAX_MARKDOWN_LENGTH} bytes`,
    );
  }

  const normalized = input.replace(/\r\n?/g, "\n");
  if (!normalized.trim()) {
    return normalized.trim();
  }

  const lines = normalized.split("\n");
  const out: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed === "") {
      out.push("");
      continue;
    }
    if (THEMATIC_BREAK_REGEX.test(trimmed) || CODE_FENCE_LINE_REGEX.test(trimmed)) {
      continue;
    }

    let t = trimmed.replace(/^#{1,6}\s+/, "");
    t = t.replace(/^[-*]\s+/, "");
    t = t.replace(/^\d+\.\s+/, "");
    t = stripInlineMarkdown(t, cleanPlainForCoverLetter);
    if (t) {
      out.push(t);
    }
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** LLM raw output → stored cover letter markdown (code fences + plain letter). */
export function normalizeGeneratedCoverLetterMarkdown(raw: string): string {
  if (raw.length > RENDER_LIMITS.MAX_MARKDOWN_LENGTH) {
    throw new Error(
      `Markdown content exceeds maximum allowed length of ${RENDER_LIMITS.MAX_MARKDOWN_LENGTH} bytes`,
    );
  }
  return normalizeCoverLetterMarkdown(normalizeGeneratedMarkdown(raw));
}

export function markdownSourceForDocumentRender(
  type: DocumentRenderType,
  markdown: string,
): string {
  return type === "cover_letter" ? normalizeCoverLetterMarkdown(markdown) : markdown;
}

export function normalizeGeneratedMarkdown(input: string): string {
  const normalized = input
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
  if (!normalized) {
    return "";
  }

  const wrappedMatch = normalized.match(WRAPPED_CODE_BLOCK_REGEX);
  if (wrappedMatch?.[1]) {
    return wrappedMatch[1].trim();
  }

  if (normalized.includes("```")) {
    const firstBlockMatch = normalized.match(FIRST_CODE_BLOCK_REGEX);
    if (firstBlockMatch?.[1]) {
      return firstBlockMatch[1].trim();
    }

    return normalized.replace(/```/g, "").trim();
  }

  return normalized;
}
