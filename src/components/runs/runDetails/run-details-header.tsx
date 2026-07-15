"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw, Settings2 } from "lucide-react";

import { RunSettingsAccordion } from "@/components/runs/run-settings-accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/app-routes";
import { cn } from "@/lib/utils";
import type { RunSettingsDto } from "@/types/output/runs.dto";

type RunDetailsHeaderProps = {
  canRetryFailedStage: boolean;
  retryPending: boolean;
  retryError: string | null;
  onRetry: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  settings: RunSettingsDto | null;
};

export function RunDetailsHeader({
  canRetryFailedStage,
  retryPending,
  retryError,
  onRetry,
  showSettings,
  onToggleSettings,
  settings,
}: RunDetailsHeaderProps) {
  return (
    <div className="border-b border-white/5 bg-surface-container-lowest">
      <div className="min-w-0 px-6 py-4 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/8 bg-surface-container-low/60 text-on-surface hover:bg-surface-container"
              asChild
            >
              <Link href={APP_ROUTES.runs}>
                <ArrowLeft className="size-4" />
                Back to Runs
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full border border-white/8 bg-surface-container-low/60 text-on-surface hover:bg-surface-container",
                showSettings && "border-primary/20 text-primary",
              )}
              onClick={onToggleSettings}
            >
              <Settings2 className="size-4" />
              Run Settings
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canRetryFailedStage ? (
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onRetry}
                disabled={retryPending}
              >
                {retryPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Retry Failed Stage
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {showSettings ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/6 bg-surface-container-low/70 p-5">
            {settings?.runConfig ? (
              <RunSettingsAccordion runConfig={settings.runConfig} />
            ) : (
              <p className="text-sm text-on-surface-variant">No saved search settings were attached to this run.</p>
            )}
          </div>
        ) : null}

        {retryError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{retryError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
