import { isValid } from "date-fns";
import { parseDateRangeStart, parseProfileDate } from "@/lib/profile-dates";

/**
 * Parses the start date from an experience `dateRange` string
 * (e.g. `"Jan 1, 2025 - Present"` or `"Jan 2020"`).
 */
function parseExperienceStartDate(dateRange: string | null | undefined): Date | undefined {
  return parseDateRangeStart(dateRange);
}

/**
 * Parses issue date for certifications (year-only, month-year, or full date).
 */
function parseCertificationIssueDate(issueDate: string | null | undefined): Date | undefined {
  if (!issueDate) return undefined;
  const trimmed = issueDate.trim();
  if (!trimmed) return undefined;

  if (/^\d{4}$/.test(trimmed)) {
    const y = Number(trimmed);
    const d = new Date(y, 11, 31);
    return isValid(d) ? d : undefined;
  }

  return parseProfileDate(trimmed);
}

function compareByDateDesc(
  aDate: Date | undefined,
  bDate: Date | undefined,
): number {
  const aTime = aDate?.getTime();
  const bTime = bDate?.getTime();
  if (aTime != null && bTime != null) {
    if (aTime !== bTime) return bTime - aTime;
    return 0;
  }
  if (aTime != null) return -1;
  if (bTime != null) return 1;
  return 0;
}

export function sortExperiencesByStartDate<T extends { dateRange: string | null | undefined }>(
  items: T[],
  direction: "asc" | "desc" = "desc",
): T[] {
  const withKeys = items.map((item) => ({
    item,
    date: parseExperienceStartDate(item.dateRange),
  }));

  withKeys.sort((a, b) => {
    const cmp = compareByDateDesc(a.date, b.date);
    return direction === "desc" ? cmp : -cmp;
  });

  return withKeys.map(({ item }) => item);
}

export function sortCertificationsByIssueDate<T extends { issueDate: string | null | undefined }>(
  items: T[],
  direction: "asc" | "desc" = "desc",
): T[] {
  const withKeys = items.map((item) => ({
    item,
    date: parseCertificationIssueDate(item.issueDate),
  }));

  withKeys.sort((a, b) => {
    const cmp = compareByDateDesc(a.date, b.date);
    return direction === "desc" ? cmp : -cmp;
  });

  return withKeys.map(({ item }) => item);
}
