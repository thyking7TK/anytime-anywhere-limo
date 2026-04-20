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

          {/* Social links */}
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61570751940730"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Autovise Black Car on Facebook"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/4 text-white/60 hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/autoviseblackcar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Autovise Black Car on Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/4 text-white/60 hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>

          {/* Contact details */}
          <div className="mt-3 flex flex-col gap-2">
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
