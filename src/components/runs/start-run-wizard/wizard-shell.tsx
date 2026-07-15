"use client";

import type { ReactNode } from "react";

import { WizardHeader } from "@/components/runs/start-run-wizard/wizard-header";
import { WizardProgress } from "@/components/runs/start-run-wizard/wizard-progress";
import { WizardLayout } from "@/components/runs/start-run-wizard/wizard-layout";
import { WizardFooter } from "@/components/runs/start-run-wizard/wizard-footer";

type WizardShellProps = {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  stepLabels: string[];
  onExit: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isSubmitting: boolean;
  isNextLoading?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  pageLabel?: string;
};

export function WizardShell({
  children,
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  stepLabels,
  onExit,
  onBack,
  onNext,
  onSubmit,
  canGoNext,
  canGoBack,
  isSubmitting,
  isNextLoading,
  nextLabel,
  submitLabel,
  pageLabel,
}: WizardShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface text-on-surface font-body overflow-y-auto">
      <WizardHeader onExit={onExit} isSubmitting={isSubmitting} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <WizardProgress currentStep={currentStep} totalSteps={totalSteps} stepLabels={stepLabels} />

        <div className="space-y-12">
          <header className="text-center">
            <h1 id="wizard-title" className="text-5xl font-extrabold font-headline tracking-tight mb-4">
              {stepTitle}
            </h1>
            <p className="text-on-surface-variant leading-relaxed max-w-xl mx-auto">
              {stepDescription}
            </p>
          </header>

          <section className="space-y-10">
            {children}

            <WizardFooter
              currentStep={currentStep}
              totalSteps={totalSteps}
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              isSubmitting={isSubmitting}
              isNextLoading={isNextLoading}
              nextLabel={nextLabel}
              submitLabel={submitLabel}
              pageLabel={pageLabel}
              onBack={onBack}
              onNext={onNext}
              onSubmit={onSubmit}
            />
          </section>
        </div>
      </main>

      <WizardLayout />
    </div>
  );
}
