import { describe, expect, it } from "vitest";

import {
  normalizeMarkdownLines,
  parseInlineSegments,
  stripInlineMarkdown,
} from "../markdown-inline";

describe("markdown-inline", () => {
  describe("stripInlineMarkdown", () => {
    it("strips bold markers", () => {
      expect(stripInlineMarkdown("**bold**", (v) => v)).toBe("bold");
    });

    it("strips italic markers", () => {
      expect(stripInlineMarkdown("*italic*", (v) => v)).toBe("italic");
    });

    it("strips code markers", () => {
      expect(stripInlineMarkdown("`code`", (v) => v)).toBe("code");
    });

    it("strips links keeping text", () => {
      expect(stripInlineMarkdown("[link text](http://example.com)", (v) => v)).toBe(
        "link text",
      );
    });

    it("handles empty string", () => {
      expect(stripInlineMarkdown("", (v) => v)).toBe("");
    });

    it("handles null/undefined input", () => {
      expect(stripInlineMarkdown(null as unknown as string, (v) => v)).toBe("");
      expect(stripInlineMarkdown(undefined as unknown as string, (v) => v)).toBe("");
    });

    it("trims whitespace", () => {
      expect(stripInlineMarkdown("  **bold**  ", (v) => v)).toBe("bold");
    });
  });

  describe("parseInlineSegments", () => {
    const cleanText = (v: string) => v;

    it("parses bold text", () => {
      const segments = parseInlineSegments("Hello **world**", cleanText);
      expect(segments).toEqual([
        { kind: "normal", text: "Hello " },
        { kind: "strong", text: "world" },
      ]);
    });

    it("parses italic text", () => {
      const segments = parseInlineSegments("Hello *world*", cleanText);
      expect(segments).toEqual([
        { kind: "normal", text: "Hello " },
        { kind: "em", text: "world" },
      ]);
    });

    it("parses code inline", () => {
      const segments = parseInlineSegments("Use `code` here", cleanText);
      expect(segments).toEqual([
        { kind: "normal", text: "Use " },
        { kind: "normal", text: "code" },
        { kind: "normal", text: " here" },
      ]);
    });

    it("parses links", () => {
      const segments = parseInlineSegments("Click [here](http://example.com)", cleanText);
      expect(segments).toEqual([
        { kind: "normal", text: "Click " },
        { kind: "normal", text: "here" },
      ]);
    });

    it("filters empty segments", () => {
      const segments = parseInlineSegments("****", cleanText);
      expect(segments).toEqual([{ kind: "normal", text: "****" }]);
    });

    it("handles text without formatting", () => {
      const segments = parseInlineSegments("plain text", cleanText);
      expect(segments).toEqual([{ kind: "normal", text: "plain text" }]);
    });
  });

  describe("normalizeMarkdownLines", () => {
    it("normalizes CRLF to LF", () => {
      expect(normalizeMarkdownLines("line1\r\nline2\r\nline3")).toEqual([
        "line1",
        "line2",
        "line3",
      ]);
    });

    it("normalizes CR to LF", () => {
      expect(normalizeMarkdownLines("line1\rline2")).toEqual(["line1", "line2"]);
    });

    it("converts br tags to newlines", () => {
      expect(normalizeMarkdownLines("line1<br>line2")).toEqual(["line1", "line2"]);
      expect(normalizeMarkdownLines("line1<br/>line2")).toEqual(["line1", "line2"]);
      expect(normalizeMarkdownLines("line1<br />line2")).toEqual(["line1", "line2"]);
    });

    it("removes null bytes", () => {
      expect(normalizeMarkdownLines("line1\u0000line2")).toEqual(["line1line2"]);
    });

    it("handles empty string", () => {
      expect(normalizeMarkdownLines("")).toEqual([]);
    });

    it("handles null/undefined input", () => {
      expect(normalizeMarkdownLines(null as unknown as string)).toEqual([]);
      expect(normalizeMarkdownLines(undefined as unknown as string)).toEqual([]);
    });

    it("throws on input exceeding max length", () => {
      const longInput = "a".repeat(11 * 1024 * 1024);
      expect(() => normalizeMarkdownLines(longInput)).toThrow(
        "Markdown content exceeds maximum allowed length",
      );
    });
  });
});