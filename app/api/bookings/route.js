import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { isAuthorizedRequest } from "@/lib/admin-auth";
import {
  buildRideLocalTimestamp,
  calculateEstimate,
  formatRideLocalTimestamp,
  getServiceById,
  getVehicleBySlug,
  normalizeBookingForm,
  validateBooking,
} from "@/lib/booking";
import { getCatalog } from "@/lib/catalog";
import { insertBooking, listRecentBookings, updateBookingStatus } from "@/lib/bookings";
import { isDatabaseConfigured } from "@/lib/database";
import { sendBookingEmails } from "@/lib/email";
import { getSiteContent } from "@/lib/site-content";
import { getSiteServiceById } from "@/lib/site-content-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookingStatuses = new Set(["pending", "confirmed", "completed", "cancelled"]);

function createReference() {
  return `AA-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function getResolvedServiceTitle(serviceId, siteContent) {
  return (
    getSiteServiceById(siteContent, serviceId)?.title ??
    getServiceById(serviceId)?.title ??
    serviceId
  );
}

function formatStoredBooking(record, siteContent) {
  const rideLocalValue =
    typeof record.ride_local_at === "string"
      ? record.ride_local_at.replace(" ", "T")
      : undefined;

  return {
    id: record.id,
    reference: record.reference,
    fullName: record.full_name,
    email: record.email,
    phone: record.phone,
    service: record.service,
    serviceTitle: getResolvedServiceTitle(record.service, siteContent),
    vehicleSlug: record.vehicle_slug,
    vehicle: record.vehicle,
    pickup: record.pickup_location,
    dropoff: record.dropoff_location,
    passengers: record.passengers,
    requests: record.special_requests,
    estimatedTotal: Math.round(record.estimated_total_cents / 100),
    estimatedDeposit: Math.round(record.estimated_deposit_cents / 100),
    status: record.status,
    when:
      formatRideLocalTimestamp(rideLocalValue) ||
      String(record.ride_local_at ?? ""),
    createdAt: record.created_at,
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
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog);
  const siteContent = await getSiteContent();
  const serviceTitle = getResolvedServiceTitle(form.service, siteContent);
  const reference = createReference();
  const bookingForNotifications = {
    reference,
    estimate,
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    service: form.service,
    serviceTitle,
    vehicle: selectedVehicle?.name ?? form.vehicle,
    pickup: form.pickup,
    dropoff: form.dropoff,
    rideLocalAt,
    passengers: Number(form.passengers),
    requests: form.requests,
  };

  try {
    await insertBooking({
      reference,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      service: form.service,
      vehicleSlug: form.vehicle,
      vehicle: selectedVehicle?.name ?? form.vehicle,
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
        service: serviceTitle,
        vehicle: selectedVehicle?.name ?? form.vehicle,
        pickup: form.pickup,
        dropoff: form.dropoff,
        when: formatRideLocalTimestamp(rideLocalAt),
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
    const siteContent = await getSiteContent();
    const bookings = await listRecentBookings();

    return NextResponse.json({
      bookings: bookings.map((booking) => formatStoredBooking(booking, siteContent)),
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

    const siteContent = await getSiteContent();

    return NextResponse.json({
      booking: formatStoredBooking(booking, siteContent),
    });
  } catch (error) {
    console.error("Failed to update booking status", error);

    return NextResponse.json(
      { message: "Could not update booking status right now." },
      { status: 500 },
    );
  }
}
