"use client";

import { cn } from "@/lib/utils";

export type StatusTone = {
  label: string;
  pillClassName: string;
  dotClassName: string;
};

type RunStatusPillProps = {
  tone: StatusTone;
  animate?: boolean;
  className?: string;
};

export function RunStatusPill({ tone, animate = false, className }: RunStatusPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.24em]",
        tone.pillClassName,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", tone.dotClassName, animate && "animate-pulse")} />
      {tone.label}
    </div>
  );
}
