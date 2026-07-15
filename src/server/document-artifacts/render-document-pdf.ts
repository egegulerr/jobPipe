// Use standalone build so standard font metrics are bundled (no AFM filesystem reads at runtime).
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import type PDFKit from "pdfkit";

import {
  DOCUMENT_TEMPLATES,
  RESUME_DESIGNS,
  DEFAULT_RESUME_TEMPLATE_ID,
  type DocumentRenderType,
  type DocumentTemplate,
  type RenderInput,
} from "@/lib/shared/document-template";
import {
  normalizeMarkdownLines,
  parseInlineSegments,
  stripInlineMarkdown,
  cleanHtmlEntities,
  normalizeExtendedLatin,
  CONTROL_CHARS_REGEX,
  FONT_SIZE_THRESHOLDS,
} from "./markdown-inline";
import { markdownSourceForDocumentRender } from "@/server/utils/markdown";
import {
  PDF_RENDER_CONSTANTS,
  PDF_LAYOUT,
  OUTPUT_LIMITS,
  RESUME_TEMPLATE_VARIATIONS,
  isNormalizedTwoColumnResumeH2Key,
} from "./document-constants";
import {
  parseResumeRoleDateHeader,
  resumeExperienceBulletSuppressStrong,
  resumeH2NormalizedKey,
} from "./resume-markdown-layout";

type RenderPdfInput = RenderInput & {
  profileImageDataUri?: string;
};

type InlineRenderOptions = {
  isPostNameLine?: boolean;
  indent?: number;
  prefix?: string;
  x?: number;
  y?: number;
  width?: number;
  /** When true, **strong** segments render like normal body text (e.g. experience bullets). */
  suppressStrong?: boolean;
};

function cleanPlainText(value: string): string {
  const cleaned = cleanHtmlEntities(value);
  return cleaned.replace(CONTROL_CHARS_REGEX, " ");
}

function cleanInlineText(value: string): string {
  return normalizeExtendedLatin(cleanPlainText(value));
}

function stripInlineMarkdownPdf(value: string): string {
  return stripInlineMarkdown(value, cleanPlainText);
}

/** Map logical font names (e.g. Word family names) to PDFKit standard font names. */
function pdfKitFontName(logicalFont: string): string {
  if (logicalFont === "Times New Roman") {
    return "Times-Roman";
  }
  return logicalFont;
}

function resolveStrongFont(basePdfFont: string): string {
  if (basePdfFont === "Helvetica") {
    return "Helvetica-Bold";
  }
  if (basePdfFont === "Times-Roman") {
    return "Times-Bold";
  }
  return basePdfFont;
}

function resolveEmphasisFont(basePdfFont: string): string {
  if (basePdfFont === "Helvetica") {
    return "Helvetica-Oblique";
  }
  if (basePdfFont === "Times-Roman") {
    return "Times-Italic";
  }
  return basePdfFont;
}

function renderHeading(
  document: PDFKit.PDFDocument,
  text: string,
  depth: number,
  template: DocumentTemplate,
) {
  const normalizedText = stripInlineMarkdownPdf(text);
  if (!normalizedText) return;
  document.x = document.page.margins.left;

  const size =
    depth === 1
      ? template.heading1FontSizePt
      : depth === 2
        ? template.heading2FontSizePt
        : template.heading3FontSizePt;

  document
    .font(pdfKitFontName(template.headingFont))
    .fontSize(size)
    .fillColor(template.textColor)
    .text(normalizedText, {
      align: "left",
      lineGap: template.bodyLineGapPt,
    });

  if (depth === 2 && template.heading2DividerWidthPt > 0) {
    const y = document.y + PDF_LAYOUT.HEADING_DIVIDER_OFFSET_PT;
    document
      .save()
      .lineWidth(template.heading2DividerWidthPt)
      .strokeColor(template.textColor)
      .moveTo(document.page.margins.left, y)
      .lineTo(document.page.width - document.page.margins.right, y)
      .stroke()
      .restore();
    document.moveDown(PDF_RENDER_CONSTANTS.headingWithDividerMoveDown);
  } else {
    document.moveDown(PDF_RENDER_CONSTANTS.regularMoveDown);
  }
}

