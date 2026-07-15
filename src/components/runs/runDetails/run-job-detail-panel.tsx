"use client";

import type { ReactNode } from "react";

import { DetailTabs } from "@/components/runs/runDetails/detail-tabs";
import type { DetailTab } from "@/components/runs/runDetails/helpers";
import { cn } from "@/lib/utils";

type RunJobDetailPanelProps = {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  children: ReactNode;
  variant?: "default" | "inline";
};

export function RunJobDetailPanel({ activeTab, onTabChange, children, variant = "default" }: RunJobDetailPanelProps) {
  const isInline = variant === "inline";

  return (
    <div className="flex min-w-0 flex-col">
      <DetailTabs currentTab={activeTab} onTabChange={onTabChange} className={isInline ? "px-0" : undefined} />
      <div className={cn("min-w-0", isInline ? "px-0 py-4" : "px-6 py-8 lg:px-10")}>{children}</div>
    </div>
  );
}
