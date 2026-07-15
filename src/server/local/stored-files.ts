import fs from "node:fs";
import path from "node:path";

import { documentsDir } from "./database";

export function readStoredDocument(storagePath: string): Buffer | null {
  const resolvedPath = path.resolve(storagePath);
  if (path.dirname(resolvedPath) !== path.resolve(documentsDir)) {
    return null;
  }

  try {
    const stat = fs.lstatSync(resolvedPath);
    return stat.isFile() && !stat.isSymbolicLink() ? fs.readFileSync(resolvedPath) : null;
  } catch {
    return null;
  }
}
