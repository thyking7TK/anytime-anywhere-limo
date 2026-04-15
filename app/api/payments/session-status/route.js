import { NextResponse } from "next/server";

import {
  finalizeBookingPayment,
  formatBookingRecord,
  getBookingByCheckoutSessionId,
  markBookingPaymentFailed,
} from "@/lib/bookings";
import { sendPaymentCompleteEmails } from "@/lib/email";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDisplayPayment(record) {
  return {
    enabled: Number(record?.estimatedDeposit ?? 0) > 0,
    status: record?.paymentStatus ?? "not_requested",
    amount: Number(record?.estimatedDeposit ?? 0),
    bookingReference: record?.reference ?? "",
    message:
      record?.paymentStatus === "paid"
        ? "Payment received. Your booking request is secured and our team will follow up shortly."
        : record?.paymentStatus === "failed"
          ? "The payment did not complete. You can try the secure payment again."
          : "Complete the secure card payment to finish this booking request.",
  };
}

export async function GET(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { message: "Stripe payments are not configured yet." },
      { status: 503 },
    );
  }

  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { message: "Stripe session id is required." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let bookingRecord = await getBookingByCheckoutSessionId(session.id);
    let paymentEmailStatus = null;

    if (session.payment_status === "paid" || session.status === "complete") {
      const finalized = await finalizeBookingPayment({
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
      });

      bookingRecord = finalized.booking ?? bookingRecord;

      if (finalized.wasUpdated && bookingRecord) {
        paymentEmailStatus = await sendPaymentCompleteEmails({
          ...formatBookingRecord(bookingRecord),
          paymentAmount: Math.round(
            Number(bookingRecord.estimated_deposit_cents ?? 0) / 100,
          ),
        });
      }
    } else if (
      session.payment_status === "unpaid" &&
      session.status === "expired"
    ) {
      bookingRecord = await markBookingPaymentFailed({
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
      });
    }

    if (!bookingRecord) {
      return NextResponse.json(
        { message: "Booking not found for this payment session." },
        { status: 404 },
      );
    }

    const booking = formatBookingRecord(bookingRecord);

    return NextResponse.json({
      booking,
      payment: toDisplayPayment(booking),
      paymentEmailStatus,
    });
  } catch (error) {
    console.error("Failed to load Stripe session status", error);

    return NextResponse.json(
      { message: "We could not load payment status right now." },
      { status: 500 },
    );
  }
}
