"use client";

import { cn } from "@/lib/utils";

import type { DetailTab } from "./helpers";

type DetailTabsProps = {
  currentTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  className?: string;
};

export function DetailTabs({ currentTab, onTabChange, className }: DetailTabsProps) {
  return (
    <div className={cn("min-w-0 border-b border-white/5 bg-surface-container-lowest px-6 lg:px-10", className)}>
      <div className="flex gap-4 sm:gap-8">
        <button
          type="button"
          onClick={() => onTabChange("intel")}
          className={cn(
            "border-b-2 px-2 py-5 font-headline text-lg font-bold transition-colors",
            currentTab === "intel" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-white",
          )}
        >
          Job Intel
        </button>
        <button
          type="button"
          onClick={() => onTabChange("documents")}
          className={cn(
            "border-b-2 px-2 py-5 font-headline text-lg font-bold transition-colors",
            currentTab === "documents" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-white",
          )}
        >
          Documents
        </button>
      </div>
    </div>
  );
}
