import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";


export const revalidate = 300;

export const metadata = {
  title: "Service Coverage",
  description:
    "Autovise Black Car operates primarily across Maine, Massachusetts, and New York — and provides luxury transportation nationwide by request. Airport transfers, executive travel, and long-distance service throughout the East Coast and beyond.",
  keywords: [
    "black car service Maine",
    "black car service Massachusetts",
    "black car service New York",
    "Boston luxury transportation",
    "Portland Maine car service",
    "nationwide black car service",
    "East Coast chauffeur",
    "luxury transportation coverage",
    "private car service East Coast",
  ],
  alternates: { canonical: "https://autoviseblackcar.com/coverage" },
  openGraph: {
    title: "Service Coverage | Autovise Black Car",
    description:
      "Primary operations across Maine, Massachusetts, and New York. Nationwide transportation available by request.",
    url: "https://autoviseblackcar.com/coverage",
  },
  twitter: {
    title: "Service Coverage | Autovise Black Car",
    description:
      "Primary operations across Maine, Massachusetts, and New York. Nationwide transportation available by request.",
  },
};

const coverageAreas = [
  {
    name: "Maine",
    detail:
      "Primary operations for airport transfers, executive travel, and long-distance private transportation.",
  },
  {
    name: "Massachusetts",
    detail:
      "Strong Boston-area coverage including Logan transfers, corporate bookings, and private black car service.",
  },
  {
    name: "New York",
    detail:
      "Executive travel, airport service, and long-distance transportation throughout New York by request.",
  },
];

export default async function CoveragePage() {
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
            <p className="lux-section-label">Our Coverage</p>
            <h1 className="max-w-[820px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Nationwide service with primary operations across the East Coast.
            </h1>
            <p className="mt-5 max-w-[760px] text-lg leading-8 text-white/66">
              We proudly provide transportation services across the United States, with primary operations in Maine, Massachusetts, and New York.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {coverageAreas.map((area) => (
                <article key={area.name} className="glass-panel soft-lift rounded-[1.4rem] p-7">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">Primary Operations</p>
                  <h3 className="mt-4 font-display text-[1.9rem] leading-tight text-white">{area.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/64">{area.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-[1.2rem] border border-[var(--line-strong)] bg-white/3 px-5 py-4 text-sm text-white/68">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span>Nationwide service available by request.</span>
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
