import { describe, expect, it } from "vitest";

import {
  getDaysFilterLabel,
  getStartRunRecommendation,
} from "@/components/runs/start-run-recommendation";
import type { RunConfigState } from "@/components/runs/start-run-dialog.helpers";
import type { RunRecommendationBaselineDto } from "@/types/output/runs.dto";

function buildState(overrides?: Partial<RunConfigState>): RunConfigState {
  return {
    runName: overrides?.runName ?? "",
    titleKeywords: overrides?.titleKeywords ?? "Platform Engineer",
    locations: overrides?.locations ?? "Remote",
    daysFilter: overrides?.daysFilter ?? "7",
    linkedinResultsLimit: overrides?.linkedinResultsLimit ?? "150",
    indeedResultsLimit: overrides?.indeedResultsLimit ?? "75",
    platforms: overrides?.platforms ?? new Set(["linkedin", "indeed"]),
    promptOverrides: overrides?.promptOverrides ?? { job_matcher: "", resume_writer: "", cover_letter_writer: "" },
    includeProfilePicture: overrides?.includeProfilePicture ?? false,
    resumeTemplate: overrides?.resumeTemplate ?? "classic",
  };
}

function buildBaseline(overrides?: Partial<RunRecommendationBaselineDto>): RunRecommendationBaselineDto {
  return {
    run_id: overrides?.run_id ?? "run-1",
    created_at: overrides?.created_at ?? "2026-03-07T12:00:00.000Z",
    config: {
      title_keywords: overrides?.config?.title_keywords ?? "Platform Engineer",
      locations: overrides?.config?.locations ?? "Remote",
      days_filter: overrides?.config?.days_filter ?? 7,
      platforms: overrides?.config?.platforms ?? ["linkedin", "indeed"],
      country_code: overrides?.config?.country_code ?? "us",
    },
  };
}

describe("start run recommendation", () => {
  const now = new Date("2026-03-08T12:00:00.000Z");

  it("returns no warning when baselines are empty", () => {
    expect(getStartRunRecommendation(buildState(), [], now)).toBeNull();
  });

  it("matches the latest comparable baseline by normalized title, location, and platforms", () => {
    const recommendation = getStartRunRecommendation(
      buildState(),
      [
        buildBaseline({
          run_id: "run-2",
          created_at: "2026-03-08T10:00:00.000Z",
          config: {
            title_keywords: " platform engineer ",
            locations: " remote ",
            days_filter: 7,
            platforms: ["linkedin", "indeed"],
            country_code: "us",
          },
        }),
        buildBaseline({
          run_id: "run-1",
          created_at: "2026-03-07T12:00:00.000Z",
        }),
      ],
      now,
    );

    expect(recommendation?.baseline.run_id).toBe("run-2");
  });

  it("ignores baselines with different platforms", () => {
    expect(
      getStartRunRecommendation(
        buildState(),
        [buildBaseline({ config: { title_keywords: "Platform Engineer", locations: "Remote", days_filter: 7, platforms: ["linkedin"], country_code: null } })],
        now,
      ),
    ).toBeNull();
  });

  it("warns for a 7-day filter when the last comparable run was 1 day ago", () => {
    const recommendation = getStartRunRecommendation(buildState(), [buildBaseline()], now);

    expect(recommendation?.selectedDaysFilter).toBe(7);
    expect(recommendation?.recommendedDaysFilter).toBe(1);
  });

  it("warns for a 3-day filter when the last comparable run was today", () => {
    const recommendation = getStartRunRecommendation(
      buildState({ daysFilter: "3" }),
      [buildBaseline({ created_at: "2026-03-08T11:00:00.000Z" })],
      now,
    );

    expect(recommendation?.selectedDaysFilter).toBe(3);
    expect(recommendation?.recommendedDaysFilter).toBe(1);
  });

  it("does not warn when elapsed days is equal to the selected filter", () => {
    expect(
      getStartRunRecommendation(
        buildState({ daysFilter: "3" }),
        [buildBaseline({ created_at: "2026-03-05T12:00:00.000Z" })],
        now,
      ),
    ).toBeNull();
  });

  it("recommends 1 when elapsed days is 0 or 1", () => {
    const todayRecommendation = getStartRunRecommendation(
      buildState(),
      [buildBaseline({ created_at: "2026-03-08T08:00:00.000Z" })],
      now,
    );
    const yesterdayRecommendation = getStartRunRecommendation(
      buildState(),
      [buildBaseline({ created_at: "2026-03-07T12:00:00.000Z" })],
      now,
    );

    expect(todayRecommendation?.recommendedDaysFilter).toBe(1);
    expect(yesterdayRecommendation?.recommendedDaysFilter).toBe(1);
  });

  it("recommends 3 when elapsed days is between 3 and 6", () => {
    const recommendation = getStartRunRecommendation(
      buildState({ daysFilter: "7" }),
      [buildBaseline({ created_at: "2026-03-04T12:00:00.000Z" })],
      now,
    );

    expect(recommendation?.recommendedDaysFilter).toBe(3);
  });

  it("formats days filter labels for the supported options", () => {
    expect(getDaysFilterLabel(1)).toBe("Last 24 hours");
    expect(getDaysFilterLabel(3)).toBe("Last 3 days");
    expect(getDaysFilterLabel(7)).toBe("Last 7 days");
  });
});
