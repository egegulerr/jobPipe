import type { RunConfigState } from "@/components/runs/start-run-dialog.helpers";
import type { RunRecommendationBaselineDto } from "@/types/output/runs.dto";

const ALLOWED_DAYS_FILTERS = [1, 3, 7] as const;

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function haveSamePlatforms(current: Set<string>, previous: string[]) {
  if (current.size !== previous.length) {
    return false;
  }

  return previous.every((platform) => current.has(platform));
}

function isComparableBaseline(state: RunConfigState, baseline: RunRecommendationBaselineDto) {
  if (!normalizeText(state.titleKeywords) || !normalizeText(state.locations) || state.platforms.size === 0 || !state.daysFilter) {
    return false;
  }

  if (normalizeText(state.titleKeywords) !== normalizeText(baseline.config.title_keywords)) {
    return false;
  }

  if (normalizeText(state.locations) !== normalizeText(baseline.config.locations)) {
    return false;
  }

  if (!haveSamePlatforms(state.platforms, baseline.config.platforms)) {
    return false;
  }

  return true;
}

function getElapsedWholeDays(createdAt: string, now: Date) {
  const createdAtMs = new Date(createdAt).getTime();

  if (!Number.isFinite(createdAtMs)) {
    return null;
  }

  const elapsedMs = Math.max(0, now.getTime() - createdAtMs);
  return Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
}

function getRecommendedDaysFilter(elapsedDays: number) {
  const safeThreshold = Math.max(1, elapsedDays);

  for (let index = ALLOWED_DAYS_FILTERS.length - 1; index >= 0; index -= 1) {
    const candidate = ALLOWED_DAYS_FILTERS[index];
    if (candidate <= safeThreshold) {
      return candidate;
    }
  }

  return 1;
}

export function getDaysFilterLabel(daysFilter: number) {
  if (daysFilter === 1) {
    return "Last 24 hours";
  }

  if (daysFilter === 3) {
    return "Last 3 days";
  }

  if (daysFilter === 7) {
    return "Last 7 days";
  }

  return `Last ${daysFilter} days`;
}

export function getStartRunRecommendation(
  state: RunConfigState,
  baselines: RunRecommendationBaselineDto[],
  now: Date = new Date(),
) {
  const selectedDaysFilter = Number(state.daysFilter);

  if (!Number.isFinite(selectedDaysFilter)) {
    return null;
  }

  const comparableBaseline = baselines.find((baseline) => isComparableBaseline(state, baseline));
  if (!comparableBaseline) {
    return null;
  }

  const elapsedDays = getElapsedWholeDays(comparableBaseline.created_at, now);
  if (elapsedDays === null || elapsedDays >= selectedDaysFilter) {
    return null;
  }

  const recommendedDaysFilter = getRecommendedDaysFilter(elapsedDays);

  return {
    baseline: comparableBaseline,
    elapsedDays,
    selectedDaysFilter,
    selectedDaysFilterLabel: getDaysFilterLabel(selectedDaysFilter),
    recommendedDaysFilter,
    recommendedDaysFilterLabel: getDaysFilterLabel(recommendedDaysFilter),
  };
}

export function formatRecommendationTimestamp(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
