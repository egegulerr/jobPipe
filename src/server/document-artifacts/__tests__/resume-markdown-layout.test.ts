import { describe, expect, it } from "vitest";
import { parseResumeRoleDateHeader } from "../resume-markdown-layout";

describe("parseResumeRoleDateHeader", () => {
  it("merges two-line bold then italic date", () => {
    const lines = ["**Role, Co**", "*Jan 2020 — Present*", "next"];
    const r = parseResumeRoleDateHeader(lines, 0);
    expect(r).toEqual({
      mergedMarkdown: "**Role, Co** *Jan 2020 — Present*",
      extraLineSkips: 1,
    });
  });

  it("merges single-line bold and italic", () => {
    const lines = ["**Role** *2020 — 2021*"];
    const r = parseResumeRoleDateHeader(lines, 0);
    expect(r).toEqual({
      mergedMarkdown: "**Role** *2020 — 2021*",
      extraLineSkips: 0,
    });
  });

  it("returns null for plain bullets", () => {
    expect(parseResumeRoleDateHeader(["- item"], 0)).toBeNull();
  });
});
