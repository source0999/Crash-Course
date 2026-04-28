"use client";

// ─────────────────────────────────────────
// SECTION: VisitUsSection
// WHAT: Shared "Find Us" section — map embed, address, hours grid, luxury ping animation.
// WHY: Client component so Framer Motion ping ring animates over the map on mount; scroll reveal wraps in page.tsx.
//   Ping uses scale + opacity only (compositor-only, no repaints). Map is lazy-loaded.
// PHASE 4: Hours data is hardcoded. Could be moved to site_config table.
// ─────────────────────────────────────────

import { motion, useReducedMotion } from "framer-motion";

export default function VisitUsSection() {
  const reduced = useReducedMotion();

  const embedSrc =
    "https://maps.google.com/maps?q=4090+Johns+Creek+Pkwy+%23+E,+Suwanee,+GA+30024&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section data-home-band="visit" className="relative z-20 px-6 py-24 text-theme-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Map container with luxury ping ring ── */}
          <div
            className="relative w-full aspect-video lg:aspect-square rounded-3xl overflow-hidden"
            style={{
              border: "1px solid color-mix(in srgb, var(--theme-4) 22%, transparent)",
              boxShadow: "0 20px 60px color-mix(in srgb, var(--theme-4) 12%, transparent)",
            }}
          >
            {/* WHY: Lazy-loaded map keeps LCP clean — only loads when scrolled into view. */}
            <iframe
              src={embedSrc}
              width="100%"
              height="100%"
              style={{
                border: 0,
                minHeight: "400px",
                filter: "invert(100%) hue-rotate(180deg) brightness(85%) contrast(115%)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Fades and Facials location"
            />
            {/* Bottom vignette overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 70%, color-mix(in srgb, var(--theme-1) 35%, transparent) 100%)",
              }}
            />
            {/* WHY: Luxury ping ring — scale + opacity only so it stays on the compositor
                layer. Signals "live location" without distracting from the map content. */}
            <motion.div
              className="absolute inset-[-1px] rounded-3xl pointer-events-none"
              style={{ border: "2px solid var(--theme-5)" }}
              animate={reduced ? {} : {
                scale:   [1, 1.025, 1],
                opacity: [0.55, 0.1, 0.55],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop",
              }}
            />
          </div>

          {/* ── Address + hours ── */}
          <div style={{ fontFamily: "'Manrope', sans-serif" }}>
            <p
              className="uppercase tracking-[0.3em] text-xs mb-3"
              style={{ color: "color-mix(in srgb, var(--theme-4) 65%, transparent)", fontFamily: "'Manrope', sans-serif" }}
            >
              Find Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "var(--theme-4)" }}
            >
              Visit Us
            </h2>
            <p className="text-sm tracking-widest uppercase font-medium mb-1" style={{ color: "var(--theme-4)" }}>
              Shops at Johns Creek
            </p>
            <p className="text-sm tracking-widest uppercase" style={{ color: "color-mix(in srgb, var(--theme-4) 78%, transparent)" }}>
              4090 Johns Creek Pkwy # E
            </p>
            <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "color-mix(in srgb, var(--theme-4) 78%, transparent)" }}>
              Suwanee, GA 30024
            </p>
            <a
              href="https://maps.google.com/?q=4090+Johns+Creek+Pkwy+E+Suwanee+GA+30024"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 text-xs uppercase tracking-widest transition-opacity hover:opacity-70 touch-manipulation min-h-[44px]"
              style={{ color: "var(--theme-4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Get Directions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div className="mt-8 grid grid-cols-2 gap-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {[
                { day: "Mon – Tue", hours: "Closed" },
                { day: "Wed – Fri", hours: "10am – 7pm" },
                { day: "Saturday", hours: "9am – 6pm" },
                { day: "Sunday",   hours: "11am – 4pm" },
              ].map(({ day, hours }) => (
                <div
                  key={day}
                  className="rounded-2xl p-4"
                  style={{
                    background: "color-mix(in srgb, var(--theme-4) 6%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--theme-4) 18%, transparent)",
                  }}
                >
                  <p
                    className="text-sm uppercase tracking-widest mb-1"
                    style={{ color: "color-mix(in srgb, var(--theme-4) 65%, transparent)" }}
                  >
                    {day}
                  </p>
                  <p
                    className="text-sm font-medium uppercase tracking-widest"
                    style={{
                      color:
                        hours === "Closed"
                          ? "color-mix(in srgb, var(--theme-4) 45%, transparent)"
                          : "var(--theme-4)",
                    }}
                  >
                    {hours}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
