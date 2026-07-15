"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import type { SettingsTechnologyDto } from "@/types/output/settings.dto";

interface TechnologiesSectionProps {
  technologies: SettingsTechnologyDto[];
  onChange: (technologies: SettingsTechnologyDto[]) => void;
}

/**
 * Renders a section for managing technology skills.
 */
export function TechnologiesSection({ technologies, onChange }: TechnologiesSectionProps) {
  const [techInput, setTechInput] = useState("");

  const addTechnology = useCallback(() => {
    const name = techInput.trim();
    if (!name) return;
    if (technologies.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    const newTechs = [...technologies, { id: crypto.randomUUID(), name }];
    onChange(newTechs);
    setTechInput("");
  }, [techInput, technologies, onChange]);

  const removeTechnology = useCallback(
    (id: string) => {
      const newTechs = technologies.filter((t) => t.id !== id);
      onChange(newTechs);
    },
    [technologies, onChange],
  );

  const handleTechKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTechnology();
      }
    },
    [addTechnology],
  );

  return (
    <div className="space-y-4">
      <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
        Technologies
      </label>
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/5">
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech) => (
            <span
              key={tech.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium group/chip"
            >
              {tech.name}
              <button
                type="button"
                onClick={() => removeTechnology(tech.id)}
                aria-label={`Remove ${tech.name}`}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
            placeholder="Type a technology and press Enter..."
            className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-secondary/30"
          />
          <button
            type="button"
            onClick={addTechnology}
            disabled={!techInput.trim()}
            className="px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors font-label text-[10px] font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
