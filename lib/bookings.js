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
          vehicle TEXT NOT NULL,
          pickup_location TEXT NOT NULL,
          dropoff_location TEXT NOT NULL,
          ride_local_at TIMESTAMP NOT NULL,
          passengers INTEGER NOT NULL,
          special_requests TEXT NOT NULL DEFAULT '',
          estimated_total_cents INTEGER NOT NULL,
          estimated_deposit_cents INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
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
      vehicle,
      pickup_location,
      dropoff_location,
      ride_local_at,
      passengers,
      special_requests,
      estimated_total_cents,
      estimated_deposit_cents,
      status
    ) VALUES (
      ${booking.reference},
      ${booking.fullName},
      ${booking.email},
      ${booking.phone},
      ${booking.service},
      ${booking.vehicle},
      ${booking.pickup},
      ${booking.dropoff},
      ${booking.rideLocalAt},
      ${booking.passengers},
      ${booking.requests},
      ${booking.estimatedTotalCents},
      ${booking.estimatedDepositCents},
      ${booking.status ?? "pending"}
    )
    RETURNING
      id,
      reference,
      full_name,
      email,
      phone,
      service,
      vehicle,
      pickup_location,
      dropoff_location,
      ride_local_at,
      passengers,
      special_requests,
      estimated_total_cents,
      estimated_deposit_cents,
      status,
      created_at
  `;

  return rows[0];
}

export async function listRecentBookings(limit = 50) {
  await ensureBookingsTable();

  const sql = getDatabaseClient();
  return sql`
    SELECT
      id,
      reference,
      full_name,
      email,
      phone,
      service,
      vehicle,
      pickup_location,
      dropoff_location,
      ride_local_at,
      passengers,
      special_requests,
      estimated_total_cents,
      estimated_deposit_cents,
      status,
      created_at
    FROM bookings
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}
