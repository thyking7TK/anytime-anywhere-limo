"use client";

import Image from "next/image";
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
  services as marketingServices,
  testimonials,
  validateBooking,
} from "@/lib/booking";
import { getDefaultSiteContent } from "@/lib/site-content-shared";

const fieldClassName =
  "frost-input w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[var(--accent)] focus:bg-white/7";
const addressSuggestionCache = new Map();

const proofChips = [
  "Flight tracking",
  "Transparent pricing",
  "24/7 reservations",
  "Professional chauffeurs",
];
const coverageAreas = [
  {
    name: "Maine",
    detail:
      "Primary operations for airport transfers, executive travel, and long-distance private transportation.",
  },
  {
    name: "Massachusetts",
    detail:
      "Strong Boston-area coverage including Logan transfers, corporate bookings, and private black car service.",
  },
  {
    name: "New York",
    detail:
      "Executive travel, airport service, and long-distance transportation throughout New York by request.",
  },
];


const faqItems = [
  {
    q: "Do you track my flight?",
    a: "Yes. Flight tracking is part of the airport transfer experience, including pickups for Boston Logan, JFK, LaGuardia, and other major airports.",
  },
  {
    q: "What types of transportation do you offer?",
    a: "Autovise Black Car handles nationwide airport transfers, executive and corporate travel, long-distance private rides, event and VIP transportation, and hourly chauffeur service.",
  },
  {
    q: "Where are your primary operations?",
    a: "Autovise is based on the East Coast with primary operations across Maine, Massachusetts, and New York.",
  },
  {
    q: "Do you provide nationwide service?",
    a: "Yes. While the company is East Coast based, transportation services can be coordinated and provided nationwide by request.",
  },
  {
    q: "How is pricing handled?",
    a: "Quotes are provided before the ride begins. Airport, executive, long-distance, and VIP transportation are all confirmed with clear pricing and service details.",
  },
  {
    q: "Can I book long-distance private travel across state lines?",
    a: "Yes. Long-distance private transportation is one of the core services, with comfortable door-to-door rides across state lines and custom itinerary support.",
  },
  {
    q: "Are you available for weddings and private events?",
    a: "Yes. Event and VIP transportation is available for weddings, private events, and high-end clientele who want a polished arrival and departure.",
  },
  {
    q: "How do I book?",
    a: "Use the booking form on the site for a request, or call concierge directly at +1 (207) 880-3733 for immediate help.",
  },
];

const primarySectionIds = ["services", "coverage", "rates", "fleet", "reviews", "faq", "contact"];


const marketingToBookingService = {
  airport: "airport",
  corporate: "hourly",
  events: "hourly",
  hourly: "hourly",
  longdistance: "custom",
};

function mapMarketingServiceToBookingService(serviceId) {
  return marketingToBookingService[serviceId] ?? "custom";
}

function formatQuoteModeLabel(estimate) {
  return estimate?.quoteMode === "request" ? "Request quote" : "Instant estimate";
}

