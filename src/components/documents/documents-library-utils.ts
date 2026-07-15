"use client";

import type { ComponentType } from "react";
import { Layers, Network, Settings2 } from "lucide-react";
import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";
import type { DocumentRunSummaryDto, UserDocumentSummaryDto } from "@/types/output/documents.dto";

interface LucideIconProps {
  className?: string;
}

type DocumentsGroupBy = "run" | "company" | "type" | "job";

export type DocumentViewModel = UserDocumentSummaryDto & {
  companyName: string;
  displayTitle: string;
  secondaryLabel: string;
  typeLabel: string;
  createdDateLabel: string;
};

export type JobDocumentGroup = {
  key: string;
  label: string;
  subtitle: string;
  documents: DocumentViewModel[];
  newestCreatedAt: string;
};

export type DocumentGroup = {
  key: string;
  label: string;
  subtitle: string;
  accent: "primary" | "secondary" | "tertiary";
  icon: ComponentType<LucideIconProps>;
  documents: DocumentViewModel[];
  newestCreatedAt: string;
};

const accentSequence: Array<DocumentGroup["accent"]> = ["primary", "tertiary", "secondary"];
const iconSequence = [Layers, Settings2, Network] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const ATS_HOST_COMPANY_RESOLVERS: Record<string, (url: URL) => string | null> = {
  "jobs.lever.co": (url) => titleCase(url.pathname.split("/").filter(Boolean)[0] ?? ""),
  "boards.greenhouse.io": (url) => titleCase(url.pathname.split("/").filter(Boolean)[0] ?? ""),
};

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeCompanyHost(rawUrl: string | null) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    const atsCompanyName = ATS_HOST_COMPANY_RESOLVERS[host]?.(url);

    if (atsCompanyName) {
      return atsCompanyName;
    }

    const parts = host.split(".");
    const rootHost = parts.length >= 2 ? parts.slice(-2).join(".") : host;

    if (rootHost === "lever.co" || rootHost === "greenhouse.io") {
      return null;
    }

    if (parts.length === 0) {
      return null;
    }

    return titleCase(parts[0] ?? "");
  } catch {
    return null;
  }
}

function formatShortDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDocumentType(type: string) {
  const normalized = type.trim().toLowerCase();

  if (normalized === "resume") {
    return "Resume";
  }

  if (normalized === "cover_letter") {
    return "Cover Letter";
  }

  return titleCase(type);
}

export function inferCompanyName(document: UserDocumentSummaryDto) {
  return (
    document.companyName?.trim() ||
    normalizeCompanyHost(document.applyUrl) ||
    normalizeCompanyHost(document.jobLink) ||
    "Unknown Company"
  );
}

export function toDocumentViewModel(document: UserDocumentSummaryDto): DocumentViewModel {
  const companyName = inferCompanyName(document);
  const displayTitle = document.jobTitle?.trim() || document.title;
  const secondaryLabel =
    document.jobTitle && document.jobTitle.trim() !== document.title.trim()
      ? document.title
      : companyName;

  return {
    ...document,
    companyName,
    displayTitle,
    secondaryLabel,
    typeLabel: `${formatDocumentType(document.type)} (PDF/DOCX)`,
    createdDateLabel: formatShortDate(document.createdAt),
  };
}

function getGroupMeta(index: number) {
  return {
    accent: accentSequence[index % accentSequence.length] ?? "primary",
    icon: iconSequence[index % iconSequence.length] ?? Layers,
  };
}

export function groupDocumentsByJob(documents: DocumentViewModel[]): JobDocumentGroup[] {
  return groupDocuments(documents, "job").map((group) => {
    const firstDoc = group.documents[0];
    const companyName = firstDoc?.companyName ?? "";
    return {
      key: group.key,
      label: group.label,
      subtitle: `${companyName} • ${group.documents.length} Documents Generated`,
      documents: group.documents,
      newestCreatedAt: group.newestCreatedAt,
    };
  });
}

export function runSummaryToDocumentGroup(
  run: DocumentRunSummaryDto,
  index: number,
  documents: DocumentViewModel[] = [],
): DocumentGroup {
  return {
    key: run.runId,
    label: resolveRunDisplayLabel({ runId: run.runId, name: run.runName }),
    subtitle: `${formatShortDate(run.newestCreatedAt)} • ${run.documentCount} Documents Generated`,
    documents,
    newestCreatedAt: run.newestCreatedAt,
    ...getGroupMeta(index),
  };
}

function groupDocuments(documents: DocumentViewModel[], groupBy: DocumentsGroupBy): DocumentGroup[] {
  const grouped = new Map<string, DocumentViewModel[]>();

  for (const document of documents) {
    const key =
      groupBy === "company"
        ? document.companyName
        : groupBy === "type"
          ? formatDocumentType(document.type)
          : groupBy === "job"
            ? `${document.displayTitle.trim().toLowerCase()}::${document.companyName.trim().toLowerCase()}`
            : document.runId;

    const current = grouped.get(key) ?? [];
    current.push(document);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .map(([key, groupDocuments]) => {
      const ordered = [...groupDocuments].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
      const newestCreatedAt = ordered[0]?.createdAt ?? new Date().toISOString();

      const firstDoc = ordered[0];

      return {
        key,
        label:
          groupBy === "company"
            ? `Company: ${key}`
            : groupBy === "type"
              ? `Type: ${key}`
              : groupBy === "job"
                ? (firstDoc?.displayTitle ?? key)
                : resolveRunDisplayLabel({ runId: key, name: firstDoc?.runName }),
        subtitle:
          groupBy === "job"
            ? `${firstDoc?.companyName ?? ""} • ${formatShortDate(newestCreatedAt)} • ${ordered.length} Documents Generated`
            : `${formatShortDate(newestCreatedAt)} • ${ordered.length} Documents Generated`,
        documents: ordered,
        newestCreatedAt,
      };
    })
    .sort((left, right) => new Date(right.newestCreatedAt).getTime() - new Date(left.newestCreatedAt).getTime())
    .map((group, index) => ({
      ...group,
      ...getGroupMeta(index),
    }));
}
