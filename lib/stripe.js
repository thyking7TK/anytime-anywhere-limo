import Stripe from "stripe";

let stripeClient;

function normalizeSiteUrl(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function getStripePublishableKey() {
  return String(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").trim();
}

export function isStripeConfigured() {
  return Boolean(
    String(process.env.STRIPE_SECRET_KEY ?? "").trim() &&
      getStripePublishableKey(),
  );
}

export function getStripeClient() {
  if (!isStripeConfigured()) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  return String(process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
}

export function resolveSiteUrl(fallbackOrigin = "") {
  const configuredSiteUrl =
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteUrl(process.env.SITE_URL) ||
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeSiteUrl(process.env.VERCEL_URL);

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return normalizeSiteUrl(fallbackOrigin);
}

export function buildBookingPaymentLabel(booking) {
  const serviceLabel = booking.serviceTitle || "Private ride";
  return `${serviceLabel} reservation payment`;
}

export function buildBookingPaymentDescription(booking) {
  const details = [booking.pickup, booking.dropoff].filter(Boolean).join(" to ");

  return details
    ? `${booking.reference} - ${details}`
    : `${booking.reference} - Autovise Black Car`;
}
