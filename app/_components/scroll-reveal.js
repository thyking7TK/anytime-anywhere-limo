"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — drop this anywhere to activate fade-in cards on the page.
 *
 * Any element with className="fade-in" starts at opacity:0 (defined in
 * globals.css). This component sets up an IntersectionObserver that adds
 * the "in-view" class when the element enters the viewport, triggering
 * the CSS transition to opacity:1 + translateY(0).
 *
 * Renders nothing to the DOM — pure side-effect component.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in:not(.in-view)");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
