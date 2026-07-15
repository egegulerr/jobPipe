"use client";

import { cn } from "@/lib/utils";

type WizardProgressProps = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
};

export function WizardProgress({ currentStep, totalSteps, stepLabels }: WizardProgressProps) {
  return (
    <nav className="mb-16">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isInactive = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="group">
              <div
                className={cn(
                  "h-1 w-full mb-3 transition-colors",
                  isActive && "bg-primary",
                  isCompleted && "bg-primary/60",
                  isInactive && "bg-outline-variant/30 group-hover:bg-outline-variant/60"
                )}
              />
              <span
                className={cn(
                  "font-label text-[10px] uppercase tracking-[0.2em] block",
                  isActive && "text-primary",
                  isCompleted && "text-primary/60",
                  isInactive && "text-outline"
                )}
              >
                Step {String(stepNumber).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive && "text-on-surface",
                  isCompleted && "text-on-surface/60",
                  isInactive && "text-outline"
                )}
              >
                {stepLabels[index] ?? `Step ${stepNumber}`}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
