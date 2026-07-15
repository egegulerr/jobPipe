"use client";

import type { ComponentType } from "react";
import { Wand2 } from "lucide-react";

import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import {
  DOCUMENT_TONES,
  resolveDocumentTone,
  type DocumentToneValue,
} from "@/components/settings/document-tone";
import { cn } from "@/lib/utils";

type LucideIconProps = {
  className?: string;
};

interface DocumentToneSectionProps {
  title: string;
  subtitle: string;
  value: DocumentToneValue;
  onChange: (value: DocumentToneValue) => void;
  icon?: ComponentType<LucideIconProps>;
  iconClassName?: string;
  iconContainerClassName?: string;
  borderClassName?: string;
}

export function DocumentToneSection({
  title,
  subtitle,
  value,
  onChange,
  icon: Icon = Wand2,
  iconClassName = "text-secondary",
  iconContainerClassName = "bg-secondary/10",
  borderClassName = "border-white/5",
}: DocumentToneSectionProps) {
  const tone = resolveDocumentTone(value);

  function updateTone(partial: Partial<DocumentToneValue>) {
    onChange(resolveDocumentTone({ ...tone, ...partial }));
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-surface-container-low", borderClassName)}>
      <div className="flex items-center gap-4 border-b border-white/5 p-6">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconContainerClassName)}>
          <Icon className={cn("size-5", iconClassName)} />
        </div>
        <div>
          <h4 className="font-headline font-bold text-on-surface">{title}</h4>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-10 p-8">
        <div className="space-y-4">
          <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Default Narrative Tone
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {DOCUMENT_TONES.map((toneOption) => {
              const isSelected = tone.defaultTone === toneOption.id;

              return (
                <button
                  key={toneOption.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (toneOption.id === "custom") {
                      updateTone({ defaultTone: "custom" });
                    } else {
                      updateTone({ defaultTone: toneOption.id, toneInstructions: "" });
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl p-4 transition-all",
                    isSelected
                      ? "border border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/5"
                      : "border border-transparent bg-surface-container-lowest text-on-surface-variant hover:border-white/10",
                  )}
                >
                  <toneOption.icon className="size-5" />
                  <span className="font-label text-xs font-bold uppercase">{toneOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label
            className={cn(
              "block px-1 font-label text-[10px] uppercase tracking-widest",
              tone.defaultTone === "custom" ? "text-on-surface-variant" : "text-on-surface-variant/50",
            )}
          >
            Manual Tone Instructions (Custom Prompt)
          </label>
          <AutoHeightTextarea
            value={tone.toneInstructions}
            onChange={(event) => updateTone({ toneInstructions: event.target.value })}
            disabled={tone.defaultTone !== "custom"}
            placeholder="Add specific nuance, e.g. 'Use British English spelling', 'Avoid using the word passionate', 'Maintain a slightly academic yet accessible voice'"
            className="min-h-[80px] w-full resize-none rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-3 font-body text-sm text-on-surface transition-all focus:ring-1 focus:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
