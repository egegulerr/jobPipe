export type GeocodingResult = {
  countryCode: string;
  displayName: string;
};

export type GeocodingClient = {
  resolveLocation: (locationText: string) => Promise<GeocodingResult | null>;
};

export async function resolveCountryCode(
  location: string,
  geocodingClient: GeocodingClient,
): Promise<string | null> {
  const result = await geocodingClient.resolveLocation(location);
  return result?.countryCode ?? null;
}
