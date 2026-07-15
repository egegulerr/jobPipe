// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExperiencesSection } from "@/components/settings/sections/experiences-section";
import type { SettingsExperienceDto } from "@/types/output/settings.dto";

const mockRandomUUID = vi.fn().mockReturnValue("test-uuid");

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
  });
});

function buildExperience(overrides?: Partial<SettingsExperienceDto>): SettingsExperienceDto {
    return {
      id: "1",
      type: "experience",
      title: "Developer",
    organization: null,
    dateRange: null,
    description: null,
    ...overrides,
  };
}

describe("ExperiencesSection", () => {
  it("renders with provided experiences", () => {
    const experiences = [buildExperience({ title: "Senior Dev" })];
    render(<ExperiencesSection experiences={experiences} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Senior Dev")).toBeTruthy();
  });

  it("adds a new experience with default values", () => {
    const onChange = vi.fn();
    render(<ExperiencesSection experiences={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add Section"));
    expect(onChange).toHaveBeenCalledWith([
      { id: "test-uuid", type: "experience", title: "", organization: null, dateRange: null, description: null },
    ]);
  });

  it("removes an experience by id", () => {
    const onChange = vi.fn();
    const experiences = [buildExperience({ id: "1" }), buildExperience({ id: "2", title: "Manager" })];
    render(<ExperiencesSection experiences={experiences} onChange={onChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([buildExperience({ id: "2", title: "Manager" })]);
  });

  it("updates experience title without coercing to null", () => {
    const onChange = vi.fn();
    render(<ExperiencesSection experiences={[buildExperience()]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "Lead" } });
    expect(onChange).toHaveBeenCalledWith([buildExperience({ title: "Lead" })]);
  });

  it("preserves empty string for title", () => {
    const onChange = vi.fn();
    render(<ExperiencesSection experiences={[buildExperience({ title: "Dev" })]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildExperience({ title: "" })]);
  });

  it("coerces empty organization to null", () => {
    const onChange = vi.fn();
    render(<ExperiencesSection experiences={[buildExperience({ organization: "Acme" })]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Organization");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildExperience({ organization: null })]);
  });

  it("coerces empty description to null", () => {
    const onChange = vi.fn();
    render(<ExperiencesSection experiences={[buildExperience({ description: "Details" })]} onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("Key responsibilities...");
    fireEvent.change(textarea, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildExperience({ description: null })]);
  });
});
