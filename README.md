# Anytime, Anywhere Limo

Luxury limo booking site built with Next.js and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Booking storage

The booking form now saves records through `POST /api/bookings`.

It expects one of these environment variables to point to a Postgres database:

- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`

For Vercel, the simplest production setup is:

1. Add a Postgres provider such as Neon from the Vercel Marketplace.
2. Confirm one of the connection variables above exists in your project settings.
3. Redeploy the project.

The `bookings` table is created automatically on the first successful booking write.

## Address autocomplete

Pickup and drop-off fields use a server-side address search route at `GET /api/address-search`.

Optional environment variable:

- `ADDRESS_SEARCH_COUNTRY_CODES`

Example:

- `us` to prefer United States results
- `us,ca` to allow multiple countries

## Booking emails

Booking emails are sent after a booking is successfully saved.

Required environment variables for admin alerts:

- `RESEND_API_KEY`
- `BOOKING_NOTIFICATION_EMAIL`

Optional email variables:

- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO_EMAIL`
- `BOOKING_SEND_CUSTOMER_CONFIRMATIONS`

Recommended setup:

1. Create a Resend account.
2. Add and verify a sending domain in Resend.
3. Add the variables above in Vercel project settings.
4. Redeploy the project.

Notes:

- If `BOOKING_NOTIFICATION_EMAIL` is set, the app sends an admin alert for each saved booking.
- If `BOOKING_SEND_CUSTOMER_CONFIRMATIONS=true`, the app also sends a customer confirmation email.
- Without a verified domain, Resend test sending is limited. Use a verified domain before turning on customer confirmations.

## Optional admin access

If you set `BOOKINGS_ADMIN_KEY`, you can fetch recent bookings from:

```bash
GET /api/bookings?key=YOUR_ADMIN_KEY
```

You can also send the same key in the `x-admin-key` header.

## Environment variables

Copy `.env.example` to `.env.local` for local development.