function MobileNav({ navItems, activeNavSection, onNavClick, brandContent }) {
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex lg:hidden flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-full border border-white/10 bg-white/4 backdrop-blur-sm"
      >
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 flex flex-col lg:hidden border-l border-white/8 bg-[rgba(6,7,12,0.97)] backdrop-blur-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <div>
            <p className="font-display text-[1.3rem] leading-none text-white">
              {brandContent.name}
            </p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--accent)]">
              {brandContent.subtitle}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/4 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-5">
          {navItems.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => { onNavClick(id); close(); }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${activeNavSection === id ? "bg-white/6 text-white border border-white/10" : "text-white/70 hover:bg-white/4 hover:text-white"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeNavSection === id ? "bg-[var(--accent)]" : "bg-white/20"}`} />
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/8 p-5">
          <a
            href="#booking"
            onClick={close}
            className="lux-button flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e]"
          >
            Reserve Now
          </a>
        </div>
      </div>
    </>
  );
}

function ServiceCard({ service, onChoose }) {
  return (
    <article className="glass-panel fade-in soft-lift rounded-[1.4rem] p-7">
      <p className="lux-section-label">{service.eyebrow}</p>
      <h3 className="mt-4 font-display text-[2rem] leading-none text-white md:text-[2.25rem]">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-white/68">{service.text}</p>
      <button
        type="button"
        onClick={() => onChoose(service.id)}
        aria-label={`Reserve ${service.title}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:gap-4 hover:text-[var(--accent-strong)]"
      >
        Reserve this service
        <span aria-hidden="true">→</span>
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
    <article className="glass-panel fade-in soft-lift rounded-[1.4rem] overflow-hidden">
      {/* Horizontal layout: image left, details right */}
      <div className="flex flex-col md:flex-row md:items-stretch">

        {/* Image panel */}
        <div className={`soft-grid relative md:w-1/2 bg-gradient-to-br ${vehicle.accent}`}>
          <div className="float-sheen absolute inset-x-12 top-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)] blur-2xl pointer-events-none" />
          <div className="relative h-56 md:h-full min-h-[260px] border-b border-white/8 md:border-b-0 md:border-r md:border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]">
            {activeImageUrl ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(5,8,13,0.86))]" />
                <Image
                  src={activeImageUrl}
                  alt={vehicle.name}
                  fill
                  className="relative z-[1] object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,16,0.04),rgba(6,9,16,0.44))]" />
              </>
            ) : (
              <div className="relative h-full flex flex-col items-center justify-center gap-4 p-8">
                <svg viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px] opacity-30">
                  <path d="M28 70 C28 70 42 40 70 34 L110 28 L170 28 L210 34 C238 40 252 70 252 70 L260 70 L260 78 L20 78 L20 70 Z" fill="rgba(200,168,112,0.4)" stroke="rgba(200,168,112,0.5)" strokeWidth="1"/>
                  <circle cx="70" cy="78" r="14" stroke="rgba(200,168,112,0.5)" strokeWidth="1.5" fill="rgba(0,0,0,0.6)"/>
                  <circle cx="210" cy="78" r="14" stroke="rgba(200,168,112,0.5)" strokeWidth="1.5" fill="rgba(0,0,0,0.6)"/>
                  <circle cx="70" cy="78" r="5" fill="rgba(200,168,112,0.5)"/>
                  <circle cx="210" cy="78" r="5" fill="rgba(200,168,112,0.5)"/>
                  <path d="M76 34 L105 28 L175 28 L204 34 L186 56 L94 56 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </svg>
                <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/30">{vehicle.name}</p>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 p-3 border-t border-white/8 md:border-t-0 md:absolute md:bottom-3 md:left-3">
              {imageUrls.slice(0, 5).map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-[0.7rem] border ${index === resolvedImageIndex ? "border-[var(--accent)]" : "border-white/10"}`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${vehicle.name} preview ${index + 1}`}
                    width={56}
                    height={44}
                    className="bg-black/30 object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="flex flex-col justify-between gap-6 p-7 md:w-1/2 md:p-10">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="lux-section-label !mb-0 text-[0.7rem]">{vehicle.mood}</p>
                <h3 className="mt-3 font-display text-[2rem] leading-none text-white md:text-[2.6rem]">
                  {vehicle.name}
                </h3>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--line-strong)] bg-white/4 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                from {formatCurrency(vehicle.startingRate ?? 0)}
              </span>
            </div>

            <p className="mt-5 text-base leading-8 text-white/68">{vehicle.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/8 pt-6 text-sm">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--accent)]">Capacity</p>
                <p className="mt-1 font-semibold text-white">{vehicle.capacity} passengers</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--accent)]">Best for</p>
                <p className="mt-1 text-white/70">{vehicle.bestFor || "airport, corporate, and event travel"}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChoose(vehicle.slug)}
            aria-label={`Select ${vehicle.name}`}
            className="lux-button inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] shadow-[0_14px_36px_rgba(200,168,112,0.18)] hover:bg-[var(--accent-dark)] md:w-auto md:self-start"
          >
            Reserve This Vehicle →
          </button>
        </div>
      </div>
    </article>
  );
}

