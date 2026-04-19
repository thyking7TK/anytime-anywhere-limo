"use client";

import { useEffect, useRef, useState } from "react";

import BookingPaymentCheckout from "@/app/_components/booking-payment-checkout";
import {
  bookingServices,
  calculateEstimate,
  computeStartingRates,
  defaultForm,
  fleet,
  formatCurrency,
  getBookingServiceById,
  getDefaultCatalog,
  getVehicleBySlug,
  validateBooking,
} from "@/lib/booking";
import { getDefaultSiteContent } from "@/lib/site-content-shared";

const fieldClassName =
  "frost-input w-full min-w-0 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[var(--accent)] focus:bg-white/7";
const addressSuggestionCache = new Map();

const proofChips = [
  "Flight tracking",
  "Transparent pricing",
  "24/7 reservations",
  "Professional chauffeurs",
];

function formatQuoteModeLabel(estimate) {
  return estimate?.quoteMode === "request" ? "Request quote" : "Instant estimate";
}

// ─── tiny display helpers ──────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "";
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}`;
}
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m}${hr >= 12 ? "pm" : "am"}`;
}

function AddressAutocompleteField({
  label,
  field,
  placeholder,
  value,
  onChange,
  onCoordinates,
  error,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const blurTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  function cleanupBlurTimeout() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }

  async function loadSuggestions(query) {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cachedSuggestions = addressSuggestionCache.get(normalizedQuery);

    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/address-search?q=${encodeURIComponent(query.trim())}`,
      );

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      const nextSuggestions = Array.isArray(data.suggestions)
        ? data.suggestions
        : [];
      addressSuggestionCache.set(normalizedQuery, nextSuggestions);
      setSuggestions(nextSuggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }

  const showSuggestions =
    isFocused && (suggestions.length > 0 || (value.trim().length >= 3 && isLoading));

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm text-white/72">{label}</span>
      <div className="relative min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(field, event.target.value);
            onCoordinates?.(null);
            void loadSuggestions(event.target.value);
          }}
          onFocus={() => {
            cleanupBlurTimeout();
            setIsFocused(true);
            void loadSuggestions(value);
          }}
          onBlur={() => {
            if (typeof window !== "undefined" && window.scrollX !== 0) {
              window.scrollTo({ left: 0, behavior: "instant" });
            }
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
              if (typeof window !== "undefined" && window.scrollX !== 0) {
                window.scrollTo({ left: 0, behavior: "instant" });
              }
            }, 140);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={fieldClassName}
        />

        {showSuggestions ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-[rgba(8,12,18,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-white/60">
                Searching addresses...
              </div>
            ) : null}

            {!isLoading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/60">
                No matching addresses found.
              </div>
            ) : null}

            {!isLoading
              ? suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange(
                        field,
                        suggestion.selectionLabel || suggestion.displayName,
                      );
                      if (suggestion.latitude && suggestion.longitude) {
                        onCoordinates?.({ lat: suggestion.latitude, lon: suggestion.longitude });
                      }
                      setSuggestions([]);
                      setIsFocused(false);
                      if (inputRef.current) {
                        try { inputRef.current.setSelectionRange(0, 0); } catch (_) {}
                        inputRef.current.blur();
                      }
                      if (typeof window !== "undefined" && window.scrollX !== 0) {
                        window.scrollTo({ left: 0, behavior: "instant" });
                      }
                    }}
                    className="block w-full border-b border-white/6 px-4 py-3 text-left last:border-b-0 hover:bg-white/6"
                  >
                    <span className="block text-sm font-medium text-white">
                      {suggestion.primaryText}
                    </span>
                    <span className="mt-1 block text-xs text-white/55">
                      {suggestion.secondaryText || suggestion.displayName}
                    </span>
                  </button>
                ))
              : null}
          </div>
        ) : null}
      </div>
      {error ? (
        <span className="mt-2 block text-sm text-amber-200">{error}</span>
      ) : null}
    </label>
  );
}

export default function AnytimeAnywhereLimoWebsite({
  initialCatalog,
  initialSiteContent,
}) {
  const catalog = initialCatalog ?? getDefaultCatalog();
  const siteContent = initialSiteContent ?? getDefaultSiteContent();
  const vehicles = Array.isArray(catalog.vehicles) ? catalog.vehicles : fleet;
  const bookingServiceEntries = Array.isArray(catalog.bookingServices)
    ? catalog.bookingServices
    : bookingServices;
  const airportRouteEntries = Array.isArray(catalog.airportRoutes)
    ? catalog.airportRoutes.filter((route) => route.active !== false)
    : [];
  const heroStats = Array.isArray(siteContent.heroStats)
    ? siteContent.heroStats
    : [];
  const proofContent = siteContent.proof ?? {};
  const heroContent = siteContent.hero ?? {};
  const bookingUi = siteContent.bookingUi ?? {};
  const visibleProofChips = Array.isArray(proofContent.chips)
    ? proofContent.chips.filter((chip) => String(chip ?? "").trim())
    : proofChips;
  const hasVehicles = vehicles.length > 0;
  const vehicleAvailabilityMessage = hasVehicles
    ? ""
    : bookingUi.unavailableMessage;

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistanceInfo(null);
      setDistanceError("");
      setForm((current) => {
        if (current.service !== "custom") return current;
        return { ...current, estimatedTripMiles: "0", estimatedTripHours: "0" };
      });
      return undefined;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingDistance(true);
      setDistanceError("");
      try {
        const params = new URLSearchParams({
          pickupLat: pickupCoords.lat,
          pickupLon: pickupCoords.lon,
          dropoffLat: dropoffCoords.lat,
          dropoffLon: dropoffCoords.lon,
        });
        const response = await fetch(`/api/distance?${params}`);
        if (!response.ok) throw new Error("Distance API error");
        const data = await response.json();
        setDistanceInfo(data);
        setDistanceError("");
        setForm((current) => {
          if (current.service !== "custom") return current;
          const autoMiles = String(Math.round(data.distanceMiles));
          const autoHours = String(Math.round(data.durationHours * 2) / 2);
          return {
            ...current,
            estimatedTripMiles: autoMiles,
            estimatedTripHours: autoHours,
          };
        });
        if (typeof window !== "undefined" && window.scrollX !== 0) {
          window.scrollTo({ left: 0, behavior: "instant" });
        }
      } catch {
        setDistanceError("Could not calculate route. Please enter addresses manually or contact us.");
      } finally {
        setIsCalculatingDistance(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffCoords]);

  // ─── form state — service defaults to "custom" ──────────────────────────
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    service: "custom",
    vehicle: vehicles[0]?.slug ?? "",
    airportRouteId: airportRouteEntries[0]?.id ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [paymentState, setPaymentState] = useState(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── multi-step accordion state ─────────────────────────────────────────
  const [step, setStep] = useState(1);
  const formTopRef = useRef(null);

  // Scroll to the top of the form on step change (mobile only, not step 4)
  useEffect(() => {
    if (step === 4) return;
    if (!formTopRef.current) return;
    // Only scroll on mobile viewports
    if (window.innerWidth >= 1024) return;
    // Small delay so the new step has rendered before we measure
    const id = setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(id);
  }, [step]);

  const estimate = calculateEstimate(form, catalog);
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog) ?? vehicles[0] ?? null;
  const selectedService =
    getBookingServiceById(form.service) ??
    bookingServiceEntries[0] ??
    null;
  const selectedAirportRoute =
    airportRouteEntries.find((route) => route.id === form.airportRouteId) ??
    airportRouteEntries[0] ??
    null;
  const passengerLimit = Math.max(selectedVehicle?.capacity ?? 6, 12);
  const passengerOptions = Array.from(
    { length: passengerLimit },
    (_, index) => String(index + 1),
  );
  const luggageOptions = Array.from({ length: 13 }, (_, i) => String(i));
  const quoteDisplayAmount = estimate.total > 0
    ? formatCurrency(estimate.total)
    : "Request Quote";
  const hasAirportRoutes = airportRouteEntries.length > 0;

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      return undefined;
    }

    let isActive = true;

    async function loadReturnedPaymentStatus() {
      setCheckingPaymentStatus(true);
      setSubmitError("");

      try {
        const response = await fetch(
          `/api/payments/session-status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "We could not confirm payment status right now.",
          );
        }

        if (!isActive) {
          return;
        }

        setSubmittedBooking(data.booking ?? null);
        setPaymentState(data.payment ?? null);

        const cleanUrl = `${window.location.pathname}${window.location.hash || "#booking"}`;
        window.history.replaceState({}, "", cleanUrl);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSubmitError(
          error.message || "We could not confirm payment status right now.",
        );
      } finally {
        if (isActive) {
          setCheckingPaymentStatus(false);
        }
      }
    }

    void loadReturnedPaymentStatus();

    return () => {
      isActive = false;
    };
  }, []);

  function clearFieldError(field) {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateServiceType(nextService) {
    setForm((currentForm) => ({
      ...currentForm,
      service: nextService,
      airportRouteId:
        nextService === "airport"
          ? currentForm.airportRouteId || airportRouteEntries[0]?.id || ""
          : currentForm.airportRouteId,
      roundTrip: nextService === "airport" ? currentForm.roundTrip : false,
      returnDate: nextService === "airport" ? currentForm.returnDate : "",
      returnTime: nextService === "airport" ? currentForm.returnTime : "",
    }));
    clearFieldError("service");
    clearFieldError("airportRouteId");
    setSubmitError("");
  }

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    clearFieldError(field);
    setSubmitError("");
    // Clear stale coordinates when address text is changed manually
    if (field === "pickup") setPickupCoords(null);
    if (field === "dropoff") setDropoffCoords(null);
  }

  function updateVehicle(vehicleSlug) {
    const nextVehicle = getVehicleBySlug(vehicleSlug, catalog) ?? vehicles[0] ?? null;

    if (!nextVehicle) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      vehicle: vehicleSlug,
      passengers: String(
        Math.min(Number(currentForm.passengers), nextVehicle.capacity) || 1,
      ),
    }));

    clearFieldError("vehicle");
    clearFieldError("passengers");
    setSubmitError("");
  }

  function scrollToBooking() {
    document.getElementById("booking")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function resetBookingExperience() {
    setSubmittedBooking(null);
    setPaymentState(null);
    setErrors({});
    setSubmitError("");
    setStep(1);
    setForm({
      ...defaultForm,
      service: "custom",
      vehicle: vehicles[0]?.slug ?? "",
      airportRouteId: airportRouteEntries[0]?.id ?? "",
    });
    scrollToBooking();
  }

  // ─── partial step validation ─────────────────────────────────────────────
  function tryAdvance(fromStep) {
    const errs = {};
    if (fromStep === 1) {
      if (!form.pickup.trim()) errs.pickup = "Pickup location is required.";
      if (!form.dropoff.trim()) errs.dropoff = "Drop-off location is required.";
      if (!form.date) errs.date = "Date is required.";
      if (!form.time) errs.time = "Time is required.";
    }
    if (fromStep === 3) {
      if (!form.fullName.trim()) errs.fullName = "Full name is required.";
      if (!form.phone.trim()) errs.phone = "Phone number is required.";
      if (!form.email.trim()) errs.email = "Email is required.";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return;
    }
    setStep(fromStep + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateBooking(form, { catalog });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Please correct the highlighted booking fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setSubmitError(
          data.message ??
            "We could not save this booking right now. Please try again.",
        );
        return;
      }

      setSubmittedBooking(data.booking);
      setPaymentState(data.payment ?? null);
      setErrors({});
      setSubmitError("");
      setForm({
        ...defaultForm,
        service: "custom",
        vehicle: vehicles[0]?.slug ?? "",
        airportRouteId: airportRouteEntries[0]?.id ?? "",
      });
    } catch {
      setSubmitError(
        "We could not reach the booking service. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── step badge ──────────────────────────────────────────────────────────
  function StepBadge({ n, done }) {
    if (done) {
      return (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.6rem] font-bold text-[#0a0a0e]">
          ✓
        </span>
      );
    }
    return (
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
        step === n
          ? "border-[var(--accent)] text-[var(--accent)]"
          : "border-white/20 text-white/30"
      }`}>
        {n}
      </span>
    );
  }

  // ─── continue button ─────────────────────────────────────────────────────
  function ContinueBtn({ onClick, label = "Continue" }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="lux-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_12px_30px_rgba(210,176,107,0.18)] hover:bg-[var(--accent-dark)]"
      >
        {label}
      </button>
    );
  }

  return (
    <aside
      id="booking"
      ref={formTopRef}
      className="booking-panel glass-panel min-w-0 overflow-hidden rounded-[1.4rem] p-6 md:p-8"
      aria-label={heroContent.bookingEyebrow}
    >
      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="lux-section-label">{heroContent.bookingEyebrow}</p>
          <h2 className="mt-3 font-display text-[1.6rem] leading-none text-white md:text-[2.4rem]">
            {heroContent.bookingTitle}
          </h2>
        </div>
      </div>

      {/* ── Success state ────────────────────────────────────────────── */}
      {submittedBooking ? (
        <div className="relative z-10 mt-6 rounded-[1.2rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(200,168,112,0.12),rgba(255,255,255,0.02))] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {paymentState?.status === "paid"
              ? "Payment received"
              : bookingUi.successLabel}
          </p>
          <h3 className="mt-3 font-display text-[2rem] text-white">
            Reference {submittedBooking.reference}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/72">
            {paymentState?.status === "paid"
              ? `We've received payment for your ${submittedBooking.service.toLowerCase()} request. Follow-up can go to ${submittedBooking.email}.`
              : `We saved your request for ${submittedBooking.service.toLowerCase()}. Follow-up can go to ${submittedBooking.email}.`}
          </p>
          <div className="mt-5 grid gap-3 text-sm text-white/68 sm:grid-cols-2">
            <p>Pickup: {submittedBooking.pickup}</p>
            <p>Drop-off: {submittedBooking.dropoff}</p>
            <p>When: {submittedBooking.when}</p>
            {submittedBooking.returnWhen ? (
              <p>Return: {submittedBooking.returnWhen}</p>
            ) : null}
            <p>
              {submittedBooking.estimate.quoteMode === "request"
                ? "Quote mode: Request quote"
                : `Estimated total: ${formatCurrency(submittedBooking.estimate.total)}`}
            </p>
            {paymentState?.amount ? (
              <p>
                {paymentState.status === "paid"
                  ? `Payment received: ${formatCurrency(paymentState.amount)}`
                  : `Secure payment due: ${formatCurrency(paymentState.amount)}`}
              </p>
            ) : null}
          </div>

          {checkingPaymentStatus ? (
            <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/68">
              Confirming payment status...
            </div>
          ) : null}

          {paymentState?.message ? (
            <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/68">
              {paymentState.message}
            </div>
          ) : null}

          {paymentState?.enabled && paymentState.status === "awaiting_payment" ? (
            <BookingPaymentCheckout
              key={submittedBooking.reference}
              bookingReference={submittedBooking.reference}
              amount={paymentState.amount}
            />
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetBookingExperience}
              className="lux-button inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/7"
            >
              Request Another Ride
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {submitError && !submittedBooking ? (
        <div className="relative z-10 mt-6 rounded-[0.9rem] border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100/90">
          {submitError}
        </div>
      ) : null}

      {vehicleAvailabilityMessage && !submittedBooking ? (
        <div className="relative z-10 mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
          {vehicleAvailabilityMessage}
        </div>
      ) : null}

      {/* ── Multi-step accordion form ─────────────────────────────────── */}
      {!submittedBooking ? (
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mt-6 flex flex-col gap-3"
          noValidate
          aria-label="Booking request form"
        >

          {/* ══════════════════════════════════════════════════════════
              STEP 1 — Trip Details
          ══════════════════════════════════════════════════════════ */}
          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 1 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {/* header */}
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={1} done />
                  <span className="text-sm font-medium text-white">Trip Details</span>
                </div>
                <span className="max-w-[55%] truncate text-right text-xs text-white/40">
                  {[selectedService?.title, fmtDate(form.date), fmtTime(form.time)].filter(Boolean).join(" · ")}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <StepBadge n={1} done={false} />
                <span className="text-sm font-semibold text-white">Trip Details</span>
              </div>
            )}

            {/* body */}
            {step === 1 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-4 min-w-0">

                  {/* Service */}
                  <label className="block" htmlFor="field-service">
                    <span className="mb-2 block text-sm text-white/72">Service</span>
                    <select
                      id="field-service"
                      aria-required="true"
                      value={form.service}
                      onChange={(event) => updateServiceType(event.target.value)}
                      className={fieldClassName}
                    >
                      {bookingServiceEntries.map((service) => (
                        <option key={service.id} value={service.id} className="bg-[#101319]">
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Pickup */}
                  <AddressAutocompleteField
                    label="Pickup Location"
                    field="pickup"
                    value={form.pickup}
                    onChange={updateField}
                    onCoordinates={setPickupCoords}
                    placeholder="Airport, hotel, office, or address"
                    error={errors.pickup}
                  />

                  {/* Drop-off */}
                  <AddressAutocompleteField
                    label="Drop-off Location"
                    field="dropoff"
                    value={form.dropoff}
                    onChange={updateField}
                    onCoordinates={setDropoffCoords}
                    placeholder="Destination or event venue"
                    error={errors.dropoff}
                  />

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-4 min-w-0">
                    <label className="block min-w-0">
                      <span className="mb-2 block text-sm text-white/72">Date</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) => updateField("date", event.target.value)}
                        className={fieldClassName}
                      />
                      {errors.date ? (
                        <span className="mt-2 block text-sm text-amber-200">{errors.date}</span>
                      ) : null}
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-2 block text-sm text-white/72">Time</span>
                      <input
                        type="time"
                        value={form.time}
                        onChange={(event) => updateField("time", event.target.value)}
                        className={fieldClassName}
                      />
                      {errors.time ? (
                        <span className="mt-2 block text-sm text-amber-200">{errors.time}</span>
                      ) : null}
                    </label>
                  </div>

                  {/* Passengers + Luggage */}
                  <div className="grid grid-cols-2 gap-4 min-w-0">
                    <label className="block min-w-0">
                      <span className="mb-2 block text-sm text-white/72">Passengers</span>
                      <select
                        value={form.passengers}
                        onChange={(event) => updateField("passengers", event.target.value)}
                        className={fieldClassName}
                      >
                        {passengerOptions.map((count) => (
                          <option key={count} value={count} className="bg-[#101319]">
                            {count}
                          </option>
                        ))}
                      </select>
                      {errors.passengers ? (
                        <span className="mt-2 block text-sm text-amber-200">{errors.passengers}</span>
                      ) : null}
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-2 block text-sm text-white/72">Luggage</span>
                      <select
                        value={form.bags}
                        onChange={(event) => updateField("bags", event.target.value)}
                        className={fieldClassName}
                      >
                        {luggageOptions.map((count) => (
                          <option key={count} value={count} className="bg-[#101319]">
                            {count === "0" ? "0 bags" : count === "1" ? "1 bag" : `${count} bags`}
                          </option>
                        ))}
                      </select>
                      {errors.bags ? (
                        <span className="mt-2 block text-sm text-amber-200">{errors.bags}</span>
                      ) : null}
                    </label>
                  </div>

                  {/* Distance calculation status */}
                  {isCalculatingDistance ? (
                    <p className="text-xs text-white/40">Calculating route distance…</p>
                  ) : distanceError ? (
                    <p className="rounded-lg border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
                      {distanceError}
                    </p>
                  ) : distanceInfo && form.service === "custom" ? (
                    <p className="text-xs text-white/40">
                      Route: {distanceInfo.distanceMiles} mi · {distanceInfo.durationMinutes} min drive
                    </p>
                  ) : null}

                </div>

                <button
                  type="button"
                  onClick={() => tryAdvance(1)}
                  disabled={isCalculatingDistance}
                  className="lux-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_12px_30px_rgba(210,176,107,0.18)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCalculatingDistance ? "Calculating route…" : "Continue to Vehicle →"}
                </button>
              </div>
            ) : null}
          </div>

          {/* ══════════════════════════════════════════════════════════
              STEP 2 — Vehicle
          ══════════════════════════════════════════════════════════ */}
          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 2 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {/* header */}
            {step > 2 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={2} done />
                  <span className="text-sm font-medium text-white">Vehicle</span>
                </div>
                <span className="text-xs text-white/40">{selectedVehicle?.name ?? ""}</span>
              </button>
            ) : (
              <div className={`flex items-center gap-3 px-5 py-4 ${step < 2 ? "opacity-35" : "border-b border-white/8"}`}>
                <StepBadge n={2} done={false} />
                <span className={`text-sm font-semibold ${step === 2 ? "text-white" : "text-white/50"}`}>Vehicle</span>
              </div>
            )}

            {/* body */}
            {step === 2 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="flex flex-col gap-3">
                  {hasVehicles ? (
                    vehicles.map((vehicle) => (
                      <button
                        key={vehicle.slug}
                        type="button"
                        onClick={() => updateVehicle(vehicle.slug)}
                        className={`w-full rounded-[1.2rem] border p-5 text-left transition-colors ${
                          form.vehicle === vehicle.slug
                            ? "border-[var(--accent)] bg-[rgba(200,168,112,0.07)]"
                            : "border-white/10 bg-white/3 hover:border-white/20"
                        }`}
                      >
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--accent)]">
                          Luxury SUV
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">{vehicle.name}</p>
                        <p className="mt-1 text-xs text-white/46">
                          Up to {vehicle.capacity} passengers
                        </p>
                        {form.vehicle === vehicle.slug ? (
                          <span className="mt-3 inline-block rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-0.5 text-[0.68rem] text-[var(--accent)]">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-white/50">{bookingUi.unavailableMessage}</p>
                  )}
                  {errors.vehicle ? (
                    <span className="text-sm text-amber-200">{errors.vehicle}</span>
                  ) : null}
                </div>

                <ContinueBtn onClick={() => setStep(3)} label="Continue to Contact →" />
              </div>
            ) : null}
          </div>

          {/* ══════════════════════════════════════════════════════════
              STEP 3 — Contact
          ══════════════════════════════════════════════════════════ */}
          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 3 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {/* header */}
            {step > 3 ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={3} done />
                  <span className="text-sm font-medium text-white">Contact</span>
                </div>
                <span className="max-w-[55%] truncate text-right text-xs text-white/40">
                  {form.fullName || form.email}
                </span>
              </button>
            ) : (
              <div className={`flex items-center gap-3 px-5 py-4 ${step < 3 ? "opacity-35" : "border-b border-white/8"}`}>
                <StepBadge n={3} done={false} />
                <span className={`text-sm font-semibold ${step === 3 ? "text-white" : "text-white/50"}`}>Contact</span>
              </div>
            )}

            {/* body */}
            {step === 3 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-4 min-w-0">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Full Name</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      placeholder="Passenger or organizer name"
                      className={fieldClassName}
                    />
                    {errors.fullName ? (
                      <span className="mt-2 block text-sm text-amber-200">{errors.fullName}</span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Phone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="(555) 123-4567"
                      className={fieldClassName}
                    />
                    {errors.phone ? (
                      <span className="mt-2 block text-sm text-amber-200">{errors.phone}</span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="name@example.com"
                      className={fieldClassName}
                    />
                    {errors.email ? (
                      <span className="mt-2 block text-sm text-amber-200">{errors.email}</span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">
                      Special Requests{" "}
                      <span className="text-white/36">(optional)</span>
                    </span>
                    <textarea
                      rows={3}
                      value={form.requests}
                      onChange={(event) => updateField("requests", event.target.value)}
                      placeholder="Child seat, flight number, event notes, extra stops…"
                      className={`${fieldClassName} resize-none`}
                    />
                  </label>
                </div>

                <ContinueBtn onClick={() => tryAdvance(3)} label="Review Summary →" />
              </div>
            ) : null}
          </div>

          {/* ══════════════════════════════════════════════════════════
              STEP 4 — Summary + Submit
          ══════════════════════════════════════════════════════════ */}
          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 4 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {/* header */}
            <div className={`flex items-center gap-3 px-5 py-4 ${step < 4 ? "opacity-35" : step === 4 ? "border-b border-white/8" : ""}`}>
              <StepBadge n={4} done={false} />
              <span className={`text-sm font-semibold ${step === 4 ? "text-white" : "text-white/50"}`}>Summary</span>
            </div>

            {/* body */}
            {step === 4 ? (
              <div className="px-5 pb-5 pt-4">

                {/* Details grid */}
                <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                  {[
                    { label: "Service",    value: selectedService?.title },
                    { label: "Vehicle",    value: selectedVehicle?.name },
                    { label: "Pickup",     value: form.pickup, full: true },
                    { label: "Drop-off",   value: form.dropoff, full: true },
                    { label: "Date",       value: fmtDate(form.date) },
                    { label: "Time",       value: fmtTime(form.time) },
                    { label: "Passengers", value: form.passengers },
                    { label: "Luggage",    value: `${form.bags} ${Number(form.bags) === 1 ? "bag" : "bags"}` },
                    { label: "Name",       value: form.fullName },
                    { label: "Phone",      value: form.phone },
                    { label: "Email",      value: form.email, full: true },
                    form.requests
                      ? { label: "Requests", value: form.requests, full: true }
                      : null,
                    form.service === "custom" && form.estimatedTripMiles && form.estimatedTripMiles !== "0"
                      ? { label: "Est. Distance", value: `${form.estimatedTripMiles} mi · ${form.estimatedTripHours} hr` }
                      : null,
                  ]
                    .filter(Boolean)
                    .map(({ label, value, full }) => (
                      <div key={label} className={`${full ? "sm:col-span-2" : ""} py-1`}>
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/36">{label}</p>
                        <p className="mt-0.5 text-sm text-white/80">{value || "—"}</p>
                      </div>
                    ))}
                </div>

                <div className="my-5 border-t border-white/8" />

                {/* Live pricing block */}
                <div className="rounded-[1.2rem] border border-white/10 bg-white/3 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="lux-section-label !mb-0">Live pricing</p>
                      <h3 className="mt-2 font-display text-[1.6rem] leading-none text-white">
                        {isCalculatingDistance
                          ? "Calculating…"
                          : estimate.quoteMode === "request"
                            ? "Request quote"
                            : `Est. total ${quoteDisplayAmount}`}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/56">
                      {isCalculatingDistance ? "Computing route" : formatQuoteModeLabel(estimate)}
                    </div>
                  </div>

                  {isCalculatingDistance ? (
                    <p className="mt-4 text-sm text-white/40">
                      Calculating route distance — pricing will appear in a moment.
                    </p>
                  ) : estimate.lineItems?.length ? (
                    <div className="mt-4 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
                      {estimate.lineItems.map((item) => (
                        <p key={item.key} className={item.key === "minimum-threshold" ? "text-[var(--accent-strong)]" : ""}>
                          {item.label}: {formatCurrency(item.amount)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-white/56">
                      {distanceError
                        ? "Route could not be calculated — Autovise will quote this manually."
                        : "Submit your trip and we'll return a manual quote."}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-7 text-white/40">
                    {estimate.note || bookingUi.pricingNote}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/32">We accept</span>
                    {["Card", "Cash", "Venmo", "Zelle"].map((method) => (
                      <span key={method} className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/50">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !hasVehicles}
                  className="lux-button mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_18px_42px_rgba(210,176,107,0.22)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isSubmitting
                    ? "Saving booking…"
                    : hasVehicles
                      ? bookingUi.submitButtonLabel
                      : bookingUi.unavailableButtonLabel}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="mt-3 w-full py-2 text-center text-xs text-white/36 hover:text-white/60"
                >
                  ← Edit contact details
                </button>
              </div>
            ) : null}
          </div>

        </form>
      ) : null}
    </aside>
  );
}
