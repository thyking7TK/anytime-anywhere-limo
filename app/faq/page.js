import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";
import FaqAccordion from "./faq-accordion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Autovise Black Car — flight tracking, booking process, service areas, pricing, cancellation policy, long-distance travel, and VIP event transportation.",
  keywords: [
    "black car service FAQ",
    "chauffeur service questions",
    "airport transfer FAQ",
    "black car booking questions",
    "luxury transportation FAQ",
    "limo service cancellation policy",
    "does black car track flights",
    "how to book private car service",
  ],
  alternates: { canonical: "https://autoviseblackcar.com/faq" },
  openGraph: {
    title: "FAQ | Autovise Black Car",
    description:
      "Common questions about booking, pricing, coverage, flight tracking, and cancellation answered.",
    url: "https://autoviseblackcar.com/faq",
  },
  twitter: {
    title: "FAQ | Autovise Black Car",
    description:
      "Common questions about booking, pricing, coverage, flight tracking, and cancellation answered.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you track my flight?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Flight tracking is part of the airport transfer experience, including pickups for Boston Logan, JFK, LaGuardia, and other major airports.",
      },
    },
    {
      "@type": "Question",
      name: "What types of transportation do you offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Autovise Black Car handles nationwide airport transfers, executive and corporate travel, long-distance private rides, event and VIP transportation, and hourly chauffeur service.",
      },
    },
    {
      "@type": "Question",
      name: "Where are your primary operations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Autovise is based on the East Coast with primary operations across Maine, Massachusetts, and New York.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide nationwide service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. While the company is East Coast based, transportation services can be coordinated and provided nationwide by request.",
      },
    },
    {
      "@type": "Question",
      name: "How is pricing handled?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Quotes are provided before the ride begins. Airport, executive, long-distance, and VIP transportation are all confirmed with clear pricing and service details.",
      },
    },
    {
      "@type": "Question",
      name: "Can I book long-distance private travel across state lines?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Long-distance private transportation is one of the core services, with comfortable door-to-door rides across state lines and custom itinerary support.",
      },
    },
    {
      "@type": "Question",
      name: "Are you available for weddings and private events?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Event and VIP transportation is available for weddings, private events, and high-end clientele who want a polished arrival and departure.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the booking form on the site for a request, or call concierge directly at +1 (207) 880-3733 for immediate help.",
      },
    },
  ],
};

export default async function FaqPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
        <div className="absolute inset-0 opacity-[0.028]" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)"}} />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
      </div>

      <SiteHeader siteContent={siteContent} />

      <main className="relative z-10">
        <section className="px-4 py-16 md:py-20 lg:py-24 sm:px-5">
          <div className="limo-container">
            <p className="lux-section-label">FAQ</p>
            <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Common questions answered.
            </h1>

            <FaqAccordion />
          </div>
        </section>
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
