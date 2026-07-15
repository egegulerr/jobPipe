"use client";

import { useState, useCallback, useEffect } from "react";
import { User } from "lucide-react";
import { SettingsCollapsible } from "@/components/settings/settings-collapsible";
import { AutoHeightTextarea } from "@/components/settings/auto-height-textarea";
import { AvatarEditor } from "@/components/ui/avatar-editor";
import type { SettingsResponseDto } from "@/types/output/settings.dto";

interface ProfileSectionProps {
  profile: SettingsResponseDto["profile"];
  onChange: (profile: SettingsResponseDto["profile"]) => void;
}

export function ProfileSection({ profile, onChange }: ProfileSectionProps) {
  const [formData, setFormData] = useState(profile);

  // Sync local state when parent resets (e.g., discard)
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = useCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updated = { ...formData, [field]: e.target.value };
        setFormData(updated);
        onChange(updated);
      },
    [formData, onChange],
  );

  const handleAvatarChange = useCallback(
    (newUrl: string) => {
      const updated = { ...formData, avatarUrl: newUrl };
      setFormData(updated);
      onChange(updated);
    },
    [formData, onChange],
  );

  return (
    <SettingsCollapsible
      icon={User}
      title="Profile"
      defaultOpen={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <AvatarEditor
            avatarUrl={formData.avatarUrl}
            onChange={handleAvatarChange}
          />
        </div>

        <div className="md:col-span-9 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName ?? ""}
                onChange={handleChange("firstName")}
                className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName ?? ""}
                onChange={handleChange("lastName")}
                className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-on-surface/50 focus:ring-1 focus:ring-primary/30 transition-all font-body cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block">
              Professional Bio
            </label>
            <AutoHeightTextarea
              id="bio"
              value={formData.bio ?? ""}
              onChange={handleChange("bio")}
              className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body resize-none"
            />
          </div>
        </div>
      </div>
    </SettingsCollapsible>
  );
}

