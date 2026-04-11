import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  buildRideLocalTimestamp,
  calculateEstimate,
  formatRideTime,
  getServiceById,
  normalizeBookingForm,
  validateBooking,
} from "@/lib/booking";
import { insertBooking, listRecentBookings } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createReference() {
  return `AA-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function formatStoredBooking(record) {
  return {
    id: record.id,
    reference: record.reference,
    fullName: record.full_name,
    email: record.email,
    phone: record.phone,
    service: record.service,
    serviceTitle: getServiceById(record.service)?.title ?? record.service,
    vehicle: record.vehicle,
    pickup: record.pickup_location,
    dropoff: record.dropoff_location,
    passengers: record.passengers,
    requests: record.special_requests,
    estimatedTotal: Math.round(record.estimated_total_cents / 100),
    estimatedDeposit: Math.round(record.estimated_deposit_cents / 100),
    status: record.status,
    when: formatRideTime(new Date(record.ride_local_at)),
    createdAt: record.created_at,
  };
}

function isAuthorized(request) {
  const adminKey = process.env.BOOKINGS_ADMIN_KEY;

  if (!adminKey) {
    return false;
  }

  const { searchParams } = new URL(request.url);
  const keyFromQuery = searchParams.get("key");
  const keyFromHeader = request.headers.get("x-admin-key");

  return keyFromQuery === adminKey || keyFromHeader === adminKey;
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid booking payload." },
      { status: 400 },
    );
  }

  const form = normalizeBookingForm(payload);
  const errors = validateBooking(form);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        message: "Please correct the highlighted booking fields.",
        errors,
      },
      { status: 400 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        message:
          "Booking storage is not connected yet. Add DATABASE_URL or POSTGRES_URL in Vercel before taking live bookings.",
      },
      { status: 503 },
    );
  }

  const estimate = calculateEstimate(form);
  const rideLocalAt = buildRideLocalTimestamp(form.date, form.time);
  const reference = createReference();

  try {
    await insertBooking({
      reference,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      service: form.service,
      vehicle: form.vehicle,
      pickup: form.pickup,
      dropoff: form.dropoff,
      rideLocalAt,
      passengers: Number(form.passengers),
      requests: form.requests,
      estimatedTotalCents: estimate.total * 100,
      estimatedDepositCents: estimate.deposit * 100,
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to store booking", error);

    return NextResponse.json(
      {
        message:
          "We could not save this booking right now. Check the database connection and try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      booking: {
        reference,
        estimate,
        fullName: form.fullName,
        email: form.email,
        service: getServiceById(form.service)?.title ?? "Service",
        vehicle: form.vehicle,
        pickup: form.pickup,
        dropoff: form.dropoff,
        when: formatRideTime(new Date(rideLocalAt)),
      },
    },
    { status: 201 },
  );
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        message:
          "Admin access is not enabled. Set BOOKINGS_ADMIN_KEY and pass it with the request.",
      },
      { status: 401 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { message: "Booking storage is not connected yet." },
      { status: 503 },
    );
  }

  try {
    const bookings = await listRecentBookings();

    return NextResponse.json({
      bookings: bookings.map(formatStoredBooking),
    });
  } catch (error) {
    console.error("Failed to load bookings", error);

    return NextResponse.json(
      { message: "Could not load bookings right now." },
      { status: 500 },
    );
  }
}
