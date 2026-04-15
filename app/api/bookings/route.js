import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { isAuthorizedRequest } from "@/lib/admin-auth";
import {
  buildRideLocalTimestamp,
  calculateEstimate,
  formatRideLocalTimestamp,
  getBookingPaymentAmountCents,
  getAirportRouteById,
  getBookingServiceById,
  getVehicleBySlug,
  normalizeBookingForm,
  validateBooking,
} from "@/lib/booking";
import { getCatalog } from "@/lib/catalog";
import {
  formatBookingRecord,
  insertBooking,
  listRecentBookings,
  updateBookingStatus,
} from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { sendBookingEmails } from "@/lib/email";
import { isStripeConfigured } from "@/lib/stripe";

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
  const paymentAmountCents = getBookingPaymentAmountCents(estimate);
  const paymentEnabled =
    isStripeConfigured() &&
    estimate.quoteMode === "instant" &&
    paymentAmountCents > 0;
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
      estimatedDepositCents: paymentEnabled ? paymentAmountCents : 0,
      status: "new",
      paymentStatus: paymentEnabled ? "awaiting_payment" : "not_requested",
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
      payment: {
        enabled: paymentEnabled,
        status: paymentEnabled ? "awaiting_payment" : "not_requested",
        amount: Math.round(paymentAmountCents / 100),
        amountCents: paymentAmountCents,
        bookingReference: reference,
        message: paymentEnabled
          ? "Complete the secure card payment below to finish this reservation request."
          : estimate.quoteMode === "request"
            ? "This trip needs a manual quote review before online payment is available."
            : "Online payment is not configured yet for this booking.",
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
      bookings: bookings.map((booking) => formatBookingRecord(booking)),
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
      booking: formatBookingRecord(booking),
    });
  } catch (error) {
    console.error("Failed to update booking status", error);

    return NextResponse.json(
      { message: "Could not update booking status right now." },
      { status: 500 },
    );
  }
}
