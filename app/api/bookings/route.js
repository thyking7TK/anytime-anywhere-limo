import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { isAuthorizedRequest } from "@/lib/admin-auth";
import {
  buildRideLocalTimestamp,
  calculateEstimate,
  formatRideLocalTimestamp,
  getAirportRouteById,
  getBookingServiceById,
  getVehicleBySlug,
  normalizeBookingForm,
  validateBooking,
} from "@/lib/booking";
import { getCatalog } from "@/lib/catalog";
import { insertBooking, listRecentBookings, updateBookingStatus } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { sendBookingEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookingStatuses = new Set([
  "new",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
]);

function createReference() {
  return `AV-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function normalizeStoredStatus(status) {
  return status === "pending" ? "new" : status;
}

function parseStoredJson(value) {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return value;
}

function formatStoredBooking(record) {
  const rideLocalValue =
    typeof record.ride_local_at === "string"
      ? record.ride_local_at.replace(" ", "T")
      : undefined;
  const returnLocalValue =
    typeof record.return_local_at === "string"
      ? record.return_local_at.replace(" ", "T")
      : undefined;
  const quoteBreakdown = parseStoredJson(record.quote_breakdown);

  return {
    id: record.id,
    reference: record.reference,
    fullName: record.full_name,
    email: record.email,
    phone: record.phone,
    service: record.service,
    serviceTitle: getBookingServiceById(record.service)?.title ?? record.service,
    vehicleSlug: record.vehicle_slug,
    vehicle: record.vehicle,
    pickup: record.pickup_location,
    dropoff: record.dropoff_location,
    passengers: record.passengers,
    bags: record.bags,
    requests: record.special_requests,
    estimatedTotal: Math.round(record.estimated_total_cents / 100),
    estimatedDeposit: Math.round(record.estimated_deposit_cents / 100),
    status: normalizeStoredStatus(record.status),
    when:
      formatRideLocalTimestamp(rideLocalValue) ||
      String(record.ride_local_at ?? ""),
    returnWhen:
      formatRideLocalTimestamp(returnLocalValue) ||
      (record.return_local_at ? String(record.return_local_at) : ""),
    createdAt: record.created_at,
    roundTrip: Boolean(record.round_trip),
    airportRouteId: record.airport_route_id,
    airportRouteLabel: record.airport_route_label,
    airline: record.airline,
    flightNumber: record.flight_number,
    requestedHours: record.requested_hours,
    estimatedTripHours: record.estimated_trip_hours,
    estimatedTripMiles: record.estimated_trip_miles,
    estimatedStops: record.estimated_stops,
    extraStops: record.extra_stops,
    waitHours: record.wait_hours,
    holidayOrEvent: record.holiday_or_event,
    eventType: record.event_type,
    quoteBreakdown,
  };
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
  const catalog = await getCatalog();
  const errors = validateBooking(form, { catalog });

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

  const estimate = calculateEstimate(form, catalog);
  const rideLocalAt = buildRideLocalTimestamp(form.date, form.time);
  const returnLocalAt = form.roundTrip
    ? buildRideLocalTimestamp(form.returnDate, form.returnTime)
    : null;
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog);
  const selectedService = getBookingServiceById(form.service);
  const airportRoute =
    form.service === "airport"
      ? getAirportRouteById(form.airportRouteId, catalog)
      : null;
  const reference = createReference();
  const bookingForNotifications = {
    reference,
    estimate,
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    service: form.service,
    serviceTitle: selectedService?.title ?? form.service,
    vehicle: selectedVehicle?.name ?? "Vehicle to be confirmed",
    pickup: form.pickup,
    dropoff: form.dropoff,
    rideLocalAt,
    returnLocalAt,
    passengers: Number(form.passengers),
    bags: Number(form.bags),
    requests: form.requests,
    roundTrip: form.roundTrip,
    airportRouteLabel: airportRoute?.label ?? "",
    airline: form.airline,
    flightNumber: form.flightNumber,
    requestedHours: Number(form.requestedHours || 0),
    estimatedTripHours: Number(form.estimatedTripHours || 0),
    estimatedTripMiles: Number(form.estimatedTripMiles || 0),
    estimatedStops: Number(form.estimatedStops || 0),
    extraStops: Number(form.extraStops || 0),
    waitHours: Number(form.waitHours || 0),
    holidayOrEvent: form.holidayOrEvent,
    eventType: form.eventType,
  };

  try {
    await insertBooking({
      reference,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      service: form.service,
      vehicleSlug: form.vehicle || null,
      vehicle: selectedVehicle?.name ?? "Vehicle to be confirmed",
      pickup: form.pickup,
      dropoff: form.dropoff,
      rideLocalAt,
      passengers: Number(form.passengers),
      bags: Number(form.bags),
      requests: form.requests,
      estimatedTotalCents: estimate.total * 100,
      estimatedDepositCents: 0,
      status: "new",
      airportRouteId: airportRoute?.id ?? null,
      airportRouteLabel: airportRoute?.label ?? null,
      airline: form.airline,
      flightNumber: form.flightNumber,
      roundTrip: form.roundTrip,
      returnLocalAt,
      requestedHours: Number(form.requestedHours || 0) || null,
      estimatedTripHours: Number(form.estimatedTripHours || 0) || null,
      estimatedTripMiles: Number(form.estimatedTripMiles || 0) || null,
      estimatedStops: Number(form.estimatedStops || 0),
      extraStops: Number(form.extraStops || 0),
      waitHours: Number(form.waitHours || 0),
      holidayOrEvent: form.holidayOrEvent,
      eventType: form.eventType,
      quoteBreakdown: estimate,
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

  let emailStatus = {
    enabled: false,
    admin: "skipped",
    customer: "skipped",
  };

  try {
    emailStatus = await sendBookingEmails(bookingForNotifications);
  } catch (error) {
    console.error("Failed to send booking emails", error);
  }

  return NextResponse.json(
    {
      booking: {
        reference,
        estimate,
        fullName: form.fullName,
        email: form.email,
        service: selectedService?.title ?? form.service,
        vehicle: selectedVehicle?.name ?? "Vehicle to be confirmed",
        pickup: form.pickup,
        dropoff: form.dropoff,
        when: formatRideLocalTimestamp(rideLocalAt),
        returnWhen: returnLocalAt ? formatRideLocalTimestamp(returnLocalAt) : "",
      },
      emailStatus,
    },
    { status: 201 },
  );
}

export async function GET(request) {
  if (!isAuthorizedRequest(request)) {
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
      bookings: bookings.map((booking) => formatStoredBooking(booking)),
    });
  } catch (error) {
    console.error("Failed to load bookings", error);

    return NextResponse.json(
      { message: "Could not load bookings right now." },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      {
        message:
          "Admin access is not enabled. Set BOOKINGS_ADMIN_KEY and pass it with the request.",
      },
      { status: 401 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid booking update payload." },
      { status: 400 },
    );
  }

  const id = Number(payload.id);
  const status = String(payload.status ?? "").trim().toLowerCase();

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "Booking id must be a valid number." },
      { status: 400 },
    );
  }

  if (!bookingStatuses.has(status)) {
    return NextResponse.json(
      { message: "Choose a valid booking status." },
      { status: 400 },
    );
  }

  try {
    const booking = await updateBookingStatus(id, status);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      booking: formatStoredBooking(booking),
    });
  } catch (error) {
    console.error("Failed to update booking status", error);

    return NextResponse.json(
      { message: "Could not update booking status right now." },
      { status: 500 },
    );
  }
}
