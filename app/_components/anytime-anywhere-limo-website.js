"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import BookingPaymentCheckout from "@/app/_components/booking-payment-checkout";
import {
  bookingServices,
  calculateEstimate,
  defaultForm,
  fleet,
  formatCurrency,
  formatRideLocalTimestamp,
  getBookingServiceById,
  getDefaultCatalog,
  getVehicleBySlug,
  validateBooking,
} from "@/lib/booking";
import {
  getMaineTourById,
  getMaineTourPricingOption,
  maineTourPackages,
} from "@/lib/maine-tours";
import { getDefaultSiteContent } from "@/lib/site-content-shared";

const fieldClassName =
  "frost-input w-full min-w-0 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[var(--accent)] focus:bg-white/7";
const addressSuggestionCache = new Map();

function formatQuoteModeLabel(estimate) {
  return estimate?.quoteMode === "request" ? "Request quote" : "Instant estimate";
}

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  const [, month, day] = String(value).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Math.max(0, Number(month) - 1)]} ${Number(day)}`;
}

function formatShortTime(value) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = String(value).split(":");
  const hour = Number(hours);
  return `${hour % 12 || 12}:${minutes}${hour >= 12 ? "pm" : "am"}`;
}

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, "0");
  const minutes = String((index % 4) * 15).padStart(2, "0");
  const value = `${hours}:${minutes}`;

  return {
    value,
    label: formatShortTime(value),
  };
});

function StepBadge({ active, done, number }) {
  if (done) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.65rem] font-bold text-[#0a0a0e]">
        ✓
      </span>
    );
  }

  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
        active
          ? "border-[var(--accent)] text-[var(--accent)]"
          : "border-white/20 text-white/30"
      }`}
    >
      {number}
    </span>
  );
}

