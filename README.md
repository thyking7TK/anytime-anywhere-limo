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

## Optional admin access

If you set `BOOKINGS_ADMIN_KEY`, you can fetch recent bookings from:

```bash
GET /api/bookings?key=YOUR_ADMIN_KEY
```

You can also send the same key in the `x-admin-key` header.

## Environment variables

Copy `.env.example` to `.env.local` for local development.
