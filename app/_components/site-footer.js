import Image from "next/image";

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.5 11.5c0 .3-.07.6-.22.88-.14.28-.34.54-.6.76-.42.37-.88.55-1.36.55-.34 0-.7-.08-1.1-.25-.38-.17-.77-.4-1.14-.7a18.4 18.4 0 0 1-1.1-1.02 18.1 18.1 0 0 1-1.01-1.1c-.3-.37-.52-.75-.68-1.12-.17-.38-.25-.74-.25-1.08 0-.33.07-.64.2-.93.14-.28.34-.54.62-.77.32-.26.67-.39 1.04-.39.14 0 .29.03.42.09.14.06.26.16.36.3l1.23 1.74c.1.13.17.26.22.38.05.12.08.23.08.33 0 .13-.04.26-.11.39-.07.12-.17.25-.3.37l-.4.42c-.06.06-.09.13-.09.21 0 .04.01.08.02.12.02.04.04.08.06.11.12.22.33.5.6.84.29.34.6.68.92 1.01.33.32.65.6.98.82.03.02.07.04.1.05.04.02.08.02.12.02.09 0 .16-.03.22-.1l.4-.4c.13-.13.26-.23.38-.3.13-.07.25-.1.39-.1.1 0 .2.02.33.07.12.05.25.12.38.22l1.76 1.25c.14.1.24.22.3.36.05.14.08.28.08.43Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Zm1.02 0 4.98 3.98 4.98-3.98H3.02Zm9.48 1.28L8.31 8.08a.5.5 0 0 1-.62 0L3.5 4.78v7.72a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V4.78Z" />
    </svg>
  );
}

export default function SiteFooter({ siteContent }) {
  const brandContent = siteContent?.brand ?? {};
  const footerContent = siteContent?.footer ?? {};
  const contactSection = siteContent?.contactSection ?? {};

  const phone = contactSection.phoneValue || "+1 (207) 880-3733";
  const email = contactSection.emailValue || "booking@autoviseblackcar.com";
  const phoneHref = `tel:${String(phone).replace(/[^+\d]/g, "")}`;
  const emailHref = `mailto:${email}`;

  return (
    <footer className="border-t border-[rgba(200,168,112,0.12)] px-5 pb-24 pt-8 sm:pb-28 md:pb-16 md:pt-10">
      <div className="limo-container">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                aria-hidden="true"
                width={356}
                height={257}
                className="h-10 w-auto"
              />
              <div>
                <p className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-white/90">
                  {brandContent.name}
                </p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.32em] text-[var(--accent)]">
                  {brandContent.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61570751940730"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Autovise Black Car on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-[var(--accent)] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/autoviseblackcar/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Autovise Black Car on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-[var(--accent)] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://x.com/Autoviseblkcar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Autovise Black Car on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-[var(--accent)] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <span className="text-[var(--accent)]">
                <PhoneIcon />
              </span>
              {phone}
            </a>
            <a
              href={emailHref}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <span className="text-[var(--accent)]">
                <MailIcon />
              </span>
              {email}
            </a>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/6 pt-4 text-sm text-white/40 lg:flex-row lg:items-center lg:justify-between">
          <p>{footerContent.legal}</p>
          {footerContent.description ? <p>{footerContent.description}</p> : null}
        </div>
      </div>
    </footer>
  );
}
