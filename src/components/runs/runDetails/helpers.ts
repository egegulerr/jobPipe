import sanitizeHtml from "sanitize-html";

import type { JobListFilter } from "@/lib/runs/job-list-filter";
import { matchesJobListFilter } from "@/lib/runs/job-list-filter";
import { safeExternalUrl } from "@/lib/utils/safe-external-url";
import {
  filterDocumentsForJob,
  formatApplicantsCount,
  formatRunDocumentChipLabel,
  formatSalarySummary,
  resolveSelectedDocId,
  resolveSelectedJobId,
} from "@/lib/runs/run-details-view-model";
import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";
import { resolveRunProgressPercent } from "@/lib/runs/run-progress";
import { formatRunStageLabel } from "@/lib/runs/run-stage";
import type {
  RunDetailsResponseDto,
  RunDetailsDocumentDto,
  RunDto,
  RunJobDto,
} from "@/types/output/runs.dto";
export { ACTIVE_RUN_STATUSES } from "@/lib/runs/active-run-statuses";

export type DetailTab = "intel" | "documents";

export type InsightBuckets = {
  strengths: string[];
  gaps: string[];
};

export const jobFilters: { key: JobListFilter; label: string }[] = [
  { key: "all", label: "All Jobs" },
  { key: "matched", label: "Matched Jobs" },
  { key: "unmatched", label: "Unmatched Jobs" },
];

const sourceBranding: Record<string, SourceBranding> = {
  linkedin: { label: "LinkedIn", mark: "in" },
  indeed: { label: "Indeed", mark: "i" },
};

type SourceBranding = {
  label: string;
  mark: string;
};

const negativeInsightPattern = /\b(lack|limited|missing|no prior|gap|weaker|not|without|exposure)\b/i;

export function formatPercentValue(score: number | null | undefined): string | null {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  const normalized = score >= 0 && score <= 1 ? score * 100 : score;
  return `${Math.max(0, Math.min(100, Math.round(normalized)))}%`;
}

export function resolveStageLabel(run: RunDto): string {
  if (run.status === "completed") {
    return "Completed";
  }

  if (run.status === "failed") {
    return "Run failed";
  }

  return run.stage ? formatRunStageLabel(run.stage) : "Preparing pipeline";
}

function resolveStatusTone(status: RunDto["status"]) {
  if (status === "completed") {
    return {
      label: "Ready",
      pillClassName: "border-secondary/30 bg-secondary/10 text-secondary",
      dotClassName: "bg-secondary",
    };
  }

  if (status === "failed") {
    return {
      label: "Attention needed",
      pillClassName: "border-destructive/30 bg-destructive/10 text-destructive",
      dotClassName: "bg-destructive",
    };
  }

  return {
    label: "Analyzing...",
    pillClassName: "border-primary/30 bg-primary/10 text-primary",
    dotClassName: "bg-primary",
  };
}

