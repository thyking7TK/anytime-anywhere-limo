import AnytimeAnywhereLimoWebsite from "./_components/anytime-anywhere-limo-website";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [catalog, siteContent] = await Promise.all([
    getCatalog(),
    getSiteContent(),
  ]);

  return (
    <AnytimeAnywhereLimoWebsite
      initialCatalog={catalog}
      initialSiteContent={siteContent}
    />
  );
}
