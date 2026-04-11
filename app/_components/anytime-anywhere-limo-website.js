"use client";

import { useState } from "react";

const services = [
  {
    id: "airport",
    title: "Airport Transfers",
    eyebrow: "Precision arrivals",
    text: "Reliable pickups, curbside coordination, and polished chauffeurs who track flights in real time.",
  },
  {
    id: "corporate",
    title: "Corporate Travel",
    eyebrow: "Executive movement",
    text: "Client-ready vehicles for meetings, roadshows, conferences, and last-minute schedule changes.",
  },
  {
    id: "events",
    title: "Special Events",
    eyebrow: "Occasion worthy",
    text: "Elevated transportation for weddings, proms, galas, birthdays, and nights designed to feel effortless.",
  },
];

const fleet = [
  {
    name: "Luxury Sedan",
    capacity: 3,
    details: "Quiet, tailored comfort for solo travelers, couples, and airport runs.",
    mood: "Discreet arrival",
    accent: "from-amber-100/20 via-transparent to-transparent",
  },
  {
    name: "Executive SUV",
    capacity: 6,
    details: "A refined premium cabin with extra luggage room and a more commanding presence.",
    mood: "Most requested",
    accent: "from-sky-100/18 via-transparent to-transparent",
  },
  {
    name: "Stretch Limo",
    capacity: 8,
    details: "A celebratory statement piece for entrances, group nights, and photo-ready moments.",
    mood: "Signature experience",
    accent: "from-rose-100/18 via-transparent to-transparent",
  },
];

const testimonials = [
  {
    name: "Jordan M.",
    role: "Airport client",
    quote:
      "Booking felt polished, the driver was waiting early, and the ride set the tone for the entire trip.",
  },
  {
    name: "Ashley T.",
    role: "Executive assistant",
    quote:
      "We booked a same-day transfer for a client and it still felt white-glove. Fast response, immaculate vehicle.",
  },
  {
    name: "Daniel R.",
    role: "Event booking",
    quote:
      "The limo made the night. It looked premium, arrived on time, and the entire experience felt seamless.",
  },
];

const serviceBaseRates = {
  airport: {
    "Luxury Sedan": 95,
    "Executive SUV": 145,
    "Stretch Limo": 295,
  },
  corporate: {
    "Luxury Sedan": 120,
    "Executive SUV": 175,
    "Stretch Limo": 340,
  },
  events: {
    "Luxury Sedan": 155,
    "Executive SUV": 235,
    "Stretch Limo": 425,
  },
};

const startingRates = fleet.reduce((accumulator, vehicle) => {
  const values = Object.values(serviceBaseRates).map(
    (service) => service[vehicle.name],
  );
  accumulator[vehicle.name] = Math.min(...values);
  return accumulator;
}, {});

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "airport",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  vehicle: "Executive SUV",
  passengers: "2",
  requests: "",
};

