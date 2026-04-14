"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
import { getDefaultSiteContent } from "@/lib/site-content-shared";

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

const whyAutovisePoints = [
  {
    title: "Nationwide Reach",
    text: "Autovise is based on the East Coast and can coordinate transportation services nationwide for clients who need consistency beyond one region.",
  },
  {
    title: "Professional Precision",
    text: "Clients book Autovise for discretion, punctuality, and the calm confidence that comes with professional chauffeur service.",
  },
  {
    title: "Airport to Long-Distance",
    text: "From airport transfers and executive runs to state-line travel and VIP itineraries, the service is built for real transportation needs.",
  },
  {
    title: "Available 24/7",
    text: "Early departures, late-night arrivals, and time-sensitive bookings are handled with the same level of care every day of the week.",
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

const primarySectionIds = ["how-it-works", "services", "coverage", "rates", "fleet", "reviews", "faq", "contact"];

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
    <article className="glass-panel fade-in soft-lift rounded-[1.4rem] p-7">
      <div
        className={`soft-grid relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${vehicle.accent} p-4`}
      >
        <div className="float-sheen absolute inset-x-12 top-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)] blur-2xl" />
        <div className="relative h-40 overflow-hidden rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] sm:h-52">
          {activeImageUrl ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(5,8,13,0.86))]" />
              <Image
                src={activeImageUrl}
                alt={vehicle.name}
                fill
                className="relative z-[1] object-contain p-3"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,16,0.08),rgba(6,9,16,0.48))]" />
            </>
          ) : (
            <div className="relative h-full flex flex-col items-center justify-center gap-3">
              <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 opacity-30">
                <path d="M20 52 C20 52 30 30 50 26 L80 22 L120 22 L150 26 C170 30 180 52 180 52 L185 52 L185 58 L15 58 L15 52 Z" fill="rgba(200,168,112,0.4)" stroke="rgba(200,168,112,0.5)" strokeWidth="1"/>
                <circle cx="50" cy="58" r="10" stroke="rgba(200,168,112,0.5)" strokeWidth="1.5" fill="rgba(0,0,0,0.6)"/>
                <circle cx="150" cy="58" r="10" stroke="rgba(200,168,112,0.5)" strokeWidth="1.5" fill="rgba(0,0,0,0.6)"/>
                <circle cx="50" cy="58" r="4" fill="rgba(200,168,112,0.4)"/>
                <circle cx="150" cy="58" r="4" fill="rgba(200,168,112,0.4)"/>
                <path d="M55 26 L75 22 L125 22 L145 26 L130 42 L70 42 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              </svg>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/25">{vehicle.name}</p>
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
              <Image
                src={imageUrl}
                alt={`${vehicle.name} preview ${index + 1}`}
                width={64}
                height={56}
                className="bg-black/30 object-contain p-1"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/68">
        <p>Seats: {vehicle.capacity}</p>
        <p className="mt-2">
          Best for: {vehicle.bestFor || "airport, corporate, and event travel"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChoose(vehicle.slug)}
        aria-label={`Select ${vehicle.name}`}
        className="lux-button mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/7"
      >
        Select vehicle
      </button>
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

export default function AnytimeAnywhereLimoWebsite({
  initialCatalog,
  initialSiteContent,
}) {
  const catalog = initialCatalog ?? getDefaultCatalog();
  const siteContent = initialSiteContent ?? getDefaultSiteContent();
  const vehicles = Array.isArray(catalog.vehicles) ? catalog.vehicles : fleet;
  const serviceEntries = Array.isArray(siteContent.services)
    ? siteContent.services
    : services;
  const testimonialEntries = Array.isArray(siteContent.testimonials)
    ? siteContent.testimonials
    : testimonials;
  const heroStats = Array.isArray(siteContent.heroStats)
    ? siteContent.heroStats
    : [];
  const howItWorksContent = siteContent.howItWorks ?? {};
  const howItWorksEntries = Array.isArray(howItWorksContent.steps)
    ? howItWorksContent.steps
    : howItWorksSteps;
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
  const contactPhoneHref = `tel:${String(
    contactSection.phoneValue ?? "",
  ).replace(/[^+\d]/g, "")}`;
  const startingRates = computeStartingRates(catalog);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [form, setForm] = useState(() => ({
    ...defaultForm,
    vehicle: vehicles[0]?.slug ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeNavSection, setActiveNavSection] = useState("");
  const navItems = [
    ["how-it-works", navigationContent.howItWorks],
    ["services", navigationContent.services],
    ["coverage", "Coverage"],
    ["rates", "Rates"],
    ["fleet", navigationContent.fleet],
    ["reviews", navigationContent.reviews],
    ["contact", navigationContent.contact],
  ];

  const estimate = calculateEstimate(form, catalog);
  const selectedVehicle = getVehicleBySlug(form.vehicle, catalog) ?? vehicles[0] ?? null;
  const passengerOptions = selectedVehicle
    ? Array.from({ length: selectedVehicle.capacity }, (_, index) => String(index + 1))
    : ["1"];

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
        vehicle: vehicles[0]?.slug ?? "",
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

              <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {heroStats.map((item, index) => (
                  <article
                    key={`${item.value}-${index}`}
                    className="glass-panel fade-in soft-lift rounded-[1.2rem] p-4 md:p-6"
                  >
                    <p className="font-display text-3xl leading-none text-white md:text-5xl">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/66 md:mt-3 md:text-sm md:leading-7">
                      {item.text}
                    </p>
                  </article>
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
                    {bookingUi.successLabel}
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
                <div className="relative z-10 mt-6 rounded-[0.9rem] border border-amber-200/20 bg-amber-200/8 px-4 py-3 text-sm text-amber-100/90">
                  {submitError}
                </div>
              ) : null}

              {vehicleAvailabilityMessage ? (
                <div className="relative z-10 mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
                  {vehicleAvailabilityMessage}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="relative z-10 mt-6" noValidate aria-label="Booking request form">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block" htmlFor="field-service">
                    <span className="mb-2 block text-sm text-white/72">Service</span>
                    <select id="field-service" aria-required="true" aria-invalid={!!errors.service}
                      value={form.service}
                      onChange={(event) => updateField("service", event.target.value)}
                      className={fieldClassName}
                    >
                      {serviceEntries.map((service) => (
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
                      disabled={!selectedVehicle}
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

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={form.roundTrip}
                      aria-label="Add round trip — return journey included"
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
                        <span className="text-white/40">— return journey included</span>
                      </span>
                      {form.roundTrip && (
                        <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                          Added
                        </span>
                      )}
                    </button>
                  </div>

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

                <div className="glass-panel mt-5 rounded-[1.2rem] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="lux-section-label !mb-0">Live pricing</p>
                      <h3 className="mt-3 font-display text-[1.6rem] leading-none text-white md:text-[2.4rem]">
                        Estimated total {formatCurrency(estimate.total)}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/64">
                      Deposit {formatCurrency(estimate.deposit)}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-white/64 sm:grid-cols-2">
                    <p>One-way rate: {formatCurrency(estimate.baseRate)}</p>
                    {estimate.roundTripSurcharge > 0 && (
                      <p className="text-[var(--accent-strong)]">Round trip: +{formatCurrency(estimate.roundTripSurcharge)}</p>
                    )}
                    <p>Estimated gratuity: {formatCurrency(estimate.gratuity)}</p>
                    <p>After-hours fee: {formatCurrency(estimate.afterHoursFee)}</p>
                    <p>Weekend fee: {formatCurrency(estimate.weekendFee)}</p>
                    <p>Request adjustment: {formatCurrency(estimate.requestsFee)}</p>
                    <p>Passenger adjustment: {formatCurrency(estimate.passengerAdjustment)}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white/48">
                    {bookingUi.pricingNote}
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
                <p className="mt-4 text-center text-xs text-white/36">
                  A confirmation will be sent to your email once your booking is reviewed and accepted.
                </p>
              </form>
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

        <section className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">Why Autovise</p>
            <h2 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Luxury transportation built on reliability and discretion.
            </h2>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              While Autovise Black Car is based on the East Coast, the service is built to coordinate transportation nationwide for clients who need professionalism, reliability, and precision wherever they travel.
            </p>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {whyAutovisePoints.map((item) => (
                <article key={item.title} className="glass-panel fade-in soft-lift rounded-[1.4rem] p-7">
                  <p className="text-[var(--accent)] text-lg mb-5">✦</p>
                  <h3 className="font-display text-[1.5rem] leading-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-12 md:py-16 lg:py-20 sm:px-5 border-t border-white/6">
          <div className="limo-container">
            <p className="lux-section-label">{howItWorksContent.label}</p>
            <h2 className="max-w-[780px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              {howItWorksContent.title}
            </h2>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
              {howItWorksContent.description}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {howItWorksEntries.map((item, index) => (
                <StepCard key={`${item.step}-${index}`} item={item} />
              ))}
            </div>
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

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqItems.map((item) => (
                <article key={item.q} className="glass-panel rounded-[1.4rem] p-6">
                  <h3 className="font-semibold text-white">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.a}</p>
                </article>
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

                <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-[1rem] border border-[var(--line-strong)] bg-white/3 px-4 py-3 text-sm text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>Primary operations - <strong className="text-white/80">Maine · Massachusetts · New York</strong></span>
                  <span className="hidden sm:inline text-white/24">/</span>
                  <span className="text-[var(--accent)]">Nationwide service available by request</span>
                </div>

                <p className="mt-4 text-sm text-white/40">
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
                    href={`mailto:${contactSection.emailValue}`}
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
                    {contactSection.phoneValue}
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.emailLabel}</p>
                  <a
                    href={`mailto:${contactSection.emailValue}`}
                    className="mt-4 block break-all font-display text-[1.9rem] leading-tight text-white"
                  >
                    {contactSection.emailValue}
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

      <a
        href={contactPhoneHref}
        aria-label={`Call ${brandContent.name}: ${floatingActions.callLabel}`}
        className="floating-link floating-call hidden sm:inline-flex"
      >
        <span className="floating-icon" aria-hidden="true">✆</span>
        {floatingActions.callLabel}
      </a>

      <a
        href="#booking"
        aria-label="Go to booking form"
        className="floating-link floating-action"
      >
        <span className="floating-icon" aria-hidden="true">→</span>
        {floatingActions.bookLabel}
      </a>
    </div>
  );
}
