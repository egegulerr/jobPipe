export type InlineSegment = {
  kind: "normal" | "strong" | "em";
  text: string;
};

/** Security and rendering limits to prevent DoS attacks and memory exhaustion. */
export const RENDER_LIMITS = {
  /** Maximum markdown content size: 10MB */
  MAX_MARKDOWN_LENGTH: 10 * 1024 * 1024,
  /** Maximum line length: 10,000 characters */
  MAX_LINE_LENGTH: 10000,
  /** Maximum number of lines: 10,000 */
  MAX_LINES: 10000,
  /** Maximum inline segments per line: 100,000 */
  MAX_SEGMENTS: 100000,
} as const;

/** Font size thresholds for readability adjustments. */
export const FONT_SIZE_THRESHOLDS = {
  /** Minimum readable font size in points */
  MINIMUM_READABLE_SIZE_PT: 8,
} as const;

export const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f-\u009f]/g;

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;
const LATIN_EXTENDED_REGEX = /[\u0100-\u024f]/g;

/**
 * Decodes HTML entities and strips HTML tags.
 *
 * ⚠️ SECURITY WARNING: This function decodes HTML entities back to their
 * raw character equivalents. The output should NOT be used in HTML contexts
 * without proper escaping, as it could lead to XSS vulnerabilities.
 *
 * This function is safe for PDF/DOCX document generation where content
 * is rendered in a non-HTML context.
 *
 * @param value - String containing HTML entities
 * @returns Decoded string with HTML tags removed
 */
export function cleanHtmlEntities(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  let cleaned = value;
  // Remove HTML tags (up to 3 iterations to handle nested tags)
  for (let i = 0; i < 3; i++) {
    const prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
    if (cleaned === prev) break;
  }
  return decodeHtmlEntitiesOnly(cleaned);
}

/**
 * Decodes common HTML entities without removing angle-bracket text (e.g. `Name <email@example.com>`).
 * Use for plain-text / PDF contexts where literal `<...>` must be preserved.
 */
export function decodeHtmlEntitiesOnly(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function normalizeExtendedLatin(text: string): string {
  return text.replace(LATIN_EXTENDED_REGEX, (char) =>
    char.normalize("NFKD").replace(COMBINING_MARKS_REGEX, ""),
  );
}

export function stripInlineMarkdown(
  value: string,
  cleanText: (value: string) => string,
): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  const truncated = value.slice(0, RENDER_LIMITS.MAX_MARKDOWN_LENGTH);
  return cleanText(
    truncated
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1"),
  ).trim();
}

/**
 * Parses inline markdown formatting using a state machine approach.
 * This avoids ReDoS vulnerabilities present in regex-based parsers.
 *
 * Supported formats:
 * - **bold** (strong)
 * - *italic* (emphasis)
 * - `code` (normal text, formatting stripped)
 * - [link text](url) (normal text, URL stripped)
 */
export function parseInlineSegments(
  line: string,
  cleanInlineText: (value: string) => string,
): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let currentText = "";
  let i = 0;

  const pushCurrentText = (kind: "normal" = "normal") => {
    if (currentText.length > 0) {
      const cleaned = cleanInlineText(currentText);
      if (cleaned.length > 0) {
        segments.push({ kind, text: cleaned });
      }
      currentText = "";
    }
  };

  while (i < line.length && segments.length < RENDER_LIMITS.MAX_SEGMENTS) {
    const char = line[i];
    const nextChar = line[i + 1];

    // Check for bold: **text**
    if (char === "*" && nextChar === "*") {
      pushCurrentText();
      const end = line.indexOf("**", i + 2);
      if (end !== -1 && end > i + 2) {
        const content = line.slice(i + 2, end);
        const cleaned = cleanInlineText(content);
        if (cleaned.length > 0) {
          segments.push({ kind: "strong", text: cleaned });
        }
        i = end + 2;
        continue;
      }
      if (end === i + 2) {
        const hasAdjacentDoubleStar = i + 3 < line.length && line[i + 2] === "*" && line[i + 3] === "*";
        if (hasAdjacentDoubleStar) {
          currentText += "****";
          i += 4;
          continue;
        }
        i += 2;
        continue;
      }
      if (end === -1) {
        currentText += char;
        i += 1;
        continue;
      }
    }

    // Check for italic: *text*
    if (char === "*") {
      pushCurrentText();
      const end = line.indexOf("*", i + 1);
      if (end !== -1 && end > i + 1) {
        const content = line.slice(i + 1, end);
        const cleaned = cleanInlineText(content);
        if (cleaned.length > 0) {
          segments.push({ kind: "em", text: cleaned });
        }
        i = end + 1;
        continue;
      }
      if (end === i + 1) {
        i += 1;
        continue;
      }
      if (end === -1) {
        currentText += char;
        i += 1;
        continue;
      }
    }

    // Check for code: `text`
    if (char === "`") {
      pushCurrentText();
      const end = line.indexOf("`", i + 1);
      if (end !== -1 && end > i + 1) {
        const content = line.slice(i + 1, end);
        const cleaned = cleanInlineText(content);
        if (cleaned.length > 0) {
          segments.push({ kind: "normal", text: cleaned });
        }
        i = end + 1;
        continue;
      }
      if (end === i + 1) {
        i += 1;
        continue;
      }
      if (end === -1) {
        currentText += char;
        i += 1;
        continue;
      }
    }

    // Check for link: [text](url)
    if (char === "[") {
      const closeBracket = line.indexOf("]", i + 1);
      const openParen = closeBracket !== -1 ? line.indexOf("(", closeBracket) : -1;
      const closeParen = openParen !== -1 ? line.indexOf(")", openParen) : -1;

      if (
        closeBracket !== -1 &&
        openParen === closeBracket + 1 &&
        closeParen !== -1 &&
        closeParen > openParen + 1
      ) {
        pushCurrentText();
        const linkText = line.slice(i + 1, closeBracket);
        const cleaned = cleanInlineText(linkText);
        if (cleaned.length > 0) {
          segments.push({ kind: "normal", text: cleaned });
        }
        i = closeParen + 1;
        continue;
      }
    }

    currentText += char;
    i++;
  }

  // Push any remaining text
  pushCurrentText();

  return segments.filter((segment) => segment.text.length > 0);
}

/**
 * Normalizes markdown content into lines with security limits.
 *
 * @param markdown - Raw markdown content
 * @returns Array of normalized lines
 * @throws Error if content exceeds maximum length
 */
export function normalizeMarkdownLines(markdown: string): string[] {
  if (!markdown || typeof markdown !== "string") {
    return [];
  }

  if (markdown.length > RENDER_LIMITS.MAX_MARKDOWN_LENGTH) {
    throw new Error(
      `Markdown content exceeds maximum allowed length of ${RENDER_LIMITS.MAX_MARKDOWN_LENGTH} bytes`
    );
  }

  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .slice(0, RENDER_LIMITS.MAX_LINES)
    .map((line) => line.slice(0, RENDER_LIMITS.MAX_LINE_LENGTH));
}
