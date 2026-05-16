import Image from "next/image";

import SiteFloatingActions from "./_components/site-floating-actions";
import SiteFooter from "./_components/site-footer";
import SiteHeader from "./_components/site-header";
import { getCatalog } from "@/lib/catalog";
import { services as defaultServices } from "@/lib/catalog-shared";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 60;

export const metadata = {
  title: "Autovise Black Car | Book Nationwide Luxury Transportation",
  description:
    "Book premium black car service across the United States. Airport transfers to Boston Logan, JFK & LaGuardia, executive corporate travel, long-distance private rides, VIP transportation, and hourly chauffeur service. East Coast based - nationwide available.",
  keywords: [
    "book black car service",
    "luxury airport transfer",
    "private car service booking",
    "executive transportation",
    "chauffeur booking",
    "Boston Logan transfer",
    "JFK airport car service",
    "Maine black car",
    "Massachusetts luxury transportation",
    "nationwide private car service",
  ],
  alternates: { canonical: "https://autoviseblackcar.com" },
  openGraph: {
    title: "Autovise Black Car | Book Nationwide Luxury Transportation",
    description:
      "Airport transfers, executive travel, long-distance private rides, and VIP transportation. Transparent pricing. Available 24/7.",
    url: "https://autoviseblackcar.com",
  },
  twitter: {
    title: "Autovise Black Car | Book Nationwide Luxury Transportation",
    description:
      "Airport transfers, executive travel, long-distance private rides, and VIP transportation. Available 24/7.",
  },
};

function getServiceHref(service) {
  if (service.id === "maine-tours") {
    return "/maine-touring-packages";
  }

  if (["airport", "events", "hourly"].includes(service.id)) {
    return `/contact?service=${encodeURIComponent(service.title)}#contact-form`;
  }

  return "/book";
}

export default async function Home() {
  const [catalog, siteContent] = await Promise.all([
    getCatalog(),
    getSiteContent(),
  ]);

  const heroContent = siteContent.hero ?? {};
  const homeServiceEntries = (() => {
    const entries = Array.isArray(siteContent.services)
      ? [...siteContent.services]
      : [];

    defaultServices.forEach((service) => {
      if (!entries.some((item) => item.id === service.id)) {
        entries.push(service);
      }
    });

    return entries;
  })();

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <SiteHeader siteContent={siteContent} />
      <div className="h-16 sm:hidden" />

      <main id="top">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[320px] sm:h-[520px] md:h-[600px] lg:h-[680px]">
            <Image
              src="/hero-vehicle.jpg"
              alt=""
              aria-hidden="true"
              fill
              priority
              className="object-cover opacity-40"
              style={{ objectPosition: "center 35%" }}
            />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#05060a] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05060a] via-[rgba(5,6,10,0.85)] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#05060a] to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#05060a] to-transparent" />
          </div>

          <div className="pointer-events-none absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-[0.028]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,168,112,0.3)] to-transparent" />
            <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.04),transparent_65%)]" />
          </div>

          <section className="relative z-10 px-4 pb-8 pt-28 sm:px-5 sm:pt-6 md:pb-12 md:pt-10 [overflow-x:clip]">
            <div className="limo-container">
              <div className="mx-auto max-w-[980px] pt-4 text-center md:pt-10">
                <div className="hidden sm:block">
                  <div className="lux-eyebrow mx-auto">{heroContent.eyebrow}</div>
                </div>
                {heroContent.kicker ? (
                  <p className="mt-6 text-[0.92rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                    {heroContent.kicker}
                  </p>
                ) : null}
                <h1 className="mx-auto mt-7 max-w-[900px] font-display font-bold text-[2.2rem] leading-[1] tracking-[-0.03em] text-white sm:text-[2.9rem] md:text-[4rem] lg:text-[4.8rem] xl:text-[5.6rem]">
                  {heroContent.title}
                </h1>
                {heroContent.description ? (
                  <p className="mx-auto mt-7 max-w-[760px] text-lg leading-8 text-white/68 md:text-xl">
                    {heroContent.description}
                  </p>
                ) : null}

                <div className="mt-12">
                  <p className="text-base font-bold uppercase tracking-[0.36em] text-[var(--accent)] sm:text-lg">
                    Select your service
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-5 sm:flex-row">
                    <a
                      href="/book"
                      className="lux-button hero-service-button inline-flex min-h-16 items-center justify-center rounded-full bg-[var(--accent)] px-10 text-base font-bold text-[#0a0a0e] shadow-[0_18px_40px_rgba(210,176,107,0.24)] hover:bg-[var(--accent-dark)] sm:min-h-[4.5rem] sm:px-12 sm:text-lg"
                    >
                      Black Car Service
                    </a>
                    <a
                      href="/maine-touring-packages"
                      className="lux-button hero-service-button inline-flex min-h-16 items-center justify-center rounded-full border border-white/12 bg-white/3 px-10 text-base font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6 sm:min-h-[4.5rem] sm:px-12 sm:text-lg"
                      style={{ animationDelay: "0.35s" }}
                    >
                      Maine Private Touring Packages
                    </a>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-12 max-w-[980px] pb-8 lg:pb-10">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {homeServiceEntries.map((service) => (
                    <a
                      key={service.id}
                      href={getServiceHref(service)}
                      className="glass-panel soft-lift flex min-h-[92px] items-center gap-4 rounded-[1.2rem] px-5 py-4 transition hover:border-[rgba(200,168,112,0.3)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(200,168,112,0.24)] bg-[rgba(200,168,112,0.08)] text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                        {service.id === "maine-tours"
                          ? "ME"
                          : service.title
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                          {service.eyebrow}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-white sm:text-[0.98rem]">
                          {service.title}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
