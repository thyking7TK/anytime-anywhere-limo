import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const distanceCache = globalThis.__autoviseDistanceCache ?? new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

if (!globalThis.__autoviseDistanceCache) {
  globalThis.__autoviseDistanceCache = distanceCache;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pickupLat = searchParams.get("pickupLat");
  const pickupLon = searchParams.get("pickupLon");
  const dropoffLat = searchParams.get("dropoffLat");
  const dropoffLon = searchParams.get("dropoffLon");

  if (!pickupLat || !pickupLon || !dropoffLat || !dropoffLon) {
    return NextResponse.json(
      { message: "Missing coordinates." },
      { status: 400 },
    );
  }

  const cacheKey = `${pickupLat},${pickupLon};${dropoffLat},${dropoffLon}`;
  const cached = distanceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${dropoffLon},${dropoffLat}?overview=false`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AutoviseBlackCar/1.0 distance-calculation",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Distance calculation temporarily unavailable." },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.routes) || !data.routes.length) {
      return NextResponse.json(
        { message: "No drivable route found between these locations." },
        { status: 404 },
      );
    }

    const route = data.routes[0];
    const distanceMiles = route.distance / 1609.344;
    const durationHours = route.duration / 3600;

    const result = {
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      durationHours: Math.round(durationHours * 10) / 10,
      durationMinutes: Math.round(route.duration / 60),
    };

    distanceCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Distance calculation failed", error);
    return NextResponse.json(
      { message: "Distance calculation failed." },
      { status: 500 },
    );
  }
}