function renderInlineLine(
  document: PDFKit.PDFDocument,
  line: string,
  template: DocumentTemplate,
  options?: InlineRenderOptions,
) {
  const lineWithPrefix = `${options?.prefix ?? ""}${line}`;
  const segments = parseInlineSegments(lineWithPrefix, cleanInlineText);
  if (
    segments.length === 0 ||
    stripInlineMarkdownPdf(lineWithPrefix).length === 0
  ) {
    return;
  }

  const hasAbsolutePosition =
    typeof options?.x === "number" && typeof options?.y === "number";
  if (!hasAbsolutePosition) {
    document.x = document.page.margins.left;
  }

  const baseFontSize =
    options?.isPostNameLine &&
    template.bodyFontSizePt < FONT_SIZE_THRESHOLDS.MINIMUM_READABLE_SIZE_PT
      ? FONT_SIZE_THRESHOLDS.MINIMUM_READABLE_SIZE_PT
      : template.bodyFontSizePt;
  const pdfBodyFont = pdfKitFontName(template.bodyFont);
  const strongFont = resolveStrongFont(pdfBodyFont);

  for (const [index, segment] of segments.entries()) {
    const isStrong = segment.kind === "strong" && !options?.suppressStrong;
    const isEmphasis = segment.kind === "em";
    const isContinued = index < segments.length - 1;

    const font = isStrong
      ? strongFont
      : isEmphasis
        ? resolveEmphasisFont(pdfBodyFont)
        : pdfBodyFont;
    const fontSize = isStrong
      ? Math.max(baseFontSize, template.heading3FontSizePt)
      : isEmphasis
        ? template.dateFontSizePt
        : baseFontSize;
    const color = isEmphasis ? template.mutedTextColor : template.textColor;

    const textOptions: PDFKit.Mixins.TextOptions = {
      align: "left",
      lineGap: template.bodyLineGapPt,
      width: options?.width,
      indent: index === 0 ? (options?.indent ?? 0) : 0,
      continued: isContinued,
    };

    if (index === 0 && hasAbsolutePosition) {
      document
        .font(font)
        .fontSize(fontSize)
        .fillColor(color)
        .text(segment.text, options?.x, options?.y, textOptions);
    } else {
      document
        .font(font)
        .fontSize(fontSize)
        .fillColor(color)
        .text(segment.text, textOptions);
    }
  }
}

