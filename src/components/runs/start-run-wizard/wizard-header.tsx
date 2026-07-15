"use client";

import { X } from "lucide-react";

type WizardHeaderProps = {
  onExit: () => void;
  isSubmitting: boolean;
};

export function WizardHeader({ onExit, isSubmitting }: WizardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/40 backdrop-blur-md px-8 py-6 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-on-surface font-headline tracking-tighter">
          Job Pipe
        </span>
        <span className="h-4 w-[1px] bg-outline-variant/30" />
        <span className="font-label text-xs uppercase tracking-widest text-primary">
          New Run Wizard
        </span>
      </div>
      <button
        type="button"
        onClick={onExit}
        disabled={isSubmitting}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-label text-xs uppercase tracking-widest disabled:opacity-50"
      >
        <X className="size-4" />
        Exit Setup
      </button>
    </header>
  );
}
