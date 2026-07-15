import { Briefcase, Coffee, Pencil, ScrollText, Zap } from "lucide-react";
import type { DocumentToneValue } from "@/lib/runs/engine-overrides";

export const DOCUMENT_TONES = [
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "assertive", label: "Assertive", icon: Zap },
  { id: "casual", label: "Casual", icon: Coffee },
  { id: "narrative", label: "Narrative", icon: ScrollText },
  { id: "custom", label: "Custom", icon: Pencil },
] as const;

export type { DocumentToneValue };

export function resolveDocumentTone(value: DocumentToneValue): DocumentToneValue {
  if (value.toneInstructions.trim().length > 0 && value.defaultTone !== "custom") {
    return { ...value, defaultTone: "custom" };
  }

  return value;
}

export function getDocumentToneLabel(defaultTone: string) {
  return DOCUMENT_TONES.find((tone) => tone.id === defaultTone)?.label ?? defaultTone;
}
