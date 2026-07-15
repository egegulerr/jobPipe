"use client";

import { useCallback } from "react";
import { CirclePlus, X } from "lucide-react";
import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import { DateRangePicker } from "@/components/settings/date-range-picker";
import { SortableProfileList } from "@/components/settings/sortable-profile-list";
import type { SettingsExperienceDto } from "@/types/output/settings.dto";

interface ExperiencesSectionProps {
  experiences: SettingsExperienceDto[];
  onChange: (experiences: SettingsExperienceDto[]) => void;
}

/**
 * Renders a section for managing professional experiences and education.
 */
export function ExperiencesSection({ experiences, onChange }: ExperiencesSectionProps) {
  const addExperience = useCallback(() => {
    const newItems: SettingsExperienceDto[] = [
      ...experiences,
      {
        id: crypto.randomUUID(),
        type: "experience",
        title: "",
        organization: null,
        dateRange: null,
        description: null,
      },
    ];
    onChange(newItems);
  }, [experiences, onChange]);

  const removeExperience = useCallback(
    (id: string) => {
      const newItems = experiences.filter((e) => e.id !== id);
      onChange(newItems);
    },
    [experiences, onChange],
  );

  const updateExperience = useCallback(
    (id: string, updates: Partial<Omit<SettingsExperienceDto, "id">>) => {
      const newItems = experiences.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...updates,
          organization: updates.organization !== undefined ? updates.organization || null : e.organization,
          dateRange: updates.dateRange !== undefined ? updates.dateRange || null : e.dateRange,
          description: updates.description !== undefined ? updates.description || null : e.description,
        };
      });
      onChange(newItems);
    },
    [experiences, onChange],
  );

  return (
    <div className="space-y-4">
      <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
        Experience & Education
      </label>
      <SortableProfileList
        items={experiences}
        getId={(e) => e.id}
        onReorder={onChange}
        renderItem={(exp) => (
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/5 space-y-4 relative group/entry">
          <button
            type="button"
            onClick={() => removeExperience(exp.id)}
            aria-label={`Remove ${exp.title || "experience"}`}
            className="absolute -top-2 -right-2 w-6 h-6 bg-error-container text-on-error-container rounded-full flex items-center justify-center opacity-0 group-hover/entry:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor={`experience-type-${exp.id}`} className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                Type
              </label>
              <select
                id={`experience-type-${exp.id}`}
                value={exp.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "experience" || value === "education") {
                    updateExperience(exp.id, { type: value });
                  }
                }}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
              >
                <option value="experience">Job Experience</option>
                <option value="education">Education</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={exp.title}
              onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="text"
              placeholder="Organization"
              value={exp.organization ?? ""}
              onChange={(e) => updateExperience(exp.id, { organization: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <DateRangePicker
            value={exp.dateRange}
            onChange={(value) => updateExperience(exp.id, { dateRange: value })}
            placeholder="Date Range"
          />
          <AutoHeightTextarea
            placeholder="Key responsibilities..."
            value={exp.description ?? ""}
            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 resize-none"
          />
          </div>
        )}
      />
      <button
        type="button"
        onClick={addExperience}
        className="w-full py-3 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 group/add"
      >
        <CirclePlus className="size-5 group-hover/add:rotate-90 transition-transform" />
        <span className="font-label text-[10px] font-bold uppercase tracking-widest">
          Add Section
        </span>
      </button>
    </div>
  );
}
