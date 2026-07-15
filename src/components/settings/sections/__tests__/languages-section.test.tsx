// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LanguagesSection } from "@/components/settings/sections/languages-section";
import type { SettingsLanguageDto } from "@/types/output/settings.dto";

const mockRandomUUID = vi.fn().mockReturnValue("test-uuid");

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
  });
});

function buildLanguage(overrides?: Partial<SettingsLanguageDto>): SettingsLanguageDto {
  return {
    id: "1",
    name: "English",
    proficiency: "Fluent",
    ...overrides,
  };
}

describe("LanguagesSection", () => {
  it("renders with provided languages", () => {
    const languages = [buildLanguage()];
    render(<LanguagesSection languages={languages} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("English")).toBeTruthy();
  });

  it("adds a new language with default Intermediate proficiency", () => {
    const onChange = vi.fn();
    render(<LanguagesSection languages={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add Language"));
    expect(onChange).toHaveBeenCalledWith([
      { id: "test-uuid", name: "", proficiency: "Intermediate" },
    ]);
  });

  it("removes a language by id", () => {
    const onChange = vi.fn();
    const languages = [buildLanguage({ id: "1" }), buildLanguage({ id: "2", name: "Spanish" })];
    render(<LanguagesSection languages={languages} onChange={onChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([buildLanguage({ id: "2", name: "Spanish" })]);
  });

  it("updates language name", () => {
    const onChange = vi.fn();
    render(<LanguagesSection languages={[buildLanguage()]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. English, Spanish");
    fireEvent.change(input, { target: { value: "German" } });
    expect(onChange).toHaveBeenCalledWith([buildLanguage({ name: "German" })]);
  });

  it("updates proficiency selection", () => {
    const onChange = vi.fn();
    render(<LanguagesSection languages={[buildLanguage()]} onChange={onChange} />);
    const select = screen.getByDisplayValue("Fluent");
    fireEvent.change(select, { target: { value: "Native" } });
    expect(onChange).toHaveBeenCalledWith([buildLanguage({ proficiency: "Native" })]);
  });

  it("renders all proficiency options", () => {
    render(<LanguagesSection languages={[buildLanguage()]} onChange={vi.fn()} />);
    expect(screen.getByRole("option", { name: "Native" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Fluent" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Intermediate" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Basic" })).toBeTruthy();
  });
});
