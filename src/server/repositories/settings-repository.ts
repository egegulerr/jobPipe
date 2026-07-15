import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { SettingsRepository } from "@/server/domains/settings/settings.interfaces";
import type { FullUserSettings } from "@/server/domains/settings/settings.models";
import { assetsDir, getDatabase, sqliteError, transaction } from "@/server/local/database";

const localId = "local";
const noError = null;

function profile() {
  const row = getDatabase().prepare("SELECT * FROM profile WHERE id = 1").get()!;
  return {
    userId: localId,
    displayName: String(row.display_name ?? ""),
    firstName: row.first_name == null ? null : String(row.first_name),
    lastName: row.last_name == null ? null : String(row.last_name),
    email: String(row.email ?? ""),
    bio: row.bio == null ? null : String(row.bio),
    avatarUrl: row.avatar_path == null ? null : String(row.avatar_path),
  };
}

function rows(table: string) {
  return getDatabase().prepare(`SELECT * FROM ${table} ORDER BY sort_order`).all();
}

function experiences() {
  return rows("profile_experiences").map((row) => ({
    id: String(row.id), type: row.type === "education" ? "education" as const : "experience" as const,
    title: String(row.title), organization: row.organization == null ? null : String(row.organization),
    dateRange: row.date_range == null ? null : String(row.date_range),
    description: row.description == null ? null : String(row.description),
  }));
}
function skills() {
  return rows("profile_skills").map((row) => ({ id: String(row.id), name: String(row.name), context: row.context == null ? null : String(row.context), description: row.description == null ? null : String(row.description) }));
}
function languages() {
  return rows("profile_languages").map((row) => ({ id: String(row.id), name: String(row.name), proficiency: String(row.proficiency) as "Native" | "Fluent" | "Intermediate" | "Basic" }));
}
function technologies() {
  return rows("profile_technologies").map((row) => ({ id: String(row.id), name: String(row.name) }));
}
function certifications() {
  return rows("profile_certifications").map((row) => ({ id: String(row.id), name: String(row.name), issuer: row.issuer == null ? null : String(row.issuer), issueDate: row.issue_date == null ? null : String(row.issue_date), description: row.description == null ? null : String(row.description) }));
}
function fullSettings(): FullUserSettings {
  return { profile: profile(), experiences: experiences(), skills: skills(), languages: languages(), technologies: technologies(), certifications: certifications() };
}

function replace<T>(table: string, values: T[], insert: (value: T, index: number) => void) {
  getDatabase().prepare(`DELETE FROM ${table}`).run();
  values.forEach(insert);
}

function updateProfile(input: Record<string, string | null | undefined>) {
  const columns = { firstName: "first_name", lastName: "last_name", displayName: "display_name", bio: "bio", avatarUrl: "avatar_path" } as const;
  for (const [key, column] of Object.entries(columns)) {
    const value = input[key];
    if (value !== undefined) getDatabase().prepare(`UPDATE profile SET ${column} = ?, updated_at = ? WHERE id = 1`).run(value, new Date().toISOString());
  }
}

export function createSettingsRepository(): SettingsRepository {
  return {
    async getUserProfile() { return { data: profile(), error: noError }; },
    async updateUserProfile(_userId, input) {
      try {
        updateProfile(input);
        return { data: profile(), error: noError };
      } catch (error) { return { data: null, error: sqliteError(error) }; }
    },
    async getFullUserSettings() { return { data: fullSettings(), error: noError }; },
    async getRunProfileReadiness() { const settings = fullSettings(); return { data: { profile: { firstName: settings.profile.firstName, lastName: settings.profile.lastName }, experiences: settings.experiences.map((item) => ({ title: item.title })) }, error: noError }; },
    async patchUserSettings(userId, input) {
      try {
        transaction(() => {
          if (input.profile) updateProfile({ firstName: input.profile.first_name, lastName: input.profile.last_name, displayName: input.profile.display_name, bio: input.profile.bio });
          if (input.experiences) replace("profile_experiences", input.experiences, (v, index) => getDatabase().prepare("INSERT INTO profile_experiences VALUES (?, ?, ?, ?, ?, ?, ?)").run(v.id ?? crypto.randomUUID(), v.type ?? "experience", v.title, v.organization ?? null, v.dateRange ?? null, v.description ?? null, index));
          if (input.skills) replace("profile_skills", input.skills, (v, index) => getDatabase().prepare("INSERT INTO profile_skills VALUES (?, ?, ?, ?, ?)").run(v.id ?? crypto.randomUUID(), v.name, v.context ?? null, v.description ?? null, index));
          if (input.languages) replace("profile_languages", input.languages, (v, index) => getDatabase().prepare("INSERT INTO profile_languages VALUES (?, ?, ?, ?)").run(v.id ?? crypto.randomUUID(), v.name, v.proficiency, index));
          if (input.technologies) replace("profile_technologies", input.technologies, (v, index) => getDatabase().prepare("INSERT INTO profile_technologies VALUES (?, ?, ?)").run(v.id ?? crypto.randomUUID(), v.name, index));
          if (input.certifications) replace("profile_certifications", input.certifications, (v, index) => getDatabase().prepare("INSERT INTO profile_certifications VALUES (?, ?, ?, ?, ?, ?)").run(v.id ?? crypto.randomUUID(), v.name, v.issuer ?? null, v.issueDate ?? null, v.description ?? null, index));
        });
        return { error: noError };
      } catch (error) { return { error: sqliteError(error) }; }
    },
    async uploadAvatar(_userId, storagePath, buffer) {
      try { const filePath = path.join(assetsDir, path.basename(storagePath)); fs.writeFileSync(filePath, buffer, { mode: 0o600 }); return { data: { path: filePath }, error: noError }; }
      catch (error) { return { data: null, error: sqliteError(error) }; }
    },
  };
}
