import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const distanceCache = globalThis.__autoviseDistanceCache ?? new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
if (!globalThis.__autoviseDistanceCache) {
  globalThis.__autoviseDistanceCache = distanceCache;
}

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pickupLat  = searchParams.get("pickupLat");
  const pickupLon  = searchParams.get("pickupLon");
  const dropoffLat = searchParams.get("dropoffLat");
  const dropoffLon = searchParams.get("dropoffLon");

  if (!pickupLat || !pickupLon || !dropoffLat || !dropoffLon) {
    return NextResponse.json({ message: "Missing coordinates." }, { status: 400 });
  }

  if (!GOOGLE_KEY) {
    return NextResponse.json({ message: "Distance calculation not configured." }, { status: 503 });
  }

  const cacheKey = `${pickupLat},${pickupLon};${dropoffLat},${dropoffLon}`;
  const cached = distanceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins",      `${pickupLat},${pickupLon}`);
    url.searchParams.set("destinations", `${dropoffLat},${dropoffLon}`);
    url.searchParams.set("mode",         "driving");
    url.searchParams.set("units",        "imperial");
    url.searchParams.set("key",          GOOGLE_KEY);

    const response = await fetch(url.toString(), {
      headers: { "Referer": "https://autoviseblackcar.com" },
    });
    if (!response.ok) {
      return NextResponse.json(
        { message: "Distance calculation temporarily unavailable." },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { message: "Distance calculation failed: " + data.status },
        { status: 502 },
      );
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return NextResponse.json(
        { message: "No drivable route found between these locations." },
        { status: 404 },
      );
    }

    // distance.value = metres, duration.value = seconds
    const distanceMiles  = element.distance.value / 1609.344;
    const durationHours  = element.duration.value / 3600;
    const durationMinutes = Math.round(element.duration.value / 60);

    const result = {
      distanceMiles:  Math.round(distanceMiles  * 10) / 10,
      durationHours:  Math.round(durationHours  * 10) / 10,
      durationMinutes,
    };

    distanceCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Distance calculation failed:", error);
    return NextResponse.json({ message: "Distance calculation failed." }, { status: 500 });
  }
}
