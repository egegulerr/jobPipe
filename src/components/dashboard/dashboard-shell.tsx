"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-dim">
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main
        className={cn(
          "flex flex-1 min-h-screen min-w-0 flex-col pt-16 lg:pt-0 overflow-x-hidden overflow-y-auto transition-all duration-300",
          collapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
