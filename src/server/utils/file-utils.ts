export function toSafeDownloadName(
  title: string,
  extension: "md" | "pdf" | "docx",
) {
  const base = title
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  const finalBase = base || "document";
  return `${finalBase}.${extension}`;
}
