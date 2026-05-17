"use client";

import { useState } from "react";

const fieldClassName =
  "w-full rounded-[1.2rem] border border-white/10 bg-black/55 px-4 py-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--accent)]";

const serviceOptions = [
  "Nationwide Airport Transfers",
  "Executive & Corporate Travel",
  "Long-Distance Private Travel",
  "Event & VIP Transportation",
  "Hourly Chauffeur Service",
  "Maine Private Touring Packages",
  "General Inquiry",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "General Inquiry",
  message: "",
};

export default function ContactForm({ initialService = "General Inquiry" }) {
  const resolvedInitialService = serviceOptions.includes(initialService)
    ? initialService
    : initialForm.service;
  const [form, setForm] = useState(() => ({
    ...initialForm,
    service: resolvedInitialService,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({ type: "", message: "" });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitState({ type: "", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "We could not send your inquiry right now.",
        );
      }

      setForm({
        ...initialForm,
        service: resolvedInitialService,
      });
      setSubmitState({
        type: "success",
        message:
          data.message ||
          "Your inquiry has been sent. Autovise Black Car will follow up shortly.",
      });
    } catch (error) {
      setSubmitState({
        type: "error",
        message:
          error.message || "We could not send your inquiry right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className="glass-panel soft-lift rounded-[1.5rem] p-5 sm:p-7"
    >
      <p className="lux-section-label !mb-0 text-[0.7rem]">Contact form</p>
      <h2 className="mt-4 font-display text-[1.7rem] leading-none text-white sm:text-[2.1rem]">
        Send your trip request
      </h2>
      <p className="mt-4 text-sm leading-7 text-white/64">
        Use this form for booking questions, custom requests, partnership
        inquiries, or anything that needs a direct response from the Autovise
        team.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-white/72">Full name</span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            required
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/72">Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            required
            className={fieldClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-white/72">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            className={fieldClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-white/72">Service</span>
          <select
            value={form.service}
            onChange={(event) => updateField("service", event.target.value)}
            className={fieldClassName}
          >
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-white/72">Message</span>
          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            required
            rows={6}
            className={`${fieldClassName} resize-y`}
          />
        </label>
      </div>

      {submitState.message ? (
        <p
          className={`mt-5 text-sm ${
            submitState.type === "success"
              ? "text-[var(--accent-strong)]"
              : "text-amber-200"
          }`}
        >
          {submitState.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="lux-button mt-6 inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
