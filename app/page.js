import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import SiteFloatingActions from "./_components/site-floating-actions";
// Lazy client wrapper — defers the entire booking-form JS bundle out of the
// critical path without breaking Server Component rules (ssr:false is only
// allowed inside a "use client" file, which booking-panel-lazy.js is).
import BookingPanelLazy from "./_components/booking-panel-lazy";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

// ISR: serve a cached page, regenerate in the background every 60 s.
// Eliminates per-request DB latency on every visitor.
export const revalidate = 60;

export const metadata = {
  title: "Autovise Black Car | Book Nationwide Luxury Transportation",
  description:
    "Book premium black car service across the United States. Airport transfers to Boston Logan, JFK & LaGuardia, executive corporate travel, long-distance private rides, VIP transportation, and hourly chauffeur service. East Coast based — nationwide available.",
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

/**
 * HeroStatCard — pure server HTML, rendered at build/revalidate time.
 *
 * Intentionally NO "fade-in" class:
 *   fade-in starts at opacity:0 and relies on a client-side IntersectionObserver
 *   to add "in-view". Since this component is server-rendered and the observer
 *   lives inside the deferred booking bundle (ssr:false), the cards would stay
 *   invisible until the booking JS loads — blocking FCP perception.
 *   Instead they are always visible: layout-stable, zero JS dependency.
 */
function HeroStatCard({ item }) {
  return (
    <article className="glass-panel soft-lift relative flex min-h-[210px] flex-col overflow-hidden rounded-[1.2rem] p-5 md:min-h-[230px] md:p-6 lg:min-h-[250px]">
      <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-[1.2rem] border-r border-t border-[rgba(200,168,112,0.4)]" />
      <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-[1.2rem] border-b border-l border-[rgba(200,168,112,0.2)]" />
      <p className="max-w-full font-display text-[2.35rem] leading-[0.92] text-white sm:text-[2.8rem] md:text-[3.4rem]">
        {item.value}
      </p>
      <p className="mt-4 max-w-[30ch] text-sm leading-7 text-white/66 md:text-[1rem]">
        {item.text}
      </p>
    </article>
  );
}

export default async function Home() {
  const [catalog, siteContent] = await Promise.all([
    getCatalog(),
    getSiteContent(),
  ]);

  const heroContent = siteContent.hero ?? {};
  const heroStats = Array.isArray(siteContent.heroStats)
    ? siteContent.heroStats
    : [];

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <SiteHeader siteContent={siteContent} />

      {/*
        RENDERING STRATEGY
        ──────────────────
        Left column  → 100 % server HTML. The h1 (LCP element), description,
                        and CTA links are in the initial HTML response. Zero JS
                        required before they paint.

        Right column → BookingPanelLazy (ssr:false). The entire booking-form
                        bundle is excluded from the critical JS payload. React
                        mounts it after first paint in the background.
                        A shape-matching skeleton is shown in the meantime so
                        layout is stable (no CLS).
      */}
      <main id="top">
        <div className="relative overflow-hidden">
          {/* Decorative background — CSS only, no JS */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
            <div
              className="absolute inset-0 opacity-[0.028]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,168,112,0.3)] to-transparent" />
            <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
            <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.04),transparent_65%)]" />
          </div>

          <section className="relative z-10 px-4 pb-8 pt-6 sm:px-5 md:pb-12 md:pt-10">
            <div className="limo-container grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">

              {/* ── Left column: hero — pure server HTML ── */}
              <div className="py-4 md:py-10">
                <div className="lux-eyebrow">{heroContent.eyebrow}</div>
                <p className="mt-6 text-[0.92rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                  {heroContent.kicker}
                </p>
                {/* h1 is the LCP candidate — server-rendered, no JS gate */}
                <h1 className="mt-7 max-w-[820px] font-display text-[2rem] leading-[1] tracking-[-0.03em] text-white sm:text-[2.8rem] md:text-[3.8rem] lg:text-[4.6rem] xl:text-[5.4rem]">
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
                    href="/services"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                  >
                    {heroContent.secondaryButtonLabel}
                  </a>
                </div>

                {/* Stat cards — server HTML, always visible (no fade-in / opacity:0) */}
                <div className="mt-8 grid max-w-[920px] grid-cols-1 gap-4 sm:grid-cols-2">
                  {heroStats.map((item, index) => (
                    <HeroStatCard key={`${item.value}-${index}`} item={item} />
                  ))}
                </div>
              </div>

              {/* ── Right column: booking form — deferred, ssr:false ── */}
              <BookingPanelLazy
                initialCatalog={catalog}
                initialSiteContent={siteContent}
              />
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
