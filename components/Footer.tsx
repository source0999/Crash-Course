"use client";

/** @file components/Footer.tsx */

// ─────────────────────────────────────────
// SECTION: Footer
// WHAT: `.site-footer` bar + inherited light/dark fg (earth/neon inversion in globals.css).
// WHY: Client bar; Footer links omit touchEnd preventDefault so iOS forwards click to SPA/external nav.
// PHASE 4: Static content.
// ─────────────────────────────────────────

import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/book", label: "Book Now" },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer">
      <div
        aria-hidden="true"
        className="h-[5px] w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--theme-5) 0px, var(--theme-5) 18px, color-mix(in srgb, var(--theme-3) 45%, transparent) 18px, color-mix(in srgb, var(--theme-3) 45%, transparent) 36px)",
          backgroundSize: "72px 100%",
          animation: "barber-pole-h 5.2s linear infinite",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Fades &amp; Facials
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.32em] mb-8 opacity-90"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Luxury Grooming · Suwanee, GA
            </p>

            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="w-2 h-11 rounded-full shrink-0 overflow-hidden"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, var(--theme-5) 0px, var(--theme-5) 8px, color-mix(in srgb, currentColor 22%, transparent) 8px, color-mix(in srgb, currentColor 22%, transparent) 16px)",
                  backgroundSize: "100% 36px",
                  animation: "barber-pole 3.8s linear infinite",
                }}
              />
              <p
                className="text-sm leading-relaxed max-w-[240px] font-light opacity-95"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Premium grooming, every visit. Where craft meets luxury.
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-6"
              style={{ fontFamily: "var(--font-sans)", color: "var(--theme-5)" }}
            >
              Navigate
            </p>
            <nav className="flex flex-col gap-0">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm py-2.5 transition-opacity duration-200 hover:opacity-80 touch-manipulation min-h-[44px] flex items-center"
                  style={{
                    fontFamily: "var(--font-sans)",
                    borderBottom: "1px solid color-mix(in srgb, currentColor 14%, transparent)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-4">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-6"
              style={{ fontFamily: "var(--font-sans)", color: "var(--theme-5)" }}
            >
              Connect
            </p>
            <a
              href="https://instagram.com/fadesandfacials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm touch-manipulation min-h-[44px] flex items-center gap-2 group transition-opacity duration-200 hover:opacity-80"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[var(--theme-5)] transition-transform duration-200 group-hover:scale-110 shrink-0"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @fadesandfacials
            </a>

            <div
              className="mt-5 rounded-2xl p-4"
              style={{
                border: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
                background: "color-mix(in srgb, currentColor 6%, transparent)",
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.25em] mb-1"
                style={{ fontFamily: "var(--font-sans)", color: "var(--theme-5)" }}
              >
                Location
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                Shops at Johns Creek
              </p>
              <p className="text-sm opacity-90" style={{ fontFamily: "var(--font-sans)" }}>
                4090 Johns Creek Pkwy # E
              </p>
              <p className="text-sm opacity-90" style={{ fontFamily: "var(--font-sans)" }}>
                Suwanee, GA 30024
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[color-mix(in_srgb,currentColor_18%,transparent)]">
          <p className="text-[11px] opacity-60" style={{ fontFamily: "var(--font-sans)" }}>
            © sourc3code @2026
          </p>
          <div aria-hidden="true" className="hidden sm:block w-1 h-1 rounded-full bg-[var(--theme-5)]" />
          <p className="text-[11px] opacity-60" style={{ fontFamily: "var(--font-sans)" }}>
            @fadesandfacials 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
