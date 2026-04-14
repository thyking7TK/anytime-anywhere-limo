import {
  services as baseServices,
  testimonials as baseTestimonials,
} from "./catalog-shared";

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

export function getDefaultSiteContent() {
  return {
    brand: {
      name: "Autovise Black Car",
      subtitle: "Nationwide Luxury Transportation — East Coast Based",
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
      eyebrow: "Nationwide black car service · East Coast based",
      kicker: "Luxury. Reliability. Precision.",
      title: "Nationwide Black Car Service — Based on the East Coast.",
      description:
        "Autovise Black Car provides high-end private transportation across the United States, with a strong presence throughout Maine, Massachusetts, and New York. Whether you need an airport transfer, executive travel, or long-distance service, we deliver a seamless, first-class experience wherever you go.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "View Services",
      bookingEyebrow: "Reserve your ride",
      bookingTitle: "Request a booking",
      bookingDescription:
        "Get an instant quote for your trip. Pricing updates as you select service type, timing, and passenger count.",
      bookingPill: "Flat-rate pricing",
    },
    bookingUi: {
      successLabel: "Booking request received",
      pricingNote:
        "This estimate is based on our flat-rate pricing structure. Final cost may vary for wait time ($40/hr), extra stops ($25–$50), and tolls. We'll confirm your final rate before the ride.",
      unavailableMessage:
        "Our vehicle is currently being updated. Please call or text to book directly.",
      unavailableFleetMessage:
        "No vehicles are currently available for online booking. Please contact us directly.",
      submitButtonLabel: "Request Booking",
      unavailableButtonLabel: "Call to Book",
    },
    heroStats: [
      {
        value: "$650",
        text: "Flat rate, Portland to Boston Logan — no meter, no surprises.",
      },
      {
        value: "24/7",
        text: "Available for early departures, late arrivals, and last-minute nationwide bookings.",
      },
      {
        value: "5★",
        text: "Professional chauffeur standards on every ride, every city.",
      },
      {
        value: "Nation",
        text: "Wide service available by request. East Coast primary operations.",
      },
    ],
    proof: {
      text:
        "From Boston to New York — and beyond — Autovise Black Car serves clients who expect professionalism, discretion, and reliability at every step.",
      chips: [
        "Real-time flight tracking",
        "Flat-rate pricing",
        "Available 24/7",
        "Nationwide service",
        "Licensed & insured",
        "East Coast based",
      ],
    },
    howItWorks: {
      label: "How it works",
      title: "From quote to curbside in four simple steps.",
      description:
        "Built for demanding schedules and high-stakes trips. Enter your details, see your rate, send the request, and leave the rest to us — anywhere in the country.",
      steps: [
        {
          step: "Step 01",
          title: "Enter your trip details",
          text: "Select your service, enter pickup and drop-off locations, and choose your date and time.",
        },
        {
          step: "Step 02",
          title: "See your flat-rate estimate",
          text: "Pricing updates instantly based on your service type and timing. No hidden fees — what you see is what you pay.",
        },
        {
          step: "Step 03",
          title: "Submit your request",
          text: "Your booking is sent directly to us. We'll confirm availability and your final rate promptly.",
        },
        {
          step: "Step 04",
          title: "Ride with confidence",
          text: "Your chauffeur arrives early, dressed professionally, in a clean and comfortable Yukon Denali — wherever you are.",
        },
      ],
    },
    servicesSection: {
      label: "Services",
      title: "Every trip handled with professionalism and precision.",
      description:
        "From BOS and JFK airport transfers to cross-state executive travel and VIP events, Autovise Black Car delivers first-class transportation across Maine, Massachusetts, New York, and nationwide.",
    },
    services: baseServices.map((service) => ({
      id: service.id,
      title: service.title,
      eyebrow: service.eyebrow,
      text: service.text,
    })),
    fleetSection: {
      label: "Our vehicle",
      title: "The Yukon Denali. Our flagship.",
      description:
        "One vehicle, maintained to perfection. The GMC Yukon Denali delivers a commanding luxury cabin, leather seating for up to 6 passengers, and the presence every client deserves — coast to coast.",
    },
    reviewsSection: {
      label: "Client reviews",
      title: "What our passengers say.",
    },
    testimonials: baseTestimonials.map((item) => ({
      name: item.name,
      role: item.role,
      quote: item.quote,
    })),
    contactSection: {
      label: "Book your ride",
      title: "Ready to ride? Let's talk.",
      description:
        "While we are based on the East Coast, Autovise Black Car can coordinate and provide transportation services nationwide for our clients. Call or text to book — we respond fast and confirm the same day.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "Send Us an Email",
      phoneLabel: "Call or text to book",
      phoneValue: "(207) 000-0000",
      emailLabel: "Email",
      emailValue: "book@autovise.com",
      availabilityLabel: "Hours",
      availabilityValue: "Available 24/7 — airport, executive, long-distance, and event transportation.",
    },
    footer: {
      legal: "© 2026 Autovise Black Car. All rights reserved.",
      description:
        "Nationwide luxury black car service. East Coast based — Maine, Massachusetts, New York. Available 24/7.",
    },
    floatingActions: {
      callLabel: "Call to Book",
      bookLabel: "Book Your Ride",
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

  const testimonials = Array.isArray(input.testimonials) && input.testimonials.length > 0
    ? input.testimonials.map((item, index) => ({
        name: normalizeString(item?.name, defaults.testimonials[index]?.name || `Client ${index + 1}`),
        role: normalizeString(item?.role, defaults.testimonials[index]?.role || "Client"),
        quote: normalizeString(item?.quote, defaults.testimonials[index]?.quote || ""),
      }))
    : clone(defaults.testimonials);

  const heroStats = Array.isArray(input.heroStats) && input.heroStats.length > 0
    ? input.heroStats.slice(0, 6).map((item, index) => ({
        value: normalizeString(item?.value, defaults.heroStats[index]?.value || `${index + 1}`),
        text: normalizeString(item?.text, defaults.heroStats[index]?.text || ""),
      }))
    : clone(defaults.heroStats);

  const howItWorksSteps =
    Array.isArray(input.howItWorks?.steps) && input.howItWorks.steps.length > 0
      ? input.howItWorks.steps.slice(0, 8).map((item, index) => ({
          step: normalizeString(item?.step, defaults.howItWorks.steps[index]?.step || `Step ${String(index + 1).padStart(2, "0")}`),
          title: normalizeString(item?.title, defaults.howItWorks.steps[index]?.title || ""),
          text: normalizeString(item?.text, defaults.howItWorks.steps[index]?.text || ""),
        }))
      : clone(defaults.howItWorks.steps);

  return {
    brand: {
      name: normalizeString(input.brand?.name, defaults.brand.name),
      subtitle: normalizeString(input.brand?.subtitle, defaults.brand.subtitle),
    },
    navigation: {
      howItWorks: normalizeString(input.navigation?.howItWorks, defaults.navigation.howItWorks),
      services: normalizeString(input.navigation?.services, defaults.navigation.services),
      fleet: normalizeString(input.navigation?.fleet, defaults.navigation.fleet),
      reviews: normalizeString(input.navigation?.reviews, defaults.navigation.reviews),
      contact: normalizeString(input.navigation?.contact, defaults.navigation.contact),
      reserve: normalizeString(input.navigation?.reserve, defaults.navigation.reserve),
    },
    hero: {
      eyebrow: normalizeString(input.hero?.eyebrow, defaults.hero.eyebrow),
      kicker: normalizeString(input.hero?.kicker, defaults.hero.kicker),
      title: normalizeString(input.hero?.title, defaults.hero.title),
      description: normalizeString(input.hero?.description, defaults.hero.description),
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
      bookingTitle: normalizeString(input.hero?.bookingTitle, defaults.hero.bookingTitle),
      bookingDescription: normalizeString(
        input.hero?.bookingDescription,
        defaults.hero.bookingDescription,
      ),
      bookingPill: normalizeString(input.hero?.bookingPill, defaults.hero.bookingPill),
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
      chips: normalizeStringArray(input.proof?.chips, defaults.proof.chips).slice(0, 8),
    },
    howItWorks: {
      label: normalizeString(input.howItWorks?.label, defaults.howItWorks.label),
      title: normalizeString(input.howItWorks?.title, defaults.howItWorks.title),
      description: normalizeString(
        input.howItWorks?.description,
        defaults.howItWorks.description,
      ),
      steps: howItWorksSteps,
    },
    servicesSection: {
      label: normalizeString(input.servicesSection?.label, defaults.servicesSection.label),
      title: normalizeString(input.servicesSection?.title, defaults.servicesSection.title),
      description: normalizeString(
        input.servicesSection?.description,
        defaults.servicesSection.description,
      ),
    },
    services,
    fleetSection: {
      label: normalizeString(input.fleetSection?.label, defaults.fleetSection.label),
      title: normalizeString(input.fleetSection?.title, defaults.fleetSection.title),
      description: normalizeString(
        input.fleetSection?.description,
        defaults.fleetSection.description,
      ),
    },
    reviewsSection: {
      label: normalizeString(input.reviewsSection?.label, defaults.reviewsSection.label),
      title: normalizeString(input.reviewsSection?.title, defaults.reviewsSection.title),
    },
    testimonials,
    contactSection: {
      label: normalizeString(input.contactSection?.label, defaults.contactSection.label),
      title: normalizeString(input.contactSection?.title, defaults.contactSection.title),
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
      phoneLabel: normalizeString(input.contactSection?.phoneLabel, defaults.contactSection.phoneLabel),
      phoneValue: normalizeString(input.contactSection?.phoneValue, defaults.contactSection.phoneValue),
      emailLabel: normalizeString(input.contactSection?.emailLabel, defaults.contactSection.emailLabel),
      emailValue: normalizeString(input.contactSection?.emailValue, defaults.contactSection.emailValue),
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
      legal: normalizeString(input.footer?.legal, defaults.footer.legal),
      description: normalizeString(input.footer?.description, defaults.footer.description),
    },
    floatingActions: {
      callLabel: normalizeString(input.floatingActions?.callLabel, defaults.floatingActions.callLabel),
      bookLabel: normalizeString(input.floatingActions?.bookLabel, defaults.floatingActions.bookLabel),
    },
  };
}

export function getSiteServiceById(siteContent, serviceId) {
  const content = normalizeSiteContent(siteContent);
  return content.services.find((service) => service.id === serviceId) || null;
}
