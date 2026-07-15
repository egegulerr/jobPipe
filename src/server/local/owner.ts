import { getDatabase } from "./database";

// Compatibility id for service/repository signatures while storage is single-owner.
// It is never persisted as ownership data and is not an authentication identity.
export const LOCAL_OWNER_ID = "local";

export function getLocalOwner() {
  const row = getDatabase().prepare("SELECT * FROM profile WHERE id = 1").get()!;
  return {
    userId: LOCAL_OWNER_ID,
    email: String(row.email ?? ""),
    displayName: String(row.display_name || "My Profile"),
    firstName: row.first_name == null ? null : String(row.first_name),
    lastName: row.last_name == null ? null : String(row.last_name),
    bio: row.bio == null ? null : String(row.bio),
    avatarUrl: row.avatar_path == null ? null : String(row.avatar_path),
  };
}
