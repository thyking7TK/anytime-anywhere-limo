import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RatesPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

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
            <p className="lux-section-label">Pricing</p>
            <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Clear pricing, confirmed before the ride begins.
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
              Airport transfers, executive bookings, long-distance travel, and VIP transportation are quoted clearly so clients know what to expect before the trip is confirmed.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article className="glass-panel soft-lift rounded-[1.4rem] p-6 sm:p-7">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Airport Transfers</p>
                <h3 className="mt-4 font-display text-[1.7rem] leading-tight text-white sm:text-[1.8rem]">Major Airports</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>Boston Logan (BOS)</span>
                    <span className="font-semibold text-white">Flat-rate quote</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>JFK & LaGuardia</span>
                    <span className="font-semibold text-white">Coordinated pickup</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 border-t border-white/8 pt-3">
                    <span>Nationwide airports</span>
                    <span className="font-semibold text-white">By request</span>
                  </div>
                </div>
              </article>

              <article className="glass-panel soft-lift rounded-[1.4rem] p-6 sm:p-7">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Executive & Hourly</p>
                <h3 className="mt-4 font-display text-[1.7rem] leading-tight text-white sm:text-[1.8rem]">On Your Schedule</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>Corporate travel</span>
                    <span className="font-semibold text-white">Quoted upfront</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>Hourly chauffeur</span>
                    <span className="font-semibold text-white">$110/hr starting</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 border-t border-white/8 pt-3">
                    <span>Dedicated support</span>
                    <span className="font-semibold text-white">Multi-stop ready</span>
                  </div>
                </div>
              </article>

              <article className="glass-panel soft-lift rounded-[1.4rem] p-6 sm:col-span-2 sm:p-7 lg:col-span-1">
                <p className="lux-section-label !mb-0 text-[0.7rem]">Long-Distance & VIP</p>
                <h3 className="mt-4 font-display text-[1.7rem] leading-tight text-white sm:text-[1.8rem]">Custom Itineraries</h3>
                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm text-white/68">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>State-line travel</span>
                    <span className="font-semibold text-white">Door to door</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span>Events & VIP rides</span>
                    <span className="font-semibold text-white">Custom quote</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 border-t border-white/8 pt-3">
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
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
