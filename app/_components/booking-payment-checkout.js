"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/booking";

export default function BookingPaymentCheckout({ bookingReference, amount }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function startCheckout() {
      setIsRedirecting(true);
      setError("");

      try {
        const response = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: bookingReference }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.url) {
          throw new Error(data.message || "We could not start secure payment right now.");
        }

        if (isActive) {
          window.location.href = data.url;
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "We could not start secure payment right now.");
          setIsRedirecting(false);
        }
      }
    }

    void startCheckout();

    return () => {
      isActive = false;
    };
  }, [bookingReference]);

  return (
    <div className="mt-6 rounded-[1.3rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(200,168,112,0.06),rgba(255,255,255,0.02))] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
        Secure payment
      </p>
      <h3 className="mt-3 font-display text-[1.8rem] leading-none text-white">
        Complete payment for {formatCurrency(amount)}
      </h3>
      <p className="mt-3 text-sm leading-7 text-white/62">
        Your booking is saved. You're being taken to a secure Stripe payment page to complete the reservation.
      </p>

      {error ? (
        <div className="mt-4 rounded-[1rem] border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100/90">
          {error}
        </div>
      ) : null}

      {isRedirecting ? (
        <div className="mt-5 flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
          <p className="text-sm text-white/68">Taking you to secure payment...</p>
        </div>
      ) : null}

      {!isRedirecting && !error ? null : null}

      {error ? (
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsRedirecting(true);
            fetch("/api/payments/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: bookingReference }),
            })
              .then((r) => r.json())
              .then((data) => {
                if (data.url) window.location.href = data.url;
                else setError(data.message || "Could not start payment.");
              })
              .catch(() => setError("Could not start payment. Please try again."))
              .finally(() => setIsRedirecting(false));
          }}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)]"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}
