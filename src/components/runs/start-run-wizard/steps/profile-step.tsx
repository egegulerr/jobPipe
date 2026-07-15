"use client";

import type { ReactNode } from "react";
import { CheckCircle2, ImageIcon, Loader2, PenLine, UserCircle } from "lucide-react";

import { SettingsProfileEditor } from "@/components/settings/settings-profile-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ResumeTemplateSelector } from "@/components/runs/start-run-wizard/steps/resume-template-selector";
import { cn } from "@/lib/utils";
import type { SettingsResponseDto } from "@/types/output/settings.dto";
import type { ResumeTemplateId } from "@/lib/shared/document-template";

export type RunProfileSource = "saved" | "customize";

type ProfileStepProps = {
  source: RunProfileSource;
  canUseSavedProfile: boolean;
  settings: SettingsResponseDto | undefined;
  isLoading: boolean;
  error: Error | null;
  onSourceChange: (source: RunProfileSource) => void;
  onSettingsSaved: (settings: SettingsResponseDto) => void;
  onSettingsDirtyChange: (hasChanges: boolean) => void;
  includeProfilePicture: boolean;
  onIncludeProfilePictureChange: (checked: boolean) => void;
  resumeTemplate: ResumeTemplateId;
  onResumeTemplateChange: (value: ResumeTemplateId) => void;
};

function ProfileSourceCard({
  value,
  selected,
  icon,
  title,
  description,
  onSelect,
}: {
  value: RunProfileSource;
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: (value: RunProfileSource) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "group h-full rounded-xl border p-6 text-left transition-all duration-300",
        "bg-surface-container-low hover:bg-surface-container",
        selected ? "border-primary/50 bg-surface-container shadow-[0_0_28px_rgba(192,193,255,0.08)]" : "border-outline-variant/15",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("text-primary", value === "customize" && "text-secondary")}>{icon}</div>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-primary bg-primary" : "border-outline-variant group-hover:border-primary/60",
          )}
          aria-hidden="true"
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-on-primary" /> : null}
        </span>
      </div>
      <div className="mb-1 font-headline text-lg font-bold text-on-surface">{title}</div>
      <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </button>
  );
}

export function ProfileStep({
  source,
  canUseSavedProfile,
  settings,
  isLoading,
  error,
  onSourceChange,
  onSettingsSaved,
  onSettingsDirtyChange,
  includeProfilePicture,
  onIncludeProfilePictureChange,
  resumeTemplate,
  onResumeTemplateChange,
}: ProfileStepProps) {
  const effectiveSource = canUseSavedProfile ? source : "customize";
  const hasAvatar = Boolean(settings?.profile.hasAvatar);

  return (
    <div className="space-y-10">
      <ResumeTemplateSelector value={resumeTemplate} onChange={onResumeTemplateChange} />

      {canUseSavedProfile ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="radiogroup" aria-label="Profile source">
          <ProfileSourceCard
            value="saved"
            selected={source === "saved"}
            icon={<UserCircle className="size-6" />}
            title="Use my saved profile settings"
            description="Continue with your global profile, resume data, extra experiences, technologies, certifications, and languages."
            onSelect={onSourceChange}
          />
          <ProfileSourceCard
            value="customize"
            selected={source === "customize"}
            icon={<PenLine className="size-6" />}
            title="Set up profile settings now"
            description="Review or update your profile before launch. Changes are saved to your global settings and used by this run."
            onSelect={onSourceChange}
          />
        </div>
      ) : null}

      {settings ? (
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ImageIcon className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1">
                <p className="font-headline text-base font-bold text-on-surface">Resume profile photo</p>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  When enabled, your uploaded profile picture is placed at the top-right of each generated resume PDF for this run.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="include-profile-picture"
                  checked={includeProfilePicture}
                  disabled={!hasAvatar}
                  onCheckedChange={(value) => onIncludeProfilePictureChange(value === true)}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="include-profile-picture"
                    className={hasAvatar ? "text-on-surface" : "text-on-surface-variant"}
                  >
                    Include profile picture on generated resumes
                  </Label>
                  {!hasAvatar ? (
                    <p className="text-xs text-on-surface-variant">
                      Upload a profile picture in your profile settings to enable this option.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {effectiveSource === "saved" ? (
        <div className="rounded-xl border border-white/5 bg-surface-container-lowest p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
              <CheckCircle2 className="size-5 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="font-headline text-base font-bold text-on-surface">Saved profile will be used</p>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                The run reads your saved profile data when it creates tailored resumes and cover letters. Choose setup if you want to refine it first.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => onSourceChange("customize")}
          >
            Review saved profile
          </Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl bg-surface-container-lowest p-8 text-center">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin text-primary" />
          <p className="text-sm text-on-surface-variant">Loading your profile settings...</p>
        </div>
      ) : error || !settings ? (
        <div className="rounded-xl border border-error/30 bg-error-container/10 p-6 text-center">
          <p className="text-sm text-error">{error?.message ?? "Failed to load profile settings."}</p>
        </div>
      ) : (
        <SettingsProfileEditor
          initialData={settings}
          className="space-y-6"
          showAccountSecurity={false}
          saveBarClassName="bottom-24"
          onSaved={onSettingsSaved}
          onDirtyChange={onSettingsDirtyChange}
        />
      )}
    </div>
  );
}
