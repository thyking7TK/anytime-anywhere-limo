# Autovise Black Car

Luxury transportation booking site built with Next.js and Tailwind CSS.

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

## Stripe payments

Instant-quote bookings can continue directly into embedded Stripe Checkout after the booking request is saved.

Required environment variables:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Recommended setup:

1. Create a Stripe account and collect your test or live API keys.
2. Add the four variables above in Vercel project settings.
3. In the Stripe dashboard, add a webhook endpoint pointing to:
   `https://YOUR-DOMAIN/api/stripe/webhook`
4. Subscribe that webhook to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
5. Redeploy the project after the environment variables are saved.

What the payment flow does:

- The booking is saved first through `POST /api/bookings`.
- If the booking has an instant quote and Stripe is configured, the site shows embedded Checkout immediately after submission.
- When Stripe marks the Checkout Session as paid, the booking is updated in the database.
- A payment-received email is then sent to the customer, and an admin payment email is sent if `BOOKING_NOTIFICATION_EMAIL` is configured.

Notes:

- Quote-request bookings do not open online payment until the trip has a real amount.
- The current flow charges the instant quoted amount as the online payment amount.
- Stripe webhooks are the source of truth for marking a payment as completed.

## Vehicle image uploads

The admin dashboard can now upload up to 5 images per vehicle and save those URLs in the vehicle catalog.

Required environment variable:

- `BLOB_READ_WRITE_TOKEN`

For Vercel, the simplest setup is:

1. Add a Blob store from your project storage tab.
2. Confirm `BLOB_READ_WRITE_TOKEN` appears in the project environment variables.
3. Redeploy the project.

Vehicle uploads are available from the admin dashboard at `/admin`.

## Optional admin access

If you set `BOOKINGS_ADMIN_KEY`, you can fetch recent bookings from:

```bash
GET /api/bookings?key=YOUR_ADMIN_KEY
```

You can also send the same key in the `x-admin-key` header.

The admin dashboard is available at:

```bash
/admin
```

From there you can:

- review recent bookings
- update booking status
- add or edit available vehicles
- change base rates and pricing fees

Public vehicle options and live estimates now read from the same catalog data, so admin pricing changes show up on the booking page without another code change.

## Environment variables

Copy `.env.example` to `.env.local` for local development.
