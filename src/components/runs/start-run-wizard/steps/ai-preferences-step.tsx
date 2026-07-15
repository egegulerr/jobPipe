"use client";

import { BrainCircuit, PenLine, Sparkles, Wand2 } from "lucide-react";

import {
  EngineConfigSection,
  type EngineSettingsFormValue,
} from "@/components/settings/sections/engine-config-section";
import type { DocumentToneValue } from "@/components/settings/document-tone";
import { DocumentToneSection } from "@/components/settings/sections/document-tone-section";
import {
  buildDocumentToneOverride,
  buildJobMatcherOverride,
  DEFAULT_ENGINE_SETTINGS,
  getDefaultDocumentTone,
  parseAiPreferences,
} from "@/components/runs/start-run-wizard/steps/ai-preferences-shared";
import { getDocumentToneLabel } from "@/components/settings/document-tone";

import { hasPromptOverrides, type PromptOverrideState } from "@/components/runs/start-run-dialog.helpers";
import { cn } from "@/lib/utils";

type AiPreferencesStepProps = {
  promptOverrides: PromptOverrideState;
  onChange: (type: keyof PromptOverrideState, value: string) => void;
  onResetCustomizations?: () => void;
};

function PreferenceModeCard({
  selected,
  title,
  description,
  detail,
  icon: Icon,
  iconClassName,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  detail: string;
  icon: typeof BrainCircuit;
  iconClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative h-full rounded-2xl border p-6 text-left transition-all duration-300",
        selected
          ? "border-primary/40 bg-primary/5 shadow-[0_0_28px_rgba(192,193,255,0.08)]"
          : "border-white/8 bg-surface-container-low/60 hover:border-primary/20 hover:bg-surface-container",
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high", iconClassName)}>
          <Icon className="size-5" />
        </div>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
            selected ? "border-primary bg-primary/15 text-primary" : "border-outline-variant/40 text-transparent",
          )}
          aria-hidden="true"
        >
          <Sparkles className="size-3.5" />
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary/80">{detail}</p>
      </div>
    </button>
  );
}

export function AiPreferencesStep({
  promptOverrides,
  onChange,
  onResetCustomizations,
}: AiPreferencesStepProps) {
  const hasCustomizations = hasPromptOverrides(promptOverrides);
  const mode: "default" | "configure" = hasCustomizations ? "configure" : "default";
  const { engineSettings, coverLetterTone } = parseAiPreferences(promptOverrides);

  function handleSelectDefaultEngine() {
    onResetCustomizations?.();
  }

  function handleSelectConfigure() {
    if (hasCustomizations) {
      return;
    }

    const baseSettings = DEFAULT_ENGINE_SETTINGS;
    const baseTone = getDefaultDocumentTone();
    onChange("job_matcher", buildJobMatcherOverride(baseSettings));
    onChange("resume_writer", buildDocumentToneOverride(baseTone));
    onChange("cover_letter_writer", buildDocumentToneOverride(baseTone));
  }

  function handleEngineSettingsChange(nextSettings: EngineSettingsFormValue) {
    onChange("job_matcher", buildJobMatcherOverride(nextSettings));
    onChange("resume_writer", buildDocumentToneOverride({
      defaultTone: nextSettings.defaultTone,
      toneInstructions: nextSettings.toneInstructions,
    }));
  }

  function handleCoverLetterToneChange(tone: DocumentToneValue) {
    onChange("cover_letter_writer", buildDocumentToneOverride(tone));
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
          <Wand2 className="size-4 text-primary" />
          <span className="font-label text-[10px] uppercase tracking-[0.24em] text-primary">
            Matching & Drafts
          </span>
        </div>
        <div className="space-y-3">
          <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-on-surface-variant">
            Choose default engine behavior for this run or configure matching thresholds and draft tone for this run only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PreferenceModeCard
          selected={mode === "default"}
          icon={BrainCircuit}
          iconClassName="text-primary"
          title="Use default engine settings"
          description={`Use standard match threshold and writing tone (${DEFAULT_ENGINE_SETTINGS.matchThreshold}% minimum match, ${getDocumentToneLabel(DEFAULT_ENGINE_SETTINGS.defaultTone).toLowerCase()} tone). No per-run overrides are stored.`}
          detail="Built-in defaults"
          onClick={handleSelectDefaultEngine}
        />

        <PreferenceModeCard
          selected={mode === "configure"}
          icon={PenLine}
          iconClassName="text-secondary"
          title="Configure for this run"
          description="Set match threshold, matcher instructions, and resume or cover letter tone. These settings apply only to this run."
          detail="Per-run configuration"
          onClick={handleSelectConfigure}
        />
      </div>

      <div className="rounded-2xl border border-white/6 bg-surface-container-low/40 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <BrainCircuit className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-headline text-base font-bold text-on-surface">
              {mode === "default" ? "Default engine settings are active" : "Per-run engine configuration is active"}
            </p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {mode === "default"
                ? "This run will use built-in defaults at execution. Select Configure for this run to set custom matching and draft behavior below."
                : "Adjust matching and writing controls below. Changes are saved on this run only."}
            </p>
          </div>
        </div>
      </div>

      {mode === "configure" ? (
        <div className="space-y-6">
          <EngineConfigSection
            settings={engineSettings}
            onChange={handleEngineSettingsChange}
            resumeToneSubtitle="Per-run instructions for resume drafts"
          />

          <DocumentToneSection
            title="Cover letter tone"
            subtitle="Per-run instructions for cover letter drafts"
            value={coverLetterTone}
            onChange={handleCoverLetterToneChange}
            icon={Sparkles}
            iconClassName="text-tertiary"
            iconContainerClassName="bg-tertiary/10"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-surface-container-lowest p-6">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            This run will use built-in engine defaults. Select{" "}
            <span className="text-on-surface">Configure for this run</span> to customize matching and drafts for this run only.
          </p>
        </div>
      )}
    </div>
  );
}
