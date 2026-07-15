import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

import {
  DOCUMENT_TEMPLATES,
  RESUME_DESIGNS,
  DEFAULT_RESUME_TEMPLATE_ID,
  type DocumentTemplate,
  type RenderInput,
} from "@/lib/shared/document-template";
import {
  normalizeMarkdownLines,
  parseInlineSegments,
  stripInlineMarkdown,
  cleanHtmlEntities,
  CONTROL_CHARS_REGEX,
  FONT_SIZE_THRESHOLDS,
  type InlineSegment,
} from "./markdown-inline";
import {
  DOCX_CONVERSIONS,
  DOCX_SPACING,
  HEADING_SIZE_MAP,
  OUTPUT_LIMITS,
} from "./document-constants";
import {
  parseResumeRoleDateHeader,
  resumeExperienceBulletSuppressStrong,
  resumeH2NormalizedKey,
} from "./resume-markdown-layout";
import { markdownSourceForDocumentRender } from "@/server/utils/markdown";

function cleanInlineText(value: string): string {
  const cleaned = cleanHtmlEntities(value);
  return cleaned.replace(CONTROL_CHARS_REGEX, " ");
}

function stripInlineMarkdownDocx(value: string): string {
  return stripInlineMarkdown(value, cleanInlineText);
}

function createTextRunsFromSegments(
  segments: InlineSegment[],
  template: DocumentTemplate,
  isPostNameLine: boolean = false,
  stripStrong: boolean = false,
): TextRun[] {
  if (segments.length === 0) return [];

  // Use minimum readable size for post-name lines if body font is too small
  const effectiveBodySize =
    isPostNameLine && template.bodyFontSizePt < FONT_SIZE_THRESHOLDS.MINIMUM_READABLE_SIZE_PT
      ? FONT_SIZE_THRESHOLDS.MINIMUM_READABLE_SIZE_PT
      : template.bodyFontSizePt;
  const baseFontSize = DOCX_CONVERSIONS.pointsToHalfPoints(effectiveBodySize);
  const strongFloorHalf = DOCX_CONVERSIONS.pointsToHalfPoints(template.heading3FontSizePt);
  const emHalf = DOCX_CONVERSIONS.pointsToHalfPoints(template.dateFontSizePt);
  const textColorDocx = template.textColor.replace("#", "");
  const mutedColorDocx = template.mutedTextColor.replace("#", "");

  return segments.map((segment) => {
    const isStrong = segment.kind === "strong" && !stripStrong;
    const isEmphasis = segment.kind === "em";

    const fontSize = isStrong
      ? Math.max(baseFontSize, strongFloorHalf)
      : isEmphasis
        ? emHalf
        : baseFontSize;

    const color = isEmphasis ? mutedColorDocx : textColorDocx;

    return new TextRun({
      text: segment.text,
      bold: isStrong,
      italics: isEmphasis,
      size: fontSize,
      color: color,
      font: template.bodyFont,
    });
  });
}

function createTextRuns(
  line: string,
  template: DocumentTemplate,
  isPostNameLine: boolean = false,
  stripStrong: boolean = false,
): TextRun[] {
  return createTextRunsFromSegments(
    parseInlineSegments(line, cleanInlineText),
    template,
    isPostNameLine,
    stripStrong,
  );
}

function getHeadingLevel(depth: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
  switch (depth) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    default:
      return HeadingLevel.HEADING_3;
  }
}

function getHeadingFontSize(depth: number, template: DocumentTemplate): number {
  const fontSizeKey = HEADING_SIZE_MAP[depth] ?? "heading3FontSizePt";
  const fontSizePt = template[fontSizeKey as keyof DocumentTemplate] as number;
  return DOCX_CONVERSIONS.pointsToHalfPoints(fontSizePt);
}

function renderHeadingParagraph(
  text: string,
  depth: number,
  template: DocumentTemplate,
): Paragraph {
  const normalizedText = stripInlineMarkdownDocx(text);
  const size = getHeadingFontSize(depth, template);
  const headingLevel = getHeadingLevel(depth);
  const textColorDocx = template.textColor.replace("#", "");

  const beforeSpacing =
    depth === 2
      ? DOCX_CONVERSIONS.pointsToTwips(template.heading2TopGapPt)
      : DOCX_SPACING.DEFAULT_BEFORE_TWIPS;
  const afterSpacing =
    depth === 2
      ? DOCX_CONVERSIONS.pointsToTwips(template.heading2BottomGapPt)
      : DOCX_SPACING.DEFAULT_AFTER_TWIPS;

  return new Paragraph({
    children: [
      new TextRun({
        text: normalizedText,
        size: size,
        color: textColorDocx,
        font: template.headingFont,
        bold: true,
      }),
    ],
    heading: headingLevel,
    alignment: AlignmentType.LEFT,
    spacing: {
      before: beforeSpacing,
      after: afterSpacing,
    },
    border:
      depth === 2 && template.heading2DividerWidthPt > 0
        ? {
            bottom: {
              color: textColorDocx,
              space: 1,
              style: BorderStyle.SINGLE,
              size: DOCX_CONVERSIONS.pointsToBorderEighths(template.heading2DividerWidthPt),
            },
          }
        : undefined,
  });
}

