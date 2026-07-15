"use client";

import { useCallback } from "react";
import { CirclePlus, Info, X } from "lucide-react";
import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import { SortableProfileList } from "@/components/settings/sortable-profile-list";
import type { SettingsCertificationDto } from "@/types/output/settings.dto";

interface CertificationsSectionProps {
  certifications: SettingsCertificationDto[];
  onChange: (certifications: SettingsCertificationDto[]) => void;
}

/**
 * Renders a section for managing professional certifications.
 */
export function CertificationsSection({ certifications, onChange }: CertificationsSectionProps) {
  const addCertification = useCallback(() => {
    const newCerts: SettingsCertificationDto[] = [
      ...certifications,
      {
        id: crypto.randomUUID(),
        name: "",
        issuer: null,
        issueDate: null,
        description: null,
      },
    ];
    onChange(newCerts);
  }, [certifications, onChange]);

  const removeCertification = useCallback(
    (id: string) => {
      const newCerts = certifications.filter((c) => c.id !== id);
      onChange(newCerts);
    },
    [certifications, onChange],
  );

  const updateCertification = useCallback(
    (id: string, updates: Partial<Omit<SettingsCertificationDto, "id">>) => {
      const newCerts = certifications.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...updates,
          issuer: updates.issuer !== undefined ? updates.issuer || null : c.issuer,
          issueDate: updates.issueDate !== undefined ? updates.issueDate || null : c.issueDate,
          description: updates.description !== undefined ? updates.description || null : c.description,
        };
      });
      onChange(newCerts);
    },
    [certifications, onChange],
  );

  return (
    <div className="space-y-4">
      <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
        Certifications
      </label>
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Info className="size-4 text-secondary" />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Professional certifications, licenses, and credentials. These can be
            conditionally included in your resume when relevant to a job description.
          </p>
        </div>
      </div>
      <SortableProfileList
        items={certifications}
        getId={(c) => c.id}
        onReorder={onChange}
        renderItem={(cert) => (
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/5 space-y-4 relative group/cert">
          <button
            type="button"
            onClick={() => removeCertification(cert.id)}
            aria-label={`Remove ${cert.name || "certification"}`}
            className="absolute -top-2 -right-2 w-6 h-6 bg-error-container text-on-error-container rounded-full flex items-center justify-center opacity-0 group-hover/cert:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                Certification Name
              </label>
              <input
                type="text"
                placeholder="e.g. AWS Solutions Architect"
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
                Issuer
              </label>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services"
                value={cert.issuer ?? ""}
                onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
              Issue Date
            </label>
            <input
              type="text"
              placeholder="e.g. June 2024"
              value={cert.issueDate ?? ""}
              onChange={(e) => updateCertification(cert.id, { issueDate: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <AutoHeightTextarea
            placeholder="Description or credential details..."
            value={cert.description ?? ""}
            onChange={(e) => updateCertification(cert.id, { description: e.target.value })}
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 resize-none"
          />
          </div>
        )}
      />
      <button
        type="button"
        onClick={addCertification}
        className="w-full py-3 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 group/addcert"
      >
        <CirclePlus className="size-5 group-hover/addcert:rotate-90 transition-transform" />
        <span className="font-label text-[10px] font-bold uppercase tracking-widest">
          Add Certification
        </span>
      </button>
    </div>
  );
}
