import { describe, expect, it } from "vitest";

import {
  buildCreateRunPayload,
  buildEmptyRunConfigState,
  buildRunFormData,
  canSubmitRunConfig,
  getProfilePictureReviewSummary,
  type RunConfigState,
} from "@/components/runs/start-run-dialog.helpers";
import { isRunProfileReady } from "@/lib/settings/profile-readiness";
import type { SettingsResponseDto } from "@/types/output/settings.dto";

function buildValidRunConfigState(overrides: Partial<RunConfigState> = {}): RunConfigState {
  return {
    ...buildEmptyRunConfigState(),
    titleKeywords: "Platform Engineer",
    locations: "Remote",
    daysFilter: "3",
    platforms: new Set(["linkedin", "indeed"] as const),
    linkedinResultsLimit: "150",
    indeedResultsLimit: "75",
    ...overrides,
  };
}

function buildSettings(overrides: Partial<SettingsResponseDto> = {}): SettingsResponseDto {
  return {
    profile: {
      userId: "user-1",
      displayName: "Test User",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      bio: null,
      avatarUrl: null,
      hasAvatar: false,
    },
    experiences: [],
    skills: [],
    languages: [],
    technologies: [],
    certifications: [],
    ...overrides,
  };
}

describe("start run dialog helpers", () => {
  it("builds an empty run config state", () => {
    expect(buildEmptyRunConfigState()).toEqual({
      runName: "",
      titleKeywords: "",
      locations: "",
      daysFilter: "",
      linkedinResultsLimit: "100",
      indeedResultsLimit: "50",
      platforms: new Set(),
      promptOverrides: { job_matcher: "", resume_writer: "", cover_letter_writer: "" },
      includeProfilePicture: false,
      resumeTemplate: "classic",
    });
  });

  it("treats profile as ready when first name, last name, and one experience exist", () => {
    expect(isRunProfileReady(undefined)).toBe(false);
    expect(isRunProfileReady(buildSettings())).toBe(false);
    expect(
      isRunProfileReady(
        buildSettings({
          profile: {
            ...buildSettings().profile,
            firstName: "Ada",
            lastName: null,
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
        }),
      ),
    ).toBe(false);
    expect(
      isRunProfileReady(
        buildSettings({
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
        }),
      ),
    ).toBe(true);
  });

  it("builds create-run payload with only Indeed when LinkedIn is not selected", () => {
    const state = buildValidRunConfigState({
      platforms: new Set(["indeed"] as const),
      indeedResultsLimit: "25",
    });

    expect(buildCreateRunPayload(state)).toEqual({
      config: {
        titleKeywords: "Platform Engineer",
        locations: "Remote",
        daysFilter: 3,
        platforms: ["indeed"],
        linkedinResultsLimit: null,
        indeedResultsLimit: 25,
        jobMatcherRequests: "",
        resumeWriterRequests: "",
        coverLetterWriterRequests: "",
        includeProfilePicture: false,
        resumeTemplate: "classic",
      },
    });
  });

  it("builds create-run payload from config state", () => {
    const state = buildValidRunConfigState();

    expect(buildCreateRunPayload(state)).toEqual({
      config: {
        titleKeywords: "Platform Engineer",
        locations: "Remote",
        daysFilter: 3,
        platforms: ["linkedin", "indeed"],
        linkedinResultsLimit: 150,
        indeedResultsLimit: 75,
        jobMatcherRequests: "",
        resumeWriterRequests: "",
        coverLetterWriterRequests: "",
        includeProfilePicture: false,
        resumeTemplate: "classic",
      },
    });
  });

  it("includes profile picture preference in the create-run payload", () => {
    const state = buildValidRunConfigState({ includeProfilePicture: true });

    expect(buildCreateRunPayload(state).config).toMatchObject({
      includeProfilePicture: true,
    });
  });

  it("starts each wizard session with a blank run config", () => {
    expect(buildEmptyRunConfigState().includeProfilePicture).toBe(false);
    expect(buildEmptyRunConfigState().titleKeywords).toBe("");
  });

  it("includes prompt overrides in the create-run payload", () => {
    const state = buildValidRunConfigState({
      promptOverrides: {
        job_matcher: "",
        resume_writer: "",
        cover_letter_writer: "Use British English spelling.",
      },
    });

    expect(buildCreateRunPayload(state)).toEqual({
      config: {
        titleKeywords: "Platform Engineer",
        locations: "Remote",
        daysFilter: 3,
        platforms: ["linkedin", "indeed"],
        linkedinResultsLimit: 150,
        indeedResultsLimit: 75,
        jobMatcherRequests: "",
        resumeWriterRequests: "",
        coverLetterWriterRequests: "Use British English spelling.",
        includeProfilePicture: false,
        resumeTemplate: "classic",
      },
    });
  });

  it("includes the selected resume template in the create-run payload", () => {
    const state = buildValidRunConfigState({ resumeTemplate: "modern_sans" });

    expect(buildCreateRunPayload(state).config).toMatchObject({
      resumeTemplate: "modern_sans",
    });
  });

  it("treats config as submittable when required fields are present", () => {
    const state = buildValidRunConfigState();
    expect(canSubmitRunConfig(state)).toBe(true);
  });

  it("treats empty config as not submittable", () => {
    expect(canSubmitRunConfig(buildEmptyRunConfigState())).toBe(false);
  });

  it("includes optional run name in form data", () => {
    const state = buildValidRunConfigState({ runName: "  Q2 UX Sourcing  " });
    const formData = buildRunFormData({ state });

    expect(formData.get("name")).toBe("Q2 UX Sourcing");
  });

  it("omits run name from form data when blank", () => {
    const state = buildValidRunConfigState({ runName: "   " });
    const formData = buildRunFormData({ state });

    expect(formData.get("name")).toBeNull();
  });

  it("builds run form data with config only", () => {
    const state = buildValidRunConfigState();
    const formData = buildRunFormData({ state });

    expect(formData.get("resume")).toBeNull();
    expect(formData.get("resumeAssetId")).toBeNull();
    expect(formData.get("config")).toBeTruthy();
  });

  it("summarizes included profile photo when opted in and avatar exists", () => {
    expect(
      getProfilePictureReviewSummary({
        includeProfilePicture: true,
        hasAvatar: true,
      }),
    ).toEqual({
      included: true,
      label: "Included on generated resumes (top-right)",
    });
  });

  it("summarizes excluded profile photo when opted out", () => {
    expect(
      getProfilePictureReviewSummary({
        includeProfilePicture: false,
        hasAvatar: true,
      }),
    ).toEqual({
      included: false,
      label: "Not included on generated resumes",
    });
  });

  it("summarizes excluded profile photo when no avatar is uploaded", () => {
    expect(
      getProfilePictureReviewSummary({
        includeProfilePicture: false,
        hasAvatar: false,
      }),
    ).toEqual({
      included: false,
      label: "Not included — no profile photo uploaded",
    });
  });
});
