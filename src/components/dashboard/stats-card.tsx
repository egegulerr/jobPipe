"use client";

import { BarChart3, BadgeCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_ASSET_TYPES: ("PDF" | "DOC")[] = ["PDF", "DOC"];

const VARIANT_CONFIG = {
  default: {
    icon: BarChart3,
    iconClassName: "text-primary",
    label: "JOBS ANALYZED",
    showValueSplit: true,
    cardClassName: "",
  },
  progress: {
    icon: BadgeCheck,
    iconClassName: "text-secondary",
    label: "PRECISION MATCH",
    showValueSplit: false,
    cardClassName: "",
  },
  running: {
    icon: null,
    iconClassName: "text-primary",
    label: "ACTIVE RUNS",
    showValueSplit: false,
    cardClassName: "border border-primary/5",
  },
  assets: {
    icon: FileText,
    iconClassName: "text-tertiary",
    label: "ASSETS",
    showValueSplit: false,
    cardClassName: "",
  },
} as const;

type StatsCardProps = {
  value: string | number;
  description: string;
  variant?: "default" | "progress" | "running" | "assets";
  // Overrides the variant's default top-right label.
  label?: string;
  jobId?: string;
  statusLabel?: string;
  assetTypes?: ("PDF" | "DOC")[];
};

export function StatsCard({
  value,
  description,
  variant = "default",
  label,
  jobId,
  statusLabel,
  assetTypes = DEFAULT_ASSET_TYPES,
}: StatsCardProps) {
  const variantConfig = VARIANT_CONFIG[variant];
  const resolvedLabel = label ?? variantConfig.label;

  return (
    <div
      className={cn(
        "bg-surface-container-low p-6 rounded-xl relative overflow-hidden group hover:bg-surface-container transition-colors duration-300",
        variantConfig.cardClassName
      )}
    >
      <div className="flex justify-between items-start mb-4">
        {variantConfig.icon ? (
          <variantConfig.icon className={cn("size-5", variantConfig.iconClassName)} />
        ) : (
          <div />
        )}
        <span className="text-xs font-label text-on-surface-variant">{resolvedLabel}</span>
      </div>

      {variant === "running" && statusLabel && (
        <div className="mb-4 flex items-center gap-2">
          <span className="flow-pulse h-2 w-2 mr-2"></span>
          <span className="text-xs font-label text-primary">{statusLabel}</span>
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-headline font-bold text-on-surface leading-none">{value}</h3>
        {variantConfig.showValueSplit && (
          <p className="text-on-surface-variant">{description}</p>
        )}
      </div>
      {!variantConfig.showValueSplit && (
        <p className="text-sm text-on-surface-variant mt-2">{description}</p>
      )}

      {variant === "running" && jobId && (
        <div className="mt-6 text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">
          Job ID: {jobId}
        </div>
      )}

      {variant === "assets" && (
        <div className="mt-6 flex -space-x-2">
          {assetTypes.map((type) => (
            <div
              key={type}
              className="w-6 h-6 rounded bg-surface-container-highest border border-white/5 flex items-center justify-center text-[8px] font-bold"
              style={{
                color: type === "PDF" ? "var(--tertiary)" : "var(--primary)",
              }}
            >
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
