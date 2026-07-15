import { describe, expect, it } from "vitest";

import { countJobsForFilter, matchesJobListFilter, parseJobListFilter } from "@/lib/runs/job-list-filter";

const matchedJob = { match_verdict: true, match_reasoning: null };
const unmatchedJob = { match_verdict: false, match_reasoning: "Missing core requirements" };
const skippedJob = { match_verdict: null, match_reasoning: "Skipped: duplicate posting" };
const pendingJob = { match_verdict: null, match_reasoning: null };

describe("job-list-filter", () => {
  it("parses known filters and falls back to all", () => {
    expect(parseJobListFilter("matched")).toBe("matched");
    expect(parseJobListFilter("unmatched")).toBe("unmatched");
    expect(parseJobListFilter("other")).toBe("all");
    expect(parseJobListFilter(undefined)).toBe("all");
  });

  it("matches jobs against the selected filter", () => {
    expect(matchesJobListFilter(matchedJob, "all")).toBe(true);
    expect(matchesJobListFilter(matchedJob, "matched")).toBe(true);
    expect(matchesJobListFilter(matchedJob, "unmatched")).toBe(false);

    expect(matchesJobListFilter(unmatchedJob, "matched")).toBe(false);
    expect(matchesJobListFilter(unmatchedJob, "unmatched")).toBe(true);
    expect(matchesJobListFilter(skippedJob, "unmatched")).toBe(true);
    expect(matchesJobListFilter(pendingJob, "unmatched")).toBe(true);
  });

  it("counts jobs for each filter", () => {
    const jobs = [matchedJob, unmatchedJob, skippedJob, pendingJob];

    expect(countJobsForFilter(jobs, "all")).toBe(4);
    expect(countJobsForFilter(jobs, "matched")).toBe(1);
    expect(countJobsForFilter(jobs, "unmatched")).toBe(3);
  });
});
