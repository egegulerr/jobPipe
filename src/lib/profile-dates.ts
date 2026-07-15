import { format, isValid, parse } from "date-fns";

export const PROFILE_DATE_FORMAT = "MMM d, yyyy";
const PROFILE_MONTH_YEAR_FORMAT = "MMM yyyy";

const NOW_LABELS = ["present", "now", "current"];

export function parseProfileDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsedDate = parse(trimmed, PROFILE_DATE_FORMAT, new Date());
  if (isValid(parsedDate)) return parsedDate;

  const parsedMonthYear = parse(trimmed, PROFILE_MONTH_YEAR_FORMAT, new Date());
  if (isValid(parsedMonthYear)) return parsedMonthYear;

  const nativeDate = new Date(trimmed);
  return isValid(nativeDate) ? nativeDate : undefined;
}

export function parseDateRangeStart(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  return parseProfileDate(value.split(" - ")[0]);
}

export function parseDateRangeEnd(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const parts = value.split(" - ");
  if (parts.length < 2) return undefined;

  const end = parts[1]?.trim();
  if (!end || NOW_LABELS.includes(end.toLowerCase())) return undefined;
  return parseProfileDate(end);
}

export function isOpenEndedDateRange(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(" - ");
  if (parts.length < 2) return false;
  return NOW_LABELS.includes(parts[1]?.trim().toLowerCase());
}

export function buildDateRange(
  startDate: Date | undefined,
  endDate: Date | undefined,
  now: boolean,
): string {
  if (!startDate) return "";
  const start = format(startDate, PROFILE_DATE_FORMAT);
  if (now) return `${start} - Present`;
  if (endDate) return `${start} - ${format(endDate, PROFILE_DATE_FORMAT)}`;
  return start;
}
