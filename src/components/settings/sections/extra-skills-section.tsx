"use client";

import { useCallback } from "react";
import { CirclePlus, History, Info, X } from "lucide-react";
import { SettingsCollapsible } from "@/components/settings/settings-collapsible";
import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import { SortableProfileList } from "@/components/settings/sortable-profile-list";
import type { SettingsSkillDto } from "@/types/output/settings.dto";

/**
 * Props for ExtraSkillsSection.
 * Manages additional work experiences (displayed as "Additional Experiences" in the UI).
 */
interface ExtraSkillsSectionProps {
  /** Current list of additional experiences. */
  skills: SettingsSkillDto[];
  /** Callback fired when the experiences list changes. */
  onChange: (skills: SettingsSkillDto[]) => void;
}

/**
 * Renders a collapsible form section for managing additional work experiences.
 */
export function ExtraSkillsSection({ skills, onChange }: ExtraSkillsSectionProps) {
  const addSkill = useCallback(() => {
    const newItems: SettingsSkillDto[] = [
      ...skills,
      {
        id: crypto.randomUUID(),
        name: "",
        context: null,
        description: null,
      },
    ];
    onChange(newItems);
  }, [skills, onChange]);

  const removeSkill = useCallback(
    (id: string) => {
      const newItems = skills.filter((s) => s.id !== id);
      onChange(newItems);
    },
    [skills, onChange],
  );

  const updateSkill = useCallback(
    (id: string, updates: Partial<Omit<SettingsSkillDto, "id">>) => {
      const newItems = skills.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          ...updates,
          context: updates.context !== undefined ? updates.context || null : s.context,
          description: updates.description !== undefined ? updates.description || null : s.description,
        };
      });
      onChange(newItems);
    },
    [skills, onChange],
  );

  return (
    <SettingsCollapsible
      icon={History}
      iconColorClass="text-tertiary"
      title="Additional Experiences"
      defaultOpen={true}
    >
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Info className="size-4 text-secondary" />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            These are additional work experiences you can add manually. They are not
            auto-filled from your resume. They can be conditionally included in your
            resume or cover letter when relevant to a specific job description.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <SortableProfileList
          items={skills}
          getId={(s) => s.id}
          onReorder={onChange}
          renderItem={(skill) => (
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-white/5 space-y-4 relative group/extra">
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              aria-label={`Remove ${skill.name || "experience"}`}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error-container text-on-error-container rounded-full flex items-center justify-center opacity-0 group-hover/extra:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freelance Web Developer"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                  Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. Self-employed, Upwork"
                  value={skill.context ?? ""}
                  onChange={(e) => updateSkill(skill.id, { context: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30"
                />
              </div>
            </div>
            <AutoHeightTextarea
              placeholder="Description of responsibilities and achievements..."
              value={skill.description ?? ""}
              onChange={(e) => updateSkill(skill.id, { description: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30 resize-none"
            />
            </div>
          )}
        />
        <button
          type="button"
          onClick={addSkill}
          className="w-full py-3 border-2 border-dashed border-outline-variant/20 rounded-xl text-on-surface-variant hover:text-secondary hover:border-secondary/40 transition-all flex items-center justify-center gap-2 group/addextra"
        >
          <CirclePlus className="size-5 group-hover/addextra:rotate-90 transition-transform" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest">
            Add Experience
          </span>
        </button>
      </div>
    </SettingsCollapsible>
  );
}
