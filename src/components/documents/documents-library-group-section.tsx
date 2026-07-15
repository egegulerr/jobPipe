"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, ScrollText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { resolveApplyLink } from "@/components/documents/resolve-apply-link";
import { groupDocumentsByJob } from "@/components/documents/documents-library-utils";
import type { DocumentGroup, JobDocumentGroup, DocumentViewModel } from "@/components/documents/documents-library-utils";

type DocumentsLibraryGroupSectionProps = {
  group: DocumentGroup;
  selectedIds: Set<string>;
  onToggleDocument: (documentId: string, checked: boolean) => void;
  onToggleGroup: (documentIds: string[], checked: boolean) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onDeleteDocument: (documentId: string, documentTitle: string) => void;
  isDeletingDocument: boolean;
  isLoadingDocuments?: boolean;
  documentsError?: string | null;
};

const accentStyles = {
  primary: {
    badge: "bg-primary/15 text-primary",
    icon: "text-primary",
  },
  secondary: {
    badge: "bg-secondary/15 text-secondary",
    icon: "text-secondary",
  },
  tertiary: {
    badge: "bg-tertiary/15 text-tertiary",
    icon: "text-tertiary",
  },
} as const;

type DocumentActionButtonsProps = {
  documentId: string;
  documentTitle: string;
  onDeleteDocument: (documentId: string, documentTitle: string) => void;
  isDeletingDocument: boolean;
  containerClassName: string;
  actionClassName: string;
  deleteClassName: string;
};

