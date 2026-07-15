export const NON_GEOCODABLE_TOKENS = new Set(["remote", "worldwide", "anywhere", "global", "hybrid"]);

export function hasGeocodableTokens(locationText: string): boolean {
  return locationText
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((t) => !NON_GEOCODABLE_TOKENS.has(t));
}
