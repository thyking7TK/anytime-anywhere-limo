"use client";

import { useState } from "react";

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

export default function FaqAccordion() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
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
  );
}
