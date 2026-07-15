// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResumeUploadSection } from "@/components/settings/sections/resume-upload-section";

const mockMutateAsync = vi.fn();
const mockIsPending = { value: false };

vi.mock("@/hooks/use-parse-resume", () => ({
  useParseResume: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending.value,
  }),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

describe("ResumeUploadSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending.value = false;
  });

  it("renders upload area", () => {
    render(<ResumeUploadSection onParsedResume={vi.fn()} />);
    expect(screen.getByText("Click to upload your resume")).toBeTruthy();
  });

  it("shows parsing state when pending", () => {
    mockIsPending.value = true;
    render(<ResumeUploadSection onParsedResume={vi.fn()} />);
    expect(screen.getByText("Parsing resume...")).toBeTruthy();
  });

  it("rejects files larger than 5MB", () => {
    render(<ResumeUploadSection onParsedResume={vi.fn()} />);
    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(toastError).toHaveBeenCalledWith("File exceeds 5MB limit");
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls parse mutation on file select", async () => {
    mockMutateAsync.mockResolvedValue({
      profile: { firstName: "John", lastName: "Doe", bio: null },
      experiences: [],
      skills: [],
      technologies: [],
      certifications: [],
      languages: [],
    });

    const onParsedResume = vi.fn();
    render(<ResumeUploadSection onParsedResume={onParsedResume} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(file);
    });
    expect(toastSuccess).toHaveBeenCalledWith("Resume parsed successfully");
    expect(onParsedResume).toHaveBeenCalled();
  });

  it("shows error when parse fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Parse failed"));

    render(<ResumeUploadSection onParsedResume={vi.fn()} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Parse failed");
    });
  });

  it("shows error when onParsedResume throws", async () => {
    mockMutateAsync.mockResolvedValue({
      profile: { firstName: "John", lastName: "Doe", bio: null },
      experiences: [],
      skills: [],
      technologies: [],
      certifications: [],
      languages: [],
    });

    const onParsedResume = vi.fn().mockImplementation(() => {
      throw new Error("Apply failed");
    });

    render(<ResumeUploadSection onParsedResume={onParsedResume} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Resume parsed, but failed to apply results");
    });
  });

  it("resets file input after success", async () => {
    mockMutateAsync.mockResolvedValue({
      profile: { firstName: "John", lastName: "Doe", bio: null },
      experiences: [],
      skills: [],
      technologies: [],
      certifications: [],
      languages: [],
    });

    render(<ResumeUploadSection onParsedResume={vi.fn()} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });
});
