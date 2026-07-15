"use client";

import { ArrowLeft, ArrowRight, Loader2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type WizardFooterProps = {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isSubmitting: boolean;
  isNextLoading?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  pageLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function WizardFooter({
  currentStep,
  totalSteps,
  canGoBack,
  canGoNext,
  isSubmitting,
  isNextLoading,
  nextLabel = "Next Step",
  submitLabel = "Launch Run",
  pageLabel,
  onBack,
  onNext,
  onSubmit,
}: WizardFooterProps) {
  const isLastStep = currentStep === totalSteps;
  const resolvedPageLabel = pageLabel ?? `Page ${currentStep} of ${totalSteps}`;

  return (
    <footer className="pt-12 flex items-center justify-between border-t border-outline-variant/10">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack || isSubmitting}
        className={cn(
          "text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed",
          !canGoBack && "invisible"
        )}
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="flex items-center gap-6">
        <span className="font-label text-[10px] text-outline uppercase tracking-widest">
          {resolvedPageLabel}
        </span>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                {submitLabel}
                <Rocket className="size-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isNextLoading}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:transform-none"
          >
            {isNextLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
}
