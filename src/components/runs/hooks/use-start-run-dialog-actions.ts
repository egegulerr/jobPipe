"use client";

import { useRef, useState } from "react";

import {
  buildRunFormData,
  canSubmitRunConfig,
  shouldIncludeProfilePicture,
  type RunConfigState,
} from "@/components/runs/start-run-dialog.helpers";
import {
  isRunProfileReady,
  RUN_PROFILE_REQUIREMENT_MESSAGE,
} from "@/lib/settings/profile-readiness";
import type { WizardStep } from "@/components/runs/hooks/use-start-run-dialog-state";
import type { RunProfileSource } from "@/components/runs/start-run-wizard/steps/profile-step";
import type { SettingsResponseDto } from "@/types/output/settings.dto";
import { useCreateRunMutation } from "@/hooks/mutations/use-create-run-mutation";
import { fetchJson } from "@/lib/api/http-client";
import type { ValidateLocationResponseDto } from "@/types/output/runs.dto";

type UseStartRunDialogActionsOptions = {
  state: RunConfigState;
  onSuccess: () => void;
  setStep: (step: WizardStep) => void;
  setProfileError: (value: string | null) => void;
  profileSettings: SettingsResponseDto | undefined;
  profileSettingsLoading: boolean;
  profileSettingsError: Error | null;
  profileSettingsDirty: boolean;
  profileSource: RunProfileSource;
  setLocationError: (value: string | null) => void;
  setLocationHint: (value: string | null) => void;
  currentStep: WizardStep;
};

export function useStartRunDialogActions({
  state,
  onSuccess,
  setStep,
  setProfileError,
  profileSettings,
  profileSettingsLoading,
  profileSettingsError,
  profileSettingsDirty,
  profileSource,
  setLocationError,
  setLocationHint,
  currentStep,
}: UseStartRunDialogActionsOptions) {
  const createRunMutation = useCreateRunMutation();
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastValidatedRef = useRef<{ location: string; displayName: string } | null>(null);

  const isSubmitting = createRunMutation.isPending;
  const submitError = createRunMutation.isError ? createRunMutation.error.message : null;

  async function validateLocation(): Promise<boolean> {
    setLocationError(null);
    setLocationHint(null);

    const trimmedLocation = state.locations.trim();
    if (!trimmedLocation) {
      setLocationError("Please enter a location.");
      return false;
    }

    const cached = lastValidatedRef.current;
    if (cached && cached.location === trimmedLocation) {
      setLocationHint(`Resolved to: ${cached.displayName}`);
      return true;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsValidatingLocation(true);
    try {
      const result = await fetchJson<ValidateLocationResponseDto>(
        `/api/runs/validate-location?location=${encodeURIComponent(trimmedLocation)}`,
        { signal: controller.signal },
      );

      if (!result.resolved || !result.countryCode) {
        setLocationError(
          result.failureReason === "missing_concrete_city"
            ? 'Enter a concrete city name to continue (for example "Berlin" or "London").'
            : 'Could not find a matching city for this location. Please enter a valid city name (for example "Berlin" or "London").',
        );
        return false;
      }

      lastValidatedRef.current = { location: trimmedLocation, displayName: result.displayName ?? trimmedLocation };
      setLocationHint(`Resolved to: ${result.displayName}`);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return true;
      }
      setLocationError("Failed to validate location. Please try again.");
      return false;
    } finally {
      setIsValidatingLocation(false);
    }
  }

  function validateProfile(): boolean {
    setProfileError(null);

    if (profileSettingsLoading) {
      return false;
    }

    if (profileSettingsError || !profileSettings) {
      setProfileError(profileSettingsError?.message ?? "Failed to load profile settings.");
      return false;
    }

    if (profileSource === "customize" && profileSettingsDirty) {
      setProfileError("Save your profile changes before continuing.");
      return false;
    }

    if (!isRunProfileReady(profileSettings)) {
      setProfileError(RUN_PROFILE_REQUIREMENT_MESSAGE);
      return false;
    }

    return true;
  }

  async function handleNextStep() {
    if (currentStep === 1) {
      if (!canSubmitRunConfig(state)) {
        return;
      }
      const isValid = await validateLocation();
      if (isValid) {
        setStep(2);
      }
    } else if (currentStep === 2) {
      if (validateProfile()) {
        setStep(3);
      }
    } else if (currentStep === 3) {
      setStep(4);
    }
  }

  function handleBack() {
    const prevStep = currentStep - 1;
    if (prevStep >= 1 && prevStep <= 4) {
      setStep(prevStep as WizardStep);
    }
  }

  async function handleSubmit() {
    const isProfileValid = validateProfile();
    if (!isProfileValid) {
      setStep(2);
      return;
    }

    const formData = buildRunFormData({
      state: {
        ...state,
        includeProfilePicture: shouldIncludeProfilePicture({
          includeProfilePicture: state.includeProfilePicture,
          hasAvatar: profileSettings?.profile.hasAvatar,
        }),
      },
    });

    try {
      await createRunMutation.mutateAsync(formData);
    } catch {
      return;
    }

    onSuccess();
  }

  return {
    isSubmitting,
    isValidatingLocation,
    submitError,
    resetMutation: createRunMutation.reset,
    handleNextStep,
    handleBack,
    handleSubmit,
  };
}
