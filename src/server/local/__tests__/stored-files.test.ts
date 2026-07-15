import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { documentsDir } from "../database";
import { readStoredDocument } from "../stored-files";

describe("readStoredDocument", () => {
  afterEach(() => fs.rmSync(documentsDir, { recursive: true, force: true }));

  it("reads a regular file directly inside the document store", () => {
    fs.mkdirSync(documentsDir, { recursive: true });
    const filePath = path.join(documentsDir, "document.pdf");
    fs.writeFileSync(filePath, "document");

    expect(readStoredDocument(filePath)?.toString()).toBe("document");
  });

  it("rejects files outside the document store", () => {
    expect(readStoredDocument(path.join(os.tmpdir(), "outside.pdf"))).toBeNull();
  });

  it("rejects symbolic links", () => {
    fs.mkdirSync(documentsDir, { recursive: true });
    const targetPath = path.join(os.tmpdir(), `jobpipe-target-${process.pid}.pdf`);
    const linkPath = path.join(documentsDir, "linked.pdf");
    fs.writeFileSync(targetPath, "document");
    fs.symlinkSync(targetPath, linkPath);

    try {
      expect(readStoredDocument(linkPath)).toBeNull();
    } finally {
      fs.rmSync(targetPath, { force: true });
    }
  });
});
