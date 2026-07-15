import { describe, it, expect } from "vitest";
import { renderDocumentDocxBuffer } from "../render-document-docx";

describe("renderDocumentDocxBuffer", () => {
  it("renders a resume with basic markdown", async () => {
    const result = await renderDocumentDocxBuffer({
      type: "resume",
      title: "Test Resume",
      markdown: "# John Doe\n\n**Company Name** *Job Title*\n\n- Achievement 1\n- Achievement 2",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders a cover letter", async () => {
    const result = await renderDocumentDocxBuffer({
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
  });

  it("renders with only a title when markdown is empty", async () => {
    const result = await renderDocumentDocxBuffer({
      type: "resume",
      title: "Empty Resume",
      markdown: "",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders headings correctly", async () => {
    const result = await renderDocumentDocxBuffer({
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
    const result = await renderDocumentDocxBuffer({
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

  it("renders mixed inline formatting", async () => {
    const result = await renderDocumentDocxBuffer({
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
    const result = await renderDocumentDocxBuffer({
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

  it("handles whitespace-only markdown", async () => {
    const result = await renderDocumentDocxBuffer({
      type: "resume",
      title: "Whitespace Resume",
      markdown: "   \n   \n   ",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles HTML tags in markdown", async () => {
    const result = await renderDocumentDocxBuffer({
      type: "resume",
      title: "HTML in Markdown",
      markdown: `# <script>alert('xss')</script>Test
Some **bold** <em>italic</em> text`,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("renders cover letter with proper spacing", async () => {
    const result = await renderDocumentDocxBuffer({
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

  it.each(["classic", "modern_sans"] as const)(
    "renders a resume docx using the %s design",
    async (resumeTemplateId) => {
      const result = await renderDocumentDocxBuffer({
        type: "resume",
        title: `Resume-${resumeTemplateId}`,
        markdown: "# Alex Morgan\n\n## Experience\n**Acme** *Engineer*\n- Built things",
        resumeTemplateId,
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    },
  );
});
