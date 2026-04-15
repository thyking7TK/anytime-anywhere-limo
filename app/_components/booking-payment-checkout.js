"use client";

import { useEffect, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { formatCurrency } from "@/lib/booking";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null);

export default function BookingPaymentCheckout({
  bookingReference,
  amount,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function createCheckoutSession() {
      if (!publishableKey) {
        if (isActive) {
          setError(
            "Secure card payments are not available yet. Please contact concierge directly.",
          );
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: bookingReference,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.clientSecret) {
          throw new Error(
            data.message || "We could not start secure payment right now.",
          );
        }

        if (isActive) {
          setClientSecret(data.clientSecret);
        }
      } catch (checkoutError) {
        if (isActive) {
          setError(
            checkoutError.message ||
              "We could not start secure payment right now.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void createCheckoutSession();

    return () => {
      isActive = false;
    };
  }, [bookingReference]);

  return (
    <div className="mt-6 rounded-[1.3rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5">
      <div className="flex flex-col gap-3 border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
          Secure payment
        </p>
        <h3 className="font-display text-[2rem] leading-none text-white">
          Complete payment for {formatCurrency(amount)}
        </h3>
        <p className="max-w-[52ch] text-sm leading-7 text-white/62">
          Your booking request is saved. Use the secure card form below to
          complete payment and lock in this quote.
        </p>
      </div>

      {loading ? (
        <div className="mt-5 rounded-[1.1rem] border border-white/8 bg-white/4 px-4 py-4 text-sm text-white/62">
          Preparing secure checkout...
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-[1.1rem] border border-amber-200/20 bg-amber-200/8 px-4 py-4 text-sm text-amber-100/90">
          {error}
        </div>
      ) : null}

      {clientSecret ? (
        <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-3">
          <EmbeddedCheckoutProvider
            key={clientSecret}
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : null}
    </div>
  );
}
