"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileJobDetailRevealProps = {
  jobId: string;
  children: ReactNode;
};

export function MobileJobDetailReveal({ jobId, children }: MobileJobDetailRevealProps) {
  return <MobileJobDetailRevealInner key={jobId}>{children}</MobileJobDetailRevealInner>;
}

function MobileJobDetailRevealInner({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => {
      setOpen(false);
      requestAnimationFrame(() => setOpen(true));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