function normalizeReasoningTone(reasoning: string | null): string | null {
  const normalized = reasoning?.trim();
  if (!normalized) {
    return null;
  }

  return normalized
    .replace(/\b[Tt]his candidate's\b/g, "your")
    .replace(/\bThis candidate\b/g, "You")
    .replace(/\bthis candidate\b/g, "you");
}

function buildInsightBuckets(reasoning: string | null, matchVerdict: boolean | null): InsightBuckets {
  const normalizedReasoning = normalizeReasoningTone(reasoning);
  if (!normalizedReasoning) {
    return {
      strengths: matchVerdict === false ? [] : ["Match reasoning is still being prepared for this opportunity."],
      gaps: matchVerdict === false ? ["The current analysis has not produced specific fit concerns yet."] : [],
    };
  }

  const sentences = normalizedReasoning
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/^["'`\s]+|["'`\s]+$/g, "").trim())
    .filter(Boolean);

  const strengths = sentences.filter((sentence) => !negativeInsightPattern.test(sentence)).slice(0, 3);
  const gaps = sentences.filter((sentence) => negativeInsightPattern.test(sentence)).slice(0, 3);

  return {
    strengths: strengths.length > 0 ? strengths : ["Your profile aligns with the strongest requirements identified in the posting."],
    gaps: gaps.length > 0 ? gaps : matchVerdict === false ? ["The model marked this role as a weaker fit based on the overall requirement mix."] : [],
  };
}

function extractDescription(job: RunJobDto): { html: string | null; paragraphs: string[] } {
  const normalizedHtml = (job.description_html ?? "").replace(/\u0000/g, "").trim();
  const normalizedText = (job.description_text ?? "").replace(/\u0000/g, "").trim();

  const paragraphs = normalizedText
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    html: normalizedHtml || null,
    paragraphs,
  };
}

function sanitizeDescription(html: string | null) {
  if (!html) {
    return null;
  }

  return sanitizeHtml(html, {
    allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "ul", "ol", "li", "strong", "em", "a", "div"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

export function resolveSourceBranding(source: string) {
  const normalizedSource = source.trim().toLowerCase();
  return sourceBranding[normalizedSource] ?? null;
}

export function getRunDetailsViewModel({
  data,
  selectedDoc,
  selectedFilter,
  selectedJob,
}: {
  data: RunDetailsResponseDto;
  selectedDoc: string | undefined;
  selectedFilter: JobListFilter;
  selectedJob: string | undefined;
}) {
  const selectedJobId = resolveSelectedJobId(selectedJob, data.jobs);
  const selectedJobData = selectedJobId ? data.jobs.find((job) => job.id === selectedJobId) : undefined;
  const documentsForSelectedJob = filterDocumentsForJob(data.documents, selectedJobId);
  const selectedDocId = resolveSelectedDocId(selectedDoc, documentsForSelectedJob);
  const statusTone = resolveStatusTone(data.run.status);
  const percentComplete = resolveRunProgressPercent(data.run);

  const counts: Record<JobListFilter, number> = {
    all: data.jobs.length,
    matched: 0,
    unmatched: 0,
  };
  const filteredJobs: RunJobDto[] = [];

  for (const job of data.jobs) {
    if (matchesJobListFilter(job, selectedFilter)) {
      filteredJobs.push(job);
    }

    if (matchesJobListFilter(job, "matched")) {
      counts.matched += 1;
    }

    if (matchesJobListFilter(job, "unmatched")) {
      counts.unmatched += 1;
    }
  }

  const normalizedReasoning = normalizeReasoningTone(selectedJobData?.match_reasoning ?? null);
  const insights = buildInsightBuckets(selectedJobData?.match_reasoning ?? null, selectedJobData?.match_verdict ?? null);
  const description = selectedJobData ? extractDescription(selectedJobData) : { html: null, paragraphs: [] };
  const sanitizedDescriptionHtml = sanitizeDescription(description.html);
  const activeDocument = documentsForSelectedJob.find((document) => document.id === selectedDocId) ?? documentsForSelectedJob[0];
  const jobsTotal = data.run.jobs_total ?? data.jobs.length;
  const jobsMatched = data.run.jobs_matched ?? counts.matched;
  const runHeadline = resolveRunDisplayLabel({
    runId: data.run.id,
    name: data.run.name,
    titleKeywords: data.settings?.runConfig?.title_keywords,
    locations: data.settings?.runConfig?.locations,
  });
  const selectedJobApplyUrl = safeExternalUrl(selectedJobData?.apply_url ?? null);

  return {
    activeDocument,
    counts,
    description,
    documentsForSelectedJob,
    filteredJobs,
    jobsMatched,
    jobsTotal,
    normalizedReasoning,
    percentComplete,
    runHeadline,
    sanitizedDescriptionHtml,
    selectedDocId,
    selectedJobApplyUrl,
    selectedJobData,
    selectedJobId,
    statusTone,
    insights,
  };
}

export { formatApplicantsCount, formatRunDocumentChipLabel, formatSalarySummary };
export type { RunDetailsDocumentDto, RunDto, RunJobDto };
