import { describe, expect, it } from "vitest";
import { RENDER_LIMITS } from "@/server/document-artifacts/markdown-inline";
import {
  markdownSourceForDocumentRender,
  normalizeCoverLetterMarkdown,
  normalizeGeneratedCoverLetterMarkdown,
} from "../markdown";

describe("normalizeGeneratedCoverLetterMarkdown", () => {
  it("unwraps fenced output then plain letter normalization", () => {
    const raw = "```markdown\nDear **Team**,\n\nLine.\n```";
    const out = normalizeGeneratedCoverLetterMarkdown(raw);
    expect(out).not.toContain("**");
    expect(out).toContain("Dear Team");
  });
});

describe("markdownSourceForDocumentRender", () => {
  it("normalizes only cover letters", () => {
    expect(markdownSourceForDocumentRender("resume", "# **Bold**")).toBe("# **Bold**");
    expect(markdownSourceForDocumentRender("cover_letter", "# **Bold**")).toBe("Bold");
  });

  it("rejects cover letter markdown over max length before normalization", () => {
    const huge = "x".repeat(RENDER_LIMITS.MAX_MARKDOWN_LENGTH + 1);
    expect(() => markdownSourceForDocumentRender("cover_letter", huge)).toThrow(
      "Markdown content exceeds maximum allowed length",
    );
  });
});

describe("normalizeCoverLetterMarkdown", () => {
  it("strips headings, bullets, and inline emphasis", () => {
    const input = `# Motivation Letter

**Alex Example** | Munich

To the **Recruitment Team**,

- **AI:** LangGraph and **Python**.
- Second point.

Best regards,

**Alex Example**`;

    const out = normalizeCoverLetterMarkdown(input);

    expect(out).not.toContain("**");
    expect(out).not.toContain("#");
    expect(out).not.toMatch(/^[-*]\s/m);
    expect(out).toContain("Alex Example");
    expect(out).toContain("LangGraph and Python");
  });

  it("preserves angle-bracket contact text and decodes entities", () => {
    expect(normalizeCoverLetterMarkdown("Jane Doe &lt;jane@example.com&gt;")).toBe(
      "Jane Doe <jane@example.com>",
    );
    expect(normalizeCoverLetterMarkdown("Reach me at <jane@example.com> today.")).toContain(
      "<jane@example.com>",
    );
  });

  it("is idempotent on already plain text", () => {
    const plain = "Dear Hiring Manager,\n\nPlain paragraph.\n\nSincerely,\n\nJane Doe";
    expect(normalizeCoverLetterMarkdown(plain)).toBe(plain);
  });

  it("drops thematic breaks and stray code fence lines", () => {
    const input = [
      "Dear Hiring Manager,",
      "",
      "---",
      "",
      "Paragraph.",
      "",
      "***",
      "```markdown",
      "Sincerely,",
      "Jane Doe",
      "```",
    ].join("\n");

    expect(normalizeCoverLetterMarkdown(input)).toBe(
      "Dear Hiring Manager,\n\nParagraph.\n\nSincerely,\nJane Doe",
    );
  });
});
