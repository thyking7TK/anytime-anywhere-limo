import Image from "next/image";

export default function SiteFooter({ siteContent }) {
  const brandContent = siteContent?.brand ?? {};
  const footerContent = siteContent?.footer ?? {};
  const contactSection = siteContent?.contactSection ?? {};

  const phone = contactSection.phoneValue || "+1 (207) 880-3733";
  const email = contactSection.emailValue || "booking@autoviseblackcar.com";

  return (
    <footer className="border-t border-[rgba(200,168,112,0.12)] px-5 pb-28 pt-10 md:pb-16">
      <div className="limo-container">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt=""
              aria-hidden="true"
              width={356}
              height={257}
              className="h-10 w-auto"
            />
            <p className="font-display text-[1.6rem] leading-none tracking-[-0.02em] text-white/90">
              {brandContent.name}
            </p>
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--accent)]">
            {brandContent.subtitle}
          </p>

          {/* Contact details */}
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="text-[var(--accent)]">📞</span>
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="text-[var(--accent)]">✉</span>
              {email}
            </a>
          </div>
        </div>
        <div className="border-t border-white/6 pt-7 flex flex-col gap-3 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>{footerContent.legal}</p>
          {footerContent.description ? <p>{footerContent.description}</p> : null}
        </div>
      </div>
    </footer>
  );
}
