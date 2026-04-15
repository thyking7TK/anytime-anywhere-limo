import { NextResponse } from "next/server";

import { getBookingServiceById } from "@/lib/booking";
import { getBookingByReference, attachBookingCheckoutSession } from "@/lib/bookings";
import {
  buildBookingPaymentDescription,
  buildBookingPaymentLabel,
  getStripeClient,
  isStripeConfigured,
  resolveSiteUrl,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDisplayAmount(cents) {
  return Math.round(Number(cents || 0) / 100);
}

function getSuccessUrl(request) {
  const origin = new URL(request.url).origin;
  const siteUrl = resolveSiteUrl(origin);
  return `${siteUrl}/?session_id={CHECKOUT_SESSION_ID}#booking`;
}

function getCancelUrl(request) {
  const origin = new URL(request.url).origin;
  const siteUrl = resolveSiteUrl(origin);
  return `${siteUrl}/#booking`;
}

export async function POST(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { message: "Stripe payments are not configured yet." },
      { status: 503 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid checkout payload." },
      { status: 400 },
    );
  }

  const reference = String(payload.reference ?? "").trim();

  if (!reference) {
    return NextResponse.json(
      { message: "Booking reference is required to start payment." },
      { status: 400 },
    );
  }

  const booking = await getBookingByReference(reference);

  if (!booking) {
    return NextResponse.json(
      { message: "Booking not found." },
      { status: 404 },
    );
  }

  if (booking.payment_status === "paid") {
    return NextResponse.json(
      { message: "This booking has already been paid." },
      { status: 409 },
    );
  }

  if (Number(booking.estimated_deposit_cents) <= 0) {
    return NextResponse.json(
      {
        message:
          "Online payment is only available for bookings with an instant quote.",
      },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  const serviceTitle =
    getBookingServiceById(booking.service)?.title ?? booking.service;

  if (booking.stripe_checkout_session_id) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(
        booking.stripe_checkout_session_id,
      );

      if (
        existingSession?.payment_status === "paid" ||
        existingSession?.status === "complete"
      ) {
        return NextResponse.json(
          { message: "This booking has already been paid." },
          { status: 409 },
        );
      }

      if (
        existingSession?.url &&
        existingSession?.status === "open" &&
        existingSession?.payment_status === "unpaid"
      ) {
        return NextResponse.json({
          url: existingSession.url,
          sessionId: existingSession.id,
          amount: toDisplayAmount(booking.estimated_deposit_cents),
        });
      }
    } catch (error) {
      console.error("Failed to reuse Stripe checkout session", error);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: getSuccessUrl(request),
      cancel_url: getCancelUrl(request),
      customer_email: booking.email,
      client_reference_id: booking.reference,
      submit_type: "book",
      metadata: {
        bookingReference: booking.reference,
        bookingId: String(booking.id),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Number(booking.estimated_deposit_cents),
            product_data: {
              name: buildBookingPaymentLabel({
                reference: booking.reference,
                serviceTitle,
              }),
              description: buildBookingPaymentDescription({
                reference: booking.reference,
                pickup: booking.pickup_location,
                dropoff: booking.dropoff_location,
              }),
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message:
            "This secure payment reserves the quoted Autovise Black Car trip request tied to your booking reference.",
        },
      },
    });

    await attachBookingCheckoutSession({
      bookingId: booking.id,
      reference: booking.reference,
      checkoutSessionId: session.id,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      amount: toDisplayAmount(booking.estimated_deposit_cents),
    });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);

    const stripeMessage =
      error?.message || "We could not start secure payment right now.";

    return NextResponse.json(
      { message: stripeMessage },
      { status: 500 },
    );
  }
}
