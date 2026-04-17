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
            // Immediately snap the viewport back to x=0 so the browser's
            // cursor-tracking pan (triggered by long address text) is cleared
            // before the user notices any layout shift.
            if (typeof window !== "undefined" && window.scrollX !== 0) {
              window.scrollTo({ left: 0, behavior: "instant" });
            }
            blurTimeoutRef.current = setTimeout(async () => {
              setIsFocused(false);
              if (value.trim().length >= 3) {
                try {
                  const res = await fetch(
                    `/api/address-search?q=${encodeURIComponent(value.trim())}`,
                  );
                  const data = await res.json();
                  const first = data.suggestions?.[0];
                  if (first?.latitude && first?.longitude) {
                    onCoordinates?.({ lat: first.latitude, lon: first.longitude });
                  }
                } catch {
                  // silent
                }
              }
              // Second reset after async work, in case the browser re-panned.
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
                      // Explicitly blur the input. Because onMouseDown calls
                      // preventDefault(), the input keeps focus after tapping a
                      // suggestion — the cursor sits at the end of the long address
                      // text and mobile browsers pan the viewport to show it.
                      // Blurring removes focus so the browser stops cursor-tracking
                      // and resets the pan immediately.
                      if (inputRef.current) {
                        // Move cursor to start first so any pre-blur pan is minimal.
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
        // Reset any horizontal viewport pan that mobile browsers may have
        // applied while the user was typing in the address fields.
        if (typeof window !== "undefined" && window.scrollX !== 0) {
          window.scrollTo({ left: 0, behavior: "instant" });
        }
      } catch {
        setDistanceError("Could not calculate route. Please try again or contact us directly.");
      } finally {
        setIsCalculatingDistance(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffCoords]);

  const [form, setForm] = useState(() => ({
    ...defaultForm,
    vehicle: vehicles[0]?.slug ?? "",
    airportRouteId: airportRouteEntries[0]?.id ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [paymentState, setPaymentState] = useState(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setForm({
      ...defaultForm,
      vehicle: vehicles[0]?.slug ?? "",
      airportRouteId: airportRouteEntries[0]?.id ?? "",
    });
    scrollToBooking();
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

  return (
    <aside
      id="booking"
      className="booking-panel glass-panel min-w-0 overflow-hidden rounded-[1.4rem] p-6 md:p-8"
      aria-label={heroContent.bookingEyebrow}
    >
              <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="lux-section-label">{heroContent.bookingEyebrow}</p>
                  <h2 className="mt-3 font-display text-[1.6rem] leading-none text-white md:text-[2.4rem]">
                    {heroContent.bookingTitle}
                  </h2>
                  <p className="mt-3 max-w-[480px] text-sm leading-7 text-white/64">
                    {heroContent.bookingDescription}
                  </p>
                </div>
                <div className="w-fit self-start rounded-full border border-white/10 bg-white/4 px-4 py-3 text-[0.76rem] uppercase tracking-[0.26em] text-[var(--accent)] shadow-[0_14px_36px_rgba(210,176,107,0.1)]">
                  {heroContent.bookingPill}
                </div>
              </div>

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

                  {paymentState?.enabled &&
                  paymentState.status === "awaiting_payment" ? (
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

              {submitError ? (
                <div className="relative z-10 mt-6 rounded-[0.9rem] border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100/90">
                  {submitError}
                </div>
              ) : null}

              {vehicleAvailabilityMessage ? (
                <div className="relative z-10 mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
                  {vehicleAvailabilityMessage}
                </div>
              ) : null}

              {!submittedBooking ? (
                <form onSubmit={handleSubmit} className="relative z-10 mt-6" noValidate aria-label="Booking request form">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 min-w-0">
                    <label className="block" htmlFor="field-service">
                      <span className="mb-2 block text-sm text-white/72">Service</span>
                      <select id="field-service" aria-required="true" aria-invalid={!!errors.service}
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
                      {errors.service ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.service}
                        </span>
                      ) : null}
                    </label>

                    <label className="block" htmlFor="field-vehicle">
                      <span className="mb-2 block text-sm text-white/72">Vehicle</span>
                      <select
                        id="field-vehicle"
                        aria-required="true"
                        aria-invalid={!!errors.vehicle}
                        value={form.vehicle}
                        onChange={(event) => updateVehicle(event.target.value)}
                        disabled={!hasVehicles}
                        className={fieldClassName}
                      >
                        {hasVehicles ? (
                          vehicles.map((vehicle) => (
                            <option key={vehicle.slug} value={vehicle.slug} className="bg-[#101319]">
                              {vehicle.name}
                            </option>
                          ))
                        ) : (
                          <option value="" className="bg-[#101319]">
                            No vehicles available
                          </option>
                        )}
                      </select>
                      {errors.vehicle ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.vehicle}
                        </span>
                      ) : null}
                    </label>

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
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.fullName}
                        </span>
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
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.phone}
                        </span>
                      ) : null}
                    </label>

                    <label className="block md:col-span-1">
                      <span className="mb-2 block text-sm text-white/72">Email</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        placeholder="name@example.com"
                        className={fieldClassName}
                      />
                      {errors.email ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.email}
                        </span>
                      ) : null}
                    </label>

                    <label className="block md:col-span-1">
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
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.passengers}
                        </span>
                      ) : null}
                    </label>

                    <label className="block md:col-span-1">
                      <span className="mb-2 block text-sm text-white/72">Bags</span>
                      <input
                        type="number"
                        min="0"
                        value={form.bags}
                        onChange={(event) => updateField("bags", event.target.value)}
                        className={fieldClassName}
                      />
                      {errors.bags ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.bags}
                        </span>
                      ) : null}
                    </label>

                    <AddressAutocompleteField
                      label="Pickup Location"
                      field="pickup"
                      value={form.pickup}
                      onChange={updateField}
                      onCoordinates={setPickupCoords}
                      placeholder="Airport, hotel, office, or address"
                      error={errors.pickup}
                    />

                    <AddressAutocompleteField
                      label="Drop-off Location"
                      field="dropoff"
                      value={form.dropoff}
                      onChange={updateField}
                      onCoordinates={setDropoffCoords}
                      placeholder="Destination or event venue"
                      error={errors.dropoff}
                    />

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/72">Date</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) => updateField("date", event.target.value)}
                        className={fieldClassName}
                      />
                      {errors.date ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.date}
                        </span>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/72">Time</span>
                      <input
                        type="time"
                        value={form.time}
                        onChange={(event) => updateField("time", event.target.value)}
                        className={fieldClassName}
                      />
                      {errors.time ? (
                        <span className="mt-2 block text-sm text-amber-200">
                          {errors.time}
                        </span>
                      ) : null}
                    </label>

                    {form.service === "hourly" ? (
                      <>
                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Requested Hours</span>
                          <input
                            type="number"
                            min="1"
                            value={form.requestedHours}
                            onChange={(event) => updateField("requestedHours", event.target.value)}
                            className={fieldClassName}
                          />
                          {errors.requestedHours ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.requestedHours}
                            </span>
                          ) : (
                            <span className="mt-2 block text-xs text-white/42">
                              Minimum billed time is 3 hours.
                            </span>
                          )}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Estimated Stops</span>
                          <input
                            type="number"
                            min="0"
                            value={form.estimatedStops}
                            onChange={(event) => updateField("estimatedStops", event.target.value)}
                            className={fieldClassName}
                          />
                          {errors.estimatedStops ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.estimatedStops}
                            </span>
                          ) : null}
                        </label>

                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm text-white/72">Event Type</span>
                          <input
                            type="text"
                            value={form.eventType}
                            onChange={(event) => updateField("eventType", event.target.value)}
                            placeholder="Meeting, wedding, concert, dinner, roadshow..."
                            className={fieldClassName}
                          />
                        </label>
                      </>
                    ) : null}

                    {form.service === "airport" ? (
                      <>
                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm text-white/72">Airport Route</span>
                          <select
                            value={form.airportRouteId}
                            onChange={(event) => updateField("airportRouteId", event.target.value)}
                            className={fieldClassName}
                          >
                            {hasAirportRoutes ? (
                              airportRouteEntries.map((route) => (
                                <option key={route.id} value={route.id} className="bg-[#101319]">
                                  {route.label}
                                </option>
                              ))
                            ) : (
                              <option value="" className="bg-[#101319]">
                                No flat-rate airport routes configured
                              </option>
                            )}
                          </select>
                          {errors.airportRouteId ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.airportRouteId}
                            </span>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Airline</span>
                          <input
                            type="text"
                            value={form.airline}
                            onChange={(event) => updateField("airline", event.target.value)}
                            placeholder="Optional"
                            className={fieldClassName}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Flight Number</span>
                          <input
                            type="text"
                            value={form.flightNumber}
                            onChange={(event) => updateField("flightNumber", event.target.value)}
                            placeholder="Optional"
                            className={fieldClassName}
                          />
                        </label>

                        <div className="md:col-span-2">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={form.roundTrip}
                            aria-label="Add round trip"
                            onClick={() => updateField("roundTrip", !form.roundTrip)}
                            className={`flex w-full items-center justify-between rounded-[1.2rem] border px-5 py-4 text-sm transition-colors ${
                              form.roundTrip
                                ? "border-[var(--accent)] bg-[rgba(200,168,112,0.08)] text-white"
                                : "border-white/10 bg-white/4 text-white/60 hover:border-white/20 hover:text-white/80"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-colors ${
                                form.roundTrip
                                  ? "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0e]"
                                  : "border-white/20 bg-transparent"
                              }`}>
                                {form.roundTrip ? "✓" : ""}
                              </span>
                              <span className="font-medium">Round Trip</span>
                              <span className="text-white/40">— include the return reservation now</span>
                            </span>
                          </button>
                        </div>

                        {form.roundTrip ? (
                          <>
                            <label className="block">
                              <span className="mb-2 block text-sm text-white/72">Return Date</span>
                              <input
                                type="date"
                                value={form.returnDate}
                                onChange={(event) => updateField("returnDate", event.target.value)}
                                className={fieldClassName}
                              />
                              {errors.returnDate ? (
                                <span className="mt-2 block text-sm text-amber-200">
                                  {errors.returnDate}
                                </span>
                              ) : null}
                            </label>

                            <label className="block">
                              <span className="mb-2 block text-sm text-white/72">Return Time</span>
                              <input
                                type="time"
                                value={form.returnTime}
                                onChange={(event) => updateField("returnTime", event.target.value)}
                                className={fieldClassName}
                              />
                              {errors.returnTime ? (
                                <span className="mt-2 block text-sm text-amber-200">
                                  {errors.returnTime}
                                </span>
                              ) : null}
                            </label>
                          </>
                        ) : null}
                      </>
                    ) : null}

                    {form.service === "custom" ? (
                      <>
                        <label className="block">
                          <span className="mb-1 block text-sm text-white/72">Estimated Trip Hours</span>
                          <span className="mb-2 block">
                            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-[var(--accent)]">
                              {isCalculatingDistance ? "Calculating…" : "Auto-calculated"}
                            </span>
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.estimatedTripHours}
                            readOnly
                            className={`${fieldClassName} cursor-default opacity-70`}
                          />
                          {errors.estimatedTripHours ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.estimatedTripHours}
                            </span>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-sm text-white/72">Estimated Trip Miles</span>
                          <span className="mb-2 block">
                            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-[var(--accent)]">
                              {isCalculatingDistance ? "Calculating…" : "Auto-calculated"}
                            </span>
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.estimatedTripMiles}
                            readOnly
                            className={`${fieldClassName} cursor-default opacity-70`}
                          />
                          {errors.estimatedTripMiles ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.estimatedTripMiles}
                            </span>
                          ) : null}
                        </label>

                        {distanceError ? (
                          <p className="rounded-lg border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
                            {distanceError}
                          </p>
                        ) : null}

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Extra Stops</span>
                          <input
                            type="number"
                            min="0"
                            value={form.extraStops}
                            onChange={(event) => updateField("extraStops", event.target.value)}
                            className={fieldClassName}
                          />
                          {errors.extraStops ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.extraStops}
                            </span>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-white/72">Wait Time (Hours)</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={form.waitHours}
                            onChange={(event) => updateField("waitHours", event.target.value)}
                            className={fieldClassName}
                          />
                          {errors.waitHours ? (
                            <span className="mt-2 block text-sm text-amber-200">
                              {errors.waitHours}
                            </span>
                          ) : null}
                        </label>

                        <label className="inline-flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-4 text-sm text-white/74 md:col-span-2">
                          <input
                            type="checkbox"
                            checked={form.holidayOrEvent}
                            onChange={(event) => updateField("holidayOrEvent", event.target.checked)}
                          />
                          Apply holiday or event surcharge to this estimate
                        </label>
                      </>
                    ) : null}

                    <div className="md:col-span-2">
                      <label className="block">
                        <span className="mb-2 block text-sm text-white/72">
                          Special Requests
                        </span>
                        <textarea
                          rows={4}
                          value={form.requests}
                          onChange={(event) => updateField("requests", event.target.value)}
                          placeholder="Flight number, child seat needs, event notes, multi-stop requests..."
                          className={`${fieldClassName} min-h-[120px] resize-y`}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="glass-panel mt-5 rounded-[1.2rem] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="lux-section-label !mb-0">Live pricing</p>
                        <h3 className="mt-3 font-display text-[1.6rem] leading-none text-white md:text-[2.4rem]">
                          {estimate.quoteMode === "request"
                            ? "Request quote"
                            : `Estimated total ${quoteDisplayAmount}`}
                        </h3>
                      </div>
                      <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/64">
                        {formatQuoteModeLabel(estimate)}
                      </div>
                    </div>

                    {estimate.lineItems?.length ? (
                      <div className="mt-5 grid gap-3 text-sm text-white/64 sm:grid-cols-2">
                        {estimate.lineItems.map((item) => (
                          <p key={item.key} className={item.key === "minimum-threshold" ? "text-[var(--accent-strong)]" : ""}>
                            {item.label}: {formatCurrency(item.amount)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm leading-7 text-white/60">
                        Submit the trip details and Autovise will review the route and return a manual quote.
                      </p>
                    )}

                    <p className="mt-4 text-sm leading-7 text-white/48">
                      {estimate.note || bookingUi.pricingNote}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                      <span className="text-xs text-white/36 uppercase tracking-[0.2em]">We accept</span>
                      {["Card", "Cash", "Venmo", "Zelle"].map((method) => (
                        <span key={method} className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/54">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !hasVehicles}
                    className="lux-button mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_18px_42px_rgba(210,176,107,0.22)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    {isSubmitting
                      ? "Saving booking..."
                      : hasVehicles
                        ? bookingUi.submitButtonLabel
                        : bookingUi.unavailableButtonLabel}
                  </button>
                </form>
              ) : null}
    </aside>
  );
}
