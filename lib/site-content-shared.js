import {
  services as baseServices,
  testimonials as baseTestimonials,
} from "./catalog-shared";

export const SITE_CONTENT_VERSION = 2;

function clone(value) {
  return structuredClone(value);
}

function normalizeString(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeStringArray(values, fallback = []) {
  if (!Array.isArray(values)) {
    return clone(fallback);
  }

  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function normalizeEmail(value, fallback = "") {
  const normalized = normalizeString(value, fallback).toLowerCase();

  if (!normalized || normalized === "book@autoviseblackcar.com") {
    return fallback;
  }

  return normalized;
}

function normalizeLegalText(value, fallback = "") {
  return normalizeString(value, fallback).replace(/^Â©/, "©");
}

export function getDefaultSiteContent() {
  return {
    version: SITE_CONTENT_VERSION,
    brand: {
      name: "Autovise Black Car",
      subtitle: "Nationwide Luxury Transportation - East Coast Based",
    },
    navigation: {
      howItWorks: "How It Works",
      services: "Services",
      fleet: "Fleet",
      reviews: "Reviews",
      contact: "Contact",
      reserve: "Book Now",
    },
    hero: {
      eyebrow: "Nationwide Black Car Service - East Coast Based",
      kicker: "Luxury. Reliability. Precision.",
      title: "Nationwide Black Car Service - Based on the East Coast",
      description:
        "Autovise Black Car provides high-end private transportation across the United States, with a strong presence throughout Maine, Massachusetts, and New York. Whether you need an airport transfer, executive travel, or long-distance service, we deliver a seamless, first-class experience wherever you go.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "Explore Services",
      bookingEyebrow: "Request private transportation",
      bookingTitle: "Get your quote",
      bookingDescription:
        "Select hourly, airport, or custom long-distance service and Autovise Black Car will calculate the right quote structure for your trip.",
      bookingPill: "Nationwide requests",
    },
    bookingUi: {
      successLabel: "Quote request received",
      pricingNote:
        "Final pricing may be adjusted for route changes, additional stops, excess wait time, tolls, and special event demand.",
      unavailableMessage:
        "Online vehicle availability is being updated. Please call concierge to book directly.",
      unavailableFleetMessage:
        "No vehicles are currently available for online booking. Please contact concierge directly.",
      submitButtonLabel: "Request Booking",
      unavailableButtonLabel: "Call Concierge",
    },
    heroStats: [
      {
        value: "24/7",
        text: "Reservation support for airport, executive, long-distance, and VIP transportation.",
      },
      {
        value: "BOS-JFK-LGA",
        text: "Major airport coverage including Boston Logan, JFK, LaGuardia, and beyond.",
      },
      {
        value: "ME-MA-NY",
        text: "Primary operations across Maine, Massachusetts, and New York.",
      },
      {
        value: "Nationwide",
        text: "Transportation services across the United States are available by request.",
      },
    ],
    proof: {
      text:
        "From Boston to New York - and beyond - we serve clients who expect professionalism, discretion, and reliability at every step.",
      chips: [
        "Airport transfers",
        "Executive travel",
        "Long-distance service",
        "VIP transportation",
        "Available 24/7",
        "Nationwide by request",
        "East Coast based",
      ],
    },
    howItWorks: {
      label: "How it works",
      title: "A smooth booking flow from quote to curbside pickup.",
      description:
        "Built for demanding schedules and high-stakes trips. Enter the details, review the estimate, submit the request, and let Autovise coordinate the ride.",
      steps: [
        {
          step: "Step 01",
          title: "Enter trip details",
          text: "Add pickup, destination, timing, service type, and any special notes that help shape the ride correctly.",
        },
        {
          step: "Step 02",
          title: "See a live estimate",
          text: "Pricing updates as the service type, schedule, and passenger count change so the request feels clear before submission.",
        },
        {
          step: "Step 03",
          title: "Confirm the reservation",
          text: "Your booking details are saved and routed through the backend for confirmation and dispatch follow-up.",
        },
        {
          step: "Step 04",
          title: "Ride with confidence",
          text: "Autovise coordinates the transportation so the pickup feels precise, polished, and professionally handled.",
        },
      ],
    },
    servicesSection: {
      label: "Services",
      title: "Premium transportation for airport, executive, VIP, and long-distance travel.",
      description:
        "Autovise Black Car specializes in nationwide airport transfers, executive and corporate travel, long-distance private transportation, event service, and hourly chauffeur bookings.",
    },
    services: baseServices.map((service) => ({
      id: service.id,
      title: service.title,
      eyebrow: service.eyebrow,
      text: service.text,
    })),
    fleetSection: {
      label: "Fleet",
      title: "Luxury vehicles matched to the trip.",
      description:
        "Every vehicle in the Autovise fleet is selected for executive comfort, professional presentation, and dependable performance across airport, corporate, and long-distance travel.",
    },
    reviewsSection: {
      label: "Client reviews",
      title: "What passengers say about the Autovise experience.",
    },
    testimonials: baseTestimonials.map((item) => ({
      name: item.name,
      role: item.role,
      quote: item.quote,
    })),
    contactSection: {
      label: "Call concierge",
      title: "Luxury transportation, wherever the trip starts.",
      description:
        "While we are based on the East Coast, Autovise Black Car can coordinate and provide transportation services nationwide for our clients.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "Email Autovise",
      phoneLabel: "Call concierge",
      phoneValue: "+1 (207) 880-3733",
      emailLabel: "Email",
      emailValue: "booking@autoviseblackcar.com",
      availabilityLabel: "Hours",
      availabilityValue:
        "Available 24/7 for airport, executive, long-distance, and VIP transportation.",
    },
    footer: {
      legal: "© 2026 Autovise Black Car. All rights reserved.",
      description:
        "Nationwide black car service with primary operations across Maine, Massachusetts, and New York.",
    },
    floatingActions: {
      callLabel: "Call Concierge",
      bookLabel: "Book Now",
    },
  };
}

export function normalizeSiteContent(input = {}) {
  const defaults = getDefaultSiteContent();

  const services = defaults.services.map((defaultService) => {
    const override =
      Array.isArray(input.services) &&
      input.services.find((service) => service?.id === defaultService.id);

    return {
      id: defaultService.id,
      title: normalizeString(override?.title, defaultService.title),
      eyebrow: normalizeString(override?.eyebrow, defaultService.eyebrow),
      text: normalizeString(override?.text, defaultService.text),
    };
  });

  const testimonials =
    Array.isArray(input.testimonials) && input.testimonials.length > 0
      ? input.testimonials.map((item, index) => ({
          name: normalizeString(
            item?.name,
            defaults.testimonials[index]?.name || `Client ${index + 1}`,
          ),
          role: normalizeString(
            item?.role,
            defaults.testimonials[index]?.role || "Client",
          ),
          quote: normalizeString(
            item?.quote,
            defaults.testimonials[index]?.quote || "",
          ),
        }))
      : clone(defaults.testimonials);

  const heroStats =
    Array.isArray(input.heroStats) && input.heroStats.length > 0
      ? input.heroStats.slice(0, 6).map((item, index) => ({
          value: normalizeString(
            item?.value,
            defaults.heroStats[index]?.value || `${index + 1}`,
          ),
          text: normalizeString(
            item?.text,
            defaults.heroStats[index]?.text || "",
          ),
        }))
      : clone(defaults.heroStats);

  const howItWorksSteps =
    Array.isArray(input.howItWorks?.steps) && input.howItWorks.steps.length > 0
      ? input.howItWorks.steps.slice(0, 8).map((item, index) => ({
          step: normalizeString(
            item?.step,
            defaults.howItWorks.steps[index]?.step ||
              `Step ${String(index + 1).padStart(2, "0")}`,
          ),
          title: normalizeString(
            item?.title,
            defaults.howItWorks.steps[index]?.title || "",
          ),
          text: normalizeString(
            item?.text,
            defaults.howItWorks.steps[index]?.text || "",
          ),
        }))
      : clone(defaults.howItWorks.steps);

  return {
    version: SITE_CONTENT_VERSION,
    brand: {
      name: normalizeString(input.brand?.name, defaults.brand.name),
      subtitle: normalizeString(input.brand?.subtitle, defaults.brand.subtitle),
    },
    navigation: {
      howItWorks: normalizeString(
        input.navigation?.howItWorks,
        defaults.navigation.howItWorks,
      ),
      services: normalizeString(
        input.navigation?.services,
        defaults.navigation.services,
      ),
      fleet: normalizeString(input.navigation?.fleet, defaults.navigation.fleet),
      reviews: normalizeString(
        input.navigation?.reviews,
        defaults.navigation.reviews,
      ),
      contact: normalizeString(
        input.navigation?.contact,
        defaults.navigation.contact,
      ),
      reserve: normalizeString(
        input.navigation?.reserve,
        defaults.navigation.reserve,
      ),
    },
    hero: {
      eyebrow: normalizeString(input.hero?.eyebrow, defaults.hero.eyebrow),
      kicker: normalizeString(input.hero?.kicker, defaults.hero.kicker),
      title: normalizeString(input.hero?.title, defaults.hero.title),
      description: normalizeString(
        input.hero?.description,
        defaults.hero.description,
      ),
      primaryButtonLabel: normalizeString(
        input.hero?.primaryButtonLabel,
        defaults.hero.primaryButtonLabel,
      ),
      secondaryButtonLabel: normalizeString(
        input.hero?.secondaryButtonLabel,
        defaults.hero.secondaryButtonLabel,
      ),
      bookingEyebrow: normalizeString(
        input.hero?.bookingEyebrow,
        defaults.hero.bookingEyebrow,
      ),
      bookingTitle: normalizeString(
        input.hero?.bookingTitle,
        defaults.hero.bookingTitle,
      ),
      bookingDescription: normalizeString(
        input.hero?.bookingDescription,
        defaults.hero.bookingDescription,
      ),
      bookingPill: normalizeString(
        input.hero?.bookingPill,
        defaults.hero.bookingPill,
      ),
    },
    bookingUi: {
      successLabel: normalizeString(
        input.bookingUi?.successLabel,
        defaults.bookingUi.successLabel,
      ),
      pricingNote: normalizeString(
        input.bookingUi?.pricingNote,
        defaults.bookingUi.pricingNote,
      ),
      unavailableMessage: normalizeString(
        input.bookingUi?.unavailableMessage,
        defaults.bookingUi.unavailableMessage,
      ),
      unavailableFleetMessage: normalizeString(
        input.bookingUi?.unavailableFleetMessage,
        defaults.bookingUi.unavailableFleetMessage,
      ),
      submitButtonLabel: normalizeString(
        input.bookingUi?.submitButtonLabel,
        defaults.bookingUi.submitButtonLabel,
      ),
      unavailableButtonLabel: normalizeString(
        input.bookingUi?.unavailableButtonLabel,
        defaults.bookingUi.unavailableButtonLabel,
      ),
    },
    heroStats,
    proof: {
      text: normalizeString(input.proof?.text, defaults.proof.text),
      chips: normalizeStringArray(input.proof?.chips, defaults.proof.chips).slice(
        0,
        8,
      ),
    },
    howItWorks: {
      label: normalizeString(
        input.howItWorks?.label,
        defaults.howItWorks.label,
      ),
      title: normalizeString(
        input.howItWorks?.title,
        defaults.howItWorks.title,
      ),
      description: normalizeString(
        input.howItWorks?.description,
        defaults.howItWorks.description,
      ),
      steps: howItWorksSteps,
    },
    servicesSection: {
      label: normalizeString(
        input.servicesSection?.label,
        defaults.servicesSection.label,
      ),
      title: normalizeString(
        input.servicesSection?.title,
        defaults.servicesSection.title,
      ),
      description: normalizeString(
        input.servicesSection?.description,
        defaults.servicesSection.description,
      ),
    },
    services,
    fleetSection: {
      label: normalizeString(
        input.fleetSection?.label,
        defaults.fleetSection.label,
      ),
      title: normalizeString(
        input.fleetSection?.title,
        defaults.fleetSection.title,
      ),
      description: normalizeString(
        input.fleetSection?.description,
        defaults.fleetSection.description,
      ),
    },
    reviewsSection: {
      label: normalizeString(
        input.reviewsSection?.label,
        defaults.reviewsSection.label,
      ),
      title: normalizeString(
        input.reviewsSection?.title,
        defaults.reviewsSection.title,
      ),
    },
    testimonials,
    contactSection: {
      label: normalizeString(
        input.contactSection?.label,
        defaults.contactSection.label,
      ),
      title: normalizeString(
        input.contactSection?.title,
        defaults.contactSection.title,
      ),
      description: normalizeString(
        input.contactSection?.description,
        defaults.contactSection.description,
      ),
      primaryButtonLabel: normalizeString(
        input.contactSection?.primaryButtonLabel,
        defaults.contactSection.primaryButtonLabel,
      ),
      secondaryButtonLabel: normalizeString(
        input.contactSection?.secondaryButtonLabel,
        defaults.contactSection.secondaryButtonLabel,
      ),
      phoneLabel: normalizeString(
        input.contactSection?.phoneLabel,
        defaults.contactSection.phoneLabel,
      ),
      phoneValue: normalizeString(
        input.contactSection?.phoneValue,
        defaults.contactSection.phoneValue,
      ),
      emailLabel: normalizeString(
        input.contactSection?.emailLabel,
        defaults.contactSection.emailLabel,
      ),
      emailValue: normalizeEmail(
        input.contactSection?.emailValue,
        defaults.contactSection.emailValue,
      ),
      availabilityLabel: normalizeString(
        input.contactSection?.availabilityLabel,
        defaults.contactSection.availabilityLabel,
      ),
      availabilityValue: normalizeString(
        input.contactSection?.availabilityValue,
        defaults.contactSection.availabilityValue,
      ),
    },
    footer: {
      legal: normalizeLegalText(input.footer?.legal, defaults.footer.legal),
      description: normalizeString(
        input.footer?.description,
        defaults.footer.description,
      ),
    },
    floatingActions: {
      callLabel: normalizeString(
        input.floatingActions?.callLabel,
        defaults.floatingActions.callLabel,
      ),
      bookLabel: normalizeString(
        input.floatingActions?.bookLabel,
        defaults.floatingActions.bookLabel,
      ),
    },
  };
}

export function getSiteServiceById(siteContent, serviceId) {
  const content = normalizeSiteContent(siteContent);
  return content.services.find((service) => service.id === serviceId) || null;
}
