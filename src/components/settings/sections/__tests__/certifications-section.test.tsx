// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CertificationsSection } from "@/components/settings/sections/certifications-section";
import type { SettingsCertificationDto } from "@/types/output/settings.dto";

const mockRandomUUID = vi.fn().mockReturnValue("test-uuid");

beforeEach(() => {
  vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
  });
});

function buildCert(overrides?: Partial<SettingsCertificationDto>): SettingsCertificationDto {
  return {
    id: "1",
    name: "AWS",
    issuer: null,
    issueDate: null,
    description: null,
    ...overrides,
  };
}

describe("CertificationsSection", () => {
  it("renders with provided certifications", () => {
    const certifications = [buildCert({ name: "AWS SA" })];
    render(<CertificationsSection certifications={certifications} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("AWS SA")).toBeTruthy();
  });

  it("adds a new certification with default values", () => {
    const onChange = vi.fn();
    render(<CertificationsSection certifications={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add Certification"));
    expect(onChange).toHaveBeenCalledWith([
      { id: "test-uuid", name: "", issuer: null, issueDate: null, description: null },
    ]);
  });

  it("removes a certification by id", () => {
    const onChange = vi.fn();
    const certifications = [buildCert({ id: "1" }), buildCert({ id: "2", name: "GCP" })];
    render(<CertificationsSection certifications={certifications} onChange={onChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([buildCert({ id: "2", name: "GCP" })]);
  });

  it("updates certification name and preserves empty string", () => {
    const onChange = vi.fn();
    render(<CertificationsSection certifications={[buildCert()]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. AWS Solutions Architect");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildCert({ name: "" })]);
  });

  it("coerces empty issuer to null", () => {
    const onChange = vi.fn();
    render(<CertificationsSection certifications={[buildCert({ issuer: "Amazon" })]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. Amazon Web Services");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildCert({ issuer: null })]);
  });

  it("coerces empty issueDate to null", () => {
    const onChange = vi.fn();
    render(<CertificationsSection certifications={[buildCert({ issueDate: "June 2024" })]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("e.g. June 2024");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildCert({ issueDate: null })]);
  });

  it("coerces empty description to null", () => {
    const onChange = vi.fn();
    render(<CertificationsSection certifications={[buildCert({ description: "Details" })]} onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("Description or credential details...");
    fireEvent.change(textarea, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith([buildCert({ description: null })]);
  });
});
