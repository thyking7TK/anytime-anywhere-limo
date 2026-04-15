"use client";

import { useEffect, useState } from "react";

export default function SiteFloatingActions({ contactPhone, callLabel }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolvedPhone = contactPhone || "+1 (207) 880-3733";
  const resolvedLabel = callLabel || "Call Concierge";
  const contactPhoneHref = `tel:${resolvedPhone.replace(/[^+\d]/g, "")}`;

  return (
    <>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{ animation: showScrollTop ? "float-button 3s ease-in-out infinite" : "none" }}
        className={`fixed bottom-[26px] left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[#0a0a0e] shadow-[0_8px_32px_rgba(200,168,112,0.28),0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[var(--accent-dark)] sm:bottom-[28px] sm:left-6 ${showScrollTop ? "opacity-100 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <a
        href={contactPhoneHref}
        aria-label={`Call ${resolvedLabel}`}
        className="floating-call"
      >
        <span className="floating-icon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 11.5c0 .3-.07.6-.22.88-.14.28-.34.54-.6.76-.42.37-.88.55-1.36.55-.34 0-.7-.08-1.1-.25-.38-.17-.77-.4-1.14-.7a18.4 18.4 0 0 1-1.1-1.02 18.1 18.1 0 0 1-1.01-1.1c-.3-.37-.52-.75-.68-1.12-.17-.38-.25-.74-.25-1.08 0-.33.07-.64.2-.93.14-.28.34-.54.62-.77.32-.26.67-.39 1.04-.39.14 0 .29.03.42.09.14.06.26.16.36.3l1.23 1.74c.1.13.17.26.22.38.05.12.08.23.08.33 0 .13-.04.26-.11.39-.07.12-.17.25-.3.37l-.4.42c-.06.06-.09.13-.09.21 0 .04.01.08.02.12.02.04.04.08.06.11.12.22.33.5.6.84.29.34.6.68.92 1.01.33.32.65.6.98.82.03.02.07.04.1.05.04.02.08.02.12.02.09 0 .16-.03.22-.1l.4-.4c.13-.13.26-.23.38-.3.13-.07.25-.1.39-.1.1 0 .2.02.33.07.12.05.25.12.38.22l1.76 1.25c.14.1.24.22.3.36.05.14.08.28.08.43Z" fill="currentColor"/>
          </svg>
        </span>
        <span className="hidden sm:inline">{resolvedLabel}</span>
        <span className="sm:hidden">Call</span>
      </a>
    </>
  );
}