function StepCard({ item }) {
  return (
    <article className="glass-panel fade-in soft-lift rounded-[1.4rem] p-7">
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

function HeroStatCard({ item }) {
  return (
    <article className="glass-panel fade-in soft-lift relative flex min-h-[210px] flex-col overflow-hidden rounded-[1.2rem] p-5 md:min-h-[230px] md:p-6 lg:min-h-[250px]">
      <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[rgba(200,168,112,0.4)] rounded-tr-[1.2rem]" />
      <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[rgba(200,168,112,0.2)] rounded-bl-[1.2rem]" />
      <p className="max-w-full font-display text-[2.35rem] leading-[0.92] text-white sm:text-[2.8rem] md:text-[3.4rem]">
        {item.value}
      </p>
      <p className="mt-4 max-w-[30ch] text-sm leading-7 text-white/66 md:text-[1rem]">
        {item.text}
      </p>
    </article>
  );
}

function FaqAccordionItem({ item, isOpen, onToggle }) {
  return (
    <article className="glass-panel overflow-hidden rounded-[1.3rem]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
      >
        <div className="flex items-start gap-4">
          <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-[var(--accent)]">
            <span className="flex flex-col gap-[3px]">
              <span className="h-px w-3 bg-current" />
              <span className="h-px w-3 bg-current" />
              <span className="h-px w-3 bg-current" />
            </span>
          </span>
          <span className="text-sm font-semibold leading-7 text-white sm:text-base">
            {item.q}
          </span>
        </div>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/64 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/8 px-5 pb-5 pt-4 text-sm leading-7 text-white/62 sm:px-6">
            {item.a}
          </div>
        </div>
      </div>
    </article>
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
            onCoordinates?.(null);
            void loadSuggestions(event.target.value);
          }}
          onFocus={() => {
            cleanupBlurTimeout();
            setIsFocused(true);
            void loadSuggestions(value);
          }}
          onBlur={() => {
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
  const serviceEntries = Array.isArray(siteContent.services)
    ? siteContent.services
    : marketingServices;
  const bookingServiceEntries = Array.isArray(catalog.bookingServices)
    ? catalog.bookingServices
    : bookingServices;
  const airportRouteEntries = Array.isArray(catalog.airportRoutes)
    ? catalog.airportRoutes.filter((route) => route.active !== false)
    : [];
  const testimonialEntries = Array.isArray(siteContent.testimonials)
    ? siteContent.testimonials
    : testimonials;
  const heroStats = Array.isArray(siteContent.heroStats)
    ? siteContent.heroStats
    : [];
  const proofContent = siteContent.proof ?? {};
  const heroContent = siteContent.hero ?? {};
  const brandContent = siteContent.brand ?? {};
  const navigationContent = siteContent.navigation ?? {};
  const servicesSection = siteContent.servicesSection ?? {};
  const fleetSection = siteContent.fleetSection ?? {};
  const reviewsSection = siteContent.reviewsSection ?? {};
  const contactSection = siteContent.contactSection ?? {};
  const footerContent = siteContent.footer ?? {};
  const floatingActions = siteContent.floatingActions ?? {};
  const bookingUi = siteContent.bookingUi ?? {};
  const visibleProofChips = Array.isArray(proofContent.chips)
    ? proofContent.chips.filter((chip) => String(chip ?? "").trim())
    : proofChips;
  const hasVehicles = vehicles.length > 0;
  const vehicleAvailabilityMessage = hasVehicles
    ? ""
    : bookingUi.unavailableMessage;
  const resolvedContactPhone = String(contactSection.phoneValue ?? "").trim() || "+1 (207) 880-3733";
  const resolvedContactEmail =
    String(contactSection.emailValue ?? "").trim().toLowerCase() === "book@autovise.com" ||
    !String(contactSection.emailValue ?? "").trim()
      ? "booking@autoviseblackcar.com"
      : String(contactSection.emailValue ?? "").trim();
  const contactPhoneHref = `tel:${resolvedContactPhone.replace(/[^+\d]/g, "")}`;
  const contactEmailHref = `mailto:${resolvedContactEmail}`;
  const startingRates = computeStartingRates(catalog);
  const hasAirportRoutes = airportRouteEntries.length > 0;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showQuoteAssistant, setShowQuoteAssistant] = useState(false);
  const [quoteCopied, setQuoteCopied] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistanceInfo(null);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingDistance(true);
      try {
        const params = new URLSearchParams({
          pickupLat: pickupCoords.lat,
          pickupLon: pickupCoords.lon,
          dropoffLat: dropoffCoords.lat,
          dropoffLon: dropoffCoords.lon,
        });
        const response = await fetch(`/api/distance?${params}`);
        if (!response.ok) return;
        const data = await response.json();
        setDistanceInfo(data);
        setForm((current) => {
          if (current.service !== "custom") return current;
          const autoMiles = String(Math.round(data.distanceMiles));
          const autoHours = String(Math.round(data.durationHours * 2) / 2);
          const milesUnchanged = !current.estimatedTripMiles || current.estimatedTripMiles === "0";
          const hoursUnchanged = !current.estimatedTripHours || current.estimatedTripHours === "0";
          return {
            ...current,
            estimatedTripMiles: milesUnchanged ? autoMiles : current.estimatedTripMiles,
            estimatedTripHours: hoursUnchanged ? autoHours : current.estimatedTripHours,
          };
        });
      } catch {
        // silent — distance is a UI helper, not critical
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
  const [activeNavSection, setActiveNavSection] = useState("");
  const navItems = [
    ["services", navigationContent.services],
    ["coverage", "Coverage"],
    ["rates", "Rates"],
    ["fleet", navigationContent.fleet],
    ["reviews", navigationContent.reviews],
    ["faq", "FAQ"],
    ["contact", navigationContent.contact],
  ];

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
  const quoteSummary = [
    "Hello Autovise Black Car,",
    "",
    "I'd like a quote for this trip:",
    `Service: ${selectedService?.title ?? "Not selected"}`,
    `Pickup: ${form.pickup || "Not provided"}`,
    `Drop-off: ${form.dropoff || "Not provided"}`,
    `Date: ${form.date || "Not provided"}`,
    `Time: ${form.time || "Not provided"}`,
    `Passengers: ${form.passengers || "Not provided"}`,
    `Bags: ${form.bags || "0"}`,
    `Vehicle: ${selectedVehicle?.name ?? "To be confirmed"}`,
    form.service === "airport"
      ? `Airport route: ${selectedAirportRoute?.label ?? "Not selected"}`
      : "",
    form.service === "hourly"
      ? `Requested hours: ${form.requestedHours || "Not provided"}`
      : "",
    form.service === "custom"
      ? `Estimated hours: ${form.estimatedTripHours || "Not provided"}`
      : "",
    form.service === "custom"
      ? `Estimated miles: ${form.estimatedTripMiles || "Not provided"}`
      : "",
    `Quote mode: ${formatQuoteModeLabel(estimate)}`,
    `Estimated total: ${quoteDisplayAmount}`,
    "",
    `Name: ${form.fullName || "Not provided"}`,
    `Phone: ${form.phone || "Not provided"}`,
    `Email: ${form.email || "Not provided"}`,
    "",
    "Please follow up with the best quote and availability.",
  ].join("\n");
  const quickQuoteEmailHref = `${contactEmailHref}?subject=${encodeURIComponent("Trip Quote Request")}&body=${encodeURIComponent(quoteSummary)}`;
  const quickQuoteSmsHref = `sms:${resolvedContactPhone.replace(/[^+\d]/g, "")}?body=${encodeURIComponent(quoteSummary)}`;

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

  async function copyQuoteSummary() {
    try {
      await navigator.clipboard.writeText(quoteSummary);
      setQuoteCopied(true);
      window.setTimeout(() => setQuoteCopied(false), 1800);
    } catch {
      setQuoteCopied(false);
    }
  }

  useEffect(() => {
    const sections = primarySectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveNavSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-24% 0px -52% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

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

  function handleServicePick(serviceId) {
    updateServiceType(mapMarketingServiceToBookingService(serviceId));
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
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <header className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(5,6,10,0.72)] backdrop-blur-xl">
        <div className="limo-container flex min-h-[64px] items-center justify-between gap-4 md:min-h-[80px] md:gap-6">
          <a href="#top" aria-label={`${brandContent.name || "Anytime, Anywhere"} home`} className="shrink-0">
            <p className="font-display text-[1.3rem] leading-none tracking-[-0.02em] text-white md:text-[1.8rem]">
              {brandContent.name}
            </p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.28em] text-white/54">
              {brandContent.subtitle}
            </p>
          </a>

          <nav className="hidden items-center gap-3 text-[0.98rem] text-white/84 lg:flex">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                className={`nav-link ${activeNavSection === id ? "is-active" : ""}`}
                href={`#${id}`}
                onClick={() => setActiveNavSection(id)}
                aria-current={activeNavSection === id ? "page" : undefined}
              >
                <span>{label}</span>
              </a>
            ))}
          </nav>

          <a
            href="#booking"
            className="lux-button hidden min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-7 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6 md:inline-flex"
          >
            {navigationContent.reserve}
          </a>

          <MobileNav
            navItems={navItems}
            activeNavSection={activeNavSection}
            onNavClick={setActiveNavSection}
            brandContent={brandContent}
          />
        </div>
      </header>

      <main id="top">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
            <div className="absolute inset-0 opacity-[0.028]" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)"}} />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,168,112,0.3)] to-transparent" />
            <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
            <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.04),transparent_65%)]" />
          </div>

        <section className="relative z-10 px-4 pb-8 pt-6 sm:px-5 md:pb-12 md:pt-10">
          <div className="limo-container grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch">
            <div className="fade-in py-4 md:py-10">
              <div className="lux-eyebrow">{heroContent.eyebrow}</div>
              <p className="mt-6 text-[0.92rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                {heroContent.kicker}
              </p>
              <h1 className="mt-7 max-w-[820px] font-display text-[2rem] leading-[1] tracking-[-0.03em] text-white sm:text-[3rem] lg:text-[4.6rem] xl:text-[6rem]">
                {heroContent.title}
              </h1>
              <p className="mt-7 max-w-[680px] text-lg leading-8 text-white/68 md:text-xl">
                {heroContent.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#booking"
                  className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] shadow-[0_18px_40px_rgba(210,176,107,0.24)] hover:bg-[var(--accent-dark)]"
                >
                  {heroContent.primaryButtonLabel}
                </a>
                <a
                  href="#fleet"
                  className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                >
                  {heroContent.secondaryButtonLabel}
                </a>
              </div>

              <div className="mt-8 grid max-w-[920px] grid-cols-1 gap-4 sm:grid-cols-2">
                {heroStats.map((item, index) => (
                  <HeroStatCard key={`${item.value}-${index}`} item={item} />
                ))}
              </div>
            </div>

            <aside
              id="booking"
              className="booking-panel glass-panel fade-in overflow-hidden rounded-[1.4rem] p-6 md:p-8"
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
                <div className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-[0.76rem] uppercase tracking-[0.26em] text-[var(--accent)] shadow-[0_14px_36px_rgba(210,176,107,0.1)]">
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
                <div className="grid gap-4 md:grid-cols-2">
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

                  {(isCalculatingDistance || distanceInfo) && (
                    <div className="md:col-span-2 flex items-center gap-3 rounded-[1.1rem] border border-white/8 bg-white/3 px-4 py-3">
                      {isCalculatingDistance ? (
                        <p className="text-xs text-white/40 animate-pulse">Calculating route...</p>
                      ) : distanceInfo ? (
                        <>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                          <p className="text-sm text-white/70">
                            <span className="font-semibold text-white">{distanceInfo.distanceMiles} miles</span>
                            <span className="mx-2 text-white/24">/</span>
                            <span className="font-semibold text-white">~{distanceInfo.durationMinutes} min</span>
                            <span className="ml-2 text-white/40">estimated drive</span>
                          </p>
                        </>
                      ) : null}
                    </div>
                  )}

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
                        <span className="mb-2 block text-sm text-white/72">Estimated Trip Hours</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={form.estimatedTripHours}
                          onChange={(event) => updateField("estimatedTripHours", event.target.value)}
                          className={fieldClassName}
                        />
                        {errors.estimatedTripHours ? (
                          <span className="mt-2 block text-sm text-amber-200">
                            {errors.estimatedTripHours}
                          </span>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/72">Estimated Trip Miles</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.estimatedTripMiles}
                          onChange={(event) => updateField("estimatedTripMiles", event.target.value)}
                          className={fieldClassName}
                        />
                        {errors.estimatedTripMiles ? (
                          <span className="mt-2 block text-sm text-amber-200">
                            {errors.estimatedTripMiles}
                          </span>
                        ) : null}
                      </label>

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
          </div>
        </section>

        <section className="relative z-10 px-5 pb-5 pt-1">
          <div className="limo-container">
            <div className="proof-panel rounded-[1.2rem] px-6 py-5 md:px-7">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <p className="text-base leading-8 text-white/84">
                  {proofContent.text}
                </p>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {visibleProofChips.map((chip) => (
                    <div key={chip} className="proof-chip">
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>

        <section id="coverage" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">Our Coverage</p>
            <h2 className="max-w-[820px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Nationwide service with primary operations across the East Coast.
            </h2>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              We proudly provide transportation services across the United States, with primary operations in Maine, Massachusetts, and New York.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {coverageAreas.map((area) => (
                <article key={area.name} className="glass-panel soft-lift rounded-[1.4rem] p-7">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">Primary Operations</p>
                  <h3 className="mt-4 font-display text-[1.9rem] leading-tight text-white">{area.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/64">{area.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-[1.2rem] border border-[var(--line-strong)] bg-white/3 px-5 py-4 text-sm text-white/68">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span>Nationwide service available by request.</span>
            </div>
          </div>
        </section>

        <section id="rates" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">Pricing</p>
            <h2 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Clear pricing, confirmed before the ride begins.
            </h2>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
              Airport transfers, executive bookings, long-distance travel, and VIP transportation are quoted clearly so clients know what to expect before the trip is confirmed.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <article className="glass-panel soft-lift rounded-[1.4rem] p-7 md:col-span-1">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Airport Transfers</p>
                <h3 className="mt-4 font-display text-[1.8rem] leading-tight text-white">Major Airports</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex items-center justify-between">
                    <span>Boston Logan (BOS)</span>
                    <span className="font-semibold text-white">Flat-rate quote</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>JFK & LaGuardia</span>
                    <span className="font-semibold text-white">Coordinated pickup</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3">
                    <span>Nationwide airports</span>
                    <span className="font-semibold text-white">By request</span>
                  </div>
                </div>
              </article>

              <article className="glass-panel soft-lift rounded-[1.4rem] p-7 md:col-span-1">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Executive & Hourly</p>
                <h3 className="mt-4 font-display text-[1.8rem] leading-tight text-white">On Your Schedule</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex items-center justify-between">
                    <span>Corporate travel</span>
                    <span className="font-semibold text-white">Quoted upfront</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hourly chauffeur</span>
                    <span className="font-semibold text-white">$110/hr starting</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3">
                    <span>Dedicated support</span>
                    <span className="font-semibold text-white">Multi-stop ready</span>
                  </div>
                </div>
              </article>

              <article className="glass-panel soft-lift rounded-[1.4rem] p-7 md:col-span-1">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Long-Distance & VIP</p>
                <h3 className="mt-4 font-display text-[1.8rem] leading-tight text-white">Custom Itineraries</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex items-center justify-between">
                    <span>State-line travel</span>
                    <span className="font-semibold text-white">Door to door</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Events & VIP rides</span>
                    <span className="font-semibold text-white">Custom quote</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3">
                    <span>Stops & wait time</span>
                    <span className="font-semibold text-white">Confirmed upfront</span>
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-6 text-sm text-white/38">
              Final pricing is confirmed before dispatch. Long-distance and nationwide trips are quoted based on route, timing, stop count, service window, tolls, and itinerary complexity.
            </p>
          </div>
        </section>

        <section id="services" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">{servicesSection.label}</p>
            <h2 className="max-w-[820px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              {servicesSection.title}
            </h2>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              {servicesSection.description}
            </p>

            <div className="mt-10 grid gap-5 xl:grid-cols-3">
              {serviceEntries.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onChoose={handleServicePick}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="fleet" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <p className="lux-section-label">{fleetSection.label}</p>
                <h2 className="max-w-[820px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                  {fleetSection.title}
                </h2>
              </div>
              <p className="text-lg leading-8 text-white/66">
                {fleetSection.description}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-5">
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

            {!hasVehicles ? (
              <p className="mt-8 text-sm leading-7 text-white/56">
                {bookingUi.unavailableFleetMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section id="reviews" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <div className="glass-panel rounded-[1.4rem] p-7 md:p-10">
              <p className="lux-section-label">{reviewsSection.label}</p>
              <h2 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                {reviewsSection.title}
              </h2>

              <div className="mt-10 grid gap-5 xl:grid-cols-3">
                {testimonialEntries.map((item, index) => (
                  <article
                    key={`${item.name}-${index}`}
                    className="glass-panel soft-lift rounded-[1.4rem] p-7"
                  >
                    <div className="flex items-center gap-0.5 mb-4">
                      {[1,2,3,4,5].map((star) => (
                        <svg key={star} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 1L8.63 4.94L13 5.27L9.77 8.03L10.85 12.27L7 9.9L3.15 12.27L4.23 8.03L1 5.27L5.37 4.94L7 1Z" fill="var(--accent)" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-white/70">{item.quote}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border border-[var(--line-strong)] bg-white/6 flex items-center justify-center text-xs font-semibold text-[var(--accent)]">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">FAQ</p>
            <h2 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Common questions answered.
            </h2>

            <div className="mt-10 space-y-4">
              {faqItems.map((item, index) => (
                <FaqAccordionItem
                  key={item.q}
                  item={item}
                  isOpen={openFaqIndex === index}
                  onToggle={() =>
                    setOpenFaqIndex((current) => (current === index ? -1 : index))
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">{contactSection.label}</p>
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                  {contactSection.title}
                </h2>
                <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
                  {contactSection.description}
                </p>

                <p className="mt-6 text-sm text-white/40">
                  Free cancellation up to 24 hours before pickup. Wait time billed at $40/hr. Extra stops $25–$50.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#booking"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)]"
                  >
                    {contactSection.primaryButtonLabel}
                  </a>
                  <a
                    href={contactEmailHref}
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                  >
                    {contactSection.secondaryButtonLabel}
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.phoneLabel}</p>
                  <a
                    href={contactPhoneHref}
                    className="mt-4 block font-display text-[1.9rem] leading-tight text-white"
                  >
                    {resolvedContactPhone}
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.emailLabel}</p>
                  <a
                    href={contactEmailHref}
                    className="mt-4 block break-all font-display text-[1.9rem] leading-tight text-white"
                  >
                    {resolvedContactEmail}
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.availabilityLabel}</p>
                  <p className="mt-4 font-display text-[1.9rem] leading-tight text-white">
                    {contactSection.availabilityValue}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(200,168,112,0.12)] px-5 pb-16 pt-10">
        <div className="limo-container">
          <div className="mb-8 flex flex-col gap-2">
            <p className="font-display text-[1.6rem] leading-none tracking-[-0.02em] text-white/90">
              {brandContent.name}
            </p>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--accent)]">
              {brandContent.subtitle}
            </p>
          </div>
          <div className="border-t border-white/6 pt-7 flex flex-col gap-3 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
            <p>{footerContent.legal}</p>
            <p>{footerContent.description}</p>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(200,168,112,0.22)] bg-[rgba(10,10,14,0.88)] text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)] hover:text-white sm:bottom-8 sm:left-5 sm:h-11 sm:w-11 ${showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {showQuoteAssistant ? (
        <button
          type="button"
          aria-label="Close quote assistant"
          onClick={() => setShowQuoteAssistant(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
        />
      ) : null}

      <div
        className={`fixed bottom-24 right-4 z-50 w-[min(calc(100vw-1.5rem),24rem)] transition-all duration-300 sm:right-5 sm:w-[24rem] ${showQuoteAssistant ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
      >
        <div className="glass-panel overflow-hidden rounded-[1.4rem] border border-[rgba(200,168,112,0.2)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div>
              <p className="lux-section-label !mb-0 text-[0.65rem]">Quick quote</p>
              <h3 className="mt-2 font-display text-[1.7rem] leading-none text-white">
                Trip Conversation
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQuoteAssistant(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/64 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
            <div className="rounded-[1.1rem] border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-white/70">
              Tell us the trip details below and we’ll prepare a quote request you can send directly to concierge.
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                What kind of trip do you need?
              </span>
              <select
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

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                Where should we pick you up?
              </span>
              <input
                type="text"
                value={form.pickup}
                onChange={(event) => updateField("pickup", event.target.value)}
                placeholder="Airport, hotel, office, or address"
                className={fieldClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                Where are you going?
              </span>
              <input
                type="text"
                value={form.dropoff}
                onChange={(event) => updateField("dropoff", event.target.value)}
                placeholder="Destination or venue"
                className={fieldClassName}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                  Date
                </span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                  Time
                </span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => updateField("time", event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                  Passengers
                </span>
                <select
                  value={form.passengers}
                  onChange={(event) => updateField("passengers", event.target.value)}
                  className={fieldClassName}
                >
                  {passengerOptions.map((option) => (
                    <option key={`quote-passengers-${option}`} value={option} className="bg-[#101319]">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {form.service === "hourly" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                    Hours
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.requestedHours}
                    onChange={(event) => updateField("requestedHours", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                    Stops
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.estimatedStops}
                    onChange={(event) => updateField("estimatedStops", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
              </div>
            ) : null}

            {form.service === "airport" ? (
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                  Flat-rate route
                </span>
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
                      No routes configured
                    </option>
                  )}
                </select>
              </label>
            ) : null}

            {form.service === "custom" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                    Estimated hours
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.estimatedTripHours}
                    onChange={(event) => updateField("estimatedTripHours", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">
                    Estimated miles
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.estimatedTripMiles}
                    onChange={(event) => updateField("estimatedTripMiles", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
              </div>
            ) : null}

            <div className="rounded-[1.1rem] border border-[rgba(200,168,112,0.2)] bg-[linear-gradient(180deg,rgba(200,168,112,0.1),rgba(255,255,255,0.02))] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent)]">
                Quote preview
              </p>
              <p className="mt-3 font-display text-[2rem] leading-none text-white">
                {quoteDisplayAmount}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/64">
                {estimate.note || "This is the live online estimate based on the details entered so far. Concierge can confirm the final quote and availability."}
              </p>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowQuoteAssistant(false);
                  scrollToBooking();
                }}
                className="lux-button inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)]"
              >
                Use These Details In Booking Form
              </button>
              <a
                href={quickQuoteEmailHref}
                className="lux-button inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
              >
                Email Quote Request
              </a>
              <a
                href={quickQuoteSmsHref}
                className="lux-button inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
              >
                Text Quote Request
              </a>
              <button
                type="button"
                onClick={copyQuoteSummary}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-transparent px-5 text-sm font-semibold text-white/72 hover:border-white/18 hover:text-white"
              >
                {quoteCopied ? "Quote Summary Copied" : "Copy Quote Summary"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <a
        href={contactPhoneHref}
        aria-label={`Call ${brandContent.name}: ${floatingActions.callLabel}`}
        className="floating-link floating-call hidden sm:inline-flex"
      >
        <span className="floating-icon" aria-hidden="true">✆</span>
        {floatingActions.callLabel}
      </a>

      <button
        type="button"
        onClick={() => setShowQuoteAssistant((current) => !current)}
        aria-label="Open quick quote conversation"
        className="floating-link floating-action"
      >
        <span className="floating-icon" aria-hidden="true">→</span>
        {floatingActions.bookLabel}
      </button>
    </div>
  );
}
