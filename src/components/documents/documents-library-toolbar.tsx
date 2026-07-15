"use client";

import { Calendar, Download, FileText, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type DocumentsLibraryToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedRun: string;
  onRunChange: (value: string) => void;
  recentOnly: boolean;
  onRecentToggle: () => void;
  typeOptions: Array<{ value: string; label: string }>;
  runOptions: Array<{ value: string; label: string }>;
  selectedCount: number;
  onBatchDownload: () => void;
  isBatchDownloading: boolean;
  onBatchDelete: () => void;
  isBatchDeleting: boolean;
};

const surfaceSelectClass =
  "h-11 min-w-[180px] rounded-xl border border-outline-variant/10 bg-surface-container text-on-surface shadow-none";

export function DocumentsLibraryToolbar({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedRun,
  onRunChange,
  recentOnly,
  onRecentToggle,
  typeOptions,
  runOptions,
  selectedCount,
  onBatchDownload,
  isBatchDownloading,
  onBatchDelete,
  isBatchDeleting,
}: DocumentsLibraryToolbarProps) {
  return (
    <div className="space-y-5 rounded-[1.5rem] border border-outline-variant/10 bg-surface-container-low px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search companies, jobs..."
            className="h-12 rounded-xl border-0 bg-surface-container-lowest pl-10 text-sm text-on-surface placeholder:text-outline focus-visible:ring-primary/25"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className={surfaceSelectClass}>
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] uppercase tracking-[0.18em] text-outline">
                  Type:
                </span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="border-outline-variant/20 bg-surface-container text-on-surface">
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRun} onValueChange={onRunChange}>
            <SelectTrigger className={surfaceSelectClass}>
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] uppercase tracking-[0.18em] text-outline">
                  Run:
                </span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="border-outline-variant/20 bg-surface-container text-on-surface">
              <SelectItem value="all">All Runs</SelectItem>
              {runOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            onClick={onRecentToggle}
            className="h-11 rounded-xl border border-outline-variant/10 bg-surface-container px-4 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
          >
            <Calendar className="size-4" />
            {recentOnly ? "Showing Last 30 Days" : "Last 30 Days"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-outline-variant/20 pt-1 2xl:border-l 2xl:pl-6">
          <span className="font-label text-[10px] uppercase tracking-[0.18em] text-outline">
            Batch Actions:
          </span>
          <Button
            type="button"
            onClick={onBatchDownload}
            disabled={selectedCount === 0 || isBatchDownloading || isBatchDeleting}
            className="h-11 rounded-xl bg-primary-container px-4 text-xs font-bold text-on-primary-container hover:bg-primary-container/90 disabled:bg-surface-container-highest disabled:text-outline"
          >
            <Download className="size-4" />
            {isBatchDownloading ? "Preparing ZIP..." : `Download (${selectedCount})`}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onBatchDelete}
            disabled={selectedCount === 0 || isBatchDeleting || isBatchDownloading}
            className="h-11 rounded-xl bg-[#dc2626] px-4 text-xs font-bold text-white hover:bg-[#b91c1c] disabled:bg-surface-container-highest disabled:text-outline"
          >
            <Trash2 className="size-4" />
            {isBatchDeleting ? "Deleting..." : `Delete (${selectedCount})`}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled
            className="h-11 rounded-xl bg-surface-container-highest px-4 text-xs font-bold text-on-surface"
          >
            <FileText className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