export async function renderDocumentDocxBuffer(
  input: RenderInput,
): Promise<Buffer> {
  const template =
    input.type === "resume"
      ? RESUME_DESIGNS[input.resumeTemplateId ?? DEFAULT_RESUME_TEMPLATE_ID]?.template ??
        DOCUMENT_TEMPLATES.resume
      : DOCUMENT_TEMPLATES[input.type];
  const markdownSource = markdownSourceForDocumentRender(input.type, input.markdown);
  const coverLetterPlain = input.type === "cover_letter";
  const lines = normalizeMarkdownLines(markdownSource);
  const paragraphs: Paragraph[] = [];

  let previousHeadingDepth: number | null = null;
  let resumeLastH2TitleLower: string | null = null;

  if (lines.every((line) => line.trim().length === 0) && input.title.trim()) {
    paragraphs.push(renderHeadingParagraph(input.title, 1, template));
  } else {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = lines[lineIndex];
      const line = rawLine.trim();

      if (!line) {
        previousHeadingDepth = null;
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const depth = headingMatch[1].length;
        const headingText = headingMatch[2].trim();
        const h2Key = resumeH2NormalizedKey(input.type, depth, headingText);
        if (h2Key !== null) {
          resumeLastH2TitleLower = h2Key;
        }
        paragraphs.push(renderHeadingParagraph(headingText, depth, template));
        previousHeadingDepth = depth;
        continue;
      }

      const bulletMatch = line.match(/^[-*]\s+(.*)$/);
      if (bulletMatch && !coverLetterPlain) {
        const content = bulletMatch[1];
        const segments = parseInlineSegments(content, cleanInlineText);
        const stripStrong = resumeExperienceBulletSuppressStrong(
          input.type,
          resumeLastH2TitleLower,
        );
        if (segments.length > 0 && stripInlineMarkdownDocx(content)) {
          paragraphs.push(
            new Paragraph({
              children: createTextRunsFromSegments(segments, template, false, stripStrong),
              bullet: { level: 0 },
              indent: {
                left: DOCX_CONVERSIONS.pointsToTwips(template.bulletIndentPt),
              },
              spacing: {
                after: DOCX_CONVERSIONS.pointsToTwips(template.bulletGapPt),
                line: DOCX_CONVERSIONS.pointsToLineSpacing(template.bodyLineGapPt),
              },
            }),
          );
        }
        previousHeadingDepth = null;
        continue;
      }

      if (input.type === "resume") {
        const roleDate = parseResumeRoleDateHeader(lines, lineIndex);
        if (roleDate) {
          paragraphs.push(
            new Paragraph({
              children: createTextRuns(roleDate.mergedMarkdown, template),
              spacing: {
                after: DOCX_CONVERSIONS.pointsToTwips(template.paragraphBottomGapPt),
              },
            }),
          );
          lineIndex += roleDate.extraLineSkips;
          previousHeadingDepth = null;
          continue;
        }
      }

      paragraphs.push(
        new Paragraph({
          children: createTextRuns(
            line,
            template,
            input.type === "resume" && previousHeadingDepth === 1,
            coverLetterPlain,
          ),
          spacing: {
            after: DOCX_CONVERSIONS.pointsToTwips(template.paragraphBottomGapPt),
            line: DOCX_CONVERSIONS.pointsToLineSpacing(template.bodyLineGapPt),
          },
        }),
      );
      previousHeadingDepth = null;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: DOCX_CONVERSIONS.pointsToTwips(template.marginPt),
              right: DOCX_CONVERSIONS.pointsToTwips(template.marginPt),
              bottom: DOCX_CONVERSIONS.pointsToTwips(template.marginPt),
              left: DOCX_CONVERSIONS.pointsToTwips(template.marginPt),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const result = await Packer.toBuffer(doc);
  if (result.length > OUTPUT_LIMITS.MAX_DOCX_SIZE_BYTES) {
    throw new Error(
      `DOCX output exceeds maximum allowed size of ${OUTPUT_LIMITS.MAX_DOCX_SIZE_BYTES} bytes`,
    );
  }
  return result;
}
