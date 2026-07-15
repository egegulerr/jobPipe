"use client";

import { useCallback, useEffect, useState } from "react";

import { WizardShell } from "@/components/runs/start-run-wizard/wizard-shell";
import { ConfigStep } from "@/components/runs/start-run-wizard/steps/config-step";
import { ProfileStep } from "@/components/runs/start-run-wizard/steps/profile-step";
import { AiPreferencesStep } from "@/components/runs/start-run-wizard/steps/ai-preferences-step";
import { ReviewStep } from "@/components/runs/start-run-wizard/steps/review-step";

import { canSubmitRunConfig } from "@/components/runs/start-run-dialog.helpers";
import {
  isRunProfileReady,
  RUN_PROFILE_REQUIREMENT_MESSAGE,
} from "@/lib/settings/profile-readiness";
import { useModalDialogLifecycle } from "@/components/runs/hooks/use-modal-dialog-lifecycle";
import { useStartRunDialogActions } from "@/components/runs/hooks/use-start-run-dialog-actions";
import { useStartRunDialogState } from "@/components/runs/hooks/use-start-run-dialog-state";

import { useSettings } from "@/hooks/use-settings";
import type { RunRecommendationBaselineDto } from "@/types/output/runs.dto";

const STEP_CONFIG = {
  1: {
    title: "Define your pipeline",
    description: "Tell us exactly what you're looking for. Our engine will use these parameters to source, filter, and draft tailored applications.",
  },
  2: {
    title: "Configure your resume & profile for this run",
    description: "Choose your saved profile settings or refine the data our AI uses to create tailored resumes and cover letters.",
  },
  3: {
    title: "Fine-tune matching & drafts",
    description: "Optionally customize how jobs are matched and application materials are drafted for this specific run.",
  },
  4: {
    title: "Ready to launch",
    description: "Double-check everything looks correct. Once you launch, our AI will begin sourcing and applying to matching positions.",
  },
} as const;

const TOTAL_STEPS = 4;

const STEP_LABELS = [
  "Configuration",
  "Resume & Profile",
  "Matching & Drafts",
  "Review & Launch",
];

const EMPTY_BASELINES: RunRecommendationBaselineDto[] = [];

type StartRunWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendationBaselines?: RunRecommendationBaselineDto[];
};

