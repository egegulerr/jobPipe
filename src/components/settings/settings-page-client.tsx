"use client";

import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsProfileEditor } from "@/components/settings/settings-profile-editor";
import type { SettingsResponseDto } from "@/types/output/settings.dto";

interface SettingsPageClientProps {
  initialData: SettingsResponseDto;
}

export function SettingsPageClient({ initialData }: SettingsPageClientProps) {
  return (
    <div
      className={cn(
        "selection:bg-primary/30",
        "max-w-[1600px] space-y-6",
        "px-4 py-8 sm:px-6 md:px-12",
      )}
    >
      <SettingsHeader
        subtitle="System Configuration"
        title="Settings"
        description="Manage your identity, fine-tune your creative engine, and secure your automated pipeline."
      />

      <div className="px-12 space-y-6 max-w-5xl">
        <SettingsProfileEditor initialData={initialData} />
      </div>
    </div>
  );
}
