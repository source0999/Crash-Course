/**
 * @file app/page.tsx
 *
 * Public homepage. Implements a three-way runtime layout switcher using a
 * single `useState` hook — no routing, no page reloads. Each layout
 * (Cinematic, Grid, Editorial) is a fully self-contained component that
 * presents the same business content (services, location, booking CTA)
 * through a different visual lens.
 *
 * Layout switching architecture: See _blueprints/features/layout_toggler/blueprint.md
 * for the full pattern documentation and reuse guide.
 *
 * Design system: All colours, typography, and animation rules are documented
 * in _blueprints/designs/homey_luxury/design_system.md.
 *
 * console.log audit: No console.log statements present in this file.
 * If adding debug logging, wrap it in:
 *   if (process.env.NODE_ENV === 'development') { console.log(...) }
 */

"use client";

import { useState } from "react";
import Link from "next/link";

// Loaded from GitHub CDN rather than /public to avoid bundling a ~2MB GIF
// into the Next.js static asset pipeline, which would inflate cold-start
// bundle size and slow LCP on first load.
const GIF_URL =
  "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif";

// ─────────────────────────────────────────
// SECTION: BookNowPill
// WHAT: Persistent floating CTA anchored to the viewport bottom-center.
// WHY: Keeps the booking action reachable regardless of scroll position or
//   which layout is active. The animate-ping ring signals interactivity
//   using a pure-CSS compositor animation (no JS, no repaints).
// PHASE 4: No changes needed — links to external Vagaro booking page.
// ─────────────────────────────────────────

/**
 * BookNowPill
 *
 * A fixed, floating "Book Appointment" pill that persists across all three
 * layouts. Positioned at `z-50` so it renders above all page content.
 *
 * The `animate-ping` ring is a Tailwind keyframe that animates `scale` and
 * `opacity` only — both compositor-thread properties — ensuring the pulse
 * runs at 60fps without triggering layout or paint.
 *
 * @returns A fixed-position `<Link>` to the Vagaro external booking page.
 */
function BookNowPill() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto">
      <Link
        href="https://www.vagaro.com/fadesandfacials"
        target="_blank"
        className="group relative inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.24em] uppercase font-sans font-medium shadow-[0_4px_20px_rgba(11,19,43,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-95 min-h-[40px]"
        style={{
          background: "#7E9A7E",
          color: "#0B132B",
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 500,
        }}
      >
        <span className="relative z-10 px-1">Book Now</span>
        {/* Pulsing ring — pure CSS, no JS. animate-ping = scale + opacity keyframe.
            opacity-20 keeps it subtle; borderColor matches the pill background. */}
        <span
          className="absolute inset-0 rounded-full border animate-ping opacity-20"
          style={{ borderColor: "#7E9A7E" }}
        />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────
// SECTION: VisitUsSection
// WHAT: Shared "Find Us" section — map embed, address, and hours grid.
// WHY: Identical across all three layouts, extracted to avoid duplication.
// PHASE 4: Hours data is hardcoded. Could be moved to site_config table.
// ─────────────────────────────────────────

/**
 * VisitUsSection
 *
 * Renders the location block: a Google Maps iframe embed, address details,
 * directions link, and a 4-column hours grid. Shared across all three page
 * layouts — any change here propagates to Cinematic, Grid, and Editorial.
 *
 * The map iframe uses `filter: saturate(0.85) contrast(1.05)` to tone down
 * Google Maps' default bright blue palette so it harmonises with the
 * Alabaster/Ink design system.
 *
 * @returns A `<section>` containing the map embed and hours grid.
 */
