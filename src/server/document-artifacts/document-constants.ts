/**
 * Document rendering conversion constants.
 *
 * DOCX uses half-points for font sizes (e.g., 12pt = 24 half-points)
 * DOCX uses twips (twentieths of a point) for spacing
 * DOCX uses 240ths of a line for line spacing
 * DOCX uses eighths of a point for border widths
 */

export const DOCX_CONVERSIONS = {
  pointsToHalfPoints: (pt: number) => pt * 2,
  pointsToTwips: (pt: number) => pt * 20,
  pointsToLineSpacing: (pt: number) => pt * 240,
  pointsToBorderEighths: (pt: number) => pt * 8,
} as const;

/** DOCX spacing constants in twips (twentieths of a point). */
export const DOCX_SPACING = {
  /** Default spacing before non-heading paragraphs */
  DEFAULT_BEFORE_TWIPS: 100,
  /** Default spacing after non-heading paragraphs */
  DEFAULT_AFTER_TWIPS: 40,
} as const;

/** PDF rendering constants. */
export const PDF_RENDER_CONSTANTS = {
  /** Line break ratio for resume content */
  resumeMoveDownRatio: 0.16,
  /** Line break ratio for cover letter content */
  coverLetterMoveDownRatio: 0.3,
  /** Gap between columns in two-column layout (points) */
  twoColumnGapPt: 12,
  /** Move down after regular content */
  regularMoveDown: 0.2,
  /** Move down after heading with divider */
  headingWithDividerMoveDown: 0.35,
} as const;

/** Resume template variation configurations. */
export const RESUME_TEMPLATE_VARIATIONS = {
  compact: {
    marginPt: 30,
    bodyFontSizePt: 6.4,
    bodyLineGapPt: 0.6,
    heading1FontSizePt: 13,
    heading2FontSizePt: 9.2,
    heading3FontSizePt: 7.2,
    heading2TopGapPt: 7,
    heading2BottomGapPt: 1.2,
    paragraphBottomGapPt: 1,
    bulletIndentPt: 12,
    bulletGapPt: 0.9,
    dateFontSizePt: 7.2,
  },
  tight: {
    marginPt: 24,
    bodyFontSizePt: 5.9,
    bodyLineGapPt: 0.3,
    heading1FontSizePt: 12.2,
    heading2FontSizePt: 8.4,
    heading3FontSizePt: 6.8,
    heading2TopGapPt: 4.5,
    heading2BottomGapPt: 0.8,
    paragraphBottomGapPt: 0.5,
    bulletIndentPt: 10,
    bulletGapPt: 0.35,
    dateFontSizePt: 6.8,
  },
} as const;

/** Maximum output buffer sizes. */
export const OUTPUT_LIMITS = {
  /** Maximum PDF output size: 50MB */
  MAX_PDF_SIZE_BYTES: 50 * 1024 * 1024,
  /** Maximum DOCX output size: 50MB */
  MAX_DOCX_SIZE_BYTES: 50 * 1024 * 1024,
} as const;

/** Heading depth to font size property mapping. */
export const HEADING_SIZE_MAP: Record<number, string> = {
  1: "heading1FontSizePt",
  2: "heading2FontSizePt",
  3: "heading3FontSizePt",
} as const;

/** Normalized `##` titles that use the two-column bullet layout (dense lists). */
const RESUME_TWO_COLUMN_SECTION_TITLES = new Set([
  "technical skills",
  "courses",
  "additional information",
]);

/** `##` headings whose bullet lines should not use bold emphasis (entry header lines stay bold). */
const RESUME_EXPERIENCE_SECTION_H2 = new Set(
  [
    "experience",
    "professional experience",
    "work experience",
    "relevant experience",
    "employment",
    "employment history",
    "career history",
    "professional background",
    "work history",
  ].map((s) => s.toLowerCase()),
);

/** Normalized key for comparing `##` titles (lowercase, collapsed whitespace). */
export function normalizeResumeH2Key(headingText: string): string {
  return headingText.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isResumeExperienceSectionHeading(headingText: string): boolean {
  return RESUME_EXPERIENCE_SECTION_H2.has(normalizeResumeH2Key(headingText));
}

/** When the key is already normalized (e.g. cached from a `##` line), avoids re-normalizing per bullet. */
export function isNormalizedResumeExperienceH2(key: string | null): boolean {
  return Boolean(key && RESUME_EXPERIENCE_SECTION_H2.has(key));
}

export function isNormalizedTwoColumnResumeH2Key(key: string | null): boolean {
  return Boolean(key && RESUME_TWO_COLUMN_SECTION_TITLES.has(key));
}

/** PDF layout constants (points). */
export const PDF_LAYOUT = {
  /** Vertical offset for heading divider line below text */
  HEADING_DIVIDER_OFFSET_PT: 1,
  /** Square profile photo size on resume PDF (top-right). */
  PROFILE_IMAGE_SIZE_PT: 72,
  /** Shift photo upward from the content top margin to clear the first section divider. */
  PROFILE_IMAGE_TOP_OFFSET_PT: 14,
} as const;
