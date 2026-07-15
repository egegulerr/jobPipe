"use client";

import { FileText, Eye } from "lucide-react";

import {
  RESUME_TEMPLATE_OPTIONS,
  type ResumeTemplateOption,
} from "@/components/runs/start-run-wizard/steps/resume-template-options";
import type { ResumeTemplateId } from "@/lib/shared/document-template";
import { cn } from "@/lib/utils";

type ResumeTemplateSelectorProps = {
  value: ResumeTemplateId;
  onChange: (value: ResumeTemplateId) => void;
};

function TemplateCard({
  option,
  selected,
  onSelect,
}: {
  option: ResumeTemplateOption;
  selected: boolean;
  onSelect: (value: ResumeTemplateId) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.id)}
      className={cn(
        "group flex h-full flex-col rounded-xl border p-5 text-left transition-all duration-300",
        "bg-surface-container-low hover:bg-surface-container",
        selected
          ? "border-primary/50 bg-surface-container shadow-[0_0_28px_rgba(192,193,255,0.08)]"
          : "border-outline-variant/15",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="size-5 text-primary" aria-hidden="true" />
        </div>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
            selected
              ? "border-primary bg-primary"
              : "border-outline-variant group-hover:border-primary/60",
          )}
          aria-hidden="true"
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-on-primary" /> : null}
        </span>
      </div>

      <div className="mb-1 font-headline text-base font-bold text-on-surface">{option.label}</div>
      <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">{option.description}</p>

      <a
        href={option.previewPdfPath}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <Eye className="size-3.5" aria-hidden="true" />
        Preview sample
      </a>
    </button>
  );
}

export function ResumeTemplateSelector({ value, onChange }: ResumeTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="font-headline text-base font-bold text-on-surface">Resume layout</p>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Choose the design used for every tailored resume in this run. All layouts are ATS-friendly. Preview a sample before choosing.
        </p>
      </div>
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        role="radiogroup"
        aria-label="Resume layout"
      >
        {RESUME_TEMPLATE_OPTIONS.map((option) => (
          <TemplateCard
            key={option.id}
            option={option}
            selected={option.id === value}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  );
}
