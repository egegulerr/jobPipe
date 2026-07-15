"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { sortCertificationsByIssueDate, sortExperiencesByStartDate } from "@/lib/profile-list-sort";

import { ProfileSection } from "@/components/settings/sections/profile-section";
import { ProfessionalSection } from "@/components/settings/sections/professional-section";
import { ExtraSkillsSection } from "@/components/settings/sections/extra-skills-section";
import { LanguagesSection } from "@/components/settings/sections/languages-section";
import { SaveBar } from "@/components/settings/save-bar";
import { useUpdateSettings } from "@/hooks/use-update-settings";
import type { UpdateSettingsRequestDto } from "@/types/input/settings.dto";
import type { ParseResumeResponseDto, SettingsResponseDto } from "@/types/output/settings.dto";

type SettingsProfileEditorProps = {
  initialData: SettingsResponseDto;
  className?: string;
  showAccountSecurity?: boolean;
  showSaveBar?: boolean;
  saveBarClassName?: string;
  onSaved?: (settings: SettingsResponseDto) => void;
  onDirtyChange?: (hasChanges: boolean) => void;
};

function buildSettingsUpdatePayload(
  data: SettingsResponseDto,
  savedSnapshot: SettingsResponseDto,
): UpdateSettingsRequestDto {
  const payload: UpdateSettingsRequestDto = {};

  const profileChanged =
    data.profile.firstName !== savedSnapshot.profile.firstName ||
    data.profile.lastName !== savedSnapshot.profile.lastName ||
    data.profile.displayName !== savedSnapshot.profile.displayName ||
    data.profile.bio !== savedSnapshot.profile.bio;

  const experiencesChanged = JSON.stringify(data.experiences) !== JSON.stringify(savedSnapshot.experiences);
  const technologiesChanged = JSON.stringify(data.technologies) !== JSON.stringify(savedSnapshot.technologies);
  const certificationsChanged = JSON.stringify(data.certifications) !== JSON.stringify(savedSnapshot.certifications);
  const skillsChanged = JSON.stringify(data.skills) !== JSON.stringify(savedSnapshot.skills);
  const languagesChanged = JSON.stringify(data.languages) !== JSON.stringify(savedSnapshot.languages);

  if (profileChanged) {
    payload.profile = {
      firstName: data.profile.firstName ?? undefined,
      lastName: data.profile.lastName ?? undefined,
      displayName: data.profile.displayName,
      bio: data.profile.bio ?? undefined,
    };
  }

  if (experiencesChanged) {
    payload.experiences = data.experiences.map((exp) => ({
      id: exp.id,
      type: exp.type,
      title: exp.title,
      organization: exp.organization ?? undefined,
      dateRange: exp.dateRange ?? undefined,
      description: exp.description ?? undefined,
    }));
  }

  if (technologiesChanged) {
    payload.technologies = data.technologies.map((t) => ({
      id: t.id,
      name: t.name,
    }));
  }

  if (certificationsChanged) {
    payload.certifications = data.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer ?? undefined,
      issueDate: c.issueDate ?? undefined,
      description: c.description ?? undefined,
    }));
  }

  if (skillsChanged) {
    payload.skills = data.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      context: skill.context ?? undefined,
      description: skill.description ?? undefined,
    }));
  }

  if (languagesChanged) {
    payload.languages = data.languages.map((lang) => ({
      id: lang.id,
      name: lang.name,
      proficiency: lang.proficiency,
    }));
  }

  return payload;
}

