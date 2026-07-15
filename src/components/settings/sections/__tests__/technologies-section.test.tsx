// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TechnologiesSection } from "@/components/settings/sections/technologies-section";
import type { SettingsTechnologyDto } from "@/types/output/settings.dto";

const mockRandomUUID = vi.fn().mockReturnValue("test-uuid");

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
  });
});

function buildTech(overrides?: Partial<SettingsTechnologyDto>): SettingsTechnologyDto {
  return {
    id: "1",
    name: "React",
    ...overrides,
  };
}

describe("TechnologiesSection", () => {
  it("renders with provided technologies", () => {
    const technologies = [buildTech(), buildTech({ id: "2", name: "Node" })];
    render(<TechnologiesSection technologies={technologies} onChange={vi.fn()} />);
    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("Node")).toBeTruthy();
  });

  it("adds a technology on button click", () => {
    const onChange = vi.fn();
    render(<TechnologiesSection technologies={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Type a technology and press Enter...");
    fireEvent.change(input, { target: { value: "TypeScript" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith([{ id: "test-uuid", name: "TypeScript" }]);
  });

  it("adds a technology on Enter key", () => {
    const onChange = vi.fn();
    render(<TechnologiesSection technologies={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Type a technology and press Enter...");
    fireEvent.change(input, { target: { value: "TypeScript" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([{ id: "test-uuid", name: "TypeScript" }]);
  });

  it("does not add empty technology", () => {
    const onChange = vi.fn();
    render(<TechnologiesSection technologies={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blocks duplicate technologies case-insensitively", () => {
    const onChange = vi.fn();
    render(<TechnologiesSection technologies={[buildTech()]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Type a technology and press Enter...");
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a technology by id", () => {
    const onChange = vi.fn();
    render(<TechnologiesSection technologies={[buildTech(), buildTech({ id: "2", name: "Node" })]} onChange={onChange} />);
    const removeButton = screen.getByRole("button", { name: "Remove React" });
    fireEvent.click(removeButton);
    expect(onChange).toHaveBeenCalledWith([buildTech({ id: "2", name: "Node" })]);
  });

  it("clears input after adding", () => {
    render(<TechnologiesSection technologies={[]} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Type a technology and press Enter...");
    fireEvent.change(input, { target: { value: "TypeScript" } });
    fireEvent.click(screen.getByText("Add"));
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("disables add button when input is empty", () => {
    render(<TechnologiesSection technologies={[]} onChange={vi.fn()} />);
    const addButton = screen.getByText("Add");
    expect(addButton.hasAttribute("disabled")).toBe(true);
  });
});
