import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
const addressSearchCache = globalThis.__autoviseAddressCache ?? new Map();
if (!globalThis.__autoviseAddressCache) {
  globalThis.__autoviseAddressCache = addressSearchCache;
}

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Fetch coordinates for a single placeId using Google Place Details (v1).
 * Only requests the `location` field to minimise billing.
 */
async function fetchCoordinates(placeId) {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "id,location",
          "Referer": "https://autoviseblackcar.com",
        },
      },
    );
    if (!res.ok) return { lat: null, lon: null };
    const data = await res.json();
    return {
      lat: data.location?.latitude?.toString() ?? null,
      lon: data.location?.longitude?.toString() ?? null,
    };
  } catch {
    return { lat: null, lon: null };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!GOOGLE_KEY) {
    return NextResponse.json(
      { message: "Address search is not configured." },
      { status: 503 },
    );
  }

  const cacheKey = query.toLowerCase();
  const cached = addressSearchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ suggestions: cached.suggestions });
  }

  try {
    // ── Step 1: Google Places Autocomplete ────────────────────────────────
    const autocompleteRes = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "Referer": "https://autoviseblackcar.com",
        },
        body: JSON.stringify({
          input: query,
          languageCode: "en",
          regionCode: "US",
          includedPrimaryTypes: [
            "airport",
            "lodging",
            "street_address",
            "route",
            "locality",
            "sublocality",
            "premise",
            "point_of_interest",
            "establishment",
          ],
        }),
      },
    );

    if (!autocompleteRes.ok) {
      return NextResponse.json(
        { message: "Address suggestions are temporarily unavailable." },
        { status: 502 },
      );
    }

    const autocompleteData = await autocompleteRes.json();
    const predictions = Array.isArray(autocompleteData.suggestions)
      ? autocompleteData.suggestions.slice(0, 5)
      : [];

    // ── Step 2: Fetch coordinates for each prediction in parallel ─────────
    const suggestions = await Promise.all(
      predictions.map(async (pred) => {
        const p = pred.placePrediction ?? {};
        const placeId = p.placeId ?? "";
        const mainText = p.structuredFormat?.mainText?.text ?? p.text?.text ?? "";
        const secondaryText = p.structuredFormat?.secondaryText?.text ?? "";
        const selectionLabel = [mainText, secondaryText].filter(Boolean).join(", ");

        const { lat, lon } = placeId ? await fetchCoordinates(placeId) : { lat: null, lon: null };

        return {
          id: placeId,
          displayName: selectionLabel,
          primaryText: mainText,
          secondaryText,
          selectionLabel,
          latitude: lat,
          longitude: lon,
        };
      }),
    );

    addressSearchCache.set(cacheKey, {
      suggestions,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address search failed:", error);
    return NextResponse.json(
      { message: "Address suggestions are temporarily unavailable." },
      { status: 500 },
    );
  }
}
