"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentsLibraryFooterProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  visibleItems: number;
  totalDocuments: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
}

export function DocumentsLibraryFooter({
  currentPage,
  totalPages,
  totalItems,
  visibleItems,
  totalDocuments,
  onPageChange,
}: DocumentsLibraryFooterProps) {
  const progress = totalItems === 0 ? 0 : Math.max(8, Math.round((visibleItems / totalItems) * 100));
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <footer className="flex flex-col gap-6 border-t border-outline-variant/10 pt-8 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <p className="font-label text-[11px] uppercase tracking-[0.24em] text-outline">
          Showing {visibleItems} of {totalItems} runs ({totalDocuments} documents)
        </p>
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-surface-container">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition",
              page === currentPage
                ? "bg-primary text-on-primary shadow-[0_12px_30px_rgba(128,131,255,0.3)]"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </footer>
  );
}
