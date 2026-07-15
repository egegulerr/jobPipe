import { extractText } from "unpdf";
import { describe, expect, it } from "vitest";

import { renderDocumentPdfBuffer } from "@/server/document-artifacts/render-document-pdf";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  return result.text ?? "";
}

async function extractPdfPageCount(buffer: Buffer): Promise<number> {
  const result = await extractText(new Uint8Array(buffer), { mergePages: false });
  return result.totalPages ?? 0;
}

describe("renderDocumentPdfBuffer", () => {
  it("renders a standardized resume PDF", async () => {
    const pdfBuffer = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume-Acme",
      markdown: `# Alex Example

Example City | +1 555 0100 | alex@example.com

## Professional Experience

**Senior Engineer, Acme Corp**
*Jan 2025 - Present*
- Built distributed backend systems
- Improved CI/CD throughput`,
    });

    expect(pdfBuffer.length).toBeGreaterThan(0);

    const text = await extractPdfText(pdfBuffer);
    expect(text).toContain("Alex Example");
    expect(text).toContain("Professional Experience");
    expect(text).toContain("Senior Engineer, Acme Corp");
    expect(text).toContain("Jan 2025 - Present");
  });

  it("renders a standardized cover letter PDF", async () => {
    const pdfBuffer = await renderDocumentPdfBuffer({
      type: "cover_letter",
      title: "Cover-Letter-Acme",
      markdown: `# Alex Example

*January 25, 2026*

Dear Hiring Team,

I am excited to apply for this role and bring my backend and AI engineering experience to your team.`,
    });

    expect(pdfBuffer.length).toBeGreaterThan(0);

    const text = await extractPdfText(pdfBuffer);
    expect(text).toContain("Alex Example");
    expect(text).toContain("January 25, 2026");
    expect(text).toContain("Dear Hiring Team");
  });

  it("falls back to title when markdown is empty", async () => {
    const pdfBuffer = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume-Fallback",
      markdown: "",
    });

    const text = await extractPdfText(pdfBuffer);
    expect(text).toContain("Resume-Fallback");
  });

  it("normalizes unsupported extended Latin glyphs for PDF output", async () => {
    const pdfBuffer = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume-Unicode",
      markdown: `## Education

Ēxample Academy, Sampletown *Aug 2019*`,
    });

    const text = await extractPdfText(pdfBuffer);
    expect(text).toContain("Example Academy, Sampletown");
    expect(text).toContain("Aug 2019");
  });

  it("keeps a long resume to a single page using compact layout rules", async () => {
    const pdfBuffer = await renderDocumentPdfBuffer({
      type: "resume",
      title: "Resume-One-Page",
      markdown: `# Alex Example
1 Example Street, Example City | +1 555 0100 | alex@example.com

## Summary
Full Stack Engineer experienced in building customer-facing applications and internal platforms. Proven ability in backend development using Python and modern JavaScript frameworks, complemented by expertise in cloud environments and CI/CD pipelines.

## Professional Experience
**Senior Engineer, Example Corp, Example City** *Jan 2024 - Present*
- Maintained backend services using .NET, Azure, and RabbitMQ for processing application events.
- Built an internal search assistant using retrieval-augmented generation.
- Managed CI/CD pipelines and infrastructure to support frequent releases.
- Reviewed architecture changes and mentored junior team members.

**Software Engineer, Northwind Labs, Sampletown** *Oct 2021 - Dec 2023*
- Built a product catalog and reporting dashboard for fictional sample data.
- Designed responsive frontend features in Angular backed by Python services.
- Improved delivery workflows with automated reports and integration tests.

**Junior Developer, Acme Systems, Testville** *Jun 2019 - Sep 2021*
- Developed import pipelines for CSV and JSON sample files using Python.
- Added document parsers for synthetic test fixtures.
- Contributed to code reviews and customer support documentation.

## Education
Example University, Sampletown *Oct 2015 - Jul 2019*
Bachelor of Science in Computer Science
- Capstone project: Built a scheduling application using synthetic datasets.
Example Academy, Testville *Aug 2015*
Secondary School Diploma

## Courses
- Advanced C#, Example Training *2024*
- Web Architecture Workshop, Sample Institute *2023*

## Technical Skills
- Backend: .NET, Python, Java, Spring Boot, Node.js, Go, gRPC
- Frontend: React, Next.js, Angular, SwiftUI, TypeScript, Tailwind CSS
- AI/ML: LangChain, LangGraph, RAG Pipelines, Vector Databases, Prompt Engineering
- Cloud/DevOps: AWS, Azure, Docker, Kubernetes, Terraform, CI/CD

## Additional Information
- Languages: English (Native), French (B2), Spanish (B1)
- Agile: Scrum delivery, backlog grooming, stakeholder management`,
    });

    const pageCount = await extractPdfPageCount(pdfBuffer);
    expect(pageCount).toBe(1);
  });
});
