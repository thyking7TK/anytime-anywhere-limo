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
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
          "Referer": "https://autoviseblackcar.com",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: parseFloat(pickupLat),
                longitude: parseFloat(pickupLon),
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: parseFloat(dropoffLat),
                longitude: parseFloat(dropoffLon),
              },
            },
          },
          travelMode: "DRIVE",
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Distance calculation temporarily unavailable." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route) {
      return NextResponse.json(
        { message: "No drivable route found between these locations." },
        { status: 404 },
      );
    }

    // distanceMeters is a number; duration comes back as e.g. "1061s"
    const distanceMiles  = route.distanceMeters / 1609.344;
    const durationSeconds = parseInt((route.duration ?? "0s").replace("s", ""), 10);
    const durationHours  = durationSeconds / 3600;
    const durationMinutes = Math.round(durationSeconds / 60);

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
