import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveLocationFromText } from "../nominatim-client";

const fetchSpy = vi.spyOn(globalThis, "fetch");

function mockNominatimResponse(countryCode: string, city = "Berlin", country = "Germany") {
  fetchSpy.mockResolvedValueOnce(
    new Response(
      JSON.stringify([
        {
          display_name: `${city}, ${country}`,
          address: { country_code: countryCode, city, country },
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

function mockEmptyNominatimResponse() {
  fetchSpy.mockResolvedValueOnce(
    new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("resolveLocationFromText", () => {
  beforeEach(() => {
    fetchSpy.mockReset();
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  it("returns the country code and display name for a known city", async () => {
    mockNominatimResponse("de", "Berlin", "Germany");

    const result = await resolveLocationFromText("Berlin");

    expect(result).toEqual({ countryCode: "de", displayName: "Berlin, Germany" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]?.toString()).toContain("q=berlin");
  });

  it("uses the first non-remote token from a comma-separated location", async () => {
    mockNominatimResponse("de", "Berlin", "Germany");

    const result = await resolveLocationFromText("Remote, Berlin");

    expect(result).toEqual({ countryCode: "de", displayName: "Berlin, Germany" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]?.toString()).toContain("q=berlin");
  });

  it("returns null when all tokens are remote", async () => {
    const result = await resolveLocationFromText("Remote");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null for empty string", async () => {
    const result = await resolveLocationFromText("");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null when Nominatim returns an empty array", async () => {
    mockEmptyNominatimResponse();

    const result = await resolveLocationFromText("UnknownPlace");

    expect(result).toBeNull();
  });

  it("returns the raw country code even if not in the allowed set", async () => {
    mockNominatimResponse("jp", "Tokyo", "Japan");

    const result = await resolveLocationFromText("Tokyo");

    expect(result).toEqual({ countryCode: "jp", displayName: "Tokyo, Japan" });
  });

  it("returns null on non-2xx response", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("Too Many Requests", { status: 429 }));

    const result = await resolveLocationFromText("London");

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("network down"));

    const result = await resolveLocationFromText("London");

    expect(result).toBeNull();
  });
});
