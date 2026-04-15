import { NextResponse } from "next/server";

import {
  finalizeBookingPayment,
  formatBookingRecord,
  markBookingPaymentFailed,
} from "@/lib/bookings";
import { sendPaymentCompleteEmails } from "@/lib/email";
import {
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleCompletedCheckoutSession(session) {
  const finalized = await finalizeBookingPayment({
    checkoutSessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });

  if (finalized.wasUpdated && finalized.booking) {
    await sendPaymentCompleteEmails({
      ...formatBookingRecord(finalized.booking),
      paymentAmount: Math.round(
        Number(finalized.booking.estimated_deposit_cents ?? 0) / 100,
      ),
    });
  }
}

export async function POST(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { message: "Stripe payments are not configured yet." },
      { status: 503 },
    );
  }

  const endpointSecret = getStripeWebhookSecret();

  if (!endpointSecret) {
    return NextResponse.json(
      { message: "Stripe webhook secret is not configured yet." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { message: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const stripe = getStripeClient();
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);

    return NextResponse.json(
      { message: `Webhook Error: ${error.message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCompletedCheckoutSession(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        await markBookingPaymentFailed({
          checkoutSessionId: event.data.object.id,
          paymentIntentId:
            typeof event.data.object.payment_intent === "string"
              ? event.data.object.payment_intent
              : event.data.object.payment_intent?.id ?? null,
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", error);

    return NextResponse.json(
      { message: "Webhook handling failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