function DocumentActionButtons({
  documentId,
  documentTitle,
  onDeleteDocument,
  isDeletingDocument,
  containerClassName,
  actionClassName,
  deleteClassName,
}: DocumentActionButtonsProps) {
  return (
    <div className={containerClassName}>
      <a
        href={`/api/documents/${documentId}/pdf`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Download PDF for ${documentTitle}`}
        className={actionClassName}
      >
        <FileText className="size-5" />
      </a>
      <a
        href={`/api/documents/${documentId}/docx`}
        aria-label={`Download Word document for ${documentTitle}`}
        className={actionClassName}
      >
        <ScrollText className="size-5" />
      </a>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onDeleteDocument(documentId, documentTitle)}
        disabled={isDeletingDocument}
        aria-label={`Delete ${documentTitle}`}
        className={deleteClassName}
      >
        <Trash2 className="size-5" />
      </Button>
    </div>
  );
}

type DocumentListProps = {
  documents: DocumentViewModel[];
  selectedIds: Set<string>;
  onToggleDocument: (documentId: string, checked: boolean) => void;
  onDeleteDocument: (documentId: string, documentTitle: string) => void;
  isDeletingDocument: boolean;
};

function DocumentTable({ documents, selectedIds, onToggleDocument, onDeleteDocument, isDeletingDocument }: DocumentListProps) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full border-separate border-spacing-y-3 text-left">
        <thead>
          <tr className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">
            <th className="px-4 pb-2 font-medium">Document Title</th>
            <th className="px-3 pb-2 font-medium">Type</th>
            <th className="px-3 pb-2 font-medium">Company</th>
            <th className="px-3 pb-2 font-medium">Created Date</th>
            <th className="px-4 pb-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const applyHref = resolveApplyLink({
              applyUrl: document.applyUrl,
              jobLink: document.jobLink,
            });

            return (
              <tr
                key={document.id}
                className="group rounded-[1.25rem] border border-outline-variant/10 bg-surface-container-low transition hover:bg-surface-container"
              >
                <td className="rounded-l-[1.25rem] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(document.id)}
                      onCheckedChange={(checked) => onToggleDocument(document.id, checked === true)}
                      aria-label={`Select ${document.displayTitle}`}
                      className="border-outline-variant bg-surface"
                    />
                    <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                      {document.type.toLowerCase() === "resume" ? (
                        <FileText className="size-5" />
                      ) : (
                        <ScrollText className="size-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-on-surface">{document.displayTitle}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                        <span>{document.secondaryLabel}</span>
                        <Link href={`/dashboard/runs/${document.runId}`} className="text-primary transition hover:text-primary-fixed">
                          Run
                        </Link>
                        {applyHref ? (
                          <a
                            href={applyHref}
                            target="_blank"
                            rel="noreferrer"
                            className="text-secondary transition hover:text-secondary-fixed"
                          >
                            Apply
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className="inline-flex rounded-md border border-outline-variant/30 px-2.5 py-1 font-label text-[10px] uppercase tracking-[0.12em] text-outline">
                    {document.typeLabel}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-on-surface-variant">{document.companyName}</td>
                <td className="px-3 py-4 text-sm text-on-surface-variant">{document.createdDateLabel}</td>
                <td className="rounded-r-[1.25rem] px-4 py-4">
                  <DocumentActionButtons
                    documentId={document.id}
                    documentTitle={document.displayTitle}
                    onDeleteDocument={onDeleteDocument}
                    isDeletingDocument={isDeletingDocument}
                    containerClassName="flex items-center justify-end gap-2"
                    actionClassName="inline-flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-highest hover:text-primary"
                    deleteClassName="inline-flex size-10 items-center justify-center rounded-xl p-0 text-on-surface-variant hover:bg-destructive/10 hover:text-destructive"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DocumentCards({ documents, selectedIds, onToggleDocument, onDeleteDocument, isDeletingDocument }: DocumentListProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {documents.map((document) => {
        const applyHref = resolveApplyLink({
          applyUrl: document.applyUrl,
          jobLink: document.jobLink,
        });

        return (
          <article
            key={document.id}
            className="rounded-[1.25rem] border border-outline-variant/10 bg-surface-container-low p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedIds.has(document.id)}
                onCheckedChange={(checked) => onToggleDocument(document.id, checked === true)}
                aria-label={`Select ${document.displayTitle}`}
                className="mt-1 border-outline-variant bg-surface"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="truncate text-base font-bold text-on-surface">{document.displayTitle}</p>
                  <p className="text-sm text-on-surface-variant">{document.secondaryLabel}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-md border border-outline-variant/30 px-2.5 py-1 font-label text-[10px] uppercase tracking-[0.12em] text-outline">
                    {document.typeLabel}
                  </span>
                  <span className="inline-flex rounded-md bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface-variant">
                    {document.companyName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                  <span>{document.createdDateLabel}</span>
                  <Link href={`/dashboard/runs/${document.runId}`} className="text-primary transition hover:text-primary-fixed">
                    Run
                  </Link>
                  {applyHref ? (
                    <a href={applyHref} target="_blank" rel="noreferrer" className="text-secondary transition hover:text-secondary-fixed">
                      Apply
                    </a>
                  ) : null}
                </div>
              </div>
              <DocumentActionButtons
                documentId={document.id}
                documentTitle={document.displayTitle}
                onDeleteDocument={onDeleteDocument}
                isDeletingDocument={isDeletingDocument}
                containerClassName="flex flex-col gap-2"
                actionClassName="inline-flex size-10 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant"
                deleteClassName="inline-flex size-10 items-center justify-center rounded-xl bg-surface-container-highest p-0 text-on-surface-variant hover:bg-destructive/10 hover:text-destructive"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

type JobSectionProps = {
  job: JobDocumentGroup;
  selectedIds: Set<string>;
  onToggleDocument: (documentId: string, checked: boolean) => void;
  onDeleteDocument: (documentId: string, documentTitle: string) => void;
  isDeletingDocument: boolean;
};

function JobSection({ job, selectedIds, onToggleDocument, onDeleteDocument, isDeletingDocument }: JobSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-3 text-left transition hover:bg-surface-container-highest"
        aria-expanded={isOpen}
      >
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-on-surface">{job.label}</p>
          <p className="text-xs text-on-surface-variant">{job.subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-on-surface-variant transition-transform duration-300 ease-in-out",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!isOpen || undefined}>
          <DocumentTable
            documents={job.documents}
            selectedIds={selectedIds}
            onToggleDocument={onToggleDocument}
            onDeleteDocument={onDeleteDocument}
            isDeletingDocument={isDeletingDocument}
          />
          <DocumentCards
            documents={job.documents}
            selectedIds={selectedIds}
            onToggleDocument={onToggleDocument}
            onDeleteDocument={onDeleteDocument}
            isDeletingDocument={isDeletingDocument}
          />
        </div>
      </div>
    </div>
  );
}

export function DocumentsLibraryGroupSection({
  group,
  selectedIds,
  onToggleDocument,
  onToggleGroup,
  isOpen,
  onToggleOpen,
  onDeleteDocument,
  isDeletingDocument,
  isLoadingDocuments = false,
  documentsError = null,
}: DocumentsLibraryGroupSectionProps) {
  const selectedCount = group.documents.filter((document) => selectedIds.has(document.id)).length;
  const allSelected = group.documents.length > 0 && selectedCount === group.documents.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const accent = accentStyles[group.accent];
  const jobGroups = useMemo(() => groupDocumentsByJob(group.documents), [group.documents]);

  return (
    <section className="space-y-4">
      <div className="border-b border-outline-variant/10 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onToggleOpen}
            className="flex items-center gap-3 text-left"
            aria-expanded={isOpen}
          >
            <div className={cn("flex size-10 items-center justify-center rounded-xl", accent.badge)}>
              <group.icon className={cn("size-5", accent.icon)} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-headline text-2xl font-bold tracking-[-0.03em] text-on-surface">{group.label}</h2>
                <ChevronDown
                  className={cn(
                    "size-5 text-on-surface-variant transition-transform duration-300 ease-in-out",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-outline">{group.subtitle}</p>
            </div>
          </button>

          <button
            type="button"
            disabled={isLoadingDocuments}
            onClick={() => onToggleGroup(group.documents.map((document) => document.id), !allSelected)}
            className="self-start text-sm font-medium text-primary transition hover:text-primary-fixed disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allSelected ? "Clear selection in group" : someSelected ? "Select remaining in group" : "Select all in group"}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!isOpen || undefined}>
          <div className="space-y-6 py-2">
            {isLoadingDocuments ? (
              <p className="px-2 text-sm text-on-surface-variant">Loading documents...</p>
            ) : documentsError ? (
              <p className="px-2 text-sm text-error">{documentsError}</p>
            ) : group.documents.length === 0 ? (
              <p className="px-2 text-sm text-on-surface-variant">No documents match the current filters in this run.</p>
            ) : (
              jobGroups.map((job) => (
                <JobSection
                  key={job.key}
                  job={job}
                  selectedIds={selectedIds}
                  onToggleDocument={onToggleDocument}
                  onDeleteDocument={onDeleteDocument}
                  isDeletingDocument={isDeletingDocument}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
