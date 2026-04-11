import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
const addressSearchCache = globalThis.__anytimeAnywhereAddressCache ?? new Map();

if (!globalThis.__anytimeAnywhereAddressCache) {
  globalThis.__anytimeAnywhereAddressCache = addressSearchCache;
}

function buildSecondaryText(address = {}) {
  const locality =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.county ||
    address.state_district;

  return [
    locality,
    address.state,
    address.postcode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function mapSuggestion(item) {
  const address = item.address ?? {};
  const primaryText =
    [
      address.house_number,
      address.road ||
        address.pedestrian ||
        address.footway ||
        address.neighbourhood ||
        address.suburb,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    item.name ||
    item.display_name;

  return {
    id: String(item.place_id),
    displayName: item.display_name,
    primaryText,
    secondaryText: buildSecondaryText(address),
    latitude: item.lat,
    longitude: item.lon,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const normalizedQuery = query.toLowerCase();

  const upstream = new URL("https://nominatim.openstreetmap.org/search");
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("addressdetails", "1");
  upstream.searchParams.set("limit", "5");
  upstream.searchParams.set("q", query);

  const countryCodes =
    process.env.ADDRESS_SEARCH_COUNTRY_CODES?.trim() || "us";

  const cacheKey = `${countryCodes}:${normalizedQuery}`;
  const cachedEntry = addressSearchCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return NextResponse.json({
      suggestions: cachedEntry.suggestions,
    });
  }

  if (countryCodes) {
    upstream.searchParams.set("countrycodes", countryCodes);
  }

  try {
    const response = await fetch(upstream, {
      headers: {
        "User-Agent": "AnytimeAnywhereLimo/1.0 address-search",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Address suggestions are temporarily unavailable." },
        { status: 502 },
      );
    }

    const results = await response.json();

    const suggestions = Array.isArray(results) ? results.map(mapSuggestion) : [];

    addressSearchCache.set(cacheKey, {
      suggestions,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address search failed", error);

    return NextResponse.json(
      { message: "Address suggestions are temporarily unavailable." },
      { status: 500 },
    );
  }
}
