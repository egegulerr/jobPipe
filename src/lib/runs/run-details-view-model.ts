type RunJobLite = {
  id: string;
  company_name: string | null;
  location_text?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_unit?: string | null;
  salary_text?: string | null;
  applicants_count?: number | null;
};

type RunDocumentLite = {
  id: string;
  type: string;
  title: string;
  job_id: string | null;
};

export function resolveSelectedJobId<TJob extends RunJobLite>(rawJobId: string | undefined, jobs: TJob[]): string | undefined {
  if (!rawJobId) {
    return undefined;
  }

  return jobs.some((job) => job.id === rawJobId) ? rawJobId : undefined;
}

export function filterDocumentsForJob<TDocument extends RunDocumentLite>(documents: TDocument[], selectedJobId: string | undefined): TDocument[] {
  if (!selectedJobId) {
    return documents;
  }

  return documents.filter((document) => document.job_id === selectedJobId);
}

export function resolveSelectedDocId<TDocument extends RunDocumentLite>(rawDocId: string | undefined, documents: TDocument[]): string | undefined {
  if (rawDocId && documents.some((document) => document.id === rawDocId)) {
    return rawDocId;
  }

  return documents[0]?.id;
}

export function formatMatchScore(score: number | null | undefined): string | null {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  const normalized = score >= 0 && score <= 1 ? score * 100 : score;
  const clamped = Math.min(100, Math.max(0, Math.round(normalized)));
  return `Score ${clamped}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatSalarySummary(job: {
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_unit?: string | null;
  salary_text?: string | null;
}): string | null {
  const hasRange = typeof job.salary_min === "number" || typeof job.salary_max === "number";
  if (!hasRange) {
    const fallback = job.salary_text?.trim() ?? "";
    return fallback ? fallback : null;
  }

  const currency = job.salary_currency?.trim();
  const min = typeof job.salary_min === "number" ? formatNumber(job.salary_min) : null;
  const max = typeof job.salary_max === "number" ? formatNumber(job.salary_max) : null;
  const amount = min && max ? `${min} - ${max}` : min ?? max;
  const unit = job.salary_unit?.trim();

  if (!amount) {
    return null;
  }

  const prefix = currency ? `${currency} ` : "";
  const suffix = unit ? ` / ${unit}` : "";
  return `${prefix}${amount}${suffix}`;
}

export function formatApplicantsCount(applicantsCount: number | null | undefined): string | null {
  if (typeof applicantsCount !== "number" || Number.isNaN(applicantsCount) || applicantsCount < 0) {
    return null;
  }

  const count = Math.round(applicantsCount);
  return `${formatNumber(count)} applicants`;
}

function documentTypeLabel(type: string): string {
  if (type === "resume") {
    return "Resume";
  }

  if (type === "cover_letter") {
    return "Cover Letter";
  }

  return type;
}

export function formatRunDocumentChipLabel(document: RunDocumentLite, jobsById: Map<string, RunJobLite>): string {
  const typeLabel = documentTypeLabel(document.type);
  const companyName = document.job_id ? jobsById.get(document.job_id)?.company_name?.trim() : null;

  if (companyName) {
    return `${typeLabel} - ${companyName}`;
  }

  if (document.title.trim()) {
    return document.title;
  }

  return `${typeLabel} - Unknown Company`;
}
