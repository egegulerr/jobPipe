"use client";

import type { DocumentsStorageDto } from "@/types/output/documents.dto";

type DocumentsLibraryHeaderProps = {
  totalDocuments: number;
  storage: DocumentsStorageDto;
};

function formatStorageAmount(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(1)} GB`;
  }

  return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
}

export function DocumentsLibraryHeader({ totalDocuments, storage }: DocumentsLibraryHeaderProps) {
  const storagePercent = Math.min(100, Math.max(0, storage.percentUsed));

  return (
    <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-4">
        <div className="space-y-3">
          <h1 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
            Documents Library
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Central repository for high-volume career artifacts. Organize by run, company, or document
            type.
          </p>
        </div>

        <div className="flex w-fit flex-col gap-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="font-label text-[10px] uppercase tracking-[0.18em] text-outline">Documents</div>
            <div className="text-lg font-semibold text-on-surface">{totalDocuments}</div>
          </div>
          <div className="hidden h-10 w-px bg-outline-variant/20 sm:block" />
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-8">
              <span className="font-label text-[10px] uppercase tracking-[0.18em] text-outline">
                Storage Capacity
              </span>
              <span className="text-xs font-bold text-on-surface">{storagePercent}% Full</span>
            </div>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-tertiary shadow-[0_0_16px_rgba(255,185,95,0.45)]"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
          <div className="hidden h-10 w-px bg-outline-variant/20 sm:block" />
          <div className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
            {formatStorageAmount(storage.usedBytes)} / {formatStorageAmount(storage.limitBytes)} used
          </div>
        </div>
      </div>
    </header>
  );
}
