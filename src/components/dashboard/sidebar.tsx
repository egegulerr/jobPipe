"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_ROUTES, START_RUN_EVENT, buildStartRunHref } from "@/lib/app-routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: APP_ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: APP_ROUTES.runs, label: "Runs", icon: Activity },
  { href: APP_ROUTES.documents, label: "Documents", icon: FileText },
  { href: APP_ROUTES.settings, label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleStartNewRunClick(event: MouseEvent<HTMLAnchorElement>) {
    setMobileOpen(false);

    if (pathname === APP_ROUTES.runs) {
      event.preventDefault();
      window.dispatchEvent(new Event(START_RUN_EVENT));
    }
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-outline-variant/30 bg-surface-dim/70 backdrop-blur-md z-40 flex items-center gap-3 px-4">
        <button
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link href={APP_ROUTES.dashboard} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] flex items-center justify-center">
            <Zap className="size-5 text-[#0d0096] fill-[#0d0096]" />
          </div>
          <span className="font-headline font-bold text-on-surface">
            Job Pipe
          </span>
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 flex flex-col p-4 bg-surface-dim border-r border-outline-variant/30 font-headline tracking-tight transition-all duration-300 lg:transform-none",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "mb-6 flex items-center justify-between px-2",
            collapsed && "lg:mb-5 lg:justify-end"
          )}
        >
          <div
            className={cn("flex items-center gap-3", collapsed && "lg:hidden")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] flex items-center justify-center">
              <Zap className="size-5 text-[#0d0096] fill-[#0d0096]" />
            </div>
            <h1
              className={cn(
                "text-xl font-bold tracking-tighter text-on-surface",
                collapsed && "lg:hidden"
              )}
            >
              Job Pipe
            </h1>
          </div>
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden lg:flex p-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Start New Run Button */}
        <Button
          asChild
          className={cn(
            "mb-6 w-full bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0d0096] font-bold shadow-none hover:shadow-none hover:bg-[linear-gradient(to_bottom_right,#c0c1ff,#8083ff)]",
            collapsed ? "lg:px-2 lg:justify-center" : "lg:px-4"
          )}
        >
          <Link
            href={buildStartRunHref()}
            onClick={handleStartNewRunClick}
            aria-label="Start New Run"
          >
            <Plus className="size-5" />
            <span className={cn(collapsed && "lg:hidden")}>Start New Run</span>
          </Link>
        </Button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === APP_ROUTES.dashboard
                ? pathname === APP_ROUTES.dashboard
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200 active:scale-95",
                  collapsed
                    ? "lg:justify-center lg:px-2 lg:py-2.5"
                    : "lg:px-4 lg:py-2.5",
                  "gap-3 px-4 py-2.5",
                  isActive
                    ? "text-indigo-400 font-semibold bg-indigo-500/10"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/70"
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    isActive && "fill-indigo-400/20"
                  )}
                />
                <span className={cn(collapsed && "lg:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