export function StartRunWizard({
  open,
  onOpenChange,
  recommendationBaselines = EMPTY_BASELINES,
}: StartRunWizardProps) {
  const [profileSettingsDirty, setProfileSettingsDirty] = useState(false);

  const draft = useStartRunDialogState();
  const {
    step,
    setStep,
    state,
    profileError,
    locationError,
    locationHint,
    profileSource,
    setProfileSource,
    resetDraft,
    applyConfigChange,
    handlePromptOverrideChange,
    setProfileError,
  } = draft;
  const settingsQuery = useSettings({ enabled: open });

  const {
    isSubmitting,
    isValidatingLocation,
    submitError,
    resetMutation,
    handleNextStep,
    handleBack,
    handleSubmit,
  } = useStartRunDialogActions({
    state,
    onSuccess: () => {
      onOpenChange(false);
      resetMutation();
      resetDraft();
      setProfileSettingsDirty(false);
    },
    setStep,
    setProfileError,
    profileSettings: settingsQuery.data,
    profileSettingsLoading: settingsQuery.isLoading,
    profileSettingsError: settingsQuery.error,
    profileSettingsDirty,
    profileSource,
    setLocationError: draft.setLocationError,
    setLocationHint: draft.setLocationHint,
    currentStep: step,
  });

  const closeDialog = () => {
    if (isSubmitting) {
      return;
    }
    onOpenChange(false);
    resetMutation();
    resetDraft();
    setProfileSettingsDirty(false);
  };

  const { dialogRef, handleDialogKeyDown } = useModalDialogLifecycle({
    open,
    onClose: closeDialog,
  });

  const stepInfo = STEP_CONFIG[step];
  const profileReady = isRunProfileReady(settingsQuery.data);

  const canProceed = () => {
    if (step === 1) {
      return canSubmitRunConfig(state) && !isValidatingLocation;
    }
    if (step === 2) {
      const settingsReady = !settingsQuery.isLoading && !settingsQuery.error && Boolean(settingsQuery.data);

      if (profileSource === "saved") {
        return settingsReady && profileReady;
      }

      return settingsReady && profileReady && !profileSettingsDirty;
    }
    if (step === 3) {
      return true;
    }
    return canSubmitRunConfig(state);
  };

  const handleProfileSourceChange = useCallback((nextSource: typeof profileSource) => {
    setProfileSource(nextSource);
    setProfileError(null);
    if (nextSource === "saved") {
      setProfileSettingsDirty(false);
    }
  }, [setProfileSource, setProfileError, setProfileSettingsDirty]);

  useEffect(() => {
    if (settingsQuery.isLoading || !settingsQuery.data) {
      return;
    }

    if (!profileReady && profileSource === "saved") {
      setProfileSource("customize");
    }
  }, [settingsQuery.data, settingsQuery.isLoading, profileReady, profileSource, setProfileSource]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      className="fixed inset-0 z-50"
      onKeyDown={handleDialogKeyDown}
    >
      <WizardShell
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        stepTitle={stepInfo.title}
        stepDescription={stepInfo.description}
        stepLabels={STEP_LABELS}
        onExit={closeDialog}
        onBack={handleBack}
        onNext={() => void handleNextStep()}
        onSubmit={() => void handleSubmit()}
        canGoNext={canProceed()}
        canGoBack={step > 1}
        isSubmitting={isSubmitting}
        isNextLoading={isValidatingLocation}
        nextLabel={step === 3 ? "Review" : "Next Step"}
        submitLabel="Launch Run"
        pageLabel={`Page ${step} of ${TOTAL_STEPS}`}
      >
        {step === 1 && (
          <ConfigStep
            state={state}
            onChange={applyConfigChange}
            locationError={locationError}
            locationHint={locationHint}
            recommendationBaselines={recommendationBaselines}
          />
        )}

        {step === 2 && (
          <div className="space-y-10">
            <ProfileStep
              source={profileSource}
              canUseSavedProfile={profileReady}
              settings={settingsQuery.data}
              isLoading={settingsQuery.isLoading}
              error={settingsQuery.error}
              onSourceChange={handleProfileSourceChange}
              onSettingsSaved={() => {
                setProfileSettingsDirty(false);
                setProfileSource("saved");
                setProfileError(null);
              }}
              onSettingsDirtyChange={setProfileSettingsDirty}
              includeProfilePicture={state.includeProfilePicture}
              onIncludeProfilePictureChange={(checked) => {
                applyConfigChange((current) => ({
                  ...current,
                  includeProfilePicture: checked,
                }));
              }}
              resumeTemplate={state.resumeTemplate}
              onResumeTemplateChange={(value) => {
                applyConfigChange((current) => ({
                  ...current,
                  resumeTemplate: value,
                }));
              }}
            />
            {step === 2 && profileSource === "customize" && profileSettingsDirty ? (
              <p className="text-sm text-on-surface-variant">Save your profile changes to continue.</p>
            ) : null}
            {step === 2 &&
            settingsQuery.data &&
            !profileReady &&
            !(profileSource === "customize" && profileSettingsDirty) ? (
              <p className="text-sm text-on-surface-variant">
                *{RUN_PROFILE_REQUIREMENT_MESSAGE}
              </p>
            ) : null}
            {profileError ? <p className="text-sm text-error">{profileError}</p> : null}
          </div>
        )}

        {step === 3 && (
          <AiPreferencesStep
            promptOverrides={state.promptOverrides}
            onChange={handlePromptOverrideChange}
            onResetCustomizations={draft.clearPromptOverrides}
          />
        )}

        {step === 4 && (
          <ReviewStep
            state={state}
            profileSource={profileSource}
            profileSettings={settingsQuery.data}
            locationHint={locationHint}
            submitError={submitError}
          />
        )}
      </WizardShell>
    </div>
  );
}