const fieldClassName =
  "w-full rounded-[1.15rem] border border-white/10 bg-white/6 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)] focus:bg-white/8";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildDateTime(date, time) {
  if (!date || !time) {
    return null;
  }

  const combined = new Date(`${date}T${time}`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

function calculateEstimate(form) {
  const vehicle = fleet.find((item) => item.name === form.vehicle) ?? fleet[1];
  const baseRate = serviceBaseRates[form.service][vehicle.name];
  const passengers = Number(form.passengers);
  const extraPassengerCount = Math.max(0, passengers - vehicle.capacity);
  const passengerAdjustment = extraPassengerCount * 35;
  const bookingTime = buildDateTime(form.date, form.time);
  const hour = bookingTime?.getHours() ?? 12;
  const isWeekend = bookingTime ? [0, 5, 6].includes(bookingTime.getDay()) : false;
  const afterHoursFee = hour < 6 || hour >= 22 ? 35 : 0;
  const weekendFee = isWeekend ? 40 : 0;
  const requestsFee = form.requests.trim() ? 25 : 0;
  const subtotal = baseRate + passengerAdjustment + afterHoursFee + weekendFee + requestsFee;
  const gratuity = Math.round(subtotal * 0.18);
  const total = subtotal + gratuity;
  const deposit = Math.round(total * 0.2);

  return {
    baseRate,
    afterHoursFee,
    weekendFee,
    passengerAdjustment,
    requestsFee,
    gratuity,
    total,
    deposit,
  };
}

function validateBooking(form) {
  const nextErrors = {};
  const digitsOnlyPhone = form.phone.replace(/\D/g, "");
  const passengers = Number(form.passengers);
  const vehicle = fleet.find((item) => item.name === form.vehicle) ?? fleet[1];
  const bookingTime = buildDateTime(form.date, form.time);

  if (!form.fullName.trim()) {
    nextErrors.fullName = "Please enter the passenger or contact name.";
  }

  if (!form.email.trim()) {
    nextErrors.email = "An email address is required for the booking summary.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (digitsOnlyPhone.length < 10) {
    nextErrors.phone = "Enter a valid phone number.";
  }

  if (!form.pickup.trim()) {
    nextErrors.pickup = "Please enter a pickup location.";
  }

  if (!form.dropoff.trim()) {
    nextErrors.dropoff = "Please enter a destination.";
  }

  if (!form.date) {
    nextErrors.date = "Choose the service date.";
  }

  if (!form.time) {
    nextErrors.time = "Choose the pickup time.";
  }

  if (bookingTime && bookingTime <= new Date()) {
    nextErrors.time = "Pickup time must be in the future.";
  }

  if (passengers < 1) {
    nextErrors.passengers = "Passenger count must be at least 1.";
  } else if (passengers > vehicle.capacity) {
    nextErrors.passengers = `Choose a larger vehicle for more than ${vehicle.capacity} passengers.`;
  }

  return nextErrors;
}

function createBookingReference(form) {
  const datePart = form.date ? form.date.replace(/-/g, "").slice(-4) : "0000";
  const timePart = form.time ? form.time.replace(":", "") : "0000";
  const phonePart = form.phone.replace(/\D/g, "").slice(-2).padStart(2, "0");

  return `AA-${datePart}-${timePart}-${phonePart}`;
}

function ServiceCard({ service, onChoose }) {
  return (
    <article className="glass-panel fade-in rounded-[2rem] p-7">
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
        {service.eyebrow}
      </p>
      <h3 className="mt-4 font-display text-3xl tracking-[0.02em] text-white">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-white/72">{service.text}</p>
      <button
        type="button"
        onClick={() => onChoose(service.id)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)] hover:text-white"
      >
        Reserve this service
        <span aria-hidden="true">-&gt;</span>
      </button>
    </article>
  );
}

function FleetCard({ vehicle, onChoose }) {
  return (
    <article className="glass-panel fade-in rounded-[2rem] p-6">
      <div
        className={`soft-grid relative mb-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${vehicle.accent} p-5`}
      >
        <div className="float-sheen absolute inset-x-10 top-4 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)] blur-2xl" />
        <div className="relative h-36 rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-4">
          <div className="absolute inset-x-6 bottom-8 h-10 rounded-[999px] border border-white/12 bg-black/35" />
          <div className="absolute inset-x-10 bottom-12 h-12 rounded-[999px] border border-white/14 bg-[linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
          <div className="absolute bottom-11 left-12 h-5 w-5 rounded-full border border-white/15 bg-black/70" />
          <div className="absolute bottom-11 right-12 h-5 w-5 rounded-full border border-white/15 bg-black/70" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl text-white">{vehicle.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/45">
            {vehicle.mood}
          </p>
        </div>
        <span className="rounded-full border border-[var(--line-strong)] px-3 py-1 text-xs text-[var(--accent-strong)]">
          from {formatCurrency(startingRates[vehicle.name])}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/72">{vehicle.details}</p>
      <div className="mt-6 flex items-center justify-between text-sm text-white/60">
        <span>{vehicle.capacity} passengers</span>
        <button
          type="button"
          onClick={() => onChoose(vehicle.name)}
          className="rounded-full border border-white/12 px-4 py-2 font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
        >
          Select vehicle
        </button>
      </div>
    </article>
  );
}

export default function AnytimeAnywhereLimoWebsite() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const estimate = calculateEstimate(form);
  const selectedVehicle = fleet.find((item) => item.name === form.vehicle) ?? fleet[1];
  const passengerOptions = Array.from(
    { length: selectedVehicle.capacity },
    (_, index) => String(index + 1),
  );

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateVehicle(vehicleName) {
    const nextVehicle = fleet.find((item) => item.name === vehicleName) ?? fleet[1];

    setForm((currentForm) => ({
      ...currentForm,
      vehicle: vehicleName,
      passengers: String(
        Math.min(Number(currentForm.passengers), nextVehicle.capacity) || 1,
      ),
    }));

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.passengers;
      return nextErrors;
    });
  }

  function scrollToBooking() {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleServicePick(serviceId) {
    updateField("service", serviceId);
    scrollToBooking();
  }

  function handleVehiclePick(vehicleName) {
    updateVehicle(vehicleName);
    scrollToBooking();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateBooking(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const bookingTime = buildDateTime(form.date, form.time);
    const reference = createBookingReference(form);

    setSubmittedBooking({
      reference,
      estimate,
      fullName: form.fullName,
      email: form.email,
      service: services.find((item) => item.id === form.service)?.title ?? "Service",
      vehicle: form.vehicle,
      pickup: form.pickup,
      dropoff: form.dropoff,
      when: bookingTime?.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    });

    setErrors({});
  }

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(7,9,13,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <a href="#top" className="shrink-0">
            <p className="font-display text-3xl leading-none tracking-[0.08em] text-white">
              Anytime, Anywhere
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.34em] text-white/48">
              Luxury Limo Service
            </p>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-white/72 lg:flex">
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#fleet" className="hover:text-white">
              Fleet
            </a>
            <a href="#testimonials" className="hover:text-white">
              Reviews
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </nav>

          <a
            href="#booking"
            className="hidden rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-strong)] hover:bg-white/6 sm:inline-flex"
          >
            Reserve Now
          </a>
        </div>
      </header>

      <main id="top">
        <section className="section-shell relative overflow-hidden px-6 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="fade-in flex flex-col justify-center">
              <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line)] bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/58">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                Chauffeur-level transportation
              </div>

              <p className="text-sm uppercase tracking-[0.34em] text-[var(--accent)]">
                Executive arrivals. Event-ready entrances.
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-6xl leading-[0.92] tracking-[0.02em] text-white sm:text-7xl">
                Luxury rides that feel calm, exact, and completely handled.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                Anytime, Anywhere blends modern online booking with a classic
                chauffeur experience. Reserve airport transfers, corporate travel,
                or event transportation with a vehicle that matches the moment.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#booking"
                  className="rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-bold text-[#16110a] shadow-[0_18px_40px_rgba(209,174,114,0.25)] hover:translate-y-[-1px] hover:bg-[var(--accent-strong)]"
                >
                  Get Instant Estimate
                </a>
                <a
                  href="#fleet"
                  className="rounded-full border border-white/12 px-7 py-3.5 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                >
                  Explore Fleet
                </a>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="glass-panel rounded-[1.6rem] p-5">
                  <p className="font-display text-4xl text-white">24/7</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Reservation support for early departures and late-night returns.
                  </p>
                </div>
                <div className="glass-panel rounded-[1.6rem] p-5">
                  <p className="font-display text-4xl text-white">4.9/5</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Trusted by airport travelers, assistants, and event planners.
                  </p>
                </div>
                <div className="glass-panel rounded-[1.6rem] p-5">
                  <p className="font-display text-4xl text-white">3 tiers</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Sedan, SUV, and stretch limo options for every type of arrival.
                  </p>
                </div>
              </div>
            </div>

            <aside
              id="booking"
              className="glass-panel fade-in rounded-[2.2rem] p-6 sm:p-7 lg:p-8"
            >
              <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
                    Reserve your ride
                  </p>
                  <h2 className="mt-3 font-display text-4xl text-white">
                    Request a booking
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/62">
                    Estimate updates instantly as you choose the service, vehicle,
                    timing, and trip details.
                  </p>
                </div>

                <div className="rounded-full border border-[var(--line-strong)] bg-white/4 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                  white-glove response
                </div>
              </div>

              {submittedBooking ? (
                <div className="mt-6 rounded-[1.6rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(209,174,114,0.16),rgba(255,255,255,0.02))] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    Booking request received
                  </p>
                  <h3 className="mt-3 font-display text-3xl text-white">
                    Reference {submittedBooking.reference}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    We have your request for {submittedBooking.service.toLowerCase()} in a{" "}
                    {submittedBooking.vehicle.toLowerCase()}. A confirmation email can be
                    sent to {submittedBooking.email}.
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-white/68 sm:grid-cols-2">
                    <p>Pickup: {submittedBooking.pickup}</p>
                    <p>Drop-off: {submittedBooking.dropoff}</p>
                    <p>When: {submittedBooking.when}</p>
                    <p>Estimated total: {formatCurrency(submittedBooking.estimate.total)}</p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Service</span>
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
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Vehicle</span>
                    <select
                      value={form.vehicle}
                      onChange={(event) => updateVehicle(event.target.value)}
                      className={fieldClassName}
                    >
                      {fleet.map((vehicle) => (
                        <option
                          key={vehicle.name}
                          value={vehicle.name}
                          className="bg-[#101319]"
                        >
                          {vehicle.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Full Name</span>
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
                    <span className="mb-2 block text-sm text-white/70">Phone</span>
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
                </div>

                <div className="grid gap-5 sm:grid-cols-[1.25fr_0.75fr]">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Email</span>
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

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Passengers</span>
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
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Pickup Location</span>
                    <input
                      type="text"
                      value={form.pickup}
                      onChange={(event) => updateField("pickup", event.target.value)}
                      placeholder="Airport, hotel, office, or address"
                      className={fieldClassName}
                    />
                    {errors.pickup ? (
                      <span className="mt-2 block text-sm text-amber-200">
                        {errors.pickup}
                      </span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Drop-off Location</span>
                    <input
                      type="text"
                      value={form.dropoff}
                      onChange={(event) => updateField("dropoff", event.target.value)}
                      placeholder="Destination or event venue"
                      className={fieldClassName}
                    />
                    {errors.dropoff ? (
                      <span className="mt-2 block text-sm text-amber-200">
                        {errors.dropoff}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-[1fr_1fr_0.9fr]">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Date</span>
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
                    <span className="mb-2 block text-sm text-white/70">Time</span>
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

                  <div className="block">
                    <span className="mb-2 block text-sm text-white/70">Capacity</span>
                    <div className="rounded-[1.15rem] border border-white/10 bg-white/4 px-4 py-3.5 text-sm text-white/72">
                      Up to {selectedVehicle.capacity} guests
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-white/70">Special Requests</span>
                  <textarea
                    rows={4}
                    value={form.requests}
                    onChange={(event) => updateField("requests", event.target.value)}
                    placeholder="Flight number, child seat needs, event notes, multi-stop requests..."
                    className={`${fieldClassName} min-h-[120px] resize-y`}
                  />
                </label>

                <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                        Live pricing
                      </p>
                      <h3 className="mt-3 font-display text-3xl text-white">
                        Estimated total {formatCurrency(estimate.total)}
                      </h3>
                    </div>
                    <p className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/58">
                      Deposit {formatCurrency(estimate.deposit)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-white/64 sm:grid-cols-2">
                    <p>Base rate: {formatCurrency(estimate.baseRate)}</p>
                    <p>Estimated gratuity: {formatCurrency(estimate.gratuity)}</p>
                    <p>After-hours fee: {formatCurrency(estimate.afterHoursFee)}</p>
                    <p>Weekend fee: {formatCurrency(estimate.weekendFee)}</p>
                    <p>Request adjustment: {formatCurrency(estimate.requestsFee)}</p>
                    <p>Passenger adjustment: {formatCurrency(estimate.passengerAdjustment)}</p>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-white/44">
                    Instant quote is a starting estimate based on service type, vehicle,
                    timing, and party size. Final pricing can shift for distance, waiting
                    time, tolls, or custom itinerary details.
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-bold text-[#16110a] shadow-[0_18px_40px_rgba(209,174,114,0.2)] hover:translate-y-[-1px] hover:bg-[var(--accent-strong)]"
                >
                  Request Booking
                </button>
              </form>
            </aside>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.34em] text-[var(--accent)]">
              Services
            </p>
            <h2 className="mt-4 font-display text-5xl text-white">
              Transportation built around timing, image, and comfort.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/66">
              Whether the priority is being early for a flight or making an entrance for
              a celebration, the experience is designed to feel composed from pickup to
              drop-off.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onChoose={handleServicePick}
              />
            ))}
          </div>
        </section>

        <section id="fleet" className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.34em] text-[var(--accent)]">
                Fleet
              </p>
              <h2 className="mt-4 font-display text-5xl text-white">
                Match the vehicle to the occasion.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-white/66">
              Clean lines, premium interiors, and a vehicle mix that works for discreet
              executive travel as easily as it does for celebratory nights out.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {fleet.map((vehicle) => (
              <FleetCard key={vehicle.name} vehicle={vehicle} onChoose={handleVehiclePick} />
            ))}
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
          <div className="glass-panel rounded-[2.3rem] p-8 sm:p-10">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.34em] text-[var(--accent)]">
                Client notes
              </p>
              <h2 className="mt-4 font-display text-5xl text-white">
                A more composed ride changes the whole day.
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-[1.7rem] border border-white/8 bg-white/4 p-6"
                >
                  <p className="font-display text-4xl text-[var(--accent)]">“</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{item.quote}</p>
                  <p className="mt-5 text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/42">
                    {item.role}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-white/8 px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.34em] text-[var(--accent)]">
              Contact
            </p>
            <h2 className="mt-4 font-display text-5xl text-white">
              Reserve the next ride with confidence.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/66">
              This first version now behaves like a real booking experience on the
              frontend, with instant estimates and validation. The next layer can add
              Stripe, email confirmations, and a bookings dashboard.
            </p>
          </div>

          <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/44">
                Concierge line
              </p>
              <a href="tel:+15550000000" className="mt-3 block text-lg text-white">
                (555) 000-0000
              </a>
            </div>
            <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/44">
                Email
              </p>
              <a
                href="mailto:bookings@anytimeanywhere.com"
                className="mt-3 block text-lg text-white"
              >
                bookings@anytimeanywhere.com
              </a>
            </div>
            <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.24em] text-white/44">
                Availability
              </p>
              <p className="mt-3 text-lg text-white">
                24/7 by reservation for airport, corporate, and event travel.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
