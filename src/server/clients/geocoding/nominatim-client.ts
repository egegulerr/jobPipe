import { logEvent } from "@/server/shared/observability/logger";
import type { GeocodingClient, GeocodingResult } from "@/server/domains/runs/geocoding.port";
import { NON_GEOCODABLE_TOKENS } from "@/lib/shared/location-tokens";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_TIMEOUT_MS = 3_000;
const USER_AGENT = "JobPipe/0.1 (github.com/egegulerr/job-pipe)";

function extractFirstConcreteLocation(locationText: string): string | null {
  const tokens = locationText
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t && !NON_GEOCODABLE_TOKENS.has(t));

  return tokens[0] ?? null;
}

type NominatimResult = {
  display_name?: string;
  address?: { country_code?: string; city?: string; town?: string; village?: string; state?: string; country?: string };
};

async function fetchLocation(location: string): Promise<GeocodingResult | null> {
  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("q", location);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // fallow-ignore-next-line security-sink
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      logEvent({
        level: "warn",
        message: "geocoding_non_ok_response",
        metadata: { location, status: response.status },
      });
      return null;
    }

    const data = (await response.json()) as NominatimResult[];
    const first = data[0];
    const countryCode = first?.address?.country_code;
    if (!countryCode) {
      return null;
    }

    const address = first.address!;
    const city = address.city ?? address.town ?? address.village ?? address.state ?? "";
    const country = address.country ?? "";
    const displayName = [city, country].filter(Boolean).join(", ") || first.display_name || location;

    return {
      countryCode: countryCode.toLowerCase(),
      displayName,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves a location string to a country code and display name via Nominatim.
 * Returns `null` when the location cannot be resolved (unknown place, network error, etc.).
 * Filters out "remote" from comma-separated locations and geocodes the first concrete token.
 */
export async function resolveLocationFromText(locationText: string): Promise<GeocodingResult | null> {
  const token = extractFirstConcreteLocation(locationText);
  if (!token) {
    return null;
  }

  try {
    return await fetchLocation(token);
  } catch (error) {
    logEvent({
      level: "warn",
      message: "geocoding_failed",
      error: error instanceof Error ? error.message : String(error),
      metadata: { location: token },
    });
    return null;
  }
}

export const defaultGeocodingClient: GeocodingClient = {
  resolveLocation: resolveLocationFromText,
};
