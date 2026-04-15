import AnytimeAnywhereLimoWebsite from "./_components/anytime-anywhere-limo-website";
import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import SiteFloatingActions from "./_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
