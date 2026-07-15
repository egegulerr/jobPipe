"use client";

import { ScrollText } from "lucide-react";
import { SettingsCollapsible } from "@/components/settings/settings-collapsible";
import { ResumeUploadSection } from "./resume-upload-section";
import { ExperiencesSection } from "./experiences-section";
import { TechnologiesSection } from "./technologies-section";
import { CertificationsSection } from "./certifications-section";
import type { ParseResumeResponseDto, SettingsResponseDto } from "@/types/output/settings.dto";

/**
 * Props for ProfessionalSection.
 */
interface ProfessionalSectionProps {
  experiences: SettingsResponseDto["experiences"];
  technologies: SettingsResponseDto["technologies"];
  certifications: SettingsResponseDto["certifications"];
  /** Called when the experiences list changes. */
  onChange: (experiences: SettingsResponseDto["experiences"]) => void;
  /** Called when the technologies list changes. */
  onTechnologiesChange: (technologies: SettingsResponseDto["technologies"]) => void;
  /** Called when the certifications list changes. */
  onCertificationsChange: (certifications: SettingsResponseDto["certifications"]) => void;
  /** Called after a resume file is uploaded and successfully parsed. */
  onParsedResume: (parsed: ParseResumeResponseDto) => void;
}

/**
 * Renders a collapsible section for professional profile, resume upload,
 * experiences, technologies, and certifications.
 */
export function ProfessionalSection({
  experiences,
  technologies,
  certifications,
  onChange,
  onTechnologiesChange,
  onCertificationsChange,
  onParsedResume,
}: ProfessionalSectionProps) {
  return (
    <SettingsCollapsible
      icon={ScrollText}
      iconColorClass="text-secondary"
      title="Professional Profile & Resume"
      defaultOpen={true}
    >
      <div className="space-y-8">
        <ResumeUploadSection onParsedResume={onParsedResume} />
        <ExperiencesSection experiences={experiences} onChange={onChange} />
        <TechnologiesSection technologies={technologies} onChange={onTechnologiesChange} />
        <CertificationsSection certifications={certifications} onChange={onCertificationsChange} />
      </div>
    </SettingsCollapsible>
  );
}
