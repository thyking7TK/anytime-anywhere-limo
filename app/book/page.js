import BookingPanelLazy from "../_components/booking-panel-lazy";
import SiteFloatingActions from "../_components/site-floating-actions";
import SiteFooter from "../_components/site-footer";
import SiteHeader from "../_components/site-header";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 60;

export const metadata = {
  title: "Book Now",
  description:
    "Reserve black car service or request a Maine private touring package with Autovise Black Car.",
  alternates: { canonical: "https://autoviseblackcar.com/book" },
  openGraph: {
    title: "Book Now | Autovise Black Car",
    description:
      "Reserve black car service or request a Maine private touring package with Autovise Black Car.",
    url: "https://autoviseblackcar.com/book",
  },
  twitter: {
    title: "Book Now | Autovise Black Car",
    description:
      "Reserve black car service or request a Maine private touring package with Autovise Black Car.",
  },
};

export default async function BookPage() {
  const [catalog, siteContent] = await Promise.all([
    getCatalog(),
    getSiteContent(),
  ]);

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

      <main className="relative z-10 px-3 py-16 sm:px-5 md:py-20 lg:py-24">
        <div className="limo-container">
          <div id="book-now" className="mx-auto w-full max-w-none lg:max-w-[980px]">
            <BookingPanelLazy
              initialCatalog={catalog}
              initialSiteContent={siteContent}
            />
          </div>
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
