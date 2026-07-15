// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfessionalSection } from "@/components/settings/sections/professional-section";

vi.mock("@/hooks/use-parse-resume", () => ({
  useParseResume: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ProfessionalSection", () => {
  it("renders all sub-sections", () => {
    render(
      <ProfessionalSection
        experiences={[]}
        technologies={[]}
        certifications={[]}
        onChange={vi.fn()}
        onTechnologiesChange={vi.fn()}
        onCertificationsChange={vi.fn()}
        onParsedResume={vi.fn()}
      />,
    );
    expect(screen.getByText("Master Resume")).toBeTruthy();
    expect(screen.getByText("Experience & Education")).toBeTruthy();
    expect(screen.getByText("Technologies")).toBeTruthy();
    expect(screen.getByText("Certifications")).toBeTruthy();
  });
});