function applyParsedResumeToSettings(
  current: SettingsResponseDto,
  parsed: ParseResumeResponseDto,
): SettingsResponseDto {
  if (
    !Array.isArray(parsed.experiences) ||
    !Array.isArray(parsed.skills) ||
    !Array.isArray(parsed.technologies) ||
    !Array.isArray(parsed.certifications) ||
    !Array.isArray(parsed.languages)
  ) {
    throw new Error("Resume data is malformed");
  }

  const withId = <T extends object>(items: T[]) =>
    items.map((item) => ({ ...item, id: crypto.randomUUID() }));

  const sortedExperiences = sortExperiencesByStartDate(
    parsed.experiences.map((exp) => ({ ...exp, type: exp.type ?? "experience" })),
    "desc",
  );

  const sortedCertifications = sortCertificationsByIssueDate(parsed.certifications, "desc");

  return {
    ...current,
    profile: {
      ...current.profile,
      firstName: parsed.profile.firstName ?? current.profile.firstName,
      lastName: parsed.profile.lastName ?? current.profile.lastName,
      bio: parsed.profile.bio ?? current.profile.bio,
    },
    experiences: withId(sortedExperiences),
    skills: withId(parsed.skills),
    technologies: withId(parsed.technologies),
    certifications: withId(sortedCertifications),
    languages: withId(parsed.languages),
  };
}

export function SettingsProfileEditor({
  initialData,
  className = "space-y-6",
  showSaveBar = true,
  saveBarClassName,
  onSaved,
  onDirtyChange,
}: SettingsProfileEditorProps) {
  const [data, setData] = useState(initialData);
  const [savedSnapshot, setSavedSnapshot] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const updateSettings = useUpdateSettings();

  const onDirtyChangeRef = useRef(onDirtyChange);

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  });

  useEffect(() => {
    onDirtyChangeRef.current?.(hasChanges);
  }, [hasChanges]);

  const handleProfileChange = useCallback((profile: SettingsResponseDto["profile"]) => {
    setData((prev) => ({ ...prev, profile }));
    setHasChanges(true);
  }, []);

  const handleExperiencesChange = useCallback((experiences: SettingsResponseDto["experiences"]) => {
    setData((prev) => ({ ...prev, experiences }));
    setHasChanges(true);
  }, []);

  const handleTechnologiesChange = useCallback((technologies: SettingsResponseDto["technologies"]) => {
    setData((prev) => ({ ...prev, technologies }));
    setHasChanges(true);
  }, []);

  const handleCertificationsChange = useCallback((certifications: SettingsResponseDto["certifications"]) => {
    setData((prev) => ({ ...prev, certifications }));
    setHasChanges(true);
  }, []);

  const handleSkillsChange = useCallback((skills: SettingsResponseDto["skills"]) => {
    setData((prev) => ({ ...prev, skills }));
    setHasChanges(true);
  }, []);

  const handleLanguagesChange = useCallback((languages: SettingsResponseDto["languages"]) => {
    setData((prev) => ({ ...prev, languages }));
    setHasChanges(true);
  }, []);

  const handleParsedResume = useCallback((parsed: ParseResumeResponseDto) => {
    try {
      setData((prev) => applyParsedResumeToSettings(prev, parsed));
      setHasChanges(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resume data is malformed");
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const payload = buildSettingsUpdatePayload(data, savedSnapshot);

      if (Object.keys(payload).length === 0) {
        setHasChanges(false);
        onSaved?.(data);
        return;
      }

      const response = await updateSettings.mutateAsync(payload);
      toast.success("Settings saved successfully");
      setSavedSnapshot(response);
      setData(response);
      setHasChanges(false);
      onSaved?.(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    }
  }, [data, savedSnapshot, updateSettings, onSaved]);

  const handleDiscard = useCallback(() => {
    setData(savedSnapshot);
    setHasChanges(false);
  }, [savedSnapshot]);

  return (
    <div className={cn(className, hasChanges && "pb-28")}>
      <ProfileSection profile={data.profile} onChange={handleProfileChange} />

      <ProfessionalSection
        experiences={data.experiences}
        technologies={data.technologies}
        certifications={data.certifications}
        onChange={handleExperiencesChange}
        onTechnologiesChange={handleTechnologiesChange}
        onCertificationsChange={handleCertificationsChange}
        onParsedResume={handleParsedResume}
      />

      <ExtraSkillsSection skills={data.skills} onChange={handleSkillsChange} />

      <LanguagesSection languages={data.languages} onChange={handleLanguagesChange} />


      {showSaveBar ? (
        <SaveBar
          className={saveBarClassName}
          hasChanges={hasChanges}
          onDiscard={handleDiscard}
          onSave={handleSave}
          isSaving={updateSettings.isPending}
        />
      ) : null}
    </div>
  );
}
