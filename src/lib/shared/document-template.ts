export type DocumentRenderType = "resume" | "cover_letter";

export type ProfileImageRenderInput = {
  buffer: Uint8Array;
  mimeType: string;
};

export type RenderInput = {
  type: DocumentRenderType;
  title: string;
  markdown: string;
  profileImage?: ProfileImageRenderInput;
  /** Resume design to render. Defaults to "classic" when omitted. Applies to resume only. */
  resumeTemplateId?: ResumeTemplateId;
};

export type DocumentTemplate = {
  marginPt: number;
  bodyFont: string;
  headingFont: string;
  textColor: string;
  mutedTextColor: string;
  bodyFontSizePt: number;
  bodyLineGapPt: number;
  heading1FontSizePt: number;
  heading2FontSizePt: number;
  heading3FontSizePt: number;
  heading2DividerWidthPt: number;
  heading2TopGapPt: number;
  heading2BottomGapPt: number;
  paragraphBottomGapPt: number;
  bulletIndentPt: number;
  bulletGapPt: number;
  dateFontSizePt: number;
};

/**
 * User-selectable resume designs. Both are ATS-safe: single column,
 * real selectable text, standard PDF/DOCX fonts, no tables or sidebars.
 * Add new designs here and register them in RESUME_DESIGNS below.
 */
export type ResumeTemplateId = "classic" | "modern_sans";

export const DEFAULT_RESUME_TEMPLATE_ID: ResumeTemplateId = "classic";

const RESUME_TEMPLATE_IDS: ReadonlySet<ResumeTemplateId> = new Set([
  "classic",
  "modern_sans",
]);

export function isResumeTemplateId(value: unknown): value is ResumeTemplateId {
  return typeof value === "string" && RESUME_TEMPLATE_IDS.has(value as ResumeTemplateId);
}

export type ResumeDesign = {
  id: ResumeTemplateId;
  label: string;
  description: string;
  template: DocumentTemplate;
};

/**
 * Single source of truth for resume designs. The wizard, review step, run
 * settings, and both PDF/DOCX renderers all read from this registry.
 * `classic` mirrors DOCUMENT_TEMPLATES.resume so existing output is unchanged.
 */
export const RESUME_DESIGNS: Record<ResumeTemplateId, ResumeDesign> = {
  classic: {
    id: "classic",
    label: "Classic",
    description:
      "Traditional serif resume with bold section dividers. The standard ATS-friendly layout.",
    template: {
      marginPt: 36,
      /** Word/LibreOffice family name; PDF renderer maps this to PDFKit's Times-Roman. */
      bodyFont: "Times New Roman",
      headingFont: "Times-Bold",
      textColor: "#000000",
      /** Muted inline (e.g. date ranges in *em*); PDF uses italic + this color for distinction. */
      mutedTextColor: "#959ba6",
      bodyFontSizePt: 9,
      bodyLineGapPt: 1.2,
      heading1FontSizePt: 16,
      heading2FontSizePt: 11,
      heading3FontSizePt: 9,
      heading2DividerWidthPt: 2.5,
      heading2TopGapPt: 12,
      heading2BottomGapPt: 2,
      paragraphBottomGapPt: 2,
      bulletIndentPt: 18,
      bulletGapPt: 2,
      dateFontSizePt: 8,
    },
  },
  modern_sans: {
    id: "modern_sans",
    label: "Modern Sans",
    description:
      "Clean Helvetica layout with uppercase, letter-spaced section labels and no dividers. Contemporary and easy to scan.",
    template: {
      marginPt: 36,
      bodyFont: "Helvetica",
      headingFont: "Helvetica-Bold",
      textColor: "#1a1a1a",
      mutedTextColor: "#6b7280",
      bodyFontSizePt: 9.5,
      bodyLineGapPt: 1.4,
      heading1FontSizePt: 18,
      heading2FontSizePt: 10,
      heading3FontSizePt: 9.5,
      heading2DividerWidthPt: 0,
      heading2TopGapPt: 11,
      heading2BottomGapPt: 3,
      paragraphBottomGapPt: 2.5,
      bulletIndentPt: 16,
      bulletGapPt: 2,
      dateFontSizePt: 8.5,
    },
  },
};

/**
 * Returns the design for the given id, falling back to "classic" for unknown
 * or missing values. Used by the renderers when reading the persisted run
 * config value.
 */
export function resolveResumeTemplate(id: string | null | undefined): ResumeDesign {
  if (isResumeTemplateId(id)) {
    return RESUME_DESIGNS[id];
  }
  return RESUME_DESIGNS[DEFAULT_RESUME_TEMPLATE_ID];
}

export const DOCUMENT_TEMPLATES: Record<DocumentRenderType, DocumentTemplate> = {
  resume: RESUME_DESIGNS.classic.template,
  cover_letter: {
    marginPt: 36,
    bodyFont: "Helvetica",
    headingFont: "Times-Bold",
    textColor: "#000000",
    mutedTextColor: "#959ba6",
    bodyFontSizePt: 10,
    bodyLineGapPt: 3,
    heading1FontSizePt: 14,
    heading2FontSizePt: 12,
    heading3FontSizePt: 11,
    heading2DividerWidthPt: 0,
    heading2TopGapPt: 10,
    heading2BottomGapPt: 6,
    paragraphBottomGapPt: 12,
    bulletIndentPt: 18,
    bulletGapPt: 6,
    dateFontSizePt: 10,
  },
};

export function isDocumentRenderType(value: string): value is DocumentRenderType {
  return value === "resume" || value === "cover_letter";
}
