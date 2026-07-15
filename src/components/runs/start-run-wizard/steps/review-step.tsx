"use client";

import { useMemo, type ReactNode } from "react";
import type { ComponentType } from "react";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  CircleOff,
  FileText,
  Sparkles,
  UserCircle2,
  Wand2,
} from "lucide-react";

import {
  DAYS_FILTER_LABELS,
  getProfilePictureReviewSummary,
  hasPromptOverrides,
  type RunConfigState,
} from "@/components/runs/start-run-dialog.helpers";
import {
  parseAiPreferences,
} from "@/components/runs/start-run-wizard/steps/ai-preferences-shared";
import { getDocumentToneLabel } from "@/components/settings/document-tone";
import { getResumeTemplateOption } from "@/components/runs/start-run-wizard/steps/resume-template-options";
import type { RunProfileSource } from "@/components/runs/start-run-wizard/steps/profile-step";
import { cn } from "@/lib/utils";
import type { SettingsResponseDto } from "@/types/output/settings.dto";
import { AvatarEditor } from "@/components/ui/avatar-editor";

type ReviewStepProps = {
  state: RunConfigState;
  profileSource: RunProfileSource;
  profileSettings: SettingsResponseDto | undefined;
  locationHint: string | null;
  submitError: string | null;
};

function ReviewCard({
  title,
  icon: Icon,
  iconClassName,
  borderClassName,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  borderClassName: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/6 bg-surface-container-low p-6 shadow-sm", borderClassName, className)}>
      <div className="mb-6 flex items-center gap-3">
        <Icon className={cn("size-5", iconClassName)} />
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ReviewField({ label, value, hint }: { label: string; value: string; hint?: string | null }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-sm font-medium text-on-surface">{value}</p>
      {hint ? <p className="mt-1 text-xs text-primary">{hint}</p> : null}
    </div>
  );
}

function resolveReviewToneLabel(tone: { defaultTone: string; toneInstructions: string }) {
  if (tone.toneInstructions.trim()) {
    return "Custom";
  }

  return getDocumentToneLabel(tone.defaultTone);
}

function ToneReviewItem({
  label,
  tone,
}: {
  label: string;
  tone: { defaultTone: string; toneInstructions: string };
}) {
  const customPrompt = tone.toneInstructions.trim();

  return (
    <div className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-on-surface-variant" />
        <span className="text-sm font-semibold text-on-surface">
          {label}: {resolveReviewToneLabel(tone)}
        </span>
      </div>
      {customPrompt ? (
        <p className="mt-2 whitespace-pre-wrap pl-6 text-sm leading-relaxed text-on-surface-variant">{customPrompt}</p>
      ) : null}
    </div>
  );
}

function buildProfileIdentityPreview(profileSettings: SettingsResponseDto | undefined) {
  if (!profileSettings) {
    return { name: null, bio: null };
  }

  const fullName = [profileSettings.profile.firstName, profileSettings.profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    name: fullName || profileSettings.profile.displayName || null,
    bio: profileSettings.profile.bio?.trim() || null,
  };
}

function ProfileDataSection({
  label,
  children,
  emptyText,
}: {
  label: string;
  children: ReactNode;
  emptyText?: string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
      {children ? (
        children
      ) : emptyText ? (
        <p className="text-sm text-on-surface-variant">{emptyText}</p>
      ) : null}
    </div>
  );
}

export function ReviewStep({
  state,
  profileSource,
  profileSettings,
  locationHint,
  submitError,
}: ReviewStepProps) {
  const isLinkedinEnabled = state.platforms.has("linkedin");
  const isIndeedEnabled = state.platforms.has("indeed");
  const hasCustomPromptOverrides = hasPromptOverrides(state.promptOverrides);
  const { engineSettings, coverLetterTone } = useMemo(
    () => parseAiPreferences(state.promptOverrides),
    [state.promptOverrides]
  );
  const resumeTone = {
    defaultTone: engineSettings.defaultTone,
    toneInstructions: engineSettings.toneInstructions,
  };
  const { name: profileName, bio: profileBio } = useMemo(
    () => buildProfileIdentityPreview(profileSettings),
    [profileSettings]
  );
  const profilePictureSummary = getProfilePictureReviewSummary({
    includeProfilePicture: state.includeProfilePicture,
    hasAvatar: profileSettings?.profile.hasAvatar,
  });

  const experiences = profileSettings?.experiences ?? [];
  const skills = profileSettings?.skills ?? [];
  const technologies = profileSettings?.technologies ?? [];
  const certifications = profileSettings?.certifications ?? [];
  const languages = profileSettings?.languages ?? [];

  return (
    <div className="space-y-10">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-surface-container-low px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_16px_rgba(78,222,163,0.6)]" />
          <span className="font-label text-[10px] uppercase tracking-[0.24em] text-secondary">Ready for ignition</span>
        </div>
        <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-on-surface-variant">
          One final pass through your pipeline, profile, and AI engine settings before Job Pipe starts sourcing and drafting applications.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReviewCard title="Pipeline Configuration" icon={Briefcase} iconClassName="text-primary" borderClassName="border-l-4 border-l-primary">
          <div className="space-y-4">
            {state.runName.trim() ? <ReviewField label="Run Name" value={state.runName.trim()} /> : null}
            <ReviewField label="Target Job" value={state.titleKeywords.trim() || "Not set"} />
            <ReviewField label="Location" value={state.locations.trim() || "Not set"} hint={locationHint} />
            <ReviewField label="Posted Within" value={DAYS_FILTER_LABELS[state.daysFilter] ?? "Not set"} />

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(state.platforms).map((platform) => (
                  <span key={platform} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs capitalize text-primary">
                    {platform}
                  </span>
                ))}
                {state.platforms.size === 0 ? <span className="text-sm text-on-surface">No platforms selected</span> : null}
              </div>
            </div>

            {(isLinkedinEnabled || isIndeedEnabled) ? (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Result Limits</p>
                <div className="space-y-1 text-sm font-medium text-on-surface">
                  {isLinkedinEnabled ? <p>LinkedIn: {state.linkedinResultsLimit} results</p> : null}
                  {isIndeedEnabled ? <p>Indeed: {state.indeedResultsLimit} results</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        </ReviewCard>

        <ReviewCard title="Profile" icon={UserCircle2} iconClassName="text-secondary" borderClassName="border-l-4 border-l-secondary">
          <div className="flex gap-6 items-start">
            <AvatarEditor
              avatarUrl={profileSettings?.profile.avatarUrl}
              className="w-24 h-24 shrink-0"
            />
            <div className="flex-1 space-y-5">
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Status</p>
                <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <CheckCircle2 className="size-4 text-secondary" />
                  <span>{profileSource === "saved" ? "Using saved profile settings" : "Using freshly reviewed profile settings"}</span>
                </div>
              </div>

              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Resume profile photo
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  {profilePictureSummary.included ? (
                    <CheckCircle2 className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                  ) : (
                    <CircleOff className="size-4 shrink-0 text-on-surface-variant" aria-hidden="true" />
                  )}
                  <span>{profilePictureSummary.label}</span>
                </div>
              </div>

              <ReviewField label="Resume layout" value={getResumeTemplateOption(state.resumeTemplate).label} />

              {profileName ? (
                <ReviewField label="Name" value={profileName} />
              ) : null}
              {profileBio ? (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Bio</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{profileBio}</p>
                </div>
              ) : null}
              {!profileName && !profileBio ? (
                <p className="text-sm text-on-surface-variant">
                  Profile details from step 2 will be used for tailoring.
                </p>
              ) : null}
            </div>
          </div>
        </ReviewCard>

        <ReviewCard
          title="Saved profile"
          icon={FileText}
          iconClassName="text-tertiary"
          borderClassName="border-l-4 border-l-tertiary"
          className="md:col-span-2"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
              <FileText className="size-5 text-tertiary" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Profile settings for this run</p>
              <p className="text-xs text-on-surface-variant">
                Matching and tailored documents use your saved profile data below.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <ProfileDataSection label="Experience" emptyText="No experience entries added.">
              {experiences.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {experiences.slice(0, 5).map((exp) => (
                    <div key={exp.id} className="rounded-lg border border-white/5 bg-surface-container-lowest/60 p-3">
                      <p className="text-sm font-semibold text-on-surface">
                        {exp.title}
                        {exp.organization ? <span className="font-normal text-on-surface-variant"> at {exp.organization}</span> : null}
                      </p>
                      {exp.dateRange ? (
                        <p className="mt-0.5 text-xs text-on-surface-variant">{exp.dateRange}</p>
                      ) : null}
                      {exp.description ? (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-on-surface-variant">{exp.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </ProfileDataSection>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-5">
                <ProfileDataSection label="Skills" emptyText="No skills added.">
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 15).map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-xs text-on-surface"
                          title={skill.context ?? undefined}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </ProfileDataSection>

                <ProfileDataSection label="Technologies" emptyText="No technologies added.">
                  {technologies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {technologies.slice(0, 15).map((tech) => (
                        <span
                          key={tech.id}
                          className="rounded-full border border-tertiary/20 bg-tertiary/10 px-2.5 py-1 text-xs text-on-surface"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </ProfileDataSection>
              </div>

              <div className="space-y-5">
                <ProfileDataSection label="Certifications" emptyText="No certifications added.">
                  {certifications.length > 0 ? (
                    <div className="space-y-2">
                      {certifications.slice(0, 5).map((cert) => (
                        <div key={cert.id} className="text-sm text-on-surface">
                          <span className="font-medium">{cert.name}</span>
                          {cert.issuer ? <span className="text-on-surface-variant"> — {cert.issuer}</span> : null}
                          {cert.issueDate ? <span className="text-xs text-on-surface-variant"> ({cert.issueDate})</span> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </ProfileDataSection>

                <ProfileDataSection label="Languages" emptyText="No languages added.">
                  {languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {languages.slice(0, 10).map((lang) => (
                        <span
                          key={lang.id}
                          className="rounded-full border border-outline-variant/20 bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface"
                        >
                          {lang.name} <span className="text-on-surface-variant">({lang.proficiency})</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </ProfileDataSection>
              </div>
            </div>
          </div>
        </ReviewCard>

        <ReviewCard
          title="Run Engine Preferences"
          icon={Wand2}
          iconClassName="text-tertiary"
          borderClassName="border-white/6"
          className="md:col-span-2 bg-surface-container"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Match Threshold</p>
              <div className="flex items-end gap-2">
                <span className="font-headline text-3xl font-extrabold text-on-surface">{engineSettings.matchThreshold}%</span>
                <span className="mb-1 font-mono text-[10px] uppercase tracking-widest text-secondary">
                  {hasCustomPromptOverrides ? "Per-run" : "Default engine"}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-surface-container-highest">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${engineSettings.matchThreshold}%` }} />
              </div>
              {engineSettings.jobMatcherInstructions.trim() ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                  {engineSettings.jobMatcherInstructions.trim()}
                </p>
              ) : null}
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Voice Tone</p>
              <div className="space-y-2">
                <ToneReviewItem label="Resume" tone={resumeTone} />
                <ToneReviewItem label="Cover letter" tone={coverLetterTone} />
              </div>
            </div>
          </div>
        </ReviewCard>
      </div>

      {submitError ? (
        <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/15 px-4 py-3 text-sm text-error">
          <AlertCircle className="size-4" />
          {submitError}
        </div>
      ) : null}
    </div>
  );
}
