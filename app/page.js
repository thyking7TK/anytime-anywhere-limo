import AnytimeAnywhereLimoWebsite from "./_components/anytime-anywhere-limo-website";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();

  return <AnytimeAnywhereLimoWebsite initialCatalog={catalog} />;
}
