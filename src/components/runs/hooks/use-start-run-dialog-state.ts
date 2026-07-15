"use client";

import { useMemo, useState } from "react";

import {
  buildEmptyPromptOverrides,
  buildEmptyRunConfigState,
  type RunConfigState,
} from "@/components/runs/start-run-dialog.helpers";
import type { PromptType } from "@/lib/shared/prompts";
import type { RunProfileSource } from "@/components/runs/start-run-wizard/steps/profile-step";

export type WizardStep = 1 | 2 | 3 | 4;

export function useStartRunDialogState() {
  const [step, setStep] = useState<WizardStep>(1);
  const [draftState, setDraftState] = useState<RunConfigState | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const [profileSource, setProfileSource] = useState<RunProfileSource>("saved");

  const emptyConfigState = useMemo(() => buildEmptyRunConfigState(), []);
  const state = draftState ?? emptyConfigState;

  function resetDraft() {
    setStep(1);
    setDraftState(null);
    setProfileError(null);
    setLocationError(null);
    setLocationHint(null);
    setProfileSource("saved");
  }

  function applyConfigChange(
    updater: (current: RunConfigState) => RunConfigState,
  ) {
    setDraftState((currentDraftState) => {
      const baseState = currentDraftState ?? emptyConfigState;
      const nextState = updater(baseState);

      if (nextState.locations !== baseState.locations) {
        setLocationError(null);
        setLocationHint(null);
      }

      return nextState;
    });
  }

  function handlePromptOverrideChange(
    type: PromptType,
    value: string,
  ) {
    applyConfigChange((current) => ({
      ...current,
      promptOverrides: { ...current.promptOverrides, [type]: value },
    }));
  }

  function clearPromptOverrides() {
    applyConfigChange((current) => ({
      ...current,
      promptOverrides: buildEmptyPromptOverrides(),
    }));
  }

  return {
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
    clearPromptOverrides,
    setProfileError,
    setLocationError,
    setLocationHint,
  };
}