function VisitUsSection() {
  const embedSrc =
    "https://maps.google.com/maps?q=4090+Johns+Creek+Pkwy+%23+E,+Suwanee,+GA+30024&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section
      className="relative z-20 px-6 py-24"
      style={{ background: "#14223D", color: "#F9F7F2" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className="relative w-full aspect-video lg:aspect-square rounded-3xl overflow-hidden"
            style={{
              border: "1px solid rgba(249,247,242,0.18)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
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
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 70%, rgba(11,19,43,0.35) 100%)",
              }}
            />
          </div>

          <div style={{ fontFamily: "'Manrope', sans-serif" }}>
            <p
              className="uppercase tracking-[0.3em] text-xs mb-3"
              style={{
                color: "#F9F7F2",
                opacity: 0.65,
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Find Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
            >
              Visit Us
            </h2>
            <p
              className="text-sm tracking-widest uppercase font-medium mb-1"
              style={{ color: "#F9F7F2" }}
            >
              Shops at Johns Creek
            </p>
            <p
              className="text-sm tracking-widest uppercase"
              style={{ color: "#F9F7F2", opacity: 0.75 }}
            >
              4090 Johns Creek Pkwy # E
            </p>
            <p
              className="text-sm tracking-widest uppercase mb-4"
              style={{ color: "#F9F7F2", opacity: 0.75 }}
            >
              Suwanee, GA 30024
            </p>
            <a
              href="https://maps.google.com/?q=4090+Johns+Creek+Pkwy+E+Suwanee+GA+30024"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{
                color: "#F9F7F2",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Get Directions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div
              className="mt-8 grid grid-cols-2 gap-4"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {[
                { day: "Mon – Tue", hours: "Closed" },
                { day: "Wed – Fri", hours: "10am – 7pm" },
                { day: "Saturday", hours: "9am – 6pm" },
                { day: "Sunday", hours: "11am – 4pm" },
              ].map(({ day, hours }) => (
                <div
                  key={day}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(249,247,242,0.06)",
                    border: "1px solid rgba(249,247,242,0.18)",
                  }}
                >
                  <p className="text-sm uppercase tracking-widest mb-1" style={{ color: "#F9F7F2", opacity: 0.65 }}>
                    {day}
                  </p>
                  <p
                    className="text-sm font-medium uppercase tracking-widest"
                    style={{
                      color: hours === "Closed" ? "rgba(249,247,242,0.45)" : "#F9F7F2",
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

// ─────────────────────────────────────────
// SECTION: CinematicLayout
// WHAT: Full-viewport hero with gradient overlay and bottom-anchored text.
// WHY: Maximum visual impact on first load — the GIF fills the entire screen
//   and the copy emerges from the bottom like a film title card.
// PHASE 4: No changes needed — purely presentational.
// ─────────────────────────────────────────

/**
 * CinematicLayout
 *
 * Full-bleed, 100svh hero followed by the shared VisitUsSection.
 * The `svh` unit (small viewport height) is used instead of `vh` so the
 * layout fills the visible viewport on iOS Safari without being obscured
 * by the browser chrome (URL bar + tab bar).
 *
 * The gradient overlay (`rgba` linear-gradient) creates a cinematic vignette:
 * dark at the top and bottom, transparent in the middle, so the GIF reads
 * clearly at the centre while text remains legible at the edges.
 *
 * @returns A full-screen cinematic hero page with location section below.
 */
function CinematicLayout() {
  return (
    <main style={{ background: "#0B132B", color: "#F9F7F2" }}>
      <section className="relative w-full h-[100svh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={GIF_URL}
            alt="Fades and Facials atmosphere"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 15%" }}
          />
          {/* Cinematic vignette: dark at top (55%) → transparent (10%) → dark at bottom (95%) */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,19,43,0.55) 0%, rgba(11,19,43,0.1) 40%, rgba(11,19,43,0.75) 85%, rgba(11,19,43,0.95) 100%)",
            }}
          />
        </div>

        {/* Text anchored to the bottom via justify-end + pb-40 */}
        <div
          className="relative z-20 flex flex-col items-center justify-end h-full text-center pb-40 px-6"
        >
          <p
            className="uppercase tracking-[0.35em] text-xs mb-5"
            style={{
              color: "rgba(249,247,242,0.6)",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Luxury Grooming & Spa · Cumming, Georgia
          </p>
          {/* clamp() fluid type: 48px mobile → 112px desktop, never overflows */}
          <h1
            className="font-serif font-light tracking-[0.05em] mb-6 leading-none"
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(3rem, 10vw, 7rem)",
              color: "#F9F7F2",
            }}
          >
            A quiet room.
            <br />
            <em>A precise cut.</em>
          </h1>
        </div>
      </section>

    </main>
  );
}

// ─────────────────────────────────────────
// SECTION: Services Data
// WHAT: Static array of service objects used by GridLayout and EditorialLayout.
// WHY: Hardcoded for now — these services are stable and don't require a DB
//   round-trip on the public homepage. The admin Services Manager in
//   /admin/services is the live source of truth for the actual menu.
// PHASE 4: Consider replacing with a live fetch from the services table
//   so admin edits propagate to the homepage without a code deployment.
// ─────────────────────────────────────────

/**
 * Static service data for the public homepage.
 *
 * `dark: true` marks a card to render with an Ink (#0B132B) background
 * instead of white — used to create visual rhythm in the grid by alternating
 * light and dark cards.
 *
 * @remarks
 * This data is intentionally separate from the Supabase `services` table.
 * The admin panel manages live services; this array manages the homepage
 * presentation. If they diverge, the admin panel is the source of truth.
 */
const SERVICES = [
  {
    name: "The Signature Fade",
    description:
      "Precision fading, hot towel neck shave, and premium styling product application.",
    price: "$45",
    duration: "45 Min",
    dark: false,
  },
  {
    name: "Luxury Facial",
    description:
      "Deep pore cleansing, exfoliation, custom mask, and a relaxing facial massage.",
    price: "$65",
    duration: "60 Min",
    dark: true, // dark card for visual rhythm alternation
  },
  {
    name: "Beard Sculpting",
    description:
      "Detailed trimming, straight razor line-up, and conditioning beard oil treatment.",
    price: "$30",
    duration: "30 Min",
    dark: false,
  },
  {
    name: "The Full Experience",
    description:
      "Fade + facial combo. The complete luxury grooming treatment in a single session.",
    price: "$100",
    duration: "90 Min",
    dark: false,
  },
  {
    name: "Hot Towel Shave",
    description:
      "Classic straight razor shave with steamed hot towels, pre-shave oil, and aftercare balm.",
    price: "$35",
    duration: "40 Min",
    dark: true, // dark card for visual rhythm alternation
  },
  {
    name: "Brow Architecture",
    description:
      "Precision threading and shaping with a hot towel finish. Clean lines, defined face.",
    price: "$20",
    duration: "20 Min",
    dark: false,
  },
];

function FeaturedServicesSection() {
  const featured = SERVICES.slice(0, 3);

  return (
    <section className="w-full bg-alabaster px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink/40 mb-3">
          Featured Services
        </p>
        <h2
          className="text-3xl md:text-4xl font-light mb-10 text-ink"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          Signature Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((s) => (
            <article
              key={s.name}
              className="rounded-2xl border border-ink/10 bg-white p-6"
            >
              <h3
                className="text-2xl font-light text-ink mb-2"
                style={{ fontFamily: "'Bodoni Moda', serif" }}
              >
                {s.name}
              </h3>
              <p className="text-sm text-ink/60 mb-5">{s.description}</p>
              <div className="flex items-end justify-between border-t border-ink/10 pt-4">
                <span
                  className="text-2xl text-ink font-light"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  {s.price}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-ink/45">
                  {s.duration}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// SECTION: GridLayout
// WHAT: Service grid with a hero header and alternating light/dark cards.
// WHY: Shows all services at a glance — best for users who know what
//   they want and are comparison-shopping price and duration.
// PHASE 4: No changes needed — purely presentational.
// ─────────────────────────────────────────

/**
 * GridLayout
 *
 * A 65svh hero image followed by a 3-column responsive service grid.
 * Cards alternate between white ("Paper") and Ink ("Dark") backgrounds
 * using the `dark` flag on each SERVICES entry, creating visual rhythm
 * without requiring the user to consciously scan a list.
 *
 * Card hover uses `hover:-translate-y-2` (compositor-safe transform) with
 * `transition-all duration-500` for a slow, luxurious lift effect.
 *
 * @returns A light-background grid page with all services and location section.
 */
function GridLayout() {
  return (
    <main style={{ background: "#F9F7F2", color: "#0B132B" }}>
      <section
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: "65svh" }}
      >
        <img
          src={GIF_URL}
          alt="Fades and Facials"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "top center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,19,43,0.5) 0%, rgba(11,19,43,0.2) 50%, rgba(11,19,43,0.8) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-6 flex flex-col items-center justify-end h-full pb-12">
          <h1
            className="font-light leading-tight text-white"
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
            }}
          >
            Fades &amp; Facials
          </h1>
          <p
            className="mt-3 uppercase tracking-[0.3em] text-xs"
            style={{
              color: "rgba(249,247,242,0.65)",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Luxury Grooming · Suwanee, Georgia
          </p>
        </div>
      </section>

      <section className="px-5 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="uppercase tracking-[0.3em] text-xs mb-3"
            style={{
              color: "rgba(11,19,43,0.4)",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            What We Offer
          </p>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
          >
            Our Services
          </h2>
          <div
            className="mx-auto mt-5"
            style={{
              width: "40px",
              height: "1px",
              background: "rgba(11,19,43,0.25)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"
              style={{
                // dark flag drives the card variant — Ink bg or white bg
                background: s.dark ? "#0B132B" : "#FFFFFF",
                border: s.dark ? "none" : "1px solid rgba(11,19,43,0.07)",
                boxShadow: s.dark
                  ? "0 8px 40px rgba(11,19,43,0.25)"
                  : "0 2px 20px rgba(11,19,43,0.05)",
              }}
            >
              <h3
                className="text-2xl font-light mb-3"
                style={{
                  fontFamily: "'Bodoni Moda', serif",
                  color: s.dark ? "#F9F7F2" : "#0B132B",
                }}
              >
                {s.name}
              </h3>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{
                  color: s.dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 300,
                }}
              >
                {s.description}
              </p>
              <div
                className="flex justify-between items-end pt-5"
                style={{
                  borderTop: `1px solid ${s.dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,
                }}
              >
                <span
                  className="text-2xl font-light"
                  style={{
                    fontFamily: "'Bodoni Moda', serif",
                    color: s.dark ? "#F9F7F2" : "#0B132B",
                  }}
                >
                  {s.price}
                </span>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{
                    color: s.dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  {s.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

// ─────────────────────────────────────────
// SECTION: EditorialLayout
// WHAT: Split-screen hero with a magazine-style service menu below.
// WHY: Targets users who respond to luxury editorial aesthetics — feels
//   closer to a high-end print menu than a website.
// PHASE 4: No changes needed — purely presentational.
// ─────────────────────────────────────────

/**
 * EditorialLayout
 *
 * A two-column split-screen hero (text left, image right) followed by a
 * typographic service list. The service rows use `hover:bg-white hover:-mx-6
 * hover:px-6` to create a "expanding highlight" effect on hover — the row
 * grows to a white background and gains padding, pushing into the gutter,
 * without changing its height (no layout shift). This is a CSS-only illusion
 * that runs on the compositor thread.
 *
 * The large ghost number ("01") behind the section heading is decorative
 * only, using `rgba(11,19,43,0.06)` (6% ink) so it reads as a watermark
 * rather than competing with the heading.
 *
 * @returns An editorial split-screen page with typographic service menu
 *          and location section below.
 */
function EditorialLayout() {
  return (
    <main style={{ background: "#F9F7F2", color: "#0B132B" }}>
      <section className="min-h-[100svh] grid grid-cols-1 md:grid-cols-2">
        {/* Left panel — text content */}
        <div
          className="flex flex-col justify-end px-8 md:px-16 py-20 order-2 md:order-1"
          style={{ borderRight: "1px solid rgba(11,19,43,0.1)" }}
        >
          <div className="flex items-center gap-4 mb-12">
            <div style={{ width: "32px", height: "1px", background: "rgba(11,19,43,0.3)" }} />
            <p
              className="uppercase tracking-[0.35em] text-xs"
              style={{ color: "rgba(11,19,43,0.45)", fontFamily: "'Manrope', sans-serif" }}
            >
              Est. Cumming, Georgia
            </p>
          </div>

          {/* clamp() fluid type: 56px mobile → 104px desktop */}
          <h1
            className="font-light leading-[0.92] mb-8"
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(3.5rem, 7vw, 6.5rem)",
              color: "#0B132B",
            }}
          >
            Fades
            <br />
            &amp;
            <br />
            <em style={{ fontStyle: "italic" }}>Facials.</em>
          </h1>

          <p
            className="text-sm leading-loose mb-10 max-w-xs"
            style={{
              color: "rgba(11,19,43,0.55)",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 300,
            }}
          >
            Where the precision of a master barber meets the serenity of a luxury spa. Every visit is intentional.
          </p>

          <div
            className="w-full mb-10"
            style={{ height: "1px", background: "rgba(11,19,43,0.1)" }}
          />

          {/* Price preview — three signature services only, not the full menu */}
          <div
            className="grid grid-cols-3 gap-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {[
              { label: "Signature Fade", price: "$45" },
              { label: "Luxury Facial", price: "$65" },
              { label: "Beard Sculpt", price: "$30" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span
                  className="text-lg font-light"
                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
                >
                  {item.price}
                </span>
                <span
                  className="text-xs uppercase tracking-widest leading-tight"
                  style={{ color: "rgba(11,19,43,0.4)" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — media */}
        <div className="relative overflow-hidden order-1 md:order-2" style={{ minHeight: "55svh" }}>
          <img
            src={GIF_URL}
            alt="Fades and Facials craft"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "top center" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,19,43,0.15) 0%, transparent 40%)",
            }}
          />
          {/* Pull quote anchored to bottom-right of the image panel */}
          <div
            className="absolute bottom-8 right-8 text-right max-w-[200px]"
          >
            <p
              className="text-sm italic leading-relaxed"
              style={{
                color: "rgba(249,247,242,0.9)",
                fontFamily: "'Bodoni Moda', serif",
                textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              }}
            >
              "A quiet room. A precise cut."
            </p>
          </div>
        </div>
      </section>

      {/* Full service menu — editorial typographic list */}
      <section
        className="px-8 md:px-16 py-24"
        style={{ borderTop: "1px solid rgba(11,19,43,0.1)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section heading with ghost number watermark */}
          <div className="flex items-start gap-8 mb-16">
            <span
              className="text-8xl md:text-9xl font-light leading-none"
              style={{
                fontFamily: "'Bodoni Moda', serif",
                // 6% ink opacity renders as a watermark — purely decorative
                color: "rgba(11,19,43,0.06)",
              }}
            >
              01
            </span>
            <div className="pt-4">
              <p
                className="uppercase tracking-[0.3em] text-xs mb-2"
                style={{
                  color: "rgba(11,19,43,0.4)",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                The Menu
              </p>
              <h2
                className="text-4xl md:text-5xl font-light"
                style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
              >
                Our Services
              </h2>
            </div>
          </div>

          <div className="space-y-0">
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                // hover:-mx-6 + hover:px-6 creates an "expanding" row effect
                // that fills into the gutter. No height change = no layout shift.
                className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300 hover:bg-white hover:px-6 hover:rounded-2xl hover:-mx-6"
                style={{
                  borderBottom: i < SERVICES.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",
                }}
              >
                <div>
                  <h3
                    className="text-xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="text-xs uppercase tracking-widest mt-1"
                    style={{
                      color: "rgba(11,19,43,0.35)",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    {s.duration}
                  </p>
                </div>
                <p
                  className="text-sm leading-relaxed self-center"
                  style={{
                    color: "rgba(11,19,43,0.55)",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {s.description}
                </p>
                <div className="self-center">
                  <span
                    className="text-2xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
                  >
                    {s.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

// ─────────────────────────────────────────
// SECTION: Layout Switcher Types & Registry
// WHAT: The type contract and data registry that power the layout toggler.
// WHY: Keeping these at module scope (not inside the component) means they
//   are defined once and never re-created on re-render.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

/**
 * Union type for all valid layout identifiers.
 *
 * This is the compile-time contract for the layout switcher. TypeScript will
 * error if any code attempts to set an unknown layout string — typos like
 * "cinematc" are caught at build time, not discovered in production.
 *
 * To add a new layout: add a string literal here, a matching object in
 * LAYOUTS, and a new layout component + conditional render in HomePage.
 */
type Layout = "cinematic" | "grid" | "editorial";

/**
 * The layout registry — the single place where layouts are registered.
 *
 * The floating pill nav bar renders itself by mapping over this array, so
 * adding a new layout to the nav requires only adding one object here.
 * Never hardcode individual nav buttons — always extend this array instead.
 */
const LAYOUTS: { id: Layout; label: string; icon: string }[] = [
  { id: "cinematic", label: "Cinematic", icon: "◈" },
  { id: "grid",      label: "Grid",      icon: "⊞" },
  { id: "editorial", label: "Editorial", icon: "≡" },
];

// ─────────────────────────────────────────
// SECTION: HomePage (Page Entry Point)
// WHAT: Root page component — renders the floating layout switcher and the
//   currently active layout component.
// WHY: Combines the registry, state, and conditional renderer in one place.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

/**
 * HomePage
 *
 * The root page component for `/`. Owns the layout switcher state and
 * renders the floating pill nav above whichever layout is currently active.
 *
 * Layout switcher rationale: Three radically different visual layouts are
 * provided here for rapid local prototyping — each demonstrates a different
 * application of the Homey Luxury design system. In production, the active
 * layout can be locked to a single value by removing the state and hardcoding
 * `<CinematicLayout />` (or whichever the client approves). The switcher
 * itself has zero performance cost when only one layout is rendered, since
 * the inactive components are not mounted.
 *
 * The pill nav uses `backdropFilter: "blur(12px)"` for a frosted-glass
 * effect. Note: backdrop-filter is disabled in all other components per
 * CLAUDE.md rule #1 (iOS WebKit breakage). The nav is the intentional
 * exception — it is admin/dev-facing context where that tradeoff is acceptable.
 *
 * @returns The full homepage: floating pill nav + active layout + booking pill.
 */
export default function HomePage() {
  // Single piece of state drives the entire layout system.
  // For rapid prototyping: change "cinematic" to lock a default on load.
  // For production lock: remove useState, delete the pill nav, and render
  // one layout component directly.
  const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");

  return (
    <>
      {/* Floating pill nav — fixed, z-40, centered horizontally */}
      <div
        className="fixed z-40 flex items-center gap-1 p-1 rounded-full shadow-lg"
        style={{
          top: "76px", // sits below the Navbar (approx. 72px tall + 4px gap)
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(249,247,242,0.92)",
          backdropFilter: "blur(12px)",         // intentional exception — see JSDoc
          WebkitBackdropFilter: "blur(12px)",   // Safari prefix required alongside standard
          border: "1px solid rgba(11,19,43,0.1)",
        }}
      >
        {/* Map over LAYOUTS registry — never add individual buttons manually */}
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayout(l.id)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-all duration-250"
            style={{
              fontFamily: "'Manrope', sans-serif",
              // Active: filled Ink background, Alabaster text
              // Inactive: transparent, muted Ink text
              background: activeLayout === l.id ? "#0B132B" : "transparent",
              color:
                activeLayout === l.id
                  ? "#F9F7F2"
                  : "rgba(11,19,43,0.45)",
              fontWeight: activeLayout === l.id ? 500 : 400,
              cursor: "pointer",
              minHeight: "44px", // iOS 44px minimum touch target (CLAUDE.md rule #4)
            }}
          >
            <span style={{ fontSize: "14px" }}>{l.icon}</span>
            {/* Label hidden on mobile to keep pill compact; visible sm+ */}
            <span className="hidden sm:inline">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Conditional layout mount — only one component is in the DOM at a time.
          Inactive layouts are fully unmounted (no hidden DOM, no opacity tricks). */}
      {activeLayout === "cinematic" && <CinematicLayout />}
      {activeLayout === "grid"      && <GridLayout />}
      {activeLayout === "editorial" && <EditorialLayout />}

      <FeaturedServicesSection />

      {/* BookNowPill floats above all layouts at z-50 */}
      <BookNowPill />

      <div className="w-full bg-[#14223D]">
        <VisitUsSection />
        <footer className="w-full py-8 flex flex-col md:flex-row items-center justify-between px-8 text-[10px] uppercase tracking-[0.3em] text-ink/40 bg-alabaster border-t border-ink/10">
          <span>© FADES & FACIALS 2026</span>
          <span>SOURCE DEVELOPMENT</span>
        </footer>
      </div>
    </>
  );
}
