import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/settings-repository", () => ({
  createSettingsRepository: vi.fn(() => ({})),
}));

import { createRunsService } from "@/server/services/runs-service";

describe("getRunDetails", () => {
  const mockGetRunWithSearchConfigForUser = vi.fn();
  const mockListRunJobs = vi.fn();
  const mockListRunJobMatches = vi.fn();
  const mockListRunDocuments = vi.fn();

  const runsService = createRunsService({
    runsRepository: {
      getRunWithRunConfigForUser: mockGetRunWithSearchConfigForUser,
    } as never,
    jobsRepository: {
      listRunJobs: mockListRunJobs,
      listRunJobMatches: mockListRunJobMatches,
    } as never,
    documentsRepository: { listRunDocuments: mockListRunDocuments } as never,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns INFRA error when run query fails", async () => {
    mockGetRunWithSearchConfigForUser.mockResolvedValue({ data: null, error: { message: "db down" } });
    mockListRunJobs.mockResolvedValue({ data: [], error: null });
    mockListRunJobMatches.mockResolvedValue({ data: [], error: null });
    mockListRunDocuments.mockResolvedValue({ data: [], error: null });

    const result = await runsService.getRunDetails("run-id", "user-id");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INFRA");
      expect(result.error.status).toBe(500);
    }
  });

  it("returns NOT_FOUND when run is missing without infra errors", async () => {
    mockGetRunWithSearchConfigForUser.mockResolvedValue({ data: null, error: null });
    mockListRunJobs.mockResolvedValue({ data: [], error: null });
    mockListRunJobMatches.mockResolvedValue({ data: [], error: null });
    mockListRunDocuments.mockResolvedValue({ data: [], error: null });

    const result = await runsService.getRunDetails("run-id", "user-id");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.status).toBe(404);
    }
  });

  it("returns run details with job-linked documents and settings", async () => {
    mockGetRunWithSearchConfigForUser.mockResolvedValue({
      data: {
        id: "run-id",
        status: "completed",
        stage: "completed",
        stage_message: "done",
        jobs_total: 2,
        jobs_processed: 2,
        jobs_matched: 1,
        documents_generated: 2,
        created_at: "2026-02-16T10:00:00.000Z",
        started_at: "2026-02-16T10:01:00.000Z",
        finished_at: "2026-02-16T10:05:00.000Z",
        error_message: null,
        run_config: {
          title_keywords: "Backend Engineer",
          locations: "Berlin",
          days_filter: 3,
          platforms: ["linkedin"],
          country_code: "de",
          linkedin_results_limit: 100,
          indeed_results_limit: null,
          job_matcher_requests: "Be strict",
          resume_writer_requests: "",
          cover_letter_writer_requests: "",
        },
      },
      error: null,
    });

    mockListRunJobs.mockResolvedValue({
      data: [
        {
          id: "job-1",
          title: "Backend Engineer",
          company_name: "Acme",
          company_website: "https://acme.example",
          description_text: "Example job description for testing accordion details content.",
          description_html: "<p>Example job description for testing accordion details content.</p>",
          posted_at: null,
          apply_url: null,
          location_text: "Berlin",
          salary_min: 80000,
          salary_max: 100000,
          salary_currency: "EUR",
          salary_unit: "YEAR",
          salary_text: "EUR 80000 - 100000",
          applicants_count: 24,
          employment_type: "Full-time",
          seniority_level: "Mid-Senior",
          source: "linkedin",
        },
      ],
      error: null,
    });

    mockListRunJobMatches.mockResolvedValue({
      data: [{ job_id: "job-1", verdict: true, score: 82, reasoning: "Strong match." }],
      error: null,
    });

    mockListRunDocuments.mockResolvedValue({
      data: [
        {
          id: "doc-1",
          job_id: "job-1",
          type: "resume",
          format: "pdf",
          title: "Resume-Acme",
          storage_path: "user/u/runs/w/jobs/job-1/pdf/resume.pdf",
          created_at: "2026-02-16T10:04:00.000Z",
        },
      ],
      error: null,
    });


    const result = await runsService.getRunDetails("run-id", "user-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.documents[0]?.job_id).toBe("job-1");
      expect(result.data.jobs[0]?.match_verdict).toBe(true);
      expect(result.data.jobs[0]?.match_score).toBe(82);
      expect(result.data.settings).not.toBeNull();
      expect(result.data.settings?.runConfig?.title_keywords).toBe("Backend Engineer");
    }
  });

  it("returns null runConfig when run has no config attached", async () => {
    mockGetRunWithSearchConfigForUser.mockResolvedValue({
      data: {
        id: "run-id",
        status: "completed",
        stage: "completed",
        stage_message: null,
        jobs_total: 0,
        jobs_processed: 0,
        jobs_matched: 0,
        documents_generated: 0,
        created_at: "2026-02-16T10:00:00.000Z",
        started_at: null,
        finished_at: null,
        error_message: null,
        run_config: null,
      },
      error: null,
    });
    mockListRunJobs.mockResolvedValue({ data: [], error: null });
    mockListRunJobMatches.mockResolvedValue({ data: [], error: null });
    mockListRunDocuments.mockResolvedValue({ data: [], error: null });

    const result = await runsService.getRunDetails("run-id", "user-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.settings?.runConfig).toBeNull();
    }
  });
});
