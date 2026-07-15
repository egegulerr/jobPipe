import type { ResumeDesign, ResumeTemplateId } from "@/lib/shared/document-template";
import { RESUME_DESIGNS } from "@/lib/shared/document-template";

export type ResumeTemplateOption = {
  id: ResumeTemplateId;
  label: string;
  description: string;
  /** Path under /public to the pre-rendered sample PDF shown when the user previews the design. */
  previewPdfPath: string;
};

const PREVIEW_DIR = "/assets/resume-templates";

function toPreviewPath(id: ResumeTemplateId): string {
  return `${PREVIEW_DIR}/${id}.pdf`;
}

function toOption(design: ResumeDesign): ResumeTemplateOption {
  return {
    id: design.id,
    label: design.label,
    description: design.description,
    previewPdfPath: toPreviewPath(design.id),
  };
}

export const RESUME_TEMPLATE_OPTIONS: ResumeTemplateOption[] = (
  ["classic", "modern_sans"] as ResumeTemplateId[]
).map((id) => toOption(RESUME_DESIGNS[id]));

export function getResumeTemplateOption(id: ResumeTemplateId): ResumeTemplateOption {
  return toOption(RESUME_DESIGNS[id]);
}
