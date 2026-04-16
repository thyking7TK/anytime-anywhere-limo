import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";
import { testimonials as defaultTestimonials } from "@/lib/booking";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Client Reviews",
  description:
    "Read what passengers say about Autovise Black Car. Real reviews from clients who've experienced our airport transfers, executive travel, long-distance rides, and VIP transportation across Maine, Massachusetts, New York, and nationwide.",
  keywords: [
    "black car service reviews",
    "luxury transportation testimonials",
    "chauffeur service reviews",
    "Autovise Black Car reviews",
    "private car service testimonials",
    "airport transfer reviews",
    "executive car reviews",
  ],
  alternates: { canonical: "https://autoviseblackcar.com/reviews" },
  openGraph: {
    title: "Client Reviews | Autovise Black Car",
    description:
      "Real passenger reviews on airport transfers, executive travel, long-distance rides, and VIP transportation.",
    url: "https://autoviseblackcar.com/reviews",
  },
  twitter: {
    title: "Client Reviews | Autovise Black Car",
    description:
      "Real passenger reviews on airport transfers, executive travel, long-distance rides, and VIP transportation.",
  },
};

export default async function ReviewsPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

  const reviewsSection = siteContent.reviewsSection ?? {};
  const testimonialEntries = Array.isArray(siteContent.testimonials)
    ? siteContent.testimonials
    : defaultTestimonials;

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
            <div className="glass-panel rounded-[1.4rem] p-7 md:p-10">
              <p className="lux-section-label">{reviewsSection.label || "Client Reviews"}</p>
              <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                {reviewsSection.title || "What our clients say."}
              </h1>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {testimonialEntries.map((item, index) => (
                  <article
                    key={`${item.name}-${index}`}
                    className="glass-panel soft-lift rounded-[1.4rem] p-7"
                  >
                    <div className="flex items-center gap-0.5 mb-4">
                      {[1,2,3,4,5].map((star) => (
                        <svg key={star} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 1L8.63 4.94L13 5.27L9.77 8.03L10.85 12.27L7 9.9L3.15 12.27L4.23 8.03L1 5.27L5.37 4.94L7 1Z" fill="var(--accent)" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-white/70">{item.quote}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border border-[var(--line-strong)] bg-white/6 flex items-center justify-center text-xs font-semibold text-[var(--accent)]">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
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
