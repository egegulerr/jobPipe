"use client";

import { cn } from "@/lib/utils";


interface SaveBarProps {
  hasChanges?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  className?: string;
}

export function SaveBar({ hasChanges = false, onDiscard, onSave, isSaving = false, className }: SaveBarProps) {
  if (!hasChanges) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-8 z-40 flex justify-center px-4 pointer-events-none",
        className,
      )}
      role="region"
      aria-label="Unsaved changes"
    >
      <div className="pointer-events-auto bg-surface-container-highest/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
        <p className="px-4 font-label text-[10px] text-on-surface-variant uppercase tracking-widest hidden md:block">
          Unsaved modifications detected
        </p>
        <button
          type="button"
          onClick={onDiscard}
          className="px-6 py-3 bg-surface-container-low rounded-xl text-on-surface hover:bg-surface-container transition-colors font-label text-[10px] font-bold uppercase"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary-container font-headline font-extrabold tracking-tight hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Commit Changes"}
        </button>
      </div>
    </div>
  );
}
