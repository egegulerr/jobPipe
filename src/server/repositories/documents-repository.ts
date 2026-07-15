import fs from "node:fs";
import type { DocumentsRepository } from "@/server/domains/documents/documents.interfaces";
import { resolveRunDisplayLabel } from "@/lib/runs/resolve-run-display-label";
import { getDatabase, sqliteError, transaction } from "@/server/local/database";

const noError = null;
const placeholders = (values: string[]) => values.map(() => "?").join(",");

function runLabel(row: Record<string, unknown>) {
  return resolveRunDisplayLabel({ runId: String(row.run_id), name: row.run_name == null ? null : String(row.run_name), titleKeywords: String(row.title_keywords ?? ""), locations: String(row.locations ?? "") });
}

export function createDocumentsRepository(): DocumentsRepository {
  return {
    async listRunDocuments(_userId, runId) { return { data: getDatabase().prepare("SELECT id, job_id, type, format, title, storage_path, docx_storage_path, created_at FROM documents WHERE run_id=? ORDER BY created_at DESC").all(runId).map((row) => ({ ...row })) as never, error: noError }; },
    async listUserDocumentRuns(input) {
      let sql = `SELECT d.run_id, d.type, d.created_at, r.name run_name, c.title_keywords, c.locations FROM documents d JOIN runs r ON r.id=d.run_id JOIN run_configs c ON c.id=r.run_config_id WHERE 1=1`;
      const params: Array<string | number | null> = [];
      if (input.type && input.type !== "all") { sql += " AND d.type=?"; params.push(input.type); }
      if (input.runId && input.runId !== "all") { sql += " AND d.run_id=?"; params.push(input.runId); }
      const rows = getDatabase().prepare(sql).all(...params);
      const grouped = new Map<string, { run_id: string; run_name: string; document_count: number; newest_created_at: string }>();
      for (const row of rows) { const id = String(row.run_id); const current = grouped.get(id); if (!current) grouped.set(id, { run_id: id, run_name: runLabel(row), document_count: 1, newest_created_at: String(row.created_at) }); else { current.document_count += 1; if (String(row.created_at) > current.newest_created_at) current.newest_created_at = String(row.created_at); } }
      const all = [...grouped.values()].sort((a, b) => b.newest_created_at.localeCompare(a.newest_created_at));
      const start = (input.page - 1) * input.pageSize;
      return { data: { runs: all.slice(start, start + input.pageSize), totalRuns: all.length, totalDocuments: rows.length, filterOptions: { types: [...new Set(rows.map((row) => String(row.type)))], runs: all.map((run) => ({ value: run.run_id, label: run.run_name })) } }, error: noError };
    },
    async listUserDocumentsForRun(input) {
      let sql = `SELECT d.id, d.run_id, d.job_id, d.type, d.title, d.created_at, r.name run_name, c.title_keywords, c.locations, j.title job_title, j.company_name, j.apply_url, j.job_link FROM documents d JOIN runs r ON r.id=d.run_id JOIN run_configs c ON c.id=r.run_config_id LEFT JOIN jobs j ON j.id=d.job_id WHERE d.run_id=?`;
      const params: Array<string | number | null> = [input.runId];
      if (input.type && input.type !== "all") { sql += " AND d.type=?"; params.push(input.type); }
      if (input.search) { sql += " AND (d.title LIKE ? OR j.title LIKE ? OR j.company_name LIKE ?)"; const search = `%${input.search}%`; params.push(search, search, search); }
      const documents = getDatabase().prepare(sql).all(...params).map((row) => ({ ...row, run_name: runLabel(row) })) as never;
      return { data: { documents }, error: noError };
    },
    async getDocument(documentId) { const row = getDatabase().prepare("SELECT id, 'local' user_id, type, format, title, storage_path, docx_storage_path FROM documents WHERE id=?").get(documentId); return { data: row ? { ...row } as never : null, error: noError }; },
    async getDocumentsByIds(ids) { if (!ids.length) return { data: [], error: noError }; return { data: getDatabase().prepare(`SELECT id, type, title, storage_path, docx_storage_path FROM documents WHERE id IN (${placeholders(ids)})`).all(...ids).map((row) => ({ ...row })) as never, error: noError }; },
    async deleteDocumentsByIds(ids) {
      if (!ids.length) return { data: [], error: noError };
      try { const rows = getDatabase().prepare(`SELECT id, run_id, storage_path, docx_storage_path FROM documents WHERE id IN (${placeholders(ids)})`).all(...ids); transaction(() => getDatabase().prepare(`DELETE FROM documents WHERE id IN (${placeholders(ids)})`).run(...ids)); return { data: rows as never, error: noError }; }
      catch (error) { return { data: null, error: sqliteError(error) }; }
    },
    async removeStorageObjects(paths) { try { for (const file of paths) if (fs.existsSync(file)) fs.unlinkSync(file); return { data: null, error: noError }; } catch (error) { return { data: null, error: sqliteError(error) }; } },
    async getUserStorageSummary() { let usedBytes = 0; for (const row of getDatabase().prepare("SELECT storage_path, docx_storage_path FROM documents").all()) for (const file of [row.storage_path, row.docx_storage_path]) if (file && fs.existsSync(String(file))) usedBytes += fs.statSync(String(file)).size; return { data: { usedBytes, cleanupCandidateSummary: null }, error: noError }; },
  };
}
