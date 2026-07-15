#!/usr/bin/env node
/**
 * Renders one sample resume PDF per registered resume design into
 * public/assets/resume-templates/<id>.pdf using the same renderer the
 * application renderer uses. The committed PDFs are shown as
 * "Preview sample" in the run wizard's resume layout selector.
 *
 * Run from repo root:  pnpm debug:resume-template-previews
 * Pure layout rendering with fixture markdown; no external services are needed.
 *
 * To regenerate only one design's preview:
 *   pnpm debug:resume-template-previews --resume-template modern_sans
 * (Comma-separated list also accepted: --resume-template classic,modern_sans)
 */

import fs from "node:fs";
import path from "node:path";

import { RESUME_DESIGNS, isResumeTemplateId, type ResumeTemplateId } from "@/lib/shared/document-template";
import { renderDocumentPdfBuffer } from "@/server/document-artifacts/render-document-pdf";
import { normalizeGeneratedMarkdown } from "@/server/utils/markdown";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUTPUT_DIR = path.join(ROOT, "public", "assets", "resume-templates");
const MARKDOWN_FILE = path.join(ROOT, "scripts", "fixtures", "resume-template-preview-sample.md");

function parseTemplateFilter(argv: string[]): ResumeTemplateId[] | null {
  const idx = argv.indexOf("--resume-template");
  if (idx < 0) return null;
  const value = argv[idx + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("--resume-template requires a value: classic | modern_sans");
  }
  const ids = value.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0 || ids.some((id) => !isResumeTemplateId(id))) {
    throw new Error(`--resume-template must be a comma-separated list of: classic, modern_sans. Got: ${value}`);
  }
  return ids as ResumeTemplateId[];
}

async function main() {
  const markdown = normalizeGeneratedMarkdown(fs.readFileSync(MARKDOWN_FILE, "utf8"));
  if (!markdown.trim()) {
    throw new Error(`Preview fixture is empty: ${MARKDOWN_FILE}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const filter = parseTemplateFilter(process.argv);
  const ids = (filter ?? (Object.keys(RESUME_DESIGNS) as ResumeTemplateId[]));
  for (const id of ids) {
    const buffer = await renderDocumentPdfBuffer({
      type: "resume",
      title: `Resume-${id}`,
      markdown,
      resumeTemplateId: id,
    });
    const outPath = path.join(OUTPUT_DIR, `${id}.pdf`);
    fs.writeFileSync(outPath, buffer);
    console.log(`wrote ${path.relative(ROOT, outPath)} (${buffer.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
