import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("local database", () => {
  it("initializes the local store on first use, not on import", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "jobpipe-database-test-"));
    const dataDir = path.join(root, "data");
    temporaryRoots.push(root);

    execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--no-warnings",
        "--input-type=module",
        "--eval",
        `
          import fs from "node:fs";
          const imported = await import(process.env.DATABASE_MODULE_URL);
          const database = imported.default ?? imported;
          if (fs.existsSync(process.env.JOBPIPE_DATA_DIR)) throw new Error("Database import touched the filesystem");
          const connection = database.getDatabase();
          const tables = connection.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(({ name }) => name);
          for (const required of ["app_config", "profile", "runs", "jobs", "documents"]) {
            if (!tables.includes(required)) throw new Error(\`Missing table: \${required}\`);
          }
          for (const obsolete of ["prompt_templates", "document_drafts", "dlq_events"]) {
            if (tables.includes(obsolete)) throw new Error(\`Obsolete table created: \${obsolete}\`);
          }
          connection.close();
        `,
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_ENV: "production",
          JOBPIPE_DATA_DIR: dataDir,
          DATABASE_MODULE_URL: pathToFileURL(path.join(process.cwd(), "src/server/local/database.ts")).href,
        },
      },
    );

    expect(fs.existsSync(path.join(dataDir, "jobpipe.sqlite"))).toBe(true);
    expect(fs.existsSync(path.join(dataDir, "documents"))).toBe(true);
    expect(fs.existsSync(path.join(dataDir, "assets"))).toBe(true);
  });
});
