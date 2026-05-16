import MaineToursShowcase from "../_components/maine-tours-showcase";
import SiteFloatingActions from "../_components/site-floating-actions";
import SiteFooter from "../_components/site-footer";
import SiteHeader from "../_components/site-header";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 300;

export const metadata = {
  title: "Maine Private Touring Packages",
  description:
    "Explore Maine private touring packages from Autovise Black Car with curated chauffeur-led routes, coastal stops, and premium private travel experiences.",
  alternates: {
    canonical: "https://autoviseblackcar.com/maine-touring-packages",
  },
  openGraph: {
    title: "Maine Private Touring Packages | Autovise Black Car",
    description:
      "Curated chauffeur-led Maine private touring packages with premium coastal routes and luxury transportation.",
    url: "https://autoviseblackcar.com/maine-touring-packages",
  },
  twitter: {
    title: "Maine Private Touring Packages | Autovise Black Car",
    description:
      "Curated chauffeur-led Maine private touring packages with premium coastal routes and luxury transportation.",
  },
};

export default async function MaineTouringPackagesPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)",
          }}
        />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
      </div>

      <SiteHeader siteContent={siteContent} />

      <main className="relative z-10 pt-6 md:pt-10">
        <MaineToursShowcase />
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={siteContent.contactSection?.phoneValue || "+1 (207) 880-3733"}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
