"use client";

import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

type RunsHeaderProps = {
  onCreateRun: () => void;
};

export function RunsHeader({
  onCreateRun,
}: RunsHeaderProps) {
  return (
    <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
      <div>
        <p className="text-xs font-label text-primary font-bold uppercase tracking-[0.2em] mb-2">
          Automation Pipeline
        </p>
        <h2 className="text-4xl sm:text-5xl font-black font-headline text-slate-50 tracking-tighter leading-none">
          Runs Overview
        </h2>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onCreateRun}
        className="group flex h-auto items-center gap-3 rounded-xl border border-outline-variant/15 bg-surface-container px-6 py-4 transition-all duration-300 hover:bg-surface-container-high"
      >
        <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center shadow-[0_0_15px_rgba(192,193,255,0.4)]">
          <Rocket className="size-5 text-on-primary-fixed" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-label text-on-surface-variant uppercase">
            Execute Pipeline
          </p>
          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">
            Start New Run
          </p>
        </div>
      </Button>
    </section>
  );
}