function ContinueButton({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="lux-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_12px_30px_rgba(210,176,107,0.18)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
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
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
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
                        onCoordinates?.({
                          lat: suggestion.latitude,
                          lon: suggestion.longitude,
                        });
                      }
                      setSuggestions([]);
                      setIsFocused(false);
                      inputRef.current?.blur();
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
  const searchParams = useSearchParams();
  const catalog = initialCatalog ?? getDefaultCatalog();
  const siteContent = initialSiteContent ?? getDefaultSiteContent();
  const vehicles = Array.isArray(catalog.vehicles) ? catalog.vehicles : fleet;
  const airportRouteEntries = Array.isArray(catalog.airportRoutes)
    ? catalog.airportRoutes.filter((route) => route.active !== false)
    : [];
  const bookingServiceEntries = (() => {
    const entries = Array.isArray(catalog.bookingServices)
      ? [...catalog.bookingServices]
      : [];

    bookingServices.forEach((service) => {
      if (!entries.some((item) => item.id === service.id)) {
        entries.push(service);
      }
    });

    return entries;
  })();

  const heroContent = siteContent.hero ?? {};
  const bookingUi = siteContent.bookingUi ?? {};
  const hasVehicles = vehicles.length > 0;
  const vehicleAvailabilityMessage = hasVehicles
    ? ""
    : bookingUi.unavailableMessage;

  function createInitialFormState() {
    return {
      ...defaultForm,
      service: "custom",
      vehicle: vehicles[0]?.slug ?? "",
      airportRouteId: airportRouteEntries[0]?.id ?? "",
      tourPackageId: maineTourPackages[0]?.id ?? defaultForm.tourPackageId,
      tourPricingTierIndex: "0",
    };
  }

  const [form, setForm] = useState(createInitialFormState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [paymentState, setPaymentState] = useState(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState("");
  const formTopRef = useRef(null);
  const initializedFromQueryRef = useRef(false);

  const estimate = calculateEstimate(form, catalog);
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog) ?? vehicles[0] ?? null;
  const selectedService =
    getBookingServiceById(form.service) ??
    bookingServiceEntries[0] ??
    null;
  const selectedTour = getMaineTourById(form.tourPackageId);
  const selectedTourPricing = getMaineTourPricingOption(
    form.tourPackageId,
    form.tourPricingTierIndex,
  );
  const showVehicleStep = form.service !== "maine-tours";
  const passengerLimit = Math.max(selectedVehicle?.capacity ?? 6, 12);
  const passengerOptions = Array.from(
    { length: passengerLimit },
    (_, index) => String(index + 1),
  );
  const luggageOptions = Array.from({ length: 13 }, (_, index) => String(index));
  const quoteDisplayAmount =
    estimate.total > 0 ? formatCurrency(estimate.total) : "Request Quote";

  useEffect(() => {
    if (initializedFromQueryRef.current) {
      return;
    }

    const serviceParam = searchParams.get("service");
    const tourPackageIdParam = searchParams.get("tourPackageId");
    const tourPricingTierIndexParam = searchParams.get("tourPricingTierIndex");
    const pickupParam = searchParams.get("pickup");
    const passengersParam = searchParams.get("passengers");
    const requestsParam = searchParams.get("requests");

    if (
      !serviceParam &&
      !tourPackageIdParam &&
      !tourPricingTierIndexParam &&
      !pickupParam &&
      !passengersParam &&
      !requestsParam
    ) {
      initializedFromQueryRef.current = true;
      return;
    }

    initializedFromQueryRef.current = true;
    setForm((current) => ({
      ...current,
      service:
        serviceParam === "maine-tours" || serviceParam === "custom"
          ? serviceParam
          : current.service,
      tourPackageId:
        tourPackageIdParam || current.tourPackageId || maineTourPackages[0]?.id || "",
      tourPricingTierIndex:
        tourPricingTierIndexParam || current.tourPricingTierIndex || "0",
      pickup: pickupParam || current.pickup,
      passengers: passengersParam || current.passengers,
      requests: requestsParam || current.requests,
    }));
    setStep(1);
  }, [searchParams]);

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistanceInfo(null);
      setDistanceError("");
      setForm((current) => {
        if (current.service !== "custom") {
          return current;
        }

        return {
          ...current,
          estimatedTripMiles: "0",
          estimatedTripHours: "0",
        };
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

        if (!response.ok) {
          throw new Error("Distance API error");
        }

        const data = await response.json();
        setDistanceInfo(data);
        setForm((current) => {
          if (current.service !== "custom") {
            return current;
          }

          return {
            ...current,
            estimatedTripMiles: String(Math.round(data.distanceMiles)),
            estimatedTripHours: String(Math.round(data.durationHours * 2) / 2),
          };
        });
      } catch {
        setDistanceError(
          "Could not calculate route. Please enter addresses manually or contact us.",
        );
      } finally {
        setIsCalculatingDistance(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    if (step === 4 || !formTopRef.current) {
      return undefined;
    }

    if (window.innerWidth >= 1024) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [step]);

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
        const cleanUrl = `${window.location.pathname}${window.location.hash || "#book-now"}`;
        window.history.replaceState({}, "", cleanUrl);
      } catch (error) {
        if (isActive) {
          setSubmitError(
            error.message || "We could not confirm payment status right now.",
          );
        }
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

  useEffect(() => {
    function handleTourSelection(event) {
      const detail = event.detail ?? {};
      setForm((current) => ({
        ...current,
        service: "maine-tours",
        tourPackageId: detail.tourPackageId || maineTourPackages[0]?.id || "",
        tourPricingTierIndex: String(detail.tourPricingTierIndex ?? 0),
      }));
      setErrors({});
      setSubmitError("");
      setSubmittedBooking(null);
      setPaymentState(null);
      setStep(1);
    }

    window.addEventListener(
      "autovise:touring-package-selected",
      handleTourSelection,
    );

    return () => {
      window.removeEventListener(
        "autovise:touring-package-selected",
        handleTourSelection,
      );
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

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
    setSubmitError("");

    if (field === "pickup") {
      setPickupCoords(null);
    }

    if (field === "dropoff") {
      setDropoffCoords(null);
    }
  }

  function updateServiceType(nextService) {
    setForm((current) => ({
      ...current,
      service: nextService,
      airportRouteId:
        nextService === "airport"
          ? current.airportRouteId || airportRouteEntries[0]?.id || ""
          : current.airportRouteId,
      roundTrip: nextService === "airport" ? current.roundTrip : false,
      returnDate: nextService === "airport" ? current.returnDate : "",
      returnTime: nextService === "airport" ? current.returnTime : "",
      tourPackageId:
        nextService === "maine-tours"
          ? current.tourPackageId || maineTourPackages[0]?.id || ""
          : current.tourPackageId,
      tourPricingTierIndex:
        nextService === "maine-tours"
          ? current.tourPricingTierIndex || "0"
          : current.tourPricingTierIndex,
    }));
    clearFieldError("service");
    clearFieldError("airportRouteId");
    clearFieldError("tourPackageId");
    clearFieldError("tourPricingTierIndex");
    setStep(1);
    setSubmitError("");
  }

  function updateVehicle(vehicleSlug) {
    const nextVehicle = getVehicleBySlug(vehicleSlug, catalog) ?? vehicles[0] ?? null;

    if (!nextVehicle) {
      return;
    }

    setForm((current) => ({
      ...current,
      vehicle: vehicleSlug,
      passengers: String(
        Math.min(Number(current.passengers), nextVehicle.capacity) || 1,
      ),
    }));
    clearFieldError("vehicle");
    clearFieldError("passengers");
  }

  function resetBookingExperience() {
    setSubmittedBooking(null);
    setPaymentState(null);
    setErrors({});
    setSubmitError("");
    setStep(1);
    setForm(createInitialFormState());
    document.getElementById("book-now")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function tryAdvance(fromStep) {
    const nextErrors = {};

    if (fromStep === 1) {
      if (!form.pickup.trim()) {
        nextErrors.pickup = "Pickup location is required.";
      }

      if (!form.dropoff.trim()) {
        nextErrors.dropoff = "Drop-off location is required.";
      }

      if (!form.date) {
        nextErrors.date = "Date is required.";
      }

      if (!form.time) {
        nextErrors.time = "Time is required.";
      }

      if (form.service === "maine-tours") {
        if (!form.tourPackageId) {
          nextErrors.tourPackageId = "Tour package is required.";
        }

        if (!selectedTourPricing) {
          nextErrors.tourPricingTierIndex = "Package tier is required.";
        }
      }
    }

    if (fromStep === 3) {
      if (!form.fullName.trim()) {
        nextErrors.fullName = "Full name is required.";
      }

      if (!form.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      }

      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    if (fromStep === 1 && form.service === "maine-tours") {
      setStep(3);
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
        headers: { "Content-Type": "application/json" },
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
      setForm(createInitialFormState());
      setStep(1);
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
      ref={formTopRef}
      className="booking-panel glass-panel min-w-0 overflow-hidden rounded-[1.4rem] p-6 md:p-8"
      aria-label={heroContent.bookingEyebrow}
    >
      <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="lux-section-label">{heroContent.bookingEyebrow}</p>
          <h2 className="mt-3 font-display text-[1.6rem] leading-none text-white md:text-[2.4rem]">
            {heroContent.bookingTitle}
          </h2>
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

      {submitError && !submittedBooking ? (
        <div className="relative z-10 mt-6 rounded-[0.9rem] border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100/90">
          {submitError}
        </div>
      ) : null}

      {vehicleAvailabilityMessage && !submittedBooking && showVehicleStep ? (
        <div className="relative z-10 mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
          {vehicleAvailabilityMessage}
        </div>
      ) : null}

      {!submittedBooking ? (
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mt-6 flex flex-col gap-3"
          noValidate
          aria-label="Booking request form"
        >
          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 1 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <StepBadge active={false} done number={1} />
                  <span className="text-sm font-medium text-white">Trip Details</span>
                </div>
                <span className="max-w-[55%] truncate text-right text-xs text-white/40">
                  {[selectedService?.title, formatShortDate(form.date), formatShortTime(form.time)]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <StepBadge active done={false} number={1} />
                <span className="text-sm font-semibold text-white">Trip Details</span>
              </div>
            )}

            {step === 1 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-4 min-w-0">
                  <label className="block" htmlFor="field-service">
                    <span className="mb-2 block text-sm text-white/72">Service</span>
                    <select
                      id="field-service"
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

                  {form.service === "maine-tours" ? (
                    <>
                      <label className="block" htmlFor="field-tour-package">
                        <span className="mb-2 block text-sm text-white/72">Tour Package</span>
                        <select
                          id="field-tour-package"
                          value={form.tourPackageId}
                          onChange={(event) => {
                            updateField("tourPackageId", event.target.value);
                            updateField("tourPricingTierIndex", "0");
                          }}
                          className={fieldClassName}
                        >
                          {maineTourPackages.map((tour) => (
                            <option key={tour.id} value={tour.id} className="bg-[#101319]">
                              {tour.title}
                            </option>
                          ))}
                        </select>
                        {errors.tourPackageId ? (
                          <span className="mt-2 block text-sm text-amber-200">{errors.tourPackageId}</span>
                        ) : null}
                      </label>

                      <label className="block" htmlFor="field-tour-tier">
                        <span className="mb-2 block text-sm text-white/72">Package Tier</span>
                        <select
                          id="field-tour-tier"
                          value={form.tourPricingTierIndex}
                          onChange={(event) => updateField("tourPricingTierIndex", event.target.value)}
                          className={fieldClassName}
                        >
                          {selectedTour.pricingOptions.map((option, index) => (
                            <option key={`${selectedTour.id}-${option.title}`} value={String(index)} className="bg-[#101319]">
                              {option.title} - {option.price}
                            </option>
                          ))}
                        </select>
                        {errors.tourPricingTierIndex ? (
                          <span className="mt-2 block text-sm text-amber-200">{errors.tourPricingTierIndex}</span>
                        ) : null}
                      </label>

                      <div className="rounded-[1.2rem] border border-white/10 bg-white/3 p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--accent)]">
                          {selectedTour.eyebrow}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-white">
                          {selectedTourPricing?.title}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-[var(--accent-strong)]">
                          {selectedTourPricing?.price}
                        </p>
                        <div className="mt-3 grid gap-2">
                          {selectedTourPricing?.includes?.map((item) => (
                            <div key={item} className="flex gap-2 text-xs leading-5 text-white/68">
                              <span className="shrink-0 text-[var(--accent)]">✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  <AddressAutocompleteField
                    label="Pickup Location"
                    field="pickup"
                    value={form.pickup}
                    onChange={updateField}
                    onCoordinates={setPickupCoords}
                    error={errors.pickup}
                  />

                  <AddressAutocompleteField
                    label="Drop-off Location"
                    field="dropoff"
                    value={form.dropoff}
                    onChange={updateField}
                    onCoordinates={setDropoffCoords}
                    error={errors.dropoff}
                  />

                  <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-2">
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
                      <select
                        value={form.time}
                        onChange={(event) => updateField("time", event.target.value)}
                        className={fieldClassName}
                      >
                        <option value="" className="bg-[#101319]">
                          Select time
                        </option>
                        {timeOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#101319]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.time ? (
                        <span className="mt-2 block text-sm text-amber-200">{errors.time}</span>
                      ) : null}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-2">
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

                  {isCalculatingDistance ? (
                    <p className="text-xs text-white/40">Calculating route distance...</p>
                  ) : distanceError ? (
                    <p className="rounded-lg border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
                      {distanceError}
                    </p>
                  ) : distanceInfo && form.service === "custom" ? (
                    <p className="text-xs text-white/40">
                      Route: {distanceInfo.distanceMiles} mi - {distanceInfo.durationMinutes} min drive
                    </p>
                  ) : null}
                </div>

                <ContinueButton
                  onClick={() => tryAdvance(1)}
                  disabled={isCalculatingDistance}
                  label={
                    isCalculatingDistance
                      ? "Calculating route..."
                      : showVehicleStep
                        ? "Continue to Vehicle ->"
                        : "Continue to Contact ->"
                  }
                />
              </div>
            ) : null}
          </div>

          {showVehicleStep ? (
            <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
              step === 2 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
            }`}>
              {step > 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <StepBadge active={false} done number={2} />
                    <span className="text-sm font-medium text-white">Vehicle</span>
                  </div>
                  <span className="text-xs text-white/40">{selectedVehicle?.name ?? ""}</span>
                </button>
              ) : (
                <div className={`flex items-center gap-3 px-5 py-4 ${step < 2 ? "opacity-35" : "border-b border-white/8"}`}>
                  <StepBadge active={step === 2} done={false} number={2} />
                  <span className={`text-sm font-semibold ${step === 2 ? "text-white" : "text-white/50"}`}>Vehicle</span>
                </div>
              )}

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

                  <ContinueButton onClick={() => setStep(3)} label="Continue to Contact ->" />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 3 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            {step > 3 ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <StepBadge active={false} done number={3} />
                  <span className="text-sm font-medium text-white">Contact</span>
                </div>
                <span className="max-w-[55%] truncate text-right text-xs text-white/40">
                  {form.fullName || form.email}
                </span>
              </button>
            ) : (
              <div className={`flex items-center gap-3 px-5 py-4 ${step < 3 ? "opacity-35" : "border-b border-white/8"}`}>
                <StepBadge active={step === 3} done={false} number={3} />
                <span className={`text-sm font-semibold ${step === 3 ? "text-white" : "text-white/50"}`}>Contact</span>
              </div>
            )}

            {step === 3 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-4 min-w-0">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Full Name</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
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
                      className={fieldClassName}
                    />
                    {errors.email ? (
                      <span className="mt-2 block text-sm text-amber-200">{errors.email}</span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">
                      Special Requests <span className="text-white/36">(optional)</span>
                    </span>
                    <textarea
                      rows={3}
                      value={form.requests}
                      onChange={(event) => updateField("requests", event.target.value)}
                      className={`${fieldClassName} resize-none`}
                    />
                  </label>
                </div>

                <ContinueButton onClick={() => tryAdvance(3)} label="Review Summary ->" />
              </div>
            ) : null}
          </div>

          <div className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
            step === 4 ? "border-white/14 bg-white/4" : "border-white/8 bg-white/2"
          }`}>
            <div className={`flex items-center gap-3 px-5 py-4 ${step < 4 ? "opacity-35" : "border-b border-white/8"}`}>
              <StepBadge active={step === 4} done={false} number={4} />
              <span className={`text-sm font-semibold ${step === 4 ? "text-white" : "text-white/50"}`}>Summary</span>
            </div>

            {step === 4 ? (
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                  {[
                    { label: "Service", value: selectedService?.title },
                    ...(form.service === "maine-tours"
                      ? [
                          { label: "Tour Package", value: selectedTour?.title },
                          { label: "Package Tier", value: selectedTourPricing?.title },
                        ]
                      : [{ label: "Vehicle", value: selectedVehicle?.name }]),
                    { label: "Pickup", value: form.pickup, full: true },
                    { label: "Drop-off", value: form.dropoff, full: true },
                    { label: "Date", value: formatShortDate(form.date) },
                    { label: "Time", value: formatShortTime(form.time) },
                    { label: "Passengers", value: form.passengers },
                    { label: "Luggage", value: `${form.bags} ${Number(form.bags) === 1 ? "bag" : "bags"}` },
                    { label: "Name", value: form.fullName },
                    { label: "Phone", value: form.phone },
                    { label: "Email", value: form.email, full: true },
                    form.requests
                      ? { label: "Requests", value: form.requests, full: true }
                      : null,
                    form.service === "custom" && form.estimatedTripMiles && form.estimatedTripMiles !== "0"
                      ? { label: "Est. Distance", value: `${form.estimatedTripMiles} mi - ${form.estimatedTripHours} hr` }
                      : null,
                    form.service === "maine-tours"
                      ? { label: "Suggested Route", value: selectedTour?.route?.join(" / "), full: true }
                      : null,
                  ]
                    .filter(Boolean)
                    .map(({ label, value, full }) => (
                      <div key={label} className={`${full ? "sm:col-span-2" : ""} py-1`}>
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/36">{label}</p>
                        <p className="mt-0.5 text-sm text-white/80">{value || "-"}</p>
                      </div>
                    ))}
                </div>

                <div className="my-5 border-t border-white/8" />

                <div className="rounded-[1.2rem] border border-white/10 bg-white/3 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="lux-section-label !mb-0">Live pricing</p>
                      <h3 className="mt-2 font-display text-[1.6rem] leading-none text-white">
                        {isCalculatingDistance
                          ? "Calculating..."
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
                      Calculating route distance - pricing will appear in a moment.
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
                        ? "Route could not be calculated - Autovise will quote this manually."
                        : "Submit your trip and we will return a manual quote."}
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

                <button
                  type="submit"
                  disabled={isSubmitting || (showVehicleStep && !hasVehicles)}
                  className="lux-button mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e] shadow-[0_18px_42px_rgba(210,176,107,0.22)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isSubmitting
                    ? "Saving booking..."
                    : showVehicleStep && !hasVehicles
                      ? bookingUi.unavailableButtonLabel
                      : bookingUi.submitButtonLabel}
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
