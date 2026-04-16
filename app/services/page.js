import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import ScrollReveal from "@/app/_components/scroll-reveal";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";
import { services as defaultServices } from "@/lib/booking";


export const revalidate = 300;

export const metadata = {
  title: "Our Services",
  description:
    "Autovise Black Car offers nationwide airport transfers, executive and corporate travel, long-distance private transportation, event and VIP service, and hourly chauffeur bookings. Premium black car for every journey.",
  keywords: [
    "airport transfer service",
    "executive car service",
    "corporate transportation",
    "VIP black car service",
    "long distance chauffeur",
    "hourly car service",
    "private car service",
    "black car for events",
    "luxury transportation services",
  ],
  alternates: { canonical: "https://autoviseblackcar.com/services" },
  openGraph: {
    title: "Our Services | Autovise Black Car",
    description:
      "Airport transfers, executive travel, long-distance rides, VIP service, and hourly chauffeur bookings — nationwide black car service.",
    url: "https://autoviseblackcar.com/services",
  },
  twitter: {
    title: "Our Services | Autovise Black Car",
    description:
      "Airport transfers, executive travel, long-distance rides, VIP service, and hourly chauffeur bookings.",
  },
};

export default async function ServicesPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

  const servicesSection = siteContent.servicesSection ?? {};
  const serviceEntries = Array.isArray(siteContent.services)
    ? siteContent.services
    : defaultServices;

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
        <div className="absolute inset-0 opacity-[0.028]" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)"}} />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
      </div>

      <SiteHeader siteContent={siteContent} />

      <main className="relative z-10">
        <section className="px-4 py-16 md:py-20 lg:py-24 sm:px-5">
          <div className="limo-container">
            <p className="lux-section-label">{servicesSection.label || "Our Services"}</p>
            <h1 className="max-w-[820px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              {servicesSection.title || "Premium transportation for every journey."}
            </h1>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              {servicesSection.description || "From airport transfers to executive travel and VIP events, Autovise delivers a premium experience at every mile."}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {serviceEntries.map((service) => (
                <article key={service.id} className="glass-panel fade-in soft-lift rounded-[1.4rem] p-6 sm:p-7">
                  <p className="lux-section-label">{service.eyebrow}</p>
                  <h3 className="mt-4 font-display text-[1.8rem] leading-none text-white md:text-[2.25rem]">{service.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/68">{service.text}</p>
                  <Link href="/#booking" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:gap-4 transition-all">
                    Reserve this service <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
      <ScrollReveal />
    </div>
  );
}
