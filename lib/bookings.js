import { formatRideLocalTimestamp, getBookingServiceById } from "./booking";
import { getDatabaseClient, isDatabaseConfigured } from "./database";

let schemaReadyPromise;

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

function normalizeStoredStatus(status) {
  return status === "pending" ? "new" : status;
}

async function ensureBookingsTable() {
  if (!isDatabaseConfigured()) {
    throw new Error("Database connection is not configured.");
  }

  if (!schemaReadyPromise) {
    const sql = getDatabaseClient();

    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id BIGSERIAL PRIMARY KEY,
          reference TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          service TEXT NOT NULL,
          vehicle_slug TEXT,
          vehicle TEXT NOT NULL,
          pickup_location TEXT NOT NULL,
          dropoff_location TEXT NOT NULL,
          ride_local_at TIMESTAMP NOT NULL,
          passengers INTEGER NOT NULL,
          special_requests TEXT NOT NULL DEFAULT '',
          estimated_total_cents INTEGER NOT NULL,
          estimated_deposit_cents INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'new',
          payment_status TEXT NOT NULL DEFAULT 'not_requested',
          stripe_checkout_session_id TEXT,
          stripe_payment_intent_id TEXT,
          payment_completed_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS vehicle_slug TEXT
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS bags INTEGER NOT NULL DEFAULT 0
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS airport_route_id TEXT
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS airport_route_label TEXT
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS airline TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS flight_number TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS round_trip BOOLEAN NOT NULL DEFAULT FALSE
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS return_local_at TIMESTAMP NULL
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS requested_hours DOUBLE PRECISION
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS estimated_trip_hours DOUBLE PRECISION
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS estimated_trip_miles DOUBLE PRECISION
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS estimated_stops INTEGER NOT NULL DEFAULT 0
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS extra_stops INTEGER NOT NULL DEFAULT 0
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS wait_hours DOUBLE PRECISION NOT NULL DEFAULT 0
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS holiday_or_event BOOLEAN NOT NULL DEFAULT FALSE
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS quote_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_requested'
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ NULL
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bookings_created_at_idx
        ON bookings (created_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bookings_ride_at_idx
        ON bookings (ride_local_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bookings_reference_idx
        ON bookings (reference)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bookings_checkout_session_idx
        ON bookings (stripe_checkout_session_id)
      `;
    })();
  }

  return schemaReadyPromise;
}

function selectColumns(sql) {
  return sql`
    id,
    reference,
    full_name,
    email,
    phone,
    service,
    vehicle_slug,
    vehicle,
    pickup_location,
    dropoff_location,
    ride_local_at,
    passengers,
    bags,
    special_requests,
    estimated_total_cents,
    estimated_deposit_cents,
    status,
    payment_status,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    payment_completed_at,
    airport_route_id,
    airport_route_label,
    airline,
    flight_number,
    round_trip,
    return_local_at,
    requested_hours,
    estimated_trip_hours,
    estimated_trip_miles,
    estimated_stops,
    extra_stops,
    wait_hours,
    holiday_or_event,
    event_type,
    quote_breakdown,
    created_at
  `;
}

export function formatBookingRecord(record) {
  if (!record) {
    return null;
  }

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
    paymentStatus: record.payment_status ?? "not_requested",
    stripeCheckoutSessionId: record.stripe_checkout_session_id ?? "",
    stripePaymentIntentId: record.stripe_payment_intent_id ?? "",
    paymentCompletedAt: record.payment_completed_at ?? null,
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
    estimate: quoteBreakdown,
    quoteBreakdown,
  };
}

export async function insertBooking(booking) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    INSERT INTO bookings (
      reference,
      full_name,
      email,
      phone,
      service,
      vehicle_slug,
      vehicle,
      pickup_location,
      dropoff_location,
      ride_local_at,
      passengers,
      bags,
      special_requests,
      estimated_total_cents,
      estimated_deposit_cents,
      status,
      payment_status,
      airport_route_id,
      airport_route_label,
      airline,
      flight_number,
      round_trip,
      return_local_at,
      requested_hours,
      estimated_trip_hours,
      estimated_trip_miles,
      estimated_stops,
      extra_stops,
      wait_hours,
      holiday_or_event,
      event_type,
      quote_breakdown
    ) VALUES (
      ${booking.reference},
      ${booking.fullName},
      ${booking.email},
      ${booking.phone},
      ${booking.service},
      ${booking.vehicleSlug ?? null},
      ${booking.vehicle},
      ${booking.pickup},
      ${booking.dropoff},
      ${booking.rideLocalAt},
      ${booking.passengers},
      ${booking.bags ?? 0},
      ${booking.requests ?? ""},
      ${booking.estimatedTotalCents},
      ${booking.estimatedDepositCents ?? 0},
      ${booking.status ?? "new"},
      ${booking.paymentStatus ?? "not_requested"},
      ${booking.airportRouteId ?? null},
      ${booking.airportRouteLabel ?? null},
      ${booking.airline ?? ""},
      ${booking.flightNumber ?? ""},
      ${booking.roundTrip ?? false},
      ${booking.returnLocalAt ?? null},
      ${booking.requestedHours ?? null},
      ${booking.estimatedTripHours ?? null},
      ${booking.estimatedTripMiles ?? null},
      ${booking.estimatedStops ?? 0},
      ${booking.extraStops ?? 0},
      ${booking.waitHours ?? 0},
      ${booking.holidayOrEvent ?? false},
      ${booking.eventType ?? ""},
      ${sql.json(booking.quoteBreakdown ?? {})}
    )
    RETURNING ${selectColumns(sql)}
  `;

  return rows[0];
}

export async function listRecentBookings(limit = 50) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  return sql`
    SELECT ${selectColumns(sql)}
    FROM bookings
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function getBookingByReference(reference) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    SELECT ${selectColumns(sql)}
    FROM bookings
    WHERE reference = ${reference}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getBookingByCheckoutSessionId(sessionId) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    SELECT ${selectColumns(sql)}
    FROM bookings
    WHERE stripe_checkout_session_id = ${sessionId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function updateBookingStatus(id, status) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    UPDATE bookings
    SET status = ${status}
    WHERE id = ${id}
    RETURNING ${selectColumns(sql)}
  `;

  return rows[0] ?? null;
}

export async function attachBookingCheckoutSession({
  bookingId,
  reference,
  checkoutSessionId,
}) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    UPDATE bookings
    SET
      stripe_checkout_session_id = ${checkoutSessionId},
      payment_status = CASE
        WHEN estimated_deposit_cents > 0 THEN 'awaiting_payment'
        ELSE payment_status
      END
    WHERE
      (${bookingId ?? null}::bigint IS NOT NULL AND id = ${bookingId ?? null})
      OR (${reference ?? null}::text IS NOT NULL AND reference = ${reference ?? null})
    RETURNING ${selectColumns(sql)}
  `;

  return rows[0] ?? null;
}

export async function markBookingPaymentFailed({
  checkoutSessionId,
  paymentIntentId = null,
}) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  const rows = await sql`
    UPDATE bookings
    SET
      payment_status = CASE
        WHEN payment_status = 'paid' THEN payment_status
        ELSE 'failed'
      END,
      stripe_payment_intent_id = COALESCE(${paymentIntentId}, stripe_payment_intent_id)
    WHERE stripe_checkout_session_id = ${checkoutSessionId}
    RETURNING ${selectColumns(sql)}
  `;

  return rows[0] ?? null;
}

export async function finalizeBookingPayment({
  checkoutSessionId,
  paymentIntentId = null,
}) {
  await ensureBookingsTable();

  const booking = await getBookingByCheckoutSessionId(checkoutSessionId);

  if (!booking) {
    return {
      booking: null,
      wasUpdated: false,
    };
  }

  if (booking.payment_status === "paid") {
    return {
      booking,
      wasUpdated: false,
    };
  }

  const sql = getDatabaseClient();
  const rows = await sql`
    UPDATE bookings
    SET
      payment_status = 'paid',
      stripe_payment_intent_id = COALESCE(${paymentIntentId}, stripe_payment_intent_id),
      payment_completed_at = COALESCE(payment_completed_at, NOW())
    WHERE id = ${booking.id}
    RETURNING ${selectColumns(sql)}
  `;

  return {
    booking: rows[0] ?? booking,
    wasUpdated: true,
  };
}
