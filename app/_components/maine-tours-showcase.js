"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMaineTourById,
  maineTourIncluded,
  maineTourPackages,
} from "@/lib/maine-tours";

const addressSuggestionCache = new Map();

function PackageButton({ tour, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tour)}
      className={`w-full rounded-[1.35rem] border px-5 py-4 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[rgba(200,168,112,0.1)] text-white"
          : "border-white/10 bg-white/[0.03] text-white hover:border-[var(--accent)]/70"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]/90">
        {tour.eyebrow}
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h3 className="font-semibold">{tour.shortTitle}</h3>
        <span className="text-sm font-bold text-[var(--accent-strong)]">
          {tour.price}
        </span>
      </div>
    </button>
  );
}

function TouringPickupAutocompleteField({ value, onChange }) {
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
    isFocused &&
    (suggestions.length > 0 || (value.trim().length >= 3 && isLoading));

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--accent-strong)]">
        Pickup Location
      </span>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
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
          autoComplete="off"
          className="w-full rounded-[1.2rem] border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-[var(--accent)]"
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
                        suggestion.selectionLabel || suggestion.displayName,
                      );
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
    </label>
  );
}

export default function MaineToursShowcase() {
  const router = useRouter();
  const [selected, setSelected] = useState(maineTourPackages[0]);
  const [activePriceIndex, setActivePriceIndex] = useState(0);
  const [showEstimate, setShowEstimate] = useState(false);
  const [customNotes, setCustomNotes] = useState("");
  const [pickup, setPickup] = useState("Portland Jetport / Hotel Pickup");
  const [guests, setGuests] = useState("2 passengers");

  const routeText = useMemo(() => selected.route.join(" / "), [selected]);
  const activePricing =
    selected.pricingOptions?.[activePriceIndex] ??
    selected.pricingOptions?.[0];

  function handleSelectTour(tour) {
    setSelected(tour);
    setActivePriceIndex(0);
    setShowEstimate(true);
  }

  function nextPrice() {
    setActivePriceIndex(
      (current) => (current + 1) % selected.pricingOptions.length,
    );
  }

  function previousPrice() {
    setActivePriceIndex(
      (current) =>
        (current - 1 + selected.pricingOptions.length) %
        selected.pricingOptions.length,
    );
  }

  function openBookingForSelectedTour() {
    const guestCountMatch = String(guests).match(/\d+/);
    const passengerCount = guestCountMatch?.[0] ?? "2";
    const params = new URLSearchParams({
      service: "maine-tours",
      tourPackageId: selected.id,
      tourPricingTierIndex: String(activePriceIndex),
      pickup,
      passengers: passengerCount,
      requests: customNotes,
    });
    router.push(`/book?${params.toString()}`);
  }

  return (
    <>
      <section id="maine-tours" className="px-4 py-14 sm:px-5 md:py-18 lg:py-22">
        <div className="limo-container">
          <div className="mb-12 text-center">
            <p className="lux-section-label">Maine Private Touring Packages</p>
            <h2 className="mx-auto mt-4 max-w-[980px] font-display text-[2rem] leading-[1.02] text-white sm:text-[2.8rem] md:text-[3.8rem]">
              Luxury Maine tours from Portland to Bar Harbor.
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              Experience Maine with a private chauffeur, premium black car service, scenic coastal stops, and a route built around comfort, safety, and peace of mind.
            </p>
          </div>

          <div className="grid items-stretch gap-8 xl:gap-10 lg:grid-cols-[.84fr_1.16fr]">
            <div className="glass-panel flex h-full flex-col rounded-[1.8rem] p-6 lg:p-7 xl:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-[var(--accent)]">
                Explore Services
              </p>
              <h3 className="mt-4 font-display text-[2rem] leading-none text-white sm:text-[2.4rem]">
                Private scenic routes built for premium clients.
              </h3>
              <p className="mt-4 text-base leading-7 text-white/62">
                These packages fit naturally into the Autovise Black Car service menu as long-distance, VIP, airport-connected, and special occasion experiences.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-[rgba(200,168,112,0.12)] bg-black/40 p-6 text-center">
                  <p className="font-display text-[3rem] leading-none text-white">24/7</p>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    Reservation support for private tours and long-distance travel.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(200,168,112,0.12)] bg-black/40 p-6 text-center">
                  <p className="font-display text-[3rem] leading-none text-white">ME</p>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    Premium coastal routes across Portland, Camden, Acadia, and Bar Harbor.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex-1 space-y-3.5">
                {maineTourPackages.map((tour) => (
                  <PackageButton
                    key={tour.id}
                    tour={tour}
                    selected={selected.id === tour.id}
                    onSelect={handleSelectTour}
                  />
                ))}
              </div>
            </div>

            <div className="glass-panel flex h-full min-h-[640px] flex-col overflow-hidden rounded-[1.8rem]">
              <div className="relative h-56 shrink-0 lg:h-60">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full bg-[var(--accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-black">
                  {selected.duration}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                    {selected.eyebrow}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold leading-tight text-white lg:text-[28px]">
                    {selected.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-5 lg:p-6 xl:p-7">
                <p className="max-w-[60ch] text-sm leading-6 text-white/66">
                  {selected.description}
                </p>

                <div className="grid flex-1 gap-4 xl:gap-5 lg:grid-cols-[1.05fr_.95fr]">
                  <div className="flex min-w-0 flex-col rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Package Pricing
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={previousPrice}
                          className="h-8 w-8 rounded-full border border-white/15 text-white transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                          aria-label="Previous pricing option"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={nextPrice}
                          className="h-8 w-8 rounded-full border border-white/15 text-white transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                          aria-label="Next pricing option"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {activePricing ? (
                      <div className="mt-3 flex flex-1 flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-bold leading-snug text-white">
                              {activePricing.title}
                            </p>
                            <p className="mt-1 text-[11px] text-white/36">
                              Tier {activePriceIndex + 1} of{" "}
                              {selected.pricingOptions.length}
                            </p>
                          </div>
                          <p className="shrink-0 whitespace-nowrap text-lg font-bold text-[var(--accent-strong)]">
                            {activePricing.price}
                          </p>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {activePricing.includes.slice(0, 5).map((item) => (
                            <div
                              key={item}
                              className="flex min-w-0 gap-2 text-xs leading-5 text-white/68"
                            >
                              <span className="shrink-0 text-[var(--accent)]">✓</span>
                              <span className="min-w-0 break-words">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                      {selected.pricingOptions.map((option, index) => (
                        <button
                          key={option.title}
                          type="button"
                          onClick={() => setActivePriceIndex(index)}
                          className={`h-2 flex-1 rounded-full transition ${
                            index === activePriceIndex
                              ? "bg-[var(--accent)]"
                              : "bg-white/15 hover:bg-white/30"
                          }`}
                          aria-label={`View ${option.title}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="rounded-[1.5rem] border border-[rgba(200,168,112,0.25)] bg-[rgba(200,168,112,0.08)] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Suggested Route
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">
                        {routeText}
                      </p>
                    </div>

                    <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                          Scenic Stops
                        </h4>
                        <div className="grid gap-1.5">
                          {selected.highlights.slice(0, 5).map((item) => (
                            <div
                              key={item}
                              className="flex min-w-0 gap-2 text-xs leading-5 text-white/68"
                            >
                              <span className="shrink-0 text-[var(--accent)]">✦</span>
                              <span className="min-w-0 break-words">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                          Package Includes
                        </h4>
                        <div className="grid gap-1.5">
                          {maineTourIncluded.slice(0, 4).map((item) => (
                            <div
                              key={item}
                              className="flex min-w-0 gap-2 text-xs leading-5 text-white/68"
                            >
                              <span className="shrink-0 text-[var(--accent)]">✓</span>
                              <span className="min-w-0 break-words">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-white/40">Private tour package</p>
                    <p className="text-lg font-bold text-[var(--accent-strong)]">
                      {selected.price}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                    <button
                      type="button"
                      onClick={openBookingForSelectedTour}
                      className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-center text-sm font-bold text-black transition hover:bg-[var(--accent-dark)]"
                    >
                      Book Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEstimate(true);
                      }}
                      className="rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                    >
                      Customize Route
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showEstimate ? (
        <section className="px-4 pb-20 sm:px-5">
          <div className="limo-container">
            <div className="glass-panel rounded-[1.8rem] border border-[rgba(200,168,112,0.3)] p-6 shadow-2xl lg:p-8">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
                    Interactive Estimate Preview
                  </p>
                  <h3 className="mt-3 font-display text-[2.1rem] leading-none text-white">
                    Build Your Private Tour Request
                  </h3>
                  <p className="mt-3 max-w-3xl text-white/62">
                    This shows how clients can choose a package, adjust pickup details, add custom route notes, then move into the booking flow with the selected package already loaded.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEstimate(false)}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Close Preview
                </button>
              </div>

              <div className="mt-8 grid gap-6 xl:gap-8 lg:grid-cols-[.9fr_1.1fr]">
                <div className="space-y-4 lg:space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--accent-strong)]">
                      Selected Package
                    </span>
                    <select
                      value={selected.id}
                      onChange={(event) => {
                        setSelected(getMaineTourById(event.target.value));
                        setActivePriceIndex(0);
                      }}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-[var(--accent)]"
                    >
                      {maineTourPackages.map((tour) => (
                        <option key={tour.id} value={tour.id}>
                          {tour.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <TouringPickupAutocompleteField
                    value={pickup}
                    onChange={setPickup}
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--accent-strong)]">
                      Guests
                    </span>
                    <select
                      value={guests}
                      onChange={(event) => setGuests(event.target.value)}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-[var(--accent)]"
                    >
                      <option>1 passenger</option>
                      <option>2 passengers</option>
                      <option>3 passengers</option>
                      <option>4 passengers</option>
                      <option>5+ passengers</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--accent-strong)]">
                      Custom Route Notes
                    </span>
                    <textarea
                      value={customNotes}
                      onChange={(event) => setCustomNotes(event.target.value)}
                      rows={5}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-black px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
                    />
                  </label>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
                    Client Request Summary
                  </p>
                  <h4 className="mt-4 text-2xl font-bold text-white">
                    {selected.title}
                  </h4>
                  <p className="mt-2 text-[var(--accent-strong)]">
                    {selected.price}
                  </p>
                  <div className="mt-6 space-y-4 text-white/70">
                    <p>
                      <span className="font-bold text-white">Duration:</span>{" "}
                      {selected.duration}
                    </p>
                    <p>
                      <span className="font-bold text-white">Route:</span>{" "}
                      {routeText}
                    </p>
                    <p>
                      <span className="font-bold text-white">Pickup:</span>{" "}
                      {pickup}
                    </p>
                    <p>
                      <span className="font-bold text-white">Guests:</span>{" "}
                      {guests}
                    </p>
                    <p>
                      <span className="font-bold text-white">Notes:</span>{" "}
                      {customNotes || "None provided."}
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={openBookingForSelectedTour}
                      className="rounded-full bg-[var(--accent)] px-6 py-3 text-center font-bold text-black hover:bg-[var(--accent-dark)]"
                    >
                      Continue to Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-white/10 bg-zinc-950/80 px-4 sm:px-5">
        <div className="limo-container py-16">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.32em] text-[var(--accent)]">
              Premium Add-Ons
            </p>
            <h2 className="mt-4 font-display text-[2rem] leading-[1.05] text-white sm:text-[2.8rem]">
              Designed to feel like a luxury experience, not a regular ride.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maineTourIncluded.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-black p-6">
                <p className="mb-4 text-2xl text-[var(--accent)]">✦</p>
                <p className="font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-5">
        <div className="limo-container">
          <div className="rounded-[1.8rem] border border-[rgba(200,168,112,0.3)] bg-gradient-to-r from-[rgba(200,168,112,0.15)] to-white/[0.03] p-8 text-center lg:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.32em] text-[var(--accent)]">
              Autovise Black Car
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl font-display text-[2rem] leading-[1.05] text-white sm:text-[2.8rem] lg:text-[3.5rem]">
              Make Maine travel smooth, private, and unforgettable.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/66">
              Perfect for airport arrivals, hotel guests, corporate travelers, couples, weddings, VIP clients, and visitors who want to see Maine without renting a car.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={openBookingForSelectedTour}
                className="rounded-full bg-[var(--accent)] px-8 py-4 font-bold text-black transition hover:bg-[var(--accent-dark)]"
              >
                Book Now
              </button>
              <a
                href="mailto:booking@autoviseblackcar.com"
                className="rounded-full border border-white/20 px-8 py-4 font-bold text-white transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                booking@autoviseblackcar.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
