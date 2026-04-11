"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";

import {
  calculateEstimate,
  computeStartingRates,
  defaultForm,
  fleet,
  formatCurrency,
  getDefaultCatalog,
  getVehicleBySlug,
  services,
  testimonials,
  validateBooking,
} from "@/lib/booking";

const fieldClassName =
  "frost-input w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[var(--accent)] focus:bg-white/7";
const addressSuggestionCache = new Map();

const howItWorksSteps = [
  {
    step: "Step 01",
    title: "Enter trip details",
    text: "Add pickup, destination, timing, service type, and any special notes that help us shape the ride correctly.",
  },
  {
    step: "Step 02",
    title: "See a live estimate",
    text: "Pricing updates instantly as the service, vehicle, schedule, and passenger count change.",
  },
  {
    step: "Step 03",
    title: "Send the request",
    text: "Your booking is saved through the live backend and can be reviewed from the admin dashboard.",
  },
  {
    step: "Step 04",
    title: "Ride with confidence",
    text: "The request is ready for follow-up, confirmation, and chauffeur coordination without starting from scratch.",
  },
];

const proofChips = [
  "Flight tracking",
  "Transparent pricing",
  "24/7 reservations",
  "Professional chauffeurs",
];

function ServiceCard({ service, onChoose }) {
  return (
    <article className="glass-panel fade-in soft-lift rounded-[2rem] p-7">
      <p className="lux-section-label">{service.eyebrow}</p>
      <h3 className="mt-4 font-display text-[2rem] leading-none text-white md:text-[2.25rem]">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-white/68">{service.text}</p>
      <button
        type="button"
        onClick={() => onChoose(service.id)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:gap-4 hover:text-[var(--accent-strong)]"
      >
        Reserve this service
        <span aria-hidden="true">-&gt;</span>
      </button>
    </article>
  );
}

function FleetCard({ vehicle, onChoose }) {
  const imageUrls = Array.isArray(vehicle.imageUrls) ? vehicle.imageUrls : [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const resolvedImageIndex = imageUrls[selectedImageIndex] ? selectedImageIndex : 0;
  const activeImageUrl = imageUrls[resolvedImageIndex] ?? imageUrls[0] ?? null;

  return (
    <article className="glass-panel fade-in soft-lift rounded-[2rem] p-7">
      <div
        className={`soft-grid relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${vehicle.accent} p-4`}
      >
        <div className="float-sheen absolute inset-x-12 top-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)] blur-2xl" />
        <div className="relative h-52 overflow-hidden rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
          {activeImageUrl ? (
            <>
              <img
                src={activeImageUrl}
                alt={vehicle.name}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,16,0.12),rgba(6,9,16,0.58))]" />
            </>
          ) : (
            <div className="relative h-full">
              <div className="absolute inset-x-8 bottom-10 h-11 rounded-[999px] border border-white/12 bg-black/35" />
              <div className="absolute inset-x-12 bottom-14 h-14 rounded-[999px] border border-white/14 bg-[linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
              <div className="absolute bottom-13 left-14 h-5 w-5 rounded-full border border-white/15 bg-black/70" />
              <div className="absolute bottom-13 right-14 h-5 w-5 rounded-full border border-white/15 bg-black/70" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-start justify-between gap-5">
        <div>
          <p className="lux-section-label !mb-0 text-[0.72rem]">{vehicle.mood}</p>
          <h3 className="mt-3 font-display text-[2rem] leading-none text-white">
            {vehicle.name}
          </h3>
        </div>
        <span className="rounded-full border border-[var(--line-strong)] bg-white/4 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          from {formatCurrency(vehicle.startingRate ?? 0)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/68">{vehicle.description}</p>

      {imageUrls.length > 1 ? (
        <div className="mt-5 flex gap-2">
          {imageUrls.slice(0, 5).map((imageUrl, index) => (
            <button
              key={imageUrl}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`overflow-hidden rounded-[0.95rem] border ${
                index === resolvedImageIndex
                  ? "border-[var(--accent)]"
                  : "border-white/10"
              }`}
            >
              <img
                src={imageUrl}
                alt={`${vehicle.name} preview ${index + 1}`}
                className="h-14 w-16 object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/68">
        <p>Seats: {vehicle.capacity}</p>
        <p className="mt-2">Best for: airport, corporate, and event travel</p>
      </div>

      <button
        type="button"
        onClick={() => onChoose(vehicle.slug)}
        className="lux-button mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/7"
      >
        Select vehicle
      </button>
    </article>
  );
}

function StepCard({ item }) {
  return (
    <article className="glass-panel fade-in soft-lift rounded-[2rem] p-7">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
        {item.step}
      </p>
      <h3 className="mt-5 font-display text-[2rem] leading-none text-white">
        {item.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-white/68">{item.text}</p>
    </article>
  );
}

function AddressAutocompleteField({
  label,
  field,
  placeholder,
  value,
  onChange,
  error,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const blurTimeoutRef = useRef(null);

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
    <label className="block">
      <span className="mb-2 block text-sm text-white/72">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(field, event.target.value);
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
                      setSuggestions([]);
                      setIsFocused(false);
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

export default function AnytimeAnywhereLimoWebsite({ initialCatalog }) {
  const catalog = initialCatalog ?? getDefaultCatalog();
  const vehicles = catalog.vehicles?.length ? catalog.vehicles : fleet;
  const startingRates = computeStartingRates(catalog);
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    vehicle: vehicles[0]?.slug ?? defaultForm.vehicle,
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimate = calculateEstimate(form, catalog);
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog) ?? vehicles[0];
  const passengerOptions = Array.from(
    { length: selectedVehicle.capacity },
    (_, index) => String(index + 1),
  );
  const heroStats = [
    {
      value: "24/7",
      text: "Reservation support for early departures, late arrivals, and schedule-sensitive rides.",
    },
    {
      value: "Live",
      text: "Quotes update instantly while the customer chooses the service, vehicle, and timing.",
    },
    {
      value: `${vehicles.length}`,
      text: "Vehicle tiers available for discreet executive travel or more celebratory arrivals.",
    },
    {
      value: `${services.length}`,
      text: "Core service types covering airport, corporate, and special-event transportation.",
    },
  ];

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
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    clearFieldError(field);
    setSubmitError("");
  }

  function updateVehicle(vehicleSlug) {
    const nextVehicle = getVehicleBySlug(vehicleSlug, catalog) ?? vehicles[0];

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

  function handleServicePick(serviceId) {
    updateField("service", serviceId);
    scrollToBooking();
  }

  function handleVehiclePick(vehicleSlug) {
    updateVehicle(vehicleSlug);
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
      setErrors({});
      setSubmitError("");
      setForm({
        ...defaultForm,
        vehicle: vehicles[0]?.slug ?? defaultForm.vehicle,
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
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(4,7,13,0.62)] backdrop-blur-xl">
        <div className="limo-container flex min-h-[86px] items-center justify-between gap-6">
          <a href="#top" aria-label="Anytime, Anywhere home" className="shrink-0">
            <p className="font-display text-[1.8rem] leading-none tracking-[-0.02em] text-white md:text-[2.2rem]">
              Anytime, Anywhere
            </p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.28em] text-white/54">
              Luxury Limo Service
            </p>
          </a>

          <nav className="hidden items-center gap-8 text-[0.98rem] text-white/84 lg:flex">
            <a className="nav-link" href="#how-it-works">
              How It Works
            </a>
            <a className="nav-link" href="#services">
              Services
            </a>
            <a className="nav-link" href="#fleet">
              Fleet
            </a>
            <a className="nav-link" href="#reviews">
              Reviews
            </a>
            <a className="nav-link" href="#contact">
              Contact
            </a>
          </nav>

          <a
            href="#booking"
            className="lux-button hidden min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-7 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6 md:inline-flex"
          >
            Reserve Now
          </a>
        </div>
      </header>

      <main id="top">
        <section className="px-5 pb-10 pt-8 md:pb-14 md:pt-12">
          <div className="limo-container grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch">
            <div className="fade-in py-4 md:py-10">
              <div className="lux-eyebrow">Chauffeur-level transportation</div>
              <p className="mt-6 text-[0.92rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                Executive arrivals. Event-ready entrances.
              </p>
              <h1 className="mt-7 max-w-[760px] font-display text-[3.4rem] leading-[0.94] tracking-[-0.03em] text-white sm:text-[4.6rem] xl:text-[5.8rem]">
                Luxury rides that feel calm, exact, and completely handled.
              </h1>
              <p className="mt-7 max-w-[680px] text-lg leading-8 text-white/68 md:text-xl">
                Anytime, Anywhere blends modern online booking with a classic
                chauffeur experience. Reserve airport transfers, corporate travel,
                or event transportation with a vehicle that matches the moment.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#booking"
                  className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#11151d] shadow-[0_18px_40px_rgba(210,176,107,0.24)] hover:bg-[var(--accent-dark)]"
                >
                  Get Instant Estimate
                </a>
                <a
                  href="#fleet"
                  className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                >
                  Explore Fleet
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((item) => (
                  <article
                    key={item.value}
                    className="glass-panel fade-in soft-lift rounded-[1.8rem] p-6"
                  >
                    <p className="font-display text-5xl leading-none text-white">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside
              id="booking"
              className="booking-panel glass-panel fade-in overflow-hidden rounded-[2rem] p-6 md:p-8"
              aria-label="Reserve your ride"
            >
              <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="lux-section-label">Reserve your ride</p>
                  <h2 className="mt-3 font-display text-[2.25rem] leading-none text-white md:text-[3rem]">
                    Request a booking
                  </h2>
                  <p className="mt-3 max-w-[480px] text-sm leading-7 text-white/64">
                    Estimate updates instantly as you choose the service, vehicle,
                    timing, and trip details.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-[0.76rem] uppercase tracking-[0.26em] text-[var(--accent)] shadow-[0_14px_36px_rgba(210,176,107,0.1)]">
                  Instant quote
                </div>
              </div>

              {submittedBooking ? (
                <div className="relative z-10 mt-6 rounded-[1.7rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(210,176,107,0.14),rgba(255,255,255,0.02))] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    Booking saved
                  </p>
                  <h3 className="mt-3 font-display text-[2rem] text-white">
                    Reference {submittedBooking.reference}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    We saved your request for {submittedBooking.service.toLowerCase()} in a{" "}
                    {submittedBooking.vehicle.toLowerCase()}. Follow-up can go to{" "}
                    {submittedBooking.email}.
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-white/68 sm:grid-cols-2">
                    <p>Pickup: {submittedBooking.pickup}</p>
                    <p>Drop-off: {submittedBooking.dropoff}</p>
                    <p>When: {submittedBooking.when}</p>
                    <p>
                      Estimated total: {formatCurrency(submittedBooking.estimate.total)}
                    </p>
                  </div>
                </div>
              ) : null}

              {submitError ? (
                <div className="relative z-10 mt-6 rounded-[1.4rem] border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
                  {submitError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="relative z-10 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Service</span>
                    <select
                      value={form.service}
                      onChange={(event) => updateField("service", event.target.value)}
                      className={fieldClassName}
                    >
                      {services.map((service) => (
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

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/72">Vehicle</span>
                    <select
                      value={form.vehicle}
                      onChange={(event) => updateVehicle(event.target.value)}
                      className={fieldClassName}
                    >
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.slug} value={vehicle.slug} className="bg-[#101319]">
                          {vehicle.name}
                        </option>
                      ))}
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

                  <AddressAutocompleteField
                    label="Pickup Location"
                    field="pickup"
                    value={form.pickup}
                    onChange={updateField}
                    placeholder="Airport, hotel, office, or address"
                    error={errors.pickup}
                  />

                  <AddressAutocompleteField
                    label="Drop-off Location"
                    field="dropoff"
                    value={form.dropoff}
                    onChange={updateField}
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

                <div className="glass-panel mt-5 rounded-[1.7rem] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="lux-section-label !mb-0">Live pricing</p>
                      <h3 className="mt-3 font-display text-[2rem] leading-none text-white md:text-[3rem]">
                        Estimated total {formatCurrency(estimate.total)}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/64">
                      Deposit {formatCurrency(estimate.deposit)}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-white/64 sm:grid-cols-2">
                    <p>Base rate: {formatCurrency(estimate.baseRate)}</p>
                    <p>Estimated gratuity: {formatCurrency(estimate.gratuity)}</p>
                    <p>After-hours fee: {formatCurrency(estimate.afterHoursFee)}</p>
                    <p>Weekend fee: {formatCurrency(estimate.weekendFee)}</p>
                    <p>Request adjustment: {formatCurrency(estimate.requestsFee)}</p>
                    <p>Passenger adjustment: {formatCurrency(estimate.passengerAdjustment)}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white/48">
                    Instant quote is a starting estimate based on service type,
                    vehicle, timing, and party size. Final pricing can shift for
                    distance, waiting time, tolls, or custom itinerary details.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lux-button mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#11151d] shadow-[0_18px_42px_rgba(210,176,107,0.22)] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isSubmitting ? "Saving booking..." : "Request Booking"}
                </button>
              </form>
            </aside>
          </div>
        </section>

        <section className="px-5 pb-6 pt-1">
          <div className="limo-container">
            <div className="proof-panel rounded-[1.8rem] px-6 py-5 md:px-7">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <p className="text-base leading-8 text-white/84">
                  Airport transfers, executive travel, and special-event service
                  with live quotes, saved reservations, and a booking experience
                  that feels polished from the first click.
                </p>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {proofChips.map((chip) => (
                    <div key={chip} className="proof-chip">
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-5 py-20 md:py-24">
          <div className="limo-container">
            <p className="lux-section-label">How it works</p>
            <h2 className="max-w-[780px] font-display text-[2.6rem] leading-[1.02] text-white md:text-[4.1rem]">
              A smooth booking flow from quote to curbside pickup.
            </h2>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
              Built for airport runs, executive schedules, and important nights out.
              Enter the trip, confirm the details, and let the logistics stay handled.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {howItWorksSteps.map((item) => (
                <StepCard key={item.step} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="px-5 py-20 md:py-24">
          <div className="limo-container">
            <p className="lux-section-label">Services</p>
            <h2 className="max-w-[820px] font-display text-[2.6rem] leading-[1.02] text-white md:text-[4.1rem]">
              Transportation built around timing, image, and comfort.
            </h2>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              Whether the priority is being early for a flight or making an entrance
              for a celebration, the experience is designed to feel composed from
              pickup to drop-off.
            </p>

            <div className="mt-10 grid gap-5 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onChoose={handleServicePick}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="fleet" className="px-5 py-20 md:py-24">
          <div className="limo-container">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <p className="lux-section-label">Fleet</p>
                <h2 className="max-w-[820px] font-display text-[2.6rem] leading-[1.02] text-white md:text-[4.1rem]">
                  Match the vehicle to the occasion.
                </h2>
              </div>
              <p className="text-lg leading-8 text-white/66">
                The fleet is selected to feel polished in motion and confident at the
                curb, whether the trip is discreet, executive, or more celebratory.
              </p>
            </div>

            <div className="mt-10 grid gap-5 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <FleetCard
                  key={vehicle.slug}
                  vehicle={{
                    ...vehicle,
                    startingRate: startingRates[vehicle.slug] ?? 0,
                  }}
                  onChoose={handleVehiclePick}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="px-5 py-20 md:py-24">
          <div className="limo-container">
            <div className="glass-panel rounded-[2.2rem] p-7 md:p-10">
              <p className="lux-section-label">Client notes</p>
              <h2 className="max-w-[760px] font-display text-[2.6rem] leading-[1.02] text-white md:text-[4.1rem]">
                A more composed ride changes the whole day.
              </h2>

              <div className="mt-10 grid gap-5 xl:grid-cols-3">
                {testimonials.map((item) => (
                  <article
                    key={item.name}
                    className="glass-panel soft-lift rounded-[1.8rem] p-7"
                  >
                    <p className="font-display text-5xl leading-none text-[var(--accent)]">
                      &quot;
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.quote}</p>
                    <p className="mt-6 text-base font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/42">
                      {item.role}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-5 py-20 md:py-24">
          <div className="limo-container">
            <p className="lux-section-label">Contact</p>
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="max-w-[760px] font-display text-[2.6rem] leading-[1.02] text-white md:text-[4.1rem]">
                  Reserve the next ride with confidence.
                </h2>
                <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
                  From the first quote to the final arrival, the experience is built
                  to feel clear, elevated, and easy to trust.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#booking"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#11151d] hover:bg-[var(--accent-dark)]"
                  >
                    Get Instant Estimate
                  </a>
                  <a
                    href="mailto:bookings@anytimeanywhere.com"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <article className="glass-panel soft-lift rounded-[1.8rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">Concierge line</p>
                  <a
                    href="tel:+15550000000"
                    className="mt-4 block font-display text-[1.9rem] leading-tight text-white"
                  >
                    (555) 000-0000
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.8rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">Email</p>
                  <a
                    href="mailto:bookings@anytimeanywhere.com"
                    className="mt-4 block break-all font-display text-[1.9rem] leading-tight text-white"
                  >
                    bookings@anytimeanywhere.com
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.8rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">Availability</p>
                  <p className="mt-4 font-display text-[1.9rem] leading-tight text-white">
                    24/7 by reservation for airport, corporate, and event travel.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 px-5 pb-14 pt-7">
        <div className="limo-container flex flex-col gap-3 text-sm text-white/54 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 Anytime, Anywhere. All rights reserved.</p>
          <p>
            Luxury limo service for airport, corporate, and special event transportation.
          </p>
        </div>
      </footer>

      <a
        href="tel:+15550000000"
        aria-label="Call concierge"
        className="floating-link floating-call hidden sm:inline-flex"
      >
        <span className="floating-icon">*</span>
        Call Concierge
      </a>

      <a
        href="#booking"
        aria-label="Book your ride now"
        className="floating-link floating-action"
      >
        <span className="floating-icon">{"->"}</span>
        Book Your Ride
      </a>
    </div>
  );
}

