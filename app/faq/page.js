import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";
import FaqAccordion from "./faq-accordion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FaqPage() {
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
            <p className="lux-section-label">FAQ</p>
            <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
              Common questions answered.
            </h1>

            <FaqAccordion />
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
