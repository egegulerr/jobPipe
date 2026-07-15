import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RunsStats } from "@/components/runs/runs-stats";

describe("RunsStats", () => {
  it("shows the average job matching rate for completed runs", () => {
    const markup = renderToStaticMarkup(
      <RunsStats
        jobsProcessed={18}
        runs={[
          { status: "completed", jobs_total: 10, jobs_matched: 4 },
          { status: "completed", jobs_total: 5, jobs_matched: 3 },
          { status: "failed", jobs_total: 20, jobs_matched: 20 },
        ]}
      />,
    );

    expect(markup).toContain("47%");
    expect(markup).toContain("Average Job Matching Rate");
  });

  it("shows 0 percent when there are no completed runs with scraped jobs", () => {
    const markup = renderToStaticMarkup(
      <RunsStats
        jobsProcessed={0}
        runs={[
          { status: "running", jobs_total: 10, jobs_matched: 4 },
          { status: "completed", jobs_total: 0, jobs_matched: 0 },
        ]}
      />,
    );

    expect(markup).toContain("0%");
  });
});
