"use client";

import { useCallback } from "react";
import { CirclePlus, Info, Languages, X } from "lucide-react";
import { SettingsCollapsible } from "@/components/settings/settings-collapsible";
import type { SettingsLanguageDto } from "@/types/output/settings.dto";

type LanguageEntry = SettingsLanguageDto;

const PROFICIENCY_OPTIONS = ["Native", "Fluent", "Intermediate", "Basic"] as const;

/**
 * Props for LanguagesSection.
 */
interface LanguagesSectionProps {
  /** Current list of languages. */
  languages: LanguageEntry[];
  /** Callback fired when the language list is modified. */
  onChange: (languages: LanguageEntry[]) => void;
}

/**
 * Renders a collapsible section for managing spoken languages and proficiency levels.
 */
export function LanguagesSection({ languages, onChange }: LanguagesSectionProps) {
  const addLanguage = useCallback(() => {
    const newItems: LanguageEntry[] = [
      ...languages,
      {
        id: crypto.randomUUID(),
        name: "",
        proficiency: "Intermediate",
      },
    ];
    onChange(newItems);
  }, [languages, onChange]);

  const removeLanguage = useCallback(
    (id: string) => {
      const newItems = languages.filter((l) => l.id !== id);
      onChange(newItems);
    },
    [languages, onChange],
  );

  const updateLanguage = useCallback(
    (id: string, updates: Partial<Omit<LanguageEntry, "id">>) => {
      const newItems = languages.map((l) => {
        if (l.id !== id) return l;
        return { ...l, ...updates };
      });
      onChange(newItems);
    },
    [languages, onChange],
  );

  return (
    <SettingsCollapsible
      icon={Languages}
      iconColorClass="text-tertiary"
      title="Languages"
      defaultOpen={true}
    >
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Info className="size-4 text-secondary" />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Languages are conditionally included in your resume or cover letter when they
            directly match a specific job description&apos;s requirements.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className="p-5 rounded-xl bg-surface-container-lowest border border-white/5 space-y-4 relative group/language"
          >
            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              aria-label={`Remove ${lang.name || "language"}`}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error-container text-on-error-container rounded-full flex items-center justify-center opacity-0 group-hover/language:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                  Language
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Spanish"
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                  Proficiency
                </label>
                <select
                  value={lang.proficiency}
                  onChange={(e) =>
                    updateLanguage(lang.id, {
                      proficiency: e.target.value as SettingsLanguageDto["proficiency"],
                    })
                  }
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30"
                >
                  {PROFICIENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addLanguage}
          className="w-full py-3 border-2 border-dashed border-outline-variant/20 rounded-xl text-on-surface-variant hover:text-secondary hover:border-secondary/40 transition-all flex items-center justify-center gap-2 group/addlang"
        >
          <CirclePlus className="size-5 group-hover/addlang:rotate-90 transition-transform" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest">
            Add Language
          </span>
        </button>
      </div>
    </SettingsCollapsible>
  );
}
