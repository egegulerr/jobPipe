"use client";

// fallow-ignore-file security-sink
import type { ReactNode } from "react";
import { CheckCircle2, ExternalLink, FileText, Sparkles, TriangleAlert } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { cn } from "@/lib/utils";

import {
  formatApplicantsCount,
  formatSalarySummary,
  resolveSourceBranding,
  type InsightBuckets,
  type RunJobDto,
} from "./helpers";

type JobIntelTabProps = {
  job: RunJobDto;
  normalizedReasoning: string | null;
  insights: InsightBuckets;
  sanitizedDescriptionHtml: string | null;
  descriptionParagraphs: string[];
  selectedJobApplyUrl: string | null;
  onOpenDocuments: () => void;
};

export function JobIntelTab({
  job,
  normalizedReasoning,
  insights,
  sanitizedDescriptionHtml,
  descriptionParagraphs,
  selectedJobApplyUrl,
  onOpenDocuments,
}: JobIntelTabProps) {
  const sourceBranding = resolveSourceBranding(job.source);

  return (
    <div className="min-w-0 space-y-8">
      <Accordion type="multiple" defaultValue={["general-information", "match-analysis"]} className="min-w-0 space-y-5">
        <AccordionItem value="general-information" className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/6 bg-surface-container-low/65 px-4 shadow-[0_20px_70px_rgba(0,0,0,0.18)] sm:px-6">
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-5 bg-primary" />
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">General Information</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="break-words font-headline text-2xl font-black tracking-tight text-white sm:text-3xl">{job.title}</h2>
                <p className="mt-2 break-words text-lg font-medium text-primary sm:text-xl">{job.company_name ?? "Unknown company"}</p>
                {selectedJobApplyUrl ? (
                  <Button
                    className="mt-5 rounded-2xl bg-primary px-5 text-sm font-bold text-slate-950 hover:bg-primary/85"
                    asChild
                  >
                    <a href={selectedJobApplyUrl} target="_blank" rel="noopener noreferrer">
                      Apply
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
              {sourceBranding ? (
                <div
                  aria-label={sourceBranding.label}
                  className="flex size-14 items-center justify-center rounded-2xl border border-white/8 bg-white/95 font-bold text-slate-700"
                >
                  {sourceBranding.mark}
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/8 bg-white/95">
                  <span className="font-label text-[10px] uppercase tracking-[0.24em] text-slate-700">{job.source.slice(0, 3)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 border-t border-white/6 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              <InfoField label="Source" value={sourceBranding?.label ?? job.source} />
              <InfoField
                label="Posted"
                value={job.posted_at ? <LocalDateTime value={job.posted_at} preset="date" /> : "Unknown"}
              />
              <InfoField label="Location" value={job.location_text ?? "Unknown"} />
              <InfoField label="Salary" value={formatSalarySummary(job) ?? "Not disclosed"} />
              <InfoField label="Applicants" value={formatApplicantsCount(job.applicants_count) ?? "Not available"} />
              <InfoField label="Employment" value={job.employment_type ?? "Unknown"} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="match-analysis" className="min-w-0 overflow-hidden rounded-[1.75rem] border border-secondary/20 bg-linear-to-br from-surface-container-high via-surface-container-high to-surface-container px-4 shadow-[0_28px_100px_rgba(0,0,0,0.22)] sm:px-7">
          <AccordionTrigger className="py-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-5 bg-secondary" />
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary">Match Analysis</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-7">
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-secondary/8 blur-3xl sm:-right-10" />
              <div className="relative min-w-0">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <h3 className="break-words font-headline text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {job.match_verdict ? "Strong Candidate Fit" : "Needs Closer Review"}
                    </h3>
                    <p className="mt-1 font-label text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                      Job Pipe AI Recommendation
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-l-2 border-secondary/30 pl-4">
                  <p className="break-words text-base leading-8 text-on-surface italic sm:text-lg">
                    {normalizedReasoning ? `"${normalizedReasoning}"` : "“We’re still preparing a detailed rationale for this job match.”"}
                  </p>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <InsightList
                    title="Key Strengths"
                    toneClassName="text-secondary"
                    dotClassName="bg-secondary"
                    icon={<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />}
                    items={insights.strengths}
                  />

                  <div>
                    <p className="flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.24em] text-tertiary">
                      <span className="size-2 rounded-full bg-tertiary" />
                      Identified Gaps
                    </p>
                    <ul className="mt-4 space-y-4">
                      {insights.gaps.length > 0 ? (
                        insights.gaps.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-tertiary" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                          <span>No significant fit gaps were highlighted in the current reasoning.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-description" className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/6 bg-surface-container-low/40 px-4 sm:px-6">
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-5 bg-on-surface-variant" />
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Job Description</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            {sanitizedDescriptionHtml ? (
              <div
                className="prose prose-invert max-w-none break-words text-sm text-on-surface-variant [&_*]:max-w-full [&_a]:break-all [&_a]:text-primary [&_img]:h-auto [&_li]:marker:text-primary [&_p]:leading-7 [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: sanitizedDescriptionHtml }}
              />
            ) : descriptionParagraphs.length > 0 ? (
              <div className="space-y-4 text-sm leading-7 text-on-surface-variant">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={`${job.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No job description available.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="border-t border-white/5 pt-2">
        <Button
          type="button"
          className="w-full justify-center rounded-2xl bg-white py-6 text-lg font-extrabold text-slate-950 hover:bg-slate-200"
          onClick={onOpenDocuments}
        >
          <FileText className="size-5" />
          Open Documents
        </Button>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="font-label text-[9px] uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-tight text-white">{value}</p>
    </div>
  );
}

function InsightList({
  title,
  toneClassName,
  dotClassName,
  icon,
  items,
}: {
  title: string;
  toneClassName: string;
  dotClassName: string;
  icon: ReactNode;
  items: string[];
}) {
  return (
    <div>
      <p className={cn("flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.24em]", toneClassName)}>
        <span className={cn("size-2 rounded-full", dotClassName)} />
        {title}
      </p>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant">
            {icon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
