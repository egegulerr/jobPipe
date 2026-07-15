// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StartRunWizard } from "@/components/runs/start-run-wizard";
import { fetchJson } from "@/lib/api/http-client";
import type { RunRecommendationBaselineDto } from "@/types/output/runs.dto";

const createRunMutateAsync = vi.fn<(...args: [FormData]) => Promise<unknown>>();
const createRunReset = vi.fn();
const mockUseSettings = vi.fn();
const parseResumeMutateAsync = vi.fn();
const updateSettingsMutateAsync = vi.fn();

const mockInvalidateQueries = vi.fn();
const fetchJsonMock = vi.mocked(fetchJson);

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-settings", () => ({
  useSettings: () => mockUseSettings(),
}));

vi.mock("@/hooks/use-parse-resume", () => ({
  useParseResume: () => ({
    mutateAsync: parseResumeMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-update-settings", () => ({
  useUpdateSettings: () => ({
    mutateAsync: updateSettingsMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/lib/api/http-client", () => ({
  fetchJson: vi.fn().mockResolvedValue({ resolved: true, countryCode: "de", displayName: "Berlin, Germany" }),
}));

vi.mock("@/hooks/mutations/use-create-run-mutation", () => ({
  useCreateRunMutation: () => ({
    mutateAsync: createRunMutateAsync,
    reset: createRunReset,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function buildRecommendationBaseline(overrides?: Partial<RunRecommendationBaselineDto>): RunRecommendationBaselineDto {
  const defaultCreatedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return {
    run_id: overrides?.run_id ?? "run-1",
    created_at: overrides?.created_at ?? defaultCreatedAt,
    config: {
      title_keywords: overrides?.config?.title_keywords ?? "Platform Engineer",
      locations: overrides?.config?.locations ?? "Remote",
      days_filter: overrides?.config?.days_filter ?? 7,
      platforms: overrides?.config?.platforms ?? ["linkedin", "indeed"],
      country_code: overrides?.config?.country_code ?? "us",
    },
  };
}

function buildSettingsData(overrides?: { hasAvatar?: boolean; avatarUrl?: string | null }) {
  return {
    profile: {
      userId: "user-1",
      displayName: "Test User",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      bio: null,
      avatarUrl: overrides?.avatarUrl ?? null,
      hasAvatar: overrides?.hasAvatar ?? false,
    },
    experiences: [
      {
        id: "exp-1",
        type: "experience",
        title: "Platform Engineer",
        organization: "Acme",
        dateRange: "2020 - Present",
        description: null,
      },
    ],
    skills: [],
    languages: [],
    technologies: [],
    certifications: [],
  };
}

function fillStep1Fields() {
  fireEvent.change(screen.getByLabelText("Target Job Title"), { target: { value: "Platform Engineer" } });
  fireEvent.change(screen.getByLabelText("Location Preferences"), { target: { value: "Remote" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "linkedin" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "indeed" }));
  fireEvent.click(screen.getByRole("combobox", { name: /Posted Within/i }));
  fireEvent.click(screen.getByRole("option", { name: "Last 3 days" }));
}

function fillStep1IndeedOnlyFields() {
  fireEvent.change(screen.getByLabelText("Target Job Title"), { target: { value: "Platform Engineer" } });
  fireEvent.change(screen.getByLabelText("Location Preferences"), { target: { value: "Berlin" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "indeed" }));
  fireEvent.click(screen.getByRole("combobox", { name: /Posted Within/i }));
  fireEvent.click(screen.getByRole("option", { name: "Last 3 days" }));
  fireEvent.click(screen.getByRole("combobox", { name: /Indeed Result Limit/i }));
  fireEvent.click(screen.getByRole("option", { name: "25 results" }));
}

async function advanceToStep2() {
  fillStep1Fields();
  fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
  await waitFor(() => {
    expect(screen.getByText("Configure your resume & profile for this run")).toBeTruthy();
  });
}

async function chooseSetupProfileNow() {
  fireEvent.click(screen.getByRole("radio", { name: /Set up profile settings now/i }));
  await waitFor(() => {
    expect(screen.getByText("Master Resume")).toBeTruthy();
  });
}

async function uploadResume(file: File) {
  fireEvent.change(screen.getByLabelText("Upload Resume PDF"), {
    target: { files: [file] },
  });
  await waitFor(() => {
    expect(screen.getByText(file.name)).toBeTruthy();
  });
}

async function saveProfileChanges() {
  fireEvent.click(screen.getByRole("button", { name: "Commit Changes" }));
  await waitFor(() => {
    expect(screen.getByText("Saved profile will be used")).toBeTruthy();
  });
}

async function advanceToStep3() {
  await advanceToStep2();
  fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
  await waitFor(() => {
    expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
  });
}

async function advanceToStep4() {
  await advanceToStep3();
  fireEvent.click(screen.getByRole("button", { name: /Review/ }));
  await waitFor(() => {
    expect(screen.getByText("Ready to launch")).toBeTruthy();
  });
}

describe("StartRunWizard", () => {
  let scrollIntoViewSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchJsonMock.mockResolvedValue({ resolved: true, countryCode: "de", displayName: "Berlin, Germany" });
    if (!window.HTMLElement.prototype.scrollIntoView) {
      Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
        value: () => {},
        writable: true,
        configurable: true,
      });
    }
    scrollIntoViewSpy = vi.spyOn(window.HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
    mockUseSettings.mockReturnValue({
      data: buildSettingsData(),
      isLoading: false,
      error: null,
    });
    parseResumeMutateAsync.mockResolvedValue({
      profile: { firstName: null, lastName: null, bio: null },
      experiences: [],
      skills: [],
      technologies: [],
      certifications: [],
      languages: [],
    });
    updateSettingsMutateAsync.mockResolvedValue(buildSettingsData());
    createRunMutateAsync.mockResolvedValue({ runId: "run-1" });
  });

  afterEach(() => {
    scrollIntoViewSpy?.mockRestore();
  });

  it("opens with blank fields", () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    expect((screen.getByLabelText("Target Job Title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Location Preferences") as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: /Next Step/ }).getAttribute("disabled")).not.toBeNull();
  });

  it("uses saved profile settings without showing the resume upload", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();

    expect(screen.getByText("Saved profile will be used")).toBeTruthy();
    expect(screen.queryByLabelText("Upload Resume PDF")).toBeNull();
  });

  it("renders a full-screen dialog shell", () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("fixed");
    expect(dialog.className).toContain("inset-0");
  });

  it("keeps the resume upload hidden until setup profile now is selected", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();

    expect(screen.queryByRole("link", { name: "Download saved resume PDF" })).toBeNull();
    expect(screen.queryByLabelText("Upload Resume PDF")).toBeNull();

    await chooseSetupProfileNow();
    expect(screen.getByLabelText("Upload Resume PDF")).toBeTruthy();
  });

  it("shows a parsed resume status inside Professional Profile when a PDF is uploaded", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    await chooseSetupProfileNow();

    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "new-resume.pdf", {
      type: "application/pdf",
    });

    await uploadResume(file);

    expect(screen.getByText("new-resume.pdf")).toBeTruthy();
    expect(screen.getByText(/Resume parsed/)).toBeTruthy();
  });

  it("does not render the old resume replacement undo flow", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    await chooseSetupProfileNow();

    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "new-resume.pdf", {
      type: "application/pdf",
    });

    await uploadResume(file);

    expect(screen.getByText("new-resume.pdf")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Download saved resume PDF" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Undo resume replacement" })).toBeNull();
  });

  it("keeps the saved profile selected when starting with blank fields", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    expect((screen.getByLabelText("Target Job Title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Location Preferences") as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: /Next Step/ }).getAttribute("disabled")).not.toBeNull();

    await advanceToStep2();

    expect(screen.getByText("Saved profile will be used")).toBeTruthy();
  });

  it("keeps the selected file when a new PDF is chosen on step 2", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    await chooseSetupProfileNow();

    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "resume.pdf", {
      type: "application/pdf",
    });

    await uploadResume(file);

    expect(screen.getByText(/Resume parsed/)).toBeTruthy();
  });

  it("hides saved profile option when no job experience is saved", async () => {
    mockUseSettings.mockReturnValue({
      data: {
        ...buildSettingsData(),
        experiences: [],
        skills: [],
      },
      isLoading: false,
      error: null,
    });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();

    expect(screen.queryByText("Use my saved profile settings")).toBeNull();
    expect(screen.queryByText("Saved profile will be used")).toBeNull();
    expect(screen.getByText("Master Resume")).toBeTruthy();

    const nextButton = screen.getByRole("button", { name: /Next Step/ });
    expect(nextButton.getAttribute("disabled")).not.toBeNull();
  });

  it("allows navigation to step 3 when profile is ready without a prior run resume", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();

    expect(screen.getByText("Saved profile will be used")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));

    await waitFor(() => {
      expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
    });
  });

  it("creates a run with FormData from the wizard config", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep4();
    fireEvent.click(screen.getByRole("button", { name: "Launch Run" }));

    await waitFor(() => {
      expect(createRunMutateAsync).toHaveBeenCalledTimes(1);
    });

    const formData = createRunMutateAsync.mock.calls[0]?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("config")).toBeTruthy();
  });

  it("submits only Indeed in the run config when Indeed is the only selected platform", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    fillStep1IndeedOnlyFields();
    expect(screen.getByRole("checkbox", { name: "indeed" })).toBeChecked();
    expect(screen.queryByRole("combobox", { name: /LinkedIn Result Limit/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
    await waitFor(() => {
      expect(screen.getByText("Configure your resume & profile for this run")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
    await waitFor(() => {
      expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    await waitFor(() => {
      expect(screen.getByText("Ready to launch")).toBeTruthy();
    });

    expect(screen.getByText("indeed")).toBeTruthy();
    expect(screen.queryByText("linkedin")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Launch Run" }));

    await waitFor(() => {
      expect(createRunMutateAsync).toHaveBeenCalledTimes(1);
    });

    const configJson = createRunMutateAsync.mock.calls[0]?.[0].get("config");
    expect(configJson).toBeTruthy();

    const parsed = JSON.parse(String(configJson)) as {
      config: {
        platforms: string[];
        linkedinResultsLimit: number | null;
        indeedResultsLimit: number | null;
      };
    };

    expect(parsed.config.platforms).toEqual(["indeed"]);
    expect(parsed.config.linkedinResultsLimit).toBeNull();
    expect(parsed.config.indeedResultsLimit).toBe(25);
  });

  it("shows an error and stays on step 1 when the city cannot be resolved", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      resolved: false,
      countryCode: null,
      displayName: null,
      failureReason: "not_found",
    });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    fillStep1Fields();
    fireEvent.change(screen.getByLabelText("Location Preferences"), {
      target: { value: "UnknownPlace" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));

    expect(
      await screen.findByText(
        'Could not find a matching city for this location. Please enter a valid city name (for example "Berlin" or "London").',
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Use my saved profile settings")).toBeNull();
  });

  it("shows an error for remote-only locations and stays on step 1", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      resolved: false,
      countryCode: null,
      displayName: null,
      failureReason: "missing_concrete_city",
    });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    fillStep1Fields();
    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));

    expect(
      await screen.findByText('Enter a concrete city name to continue (for example "Berlin" or "London").'),
    ).toBeTruthy();
    expect(screen.queryByText("Use my saved profile settings")).toBeNull();
  });

  it("submits only run config in FormData after profile setup", async () => {
    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    await chooseSetupProfileNow();

    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "resume.pdf", {
      type: "application/pdf",
    });

    await uploadResume(file);
    await saveProfileChanges();

    // Already on step 2, advance to step 4
    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
    await waitFor(() => {
      expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    await waitFor(() => {
      expect(screen.getByText("Ready to launch")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Launch Run" }));

    await waitFor(() => {
      expect(createRunMutateAsync).toHaveBeenCalledTimes(1);
    });

    const formData = createRunMutateAsync.mock.calls[0]?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("resume")).toBeNull();
    expect(formData.get("config")).toBeTruthy();
  });

  it("allows retrying launch after run creation fails", async () => {
    createRunMutateAsync
      .mockRejectedValueOnce(new Error("run create failed"))
      .mockResolvedValueOnce({ runId: "run-2" });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    await chooseSetupProfileNow();

    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "resume.pdf", {
      type: "application/pdf",
    });

    await uploadResume(file);
    await saveProfileChanges();

    // Already on step 2, advance to step 4
    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
    await waitFor(() => {
      expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    await waitFor(() => {
      expect(screen.getByText("Ready to launch")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Launch Run" }));

    await waitFor(() => {
      expect(createRunMutateAsync).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "Launch Run" }));

    await waitFor(() => {
      expect(createRunMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  it("renders a warning for an overlapping comparable run", () => {
    render(
      <StartRunWizard
        open={true}
        onOpenChange={vi.fn()}
        recommendationBaselines={[buildRecommendationBaseline()]}
      />,
    );

    fillStep1Fields();

    expect(screen.getByText(/Your last similar run was on/i)).toBeTruthy();
    expect(screen.getByText(/Choosing/i)).toBeTruthy();
    expect(screen.getByText(/We recommend/i)).toBeTruthy();
  });

  it("hides the warning when the draft no longer matches the previous search intent", () => {
    render(
      <StartRunWizard
        open={true}
        onOpenChange={vi.fn()}
        recommendationBaselines={[buildRecommendationBaseline()]}
      />,
    );

    fillStep1Fields();

    expect(screen.getByText(/Your last similar run was on/i)).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Target Job Title"), {
      target: { value: "Backend Engineer" },
    });

    expect(screen.queryByText(/Your last similar run was on/i)).toBeNull();
  });

  it("updates the recommendation when posted within changes and does not auto-change the selected value", async () => {
    render(
      <StartRunWizard
        open={true}
        onOpenChange={vi.fn()}
        recommendationBaselines={[
          buildRecommendationBaseline({
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        ]}
      />,
    );

    fillStep1Fields();

    fireEvent.click(screen.getByRole("combobox", { name: /Posted Within/i }));
    fireEvent.click(screen.getByRole("option", { name: "Last 7 days" }));

    expect(screen.getByText(/We recommend/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: /Posted Within/i }));
    fireEvent.click(screen.getByRole("option", { name: "Last 3 days" }));

    expect(screen.queryByText(/We recommend/i)).toBeNull();
  });

  it("hides the warning when no comparable baseline exists", () => {
    render(
      <StartRunWizard
        open={true}
        onOpenChange={vi.fn()}
        recommendationBaselines={[
          buildRecommendationBaseline({
            config: {
              title_keywords: "Different Role",
              locations: "Remote",
              days_filter: 7,
              platforms: ["linkedin", "indeed"],
              country_code: "us",
            },
          }),
        ]}
      />,
    );

    fillStep1Fields();

    expect(screen.queryByText(/Your last similar run was on/i)).toBeNull();
  });

  it("shows profile photo preference on the review step when included", async () => {
    mockUseSettings.mockReturnValue({
      data: buildSettingsData({ hasAvatar: true, avatarUrl: "https://example.com/avatar.png" }),
      isLoading: false,
      error: null,
    });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep2();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Include profile picture on generated resumes/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Next Step/ }));
    await waitFor(() => {
      expect(screen.getByText("Fine-tune matching & drafts")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    await waitFor(() => {
      expect(screen.getByText("Included on generated resumes (top-right)")).toBeTruthy();
    });
  });

  it("shows profile photo preference on the review step when excluded", async () => {
    mockUseSettings.mockReturnValue({
      data: buildSettingsData({ hasAvatar: true, avatarUrl: "https://example.com/avatar.png" }),
      isLoading: false,
      error: null,
    });

    render(<StartRunWizard open={true} onOpenChange={vi.fn()} />);

    await advanceToStep4();

    expect(screen.getByText("Not included on generated resumes")).toBeTruthy();
  });
});
