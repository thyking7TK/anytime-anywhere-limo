import AnytimeAnywhereLimoWebsite from "./_components/anytime-anywhere-limo-website";
import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import SiteFloatingActions from "./_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Home() {
  const [catalog, siteContent] = await Promise.all([
    getCatalog(),
    getSiteContent(),
  ]);

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <SiteHeader siteContent={siteContent} />
      <AnytimeAnywhereLimoWebsite
        initialCatalog={catalog}
        initialSiteContent={siteContent}
      />
      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
