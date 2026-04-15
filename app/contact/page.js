import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import SiteFooter from "@/app/_components/site-footer";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactPage() {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);

  const contactSection = siteContent.contactSection ?? {};

  const resolvedContactPhone = String(contactSection.phoneValue ?? "").trim() || "+1 (207) 880-3733";
  const resolvedContactEmail =
    String(contactSection.emailValue ?? "").trim().toLowerCase() === "book@autovise.com" ||
    !String(contactSection.emailValue ?? "").trim()
      ? "booking@autoviseblackcar.com"
      : String(contactSection.emailValue ?? "").trim();
  const contactPhoneHref = `tel:${resolvedContactPhone.replace(/[^+\d]/g, "")}`;
  const contactEmailHref = `mailto:${resolvedContactEmail}`;

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
            <p className="lux-section-label">{contactSection.label || "Contact"}</p>
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                  {contactSection.title || "Ready to book your ride?"}
                </h1>
                <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
                  {contactSection.description || "Reach out via phone, email, or use the booking form and we'll confirm your reservation with clear pricing before the trip begins."}
                </p>

                <p className="mt-6 text-sm text-white/40">
                  Free cancellation up to 24 hours before pickup. Wait time billed at $40/hr. Extra stops $25–$50.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/#booking"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)]"
                  >
                    {contactSection.primaryButtonLabel || "Reserve Now"}
                  </Link>
                  <a
                    href={contactEmailHref}
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                  >
                    {contactSection.secondaryButtonLabel || "Email Us"}
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.phoneLabel || "Phone"}</p>
                  <a
                    href={contactPhoneHref}
                    className="mt-4 block font-display text-[1.9rem] leading-tight text-white"
                  >
                    {resolvedContactPhone}
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.emailLabel || "Email"}</p>
                  <a
                    href={contactEmailHref}
                    className="mt-4 block break-all font-display text-[1.9rem] leading-tight text-white"
                  >
                    {resolvedContactEmail}
                  </a>
                </article>

                <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
                  <p className="lux-section-label !mb-0 text-[0.7rem]">{contactSection.availabilityLabel || "Availability"}</p>
                  <p className="mt-4 font-display text-[1.9rem] leading-tight text-white">
                    {contactSection.availabilityValue || "24/7, 365 days"}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={resolvedContactPhone}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
