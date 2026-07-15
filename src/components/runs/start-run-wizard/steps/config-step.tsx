"use client";

import { useMemo } from "react";
import { AlertCircle, Briefcase, MapPin, Settings2, Clock, Tag } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { JOB_SEARCH_PLATFORMS, type JobSearchPlatform } from "@/types/job-search-platform";
import { DAYS_FILTER_LABELS, LINKEDIN_LIMIT_OPTIONS, type RunConfigState } from "@/components/runs/start-run-dialog.helpers";
import type { RunRecommendationBaselineDto } from "@/types/output/runs.dto";
import { getStartRunRecommendation, formatRecommendationTimestamp } from "@/components/runs/start-run-recommendation";

type ConfigStepProps = {
  state: RunConfigState;
  onChange: (updater: (current: RunConfigState) => RunConfigState) => void;
  locationError?: string | null;
  locationHint?: string | null;
  recommendationBaselines?: RunRecommendationBaselineDto[];
};

export function ConfigStep({
  state,
  onChange,
  locationError,
  locationHint,
  recommendationBaselines = [],
}: ConfigStepProps) {
  const isLinkedinEnabled = state.platforms.has("linkedin");
  const isIndeedEnabled = state.platforms.has("indeed");
  const recommendation = useMemo(
    () => getStartRunRecommendation(state, recommendationBaselines),
    [state, recommendationBaselines]
  );

  function updatePlatform(platform: JobSearchPlatform, checked: boolean) {
    onChange((current) => {
      const next = new Set(current.platforms);
      if (checked) {
        next.add(platform);
      } else {
        next.delete(platform);
      }
      return { ...current, platforms: next };
    });
  }

  return (
    <div className="space-y-10">
      {/* Run Name */}
      <div className="space-y-4">
        <Label htmlFor="run-name" className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
          <Tag className="size-4" />
          Run Name (Optional)
        </Label>
        <div className="bg-surface-container-lowest rounded-xl focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
          <Input
            id="run-name"
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5"
            placeholder="e.g. Q2 UX/UI Design Sourcing"
            value={state.runName}
            onChange={(event) => onChange((current) => ({ ...current, runName: event.target.value }))}
          />
        </div>
      </div>

      {/* Job Title */}
      <div className="space-y-4">
        <Label htmlFor="run-title-keywords" className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
          <Briefcase className="size-4" />
          Target Job Title
        </Label>
        <div className="bg-surface-container-lowest rounded-xl focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
          <Input
            id="run-title-keywords"
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5"
            placeholder="e.g. Senior Product Designer"
            value={state.titleKeywords}
            onChange={(event) => onChange((current) => ({ ...current, titleKeywords: event.target.value }))}
          />
        </div>
      </div>

      {/* Location & posted within */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label htmlFor="run-locations" className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
            <MapPin className="size-4" />
            Location Preferences
          </Label>
          <div className="bg-surface-container-lowest rounded-xl">
            <Input
              id="run-locations"
              className={`bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5 ${locationError ? "text-error" : ""}`}
              placeholder="e.g. Berlin, Remote"
              value={state.locations}
              onChange={(event) => onChange((current) => ({ ...current, locations: event.target.value }))}
            />
          </div>
          {locationError ? (
            <p className="text-sm text-error">{locationError}</p>
          ) : locationHint ? (
            <p className="text-sm text-on-surface-variant">{locationHint}</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <Label htmlFor="run-days-filter" className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
            <Clock className="size-4" />
            Posted Within
          </Label>
          <div className="bg-surface-container-lowest rounded-xl">
            <Select
              value={state.daysFilter}
              onValueChange={(value) => onChange((current) => ({ ...current, daysFilter: value }))}
            >
              <SelectTrigger id="run-days-filter" aria-label="Posted Within" className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5 h-auto">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAYS_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-4">
        <Label className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
          <Settings2 className="size-4" />
          Search Platforms
        </Label>
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex flex-wrap gap-6">
            {JOB_SEARCH_PLATFORMS.map((platform) => (
              <label key={platform} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  id={`run-platform-${platform}`}
                  aria-label={platform}
                  checked={state.platforms.has(platform)}
                  onCheckedChange={(checked) => updatePlatform(platform, checked === true)}
                />
                <span className="text-sm capitalize text-on-surface">{platform}</span>
              </label>
            ))}
          </div>
          {state.platforms.size === 0 ? (
            <p className="mt-3 text-sm text-on-surface-variant">Select at least one platform to continue.</p>
          ) : null}
        </div>
      </div>

      {/* Recommendation Alert */}
      {recommendation ? (
        <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm text-on-surface">
              Your last similar run was on {formatRecommendationTimestamp(recommendation.baseline.created_at)}.
              Choosing &ldquo;{recommendation.selectedDaysFilterLabel}&rdquo; may rescrape many of the same jobs.
            </p>
            <p className="text-sm text-primary">
              We recommend &ldquo;{recommendation.recommendedDaysFilterLabel}&rdquo; for this run.
            </p>
          </div>
        </div>
      ) : null}

      {/* Result Limits */}
      {isLinkedinEnabled || isIndeedEnabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLinkedinEnabled ? (
            <div className="space-y-4">
              <Label className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                LinkedIn Result Limit
              </Label>
              <div className="bg-surface-container-lowest rounded-xl">
                <Select
                  value={state.linkedinResultsLimit}
                  onValueChange={(value) => onChange((current) => ({ ...current, linkedinResultsLimit: value }))}
                >
                  <SelectTrigger aria-label="LinkedIn Result Limit" className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5 h-auto">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {LINKEDIN_LIMIT_OPTIONS.map((limit) => (
                      <SelectItem key={limit} value={String(limit)}>
                        {limit} results
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {isIndeedEnabled ? (
            <div className="space-y-4">
              <Label className="font-label text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                Indeed Result Limit
              </Label>
              <div className="bg-surface-container-lowest rounded-xl">
                <Select
                  value={state.indeedResultsLimit}
                  onValueChange={(value) => onChange((current) => ({ ...current, indeedResultsLimit: value }))}
                >
                  <SelectTrigger aria-label="Indeed Result Limit" className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-5 h-auto">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 results</SelectItem>
                    <SelectItem value="50">50 results</SelectItem>
                    <SelectItem value="75">75 results</SelectItem>
                    <SelectItem value="100">100 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
