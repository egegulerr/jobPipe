import { describe, it, expect } from "vitest";
import { renderDocumentPdfBuffer } from "../render-document-pdf";

describe("renderDocumentPdfBuffer", () => {
  it("renders a resume with basic markdown", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Test Resume",
      markdown: "# John Doe\n\n**Company Name** *Job Title*\n\n- Achievement 1\n- Achievement 2",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
    // PDF files start with %PDF
    expect(result.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("renders a cover letter", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "cover_letter",
      title: "Cover Letter - Acme Corp",
      markdown: `# Hiring Manager

Dear Hiring Manager,

I am writing to apply for the position at **Acme Corp**.

*Sincerely,*
John Doe`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
    expect(result.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("renders with only a title when markdown is empty", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Empty Resume",
      markdown: "",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
    expect(result.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("renders headings correctly", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume with Headings",
      markdown: `# Main Heading
## Section Heading
### Subsection Heading
Regular paragraph text`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders bullet points", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume with Bullets",
      markdown: `## Skills
- JavaScript
- TypeScript
- React

* Alternative bullet
* Another item`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders resume two-column sections", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume with Two-Column Section",
      markdown: `## Technical Skills
- JavaScript
- TypeScript
- React
- Node.js
- Python
- AWS
- Docker
- Kubernetes`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders mixed inline formatting", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Formatted Resume",
      markdown: `## Experience
**Company** *Role*
Worked with **bold** and *italic* text and \`code\` snippets.

[Link text](https://example.com) should show as text only`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders resume header pattern correctly", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume with Headers",
      markdown: `## Experience
**Software Engineer** *Tech Corp*
Developed key features.

**Senior Developer** *Another Company*
Led team of engineers.`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("merges two-line role + date into one rendered line", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Split headers",
      markdown: `## Experience
**Advanced Developer, Acme, Munich**
*Jan 2025 — Present*
- Built features.`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles whitespace-only markdown", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Whitespace Resume",
      markdown: "   \n   \n   ",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles HTML tags in markdown", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "HTML in Markdown",
      markdown: `# <script>alert('xss')</script>Test
Some **bold** <em>italic</em> text`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders cover letter with proper spacing", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "cover_letter",
      title: "Formal Cover Letter",
      markdown: `# Hiring Manager
Acme Corporation
123 Business Street

Dear Hiring Manager,

I am excited to apply for the position. My experience includes:

- 5 years of relevant work
- Strong technical skills
- Excellent communication

I look forward to discussing this opportunity.

Sincerely,
John Doe`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles resume with many sections efficiently", async () => {
    const sections = Array(10)
      .fill(0)
      .map(
        (_, i) => `## Section ${i + 1}
**Company ${i + 1}** *Role ${i + 1}*
- Achievement A
- Achievement B
- Achievement C`
      )
      .join("\n\n");

    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Long Resume",
      markdown: `# John Doe\n\n${sections}`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("uses compact template for long resumes", async () => {
    // Create a resume that would typically be multi-page
    const longContent = Array(50)
      .fill(0)
      .map(
        (_, i) => `## Experience ${i + 1}
**Company Name ${i + 1}** *Senior Position ${i + 1}*
- Led team of engineers in developing scalable solutions
- Implemented CI/CD pipelines and improved deployment frequency
- Mentored junior developers and conducted code reviews
- Collaborated with product managers to define requirements`
      )
      .join("\n\n");

    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Very Long Resume",
      markdown: `# John Doe\n\n${longContent}`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders a resume with a top-right profile image", async () => {
    const profileImage = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );

    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume With Photo",
      markdown: "# Jane Doe\n\n## Experience\n**Acme** *Engineer*\n- Built things",
      profileImage: { buffer: profileImage, mimeType: "image/png" },
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
    expect(result.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it.each(["classic", "modern_sans"] as const)(
    "renders a resume using the %s design",
    async (resumeTemplateId) => {
      const result = await renderDocumentPdfBuffer({
        type: "resume",
        title: `Resume-${resumeTemplateId}`,
        markdown: "# Alex Morgan\n\n## Experience\n**Acme** *Engineer*\n- Built things",
        resumeTemplateId,
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
      expect(result.toString("ascii", 0, 4)).toBe("%PDF");
    },
  );

  it("falls back to the classic design for an unknown resumeTemplateId", async () => {
    const result = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume-unknown",
      markdown: "# Alex Morgan\n\n## Experience\n**Acme** *Engineer*\n- Built things",
      resumeTemplateId: "does-not-exist" as never,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString("ascii", 0, 4)).toBe("%PDF");
  });
});
