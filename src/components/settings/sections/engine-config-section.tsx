"use client";

import { useState, useCallback, useEffect } from "react";
import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import { resolveDocumentTone } from "@/components/settings/document-tone";
import { DocumentToneSection } from "@/components/settings/sections/document-tone-section";

import { Target } from "lucide-react";

export type EngineSettingsFormValue = {
  matchThreshold: number;
  defaultTone: string;
  jobMatcherInstructions: string;
  toneInstructions: string;
};

interface EngineConfigSectionProps {
  settings: EngineSettingsFormValue;
  onChange: (settings: EngineSettingsFormValue) => void;
  resumeToneSubtitle?: string;
}

function resolveInitialTone(s: EngineSettingsFormValue): EngineSettingsFormValue {
  const tone = resolveDocumentTone({
    defaultTone: s.defaultTone,
    toneInstructions: s.toneInstructions,
  });
  return { ...s, ...tone };
}

export function EngineConfigSection({
  settings,
  onChange,
  resumeToneSubtitle = "Narrative tone and custom instructions",
}: EngineConfigSectionProps) {
  const [formData, setFormData] = useState(() => resolveInitialTone(settings));

  const updateFields = useCallback(
    (partial: Partial<typeof formData>) => {
      const updated = { ...formData, ...partial };
      setFormData(updated);
      onChange(updated);
    },
    [formData, onChange],
  );

  const updateField = useCallback(
    <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
      updateFields({ [field]: value } as Partial<typeof formData>);
    },
    [updateFields],
  );

  // Sync local state when parent resets (e.g., discard)
  useEffect(() => {
    setFormData(resolveInitialTone(settings));
  }, [settings]);

  return (
    <section id="engine-config" className="relative pt-8">
      <div className="mb-8 flex items-baseline gap-4">
        <h3 className="font-headline text-2xl font-black text-on-surface">
          Engine Configuration
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-container-low rounded-2xl border border-primary/20 overflow-hidden shadow-lg shadow-primary/5">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="size-5 text-primary" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-on-surface">Job Matcher Settings</h4>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                Pipeline filtering parameters
              </p>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <label className="font-label text-[10px] text-on-surface uppercase tracking-widest font-bold">
                  Minimum Match Threshold %
                </label>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold font-label">
                  {formData.matchThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={formData.matchThreshold}
                onChange={(e) => updateField("matchThreshold", Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-label uppercase">
                <span>Loose (50%)</span>
                <span>Strict (95%)</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                Global Matcher Instructions
              </label>
              <AutoHeightTextarea
                value={formData.jobMatcherInstructions}
                onChange={(e) => updateField("jobMatcherInstructions", e.target.value)}
                placeholder="e.g. Ignore specific tech stacks like PHP, prioritize remote-first companies, flag roles with 'Senior' in the title only if they mention Figma..."
                className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 transition-all font-body min-h-[120px] resize-none"
              />
              <p className="text-[10px] text-slate-500 italic">
                These instructions guide the AI when analyzing job descriptions
                against your profile.
              </p>
            </div>
          </div>
        </div>

        <DocumentToneSection
          title="Resume tone"
          subtitle={resumeToneSubtitle}
          value={{
            defaultTone: formData.defaultTone,
            toneInstructions: formData.toneInstructions,
          }}
          onChange={(tone) => updateFields(tone)}
        />
      </div>
    </section>
  );
}
