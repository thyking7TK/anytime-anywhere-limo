import { getDatabaseClient, isDatabaseConfigured } from "./database";

let schemaReadyPromise;

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
        CREATE INDEX IF NOT EXISTS bookings_created_at_idx
        ON bookings (created_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bookings_ride_at_idx
        ON bookings (ride_local_at DESC)
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
