/**
 * Long-form English date for cover letters (e.g. "April 6, 2026").
 * Defaults to UTC so letters do not shift with the server host timezone.
 */
export function formatLetterDate(
  date: Date = new Date(),
  timeZone: string = "UTC",
): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date);
}
