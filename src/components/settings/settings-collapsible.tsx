"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LucideIconProps {
  className?: string;
}

interface SettingsCollapsibleProps {
  icon: ComponentType<LucideIconProps>;
  iconColorClass?: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function SettingsCollapsible({
  icon: Icon,
  iconColorClass = "text-primary",
  title,
  defaultOpen = false,
  children,
}: SettingsCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group bg-surface-container-low/50 rounded-2xl border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="collapsible-content"
        className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container-high transition-colors"
      >
        <div className="flex items-center gap-4">
          <Icon className={cn("size-5", iconColorClass)} />
          <h3 className="font-headline text-xl font-bold text-on-surface">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "size-5 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div id="collapsible-content" className="px-8 pb-8 pt-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
