// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtraSkillsSection } from "@/components/settings/sections/extra-skills-section";
import type { SettingsSkillDto } from "@/types/output/settings.dto";

const mockRandomUUID = vi.fn().mockReturnValue("test-uuid");

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
  });
});

function buildSkill(overrides?: Partial<SettingsSkillDto>): SettingsSkillDto {
  return {
    id: "1",
    name: "React",
    context: null,
    description: null,
    ...overrides,
  };
}

describe("ExtraSkillsSection", () => {
  it("renders with provided skills", () => {
    const skills = [buildSkill({ name: "React", context: "Frontend" })];
    render(<ExtraSkillsSection skills={skills} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("React")).toBeTruthy();
    expect(screen.getByDisplayValue("Frontend")).toBeTruthy();
  });

  it("adds a new skill with default values", () => {
    const onChange = vi.fn();
    render(<ExtraSkillsSection skills={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add Experience"));
    expect(onChange).toHaveBeenCalledWith([
      { id: "test-uuid", name: "", context: null, description: null },
    ]);
  });

  it("removes a skill by id", () => {
    const onChange = vi.fn();
    const skills = [buildSkill({ id: "1", name: "React" }), buildSkill({ id: "2", name: "Node" })];
    render(<ExtraSkillsSection skills={skills} onChange={onChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([buildSkill({ id: "2", name: "Node" })]);
  });

  it("updates skill name without coercing to null", () => {
    const onChange = vi.fn();
    const skills = [buildSkill()];
    render(<ExtraSkillsSection skills={skills} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. Freelance Web Developer");
    fireEvent.change(input, { target: { value: "Vue" } });
    expect(onChange).toHaveBeenCalledWith([buildSkill({ name: "Vue" })]);
  });

  it("preserves empty string for name", () => {
    const onChange = vi.fn();
    const skills = [buildSkill({ name: "React" })];
    render(<ExtraSkillsSection skills={skills} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. Freelance Web Developer");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildSkill({ name: "" })]);
  });

  it("coerces empty context to null", () => {
    const onChange = vi.fn();
    const skills = [buildSkill({ context: "Web" })];
    render(<ExtraSkillsSection skills={skills} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. Self-employed, Upwork");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildSkill({ context: null })]);
  });

  it("coerces empty description to null", () => {
    const onChange = vi.fn();
    const skills = [buildSkill({ description: "Expert" })];
    render(<ExtraSkillsSection skills={skills} onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("Description of responsibilities and achievements...");
    fireEvent.change(textarea, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildSkill({ description: null })]);
  });
});