function renderResumeTwoColumnSection(
  document: PDFKit.PDFDocument,
  sectionLines: string[],
  template: DocumentTemplate,
) {
  type TwoColumnRow = {
    rawText: string;
    rowHeight: number;
  };

  const items = sectionLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .map((rawText) => ({
      rawText,
      plainText: stripInlineMarkdownPdf(rawText),
    }))
    .filter((item) => item.plainText.length > 0);

  if (items.length === 0) {
    return;
  }

  const columnGapPt = PDF_RENDER_CONSTANTS.twoColumnGapPt;
  const contentWidth =
    document.page.width -
    document.page.margins.left -
    document.page.margins.right;
  const columnWidth = (contentWidth - columnGapPt) / 2;
  const leftX = document.page.margins.left;
  const rightX = leftX + columnWidth + columnGapPt;
  const startY = document.y;

  const leftItems: TwoColumnRow[] = [];
  const rightItems: TwoColumnRow[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  document.font(pdfKitFontName(template.bodyFont)).fontSize(template.bodyFontSizePt);
  for (const item of items) {
    const plainRow = `• ${item.plainText}`;
    const rowHeight = document.heightOfString(plainRow, {
      width: columnWidth,
      lineGap: template.bodyLineGapPt,
    });

    const row: TwoColumnRow = {
      rawText: item.rawText,
      rowHeight,
    };

    if (leftHeight <= rightHeight) {
      leftItems.push(row);
      leftHeight += rowHeight + template.bulletGapPt;
    } else {
      rightItems.push(row);
      rightHeight += rowHeight + template.bulletGapPt;
    }
  }

  const renderColumn = (rows: TwoColumnRow[], x: number) => {
    let y = startY;
    for (const row of rows) {
      renderInlineLine(document, row.rawText, template, {
        prefix: "• ",
        x,
        y,
        width: columnWidth,
      });
      y += row.rowHeight + template.bulletGapPt;
    }
    return y;
  };

  const leftY = renderColumn(leftItems, leftX);
  const rightY = renderColumn(rightItems, rightX);
  document.y = Math.max(leftY, rightY) + template.paragraphBottomGapPt;
  document.x = document.page.margins.left;
}

function getResumeCompactTemplate(base: DocumentTemplate): DocumentTemplate {
  return {
    ...base,
    ...RESUME_TEMPLATE_VARIATIONS.compact,
  };
}

function getResumeTightTemplate(base: DocumentTemplate): DocumentTemplate {
  return {
    ...base,
    ...RESUME_TEMPLATE_VARIATIONS.tight,
  };
}

function renderResumeProfileImage(document: PDFKit.PDFDocument, profileImageDataUri: string) {
  const sizePt = PDF_LAYOUT.PROFILE_IMAGE_SIZE_PT;
  const x = document.page.width - document.page.margins.right - sizePt;
  const y = document.page.margins.top - PDF_LAYOUT.PROFILE_IMAGE_TOP_OFFSET_PT;

  document.image(profileImageDataUri, x, y, {
    fit: [sizePt, sizePt],
    align: "center",
    valign: "center",
  });
}

function getTemplateCandidates(
  type: DocumentRenderType,
  templateBase: DocumentTemplate,
): DocumentTemplate[] {
  if (type !== "resume") {
    return [templateBase];
  }

  return [
    templateBase,
    getResumeCompactTemplate(templateBase),
    getResumeTightTemplate(templateBase),
  ];
}async function renderDocumentPdfBufferWithTemplate(
  input: RenderPdfInput,
  template: DocumentTemplate,
) {
  const markdownSource = markdownSourceForDocumentRender(input.type, input.markdown);
  const isCoverLetter = input.type === "cover_letter";

  const document = new PDFDocument({
    margin: template.marginPt,
    size: "A4",
  });

  const chunks: Buffer[] = [];
  let pageCount = 1;
  let completed = false;

  return new Promise<{ buffer: Buffer; pageCount: number }>(
    (resolve, reject) => {
      document.on("data", (chunk: Buffer) => {
        if (!completed) {
          chunks.push(chunk);
        }
      });
      document.on("end", () => {
        if (!completed) {
          completed = true;
          resolve({ buffer: Buffer.concat(chunks), pageCount });
        }
      });
      document.on("error", (err) => {
        if (!completed) {
          completed = true;
          reject(err);
        }
      });
      document.on("pageAdded", () => {
        pageCount += 1;
      });

      if (!isCoverLetter && input.profileImageDataUri) {
        renderResumeProfileImage(document, input.profileImageDataUri);
      }

      const lines = normalizeMarkdownLines(markdownSource);
      let previousHeadingDepth: number | null = null;
      let resumeLastH2TitleLower: string | null = null;
      const bodySizeDivisor = Math.max(template.bodyFontSizePt, 1);

      if (
        lines.every((line) => line.trim().length === 0) &&
        input.title.trim()
      ) {
        renderHeading(document, input.title, 1, template);
        document.end();
        return;
      }

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const rawLine = lines[lineIndex];
        const line = rawLine.trim();
        if (!line) {
          document.moveDown(
            input.type === "resume"
              ? PDF_RENDER_CONSTANTS.resumeMoveDownRatio
              : PDF_RENDER_CONSTANTS.coverLetterMoveDownRatio,
          );
          previousHeadingDepth = null;
          continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const depth = headingMatch[1].length;
          const headingText = headingMatch[2].trim();
          const normalizedH2Key = resumeH2NormalizedKey(input.type, depth, headingText);
          if (normalizedH2Key !== null) {
            resumeLastH2TitleLower = normalizedH2Key;
          }
          if (depth === 2) {
            document.moveDown(template.heading2TopGapPt / bodySizeDivisor);
          }
          renderHeading(document, headingText, depth, template);
          if (depth === 2) {
            document.moveDown(template.heading2BottomGapPt / bodySizeDivisor);

            if (
              input.type === "resume" &&
              isNormalizedTwoColumnResumeH2Key(normalizedH2Key)
            ) {
              const sectionLines: string[] = [];
              let cursor = lineIndex + 1;
              while (cursor < lines.length) {
                const candidate = lines[cursor]?.trim() ?? "";
                const candidateHeading = candidate.match(/^(#{1,6})\s+(.*)$/);
                if (candidateHeading) {
                  break;
                }
                sectionLines.push(lines[cursor] ?? "");
                cursor += 1;
              }

              renderResumeTwoColumnSection(document, sectionLines, template);
              lineIndex = cursor - 1;
              previousHeadingDepth = null;
              continue;
            }
          }
          previousHeadingDepth = depth;
          continue;
        }

        const bulletMatch = line.match(/^[-*]\s+(.*)$/);
        if (bulletMatch && !isCoverLetter) {
          const suppressStrong = resumeExperienceBulletSuppressStrong(
            input.type,
            resumeLastH2TitleLower,
          );
          renderInlineLine(document, bulletMatch[1], template, {
            indent: template.bulletIndentPt,
            prefix: "• ",
            suppressStrong,
          });
          document.moveDown(template.bulletGapPt / bodySizeDivisor);
          previousHeadingDepth = null;
          continue;
        }

        if (input.type === "resume") {
          const roleDate = parseResumeRoleDateHeader(lines, lineIndex);
          if (roleDate) {
            renderInlineLine(document, roleDate.mergedMarkdown, template);
            document.moveDown(template.paragraphBottomGapPt / bodySizeDivisor);
            lineIndex += roleDate.extraLineSkips;
            previousHeadingDepth = null;
            continue;
          }
        }

        renderInlineLine(document, line, template, {
          isPostNameLine: input.type === "resume" && previousHeadingDepth === 1,
          suppressStrong: isCoverLetter,
        });
        document.moveDown(template.paragraphBottomGapPt / bodySizeDivisor);
        previousHeadingDepth = null;
      }

      document.end();
    },
  );
}

function assertPdfWithinSizeLimit(buffer: Buffer): void {
  if (buffer.length > OUTPUT_LIMITS.MAX_PDF_SIZE_BYTES) {
    throw new Error(
      `PDF output exceeds maximum allowed size of ${OUTPUT_LIMITS.MAX_PDF_SIZE_BYTES} bytes`,
    );
  }
}

export async function renderDocumentPdfBuffer(input: RenderInput) {
  const isResume = input.type === "resume";
  const templateBase = isResume
    ? RESUME_DESIGNS[input.resumeTemplateId ?? DEFAULT_RESUME_TEMPLATE_ID]?.template ??
      DOCUMENT_TEMPLATES.resume
    : DOCUMENT_TEMPLATES[input.type];
  const templateCandidates = getTemplateCandidates(input.type, templateBase);
  const renderInput: RenderPdfInput = input.profileImage
    ? {
        ...input,
        profileImageDataUri: `data:${input.profileImage.mimeType};base64,${Buffer.from(input.profileImage.buffer).toString("base64")}`,
      }
    : input;

  if (!isResume) {
    const { buffer } = await renderDocumentPdfBufferWithTemplate(
      renderInput,
      templateBase,
    );
    assertPdfWithinSizeLimit(buffer);
    return buffer;
  }

  let lastBuffer: Buffer | null = null;

  for (let i = 0; i < templateCandidates.length; i++) {
    const { buffer, pageCount } = await renderDocumentPdfBufferWithTemplate(
      renderInput,
      templateCandidates[i],
    );
    lastBuffer = buffer;

    if (pageCount <= 1) {
      assertPdfWithinSizeLimit(lastBuffer);
      return lastBuffer;
    }
  }

  if (lastBuffer) {
    assertPdfWithinSizeLimit(lastBuffer);
    return lastBuffer;
  }

  throw new Error("Failed to render PDF buffer");
}
