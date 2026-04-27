/**
 * @file app/page.tsx
 *
 * Public homepage. A Global Identity Layer (database-driven hero media) sits
 * above all three layout variants. The FeaturedServicesSection adapts its
 * design using active_layout from site_config. Each layout component is a pure
 * "menu list" that receives only allServices and renders the service catalogue.
 *
 * Render order (always):
 *   1. GlobalHero — sourced from site_config.global_hero_url
 *   2. FeaturedServicesSection — 3 distinct designs keyed on active_layout
 *   4. Active layout component — menu list only (Cinematic | Grid | Editorial)
 *   5. BookNowPill (fixed, z-50)
 *   6. VisitUsSection + footer
 *
 * console.log audit: No console.log statements present in this file.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import type { DbService } from "@/lib/supabase";

// ─────────────────────────────────────────
// SECTION: Constants & Shared Types
// WHAT: All module-level constants and types shared across every component in this file.
// WHY: Centralising here means a single change propagates everywhere — no drift.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

// WHY: Database-first architecture. Decouples UI state from public view to allow remote admin control. Unified media library prevents duplicate storage usage.
const DEFAULT_GLOBAL_HERO_URL =
  "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif";

/** Union of all valid layout identifiers. TypeScript catches typos at build time. */
type Layout = "cinematic" | "grid" | "editorial";

/** A resolved featured slot: config mediaUrl paired with its live DbService row. */
type FeaturedPair = {
  serviceId: number;
  mediaUrl: string | null;
  service: DbService;
};

/** Props contract for the three pure menu-list layout components. */
type LayoutProps = { allServices: DbService[] };

// WHY: Centralises the video-vs-image branch — .mp4 extension OR media_type='video'
// both qualify. Called across FeaturedServicesSection and layout components so
// the logic is never duplicated.
function isVideoMedia(url: string | null, mediaType?: string | null): boolean {
  if (mediaType === "video") return true;
  return /\.mp4(\?|$)/i.test(url ?? "");
}

// ─────────────────────────────────────────
// SECTION: BookNowPill
// WHAT: Persistent floating CTA anchored to the viewport bottom-center.
// WHY: Keeps the booking action reachable regardless of scroll position or
//   which layout is active. The animate-ping ring signals interactivity
//   using a pure-CSS compositor animation (no JS, no repaints).
// PHASE 4: No changes needed — links to external Vagaro booking page.
// ─────────────────────────────────────────
function BookNowPill() {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Link
        href="/book"
        className="group relative inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.24em] uppercase font-sans font-medium shadow-[0_4px_20px_rgba(11,19,43,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-95 min-h-[40px]"
        style={{
          background: "#7E9A7E",
          color: "#0B132B",
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 500,
        }}
      >
        <span className="relative z-10 px-1">Book Now</span>
        {/* animate-ping = scale + opacity keyframe — compositor-only, no repaints */}
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
              style={{ color: "#F9F7F2", opacity: 0.65, fontFamily: "'Manrope', sans-serif" }}
            >
              Find Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
            >
              Visit Us
            </h2>
            <p className="text-sm tracking-widest uppercase font-medium mb-1" style={{ color: "#F9F7F2" }}>
              Shops at Johns Creek
            </p>
            <p className="text-sm tracking-widest uppercase" style={{ color: "#F9F7F2", opacity: 0.75 }}>
              4090 Johns Creek Pkwy # E
            </p>
            <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "#F9F7F2", opacity: 0.75 }}>
              Suwanee, GA 30024
            </p>
            <a
              href="https://maps.google.com/?q=4090+Johns+Creek+Pkwy+E+Suwanee+GA+30024"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "#F9F7F2", fontFamily: "'Manrope', sans-serif" }}
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
                    style={{ color: hours === "Closed" ? "rgba(249,247,242,0.45)" : "#F9F7F2" }}
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
// WHAT: Pure service menu list in the cinematic dark palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   This component is now a focused, dark-palette catalogue of all services.
// PHASE 4: No changes needed — allServices from DB.
// ─────────────────────────────────────────
function CinematicLayout({ allServices }: LayoutProps) {
  return (
    <section style={{ background: "#0B132B", color: "#F9F7F2" }} className="px-8 py-20">
      <div className="max-w-5xl mx-auto">
        <p
          className="text-[11px] uppercase tracking-[0.3em] mb-3"
          style={{ color: "rgba(249,247,242,0.4)", fontFamily: "'Manrope', sans-serif" }}
        >
          The Full Menu
        </p>
        <h2
          className="text-4xl md:text-5xl font-light mb-12"
          style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
        >
          Our Services
        </h2>
        <div>
          {allServices.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-6"
              style={{
                borderBottom:
                  i < allServices.length - 1 ? "1px solid rgba(249,247,242,0.08)" : "none",
              }}
            >
              <div className="flex items-center gap-5">
                <span
                  className="text-xs tabular-nums shrink-0"
                  style={{ color: "rgba(249,247,242,0.2)", fontFamily: "'Manrope', sans-serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.image && (
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden">
                    <img
                      src={s.image}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      alt={s.name}
                    />
                  </div>
                )}
                <div>
                  <h3
                    className="text-xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
                  >
                    {s.name}
                  </h3>
                  {s.duration && (
                    <p
                      className="text-xs uppercase tracking-widest mt-0.5"
                      style={{ color: "rgba(249,247,242,0.3)", fontFamily: "'Manrope', sans-serif" }}
                    >
                      {s.duration}
                    </p>
                  )}
                </div>
              </div>
              <span
                className="text-2xl font-light"
                style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
              >
                {typeof s.price === "number" ? `$${s.price}` : s.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// SECTION: FeaturedServicesSection
// WHAT: Featured showcase that adapts its design language to match activeLayout.
// WHY: A single data source (featuredPairs from HomePage) rendered in 3 distinct
//   visual states so the featured section flickers in unison with the menu.
// PHASE 4: No changes needed — featuredPairs resolved from live DB in HomePage.
// ─────────────────────────────────────────
function FeaturedServicesSection({
  activeLayout,
  featuredPairs,
}: {
  activeLayout: Layout;
  featuredPairs: FeaturedPair[];
}) {
  if (featuredPairs.length === 0) return null;

  // ── Shared media renderer — identical logic in all three branches ──
  // WHY: isVideoMedia() mirrors the admin media_type state machine —
  // .mp4 extension OR media_type='video' both render as <video>.
  function PairMedia({
    pair,
    className,
  }: {
    pair: FeaturedPair;
    className: string;
  }) {
    if (!pair.mediaUrl) return <div className={`${className} bg-[#0b132b]`} />;
    if (isVideoMedia(pair.mediaUrl, pair.service.media_type)) {
      return (
        <video
          src={pair.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className={className}
        />
      );
    }
    return (
      <img
        src={pair.mediaUrl}
        alt={pair.service.name}
        className={className}
      />
    );
  }

  const formatPrice = (price: string | number) =>
    typeof price === "number" ? `$${price}` : price;

  switch (activeLayout) {
    // ── Cinematic: alternating left/right full-bleed panels ──
    case "cinematic":
      return (
        <section style={{ background: "#0B132B" }}>
          <div className="max-w-6xl mx-auto px-8 pt-16 pb-6">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgba(249,247,242,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
            >
              Signature Menu
            </h2>
          </div>
          {featuredPairs.map((pair, i) => (
            <div
              key={pair.serviceId}
              // WHY: flex-col on mobile stacks media above text; md:flex-row-reverse
              // on odd indices creates the alternating left/right cinematic rhythm.
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              {/* Media panel */}
              <div className="relative w-full md:w-1/2 overflow-hidden" style={{ height: "55svh" }}>
                <PairMedia
                  pair={pair}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.5) 100%)",
                  }}
                />
              </div>
              {/* Text panel */}
              <div
                className="w-full md:w-1/2 flex flex-col justify-center px-10 py-14"
                style={{ background: "#0B132B" }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.35em] mb-4"
                  style={{ color: "rgba(249,247,242,0.35)", fontFamily: "'Manrope', sans-serif" }}
                >
                  Featured
                </p>
                <h3
                  className="font-light mb-4 leading-tight"
                  style={{
                    fontFamily: "'Bodoni Moda', serif",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    color: "#F9F7F2",
                  }}
                >
                  {pair.service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8 max-w-sm"
                  style={{
                    color: "rgba(249,247,242,0.55)",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {pair.service.description}
                </p>
                <span
                  className="text-3xl font-light"
                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
                >
                  {formatPrice(pair.service.price)}
                </span>
              </div>
            </div>
          ))}
        </section>
      );

    // ── Grid: portrait luxury cards ──
    case "grid":
      return (
        <section style={{ background: "#F9F7F2" }} className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-10"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
            >
              Signature Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPairs.map((pair) => (
                <article
                  key={pair.serviceId}
                  className="rounded-3xl overflow-hidden bg-white"
                  style={{ boxShadow: "0 8px 40px rgba(11,19,43,0.1)" }}
                >
                  {/* Portrait media with bottom gradient overlay for name + price */}
                  <div className="relative aspect-[3/4]">
                    <PairMedia
                      pair={pair}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(11,19,43,0.85) 0%, rgba(11,19,43,0.3) 50%, transparent 100%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3
                        className="text-2xl font-light text-white mb-1"
                        style={{ fontFamily: "'Bodoni Moda', serif" }}
                      >
                        {pair.service.name}
                      </h3>
                      <span
                        className="text-lg font-light"
                        style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
                      >
                        {formatPrice(pair.service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p
                      className="text-sm"
                      style={{
                        color: "rgba(11,19,43,0.6)",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      {pair.service.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );

    // ── Editorial: magazine stack — full-width hero + 2-col strip ──
    case "editorial":
    default:
      return (
        <section style={{ background: "#F9F7F2" }} className="px-6 md:px-16 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-8"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
            >
              Signature Menu
            </h2>

            {/* Slot 0 — full-width hero */}
            {featuredPairs[0] && (
              <div
                className="relative w-full overflow-hidden rounded-3xl mb-5"
                style={{ minHeight: "60svh" }}
              >
                <PairMedia
                  pair={featuredPairs[0]}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <p
                    className="text-[11px] uppercase tracking-[0.35em] mb-4"
                    style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}
                  >
                    01
                  </p>
                  <h3
                    className="font-light text-white mb-4 leading-tight"
                    style={{
                      fontFamily: "'Bodoni Moda', serif",
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                    }}
                  >
                    {featuredPairs[0].service.name}
                  </h3>
                  <span
                    className="text-2xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
                  >
                    {formatPrice(featuredPairs[0].service.price)}
                  </span>
                </div>
              </div>
            )}

            {/* Slots 1 & 2 — CRITICAL: grid-cols-1 on mobile, md:grid-cols-2 on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredPairs.slice(1, 3).map((pair, i) => (
                <div
                  key={pair.serviceId}
                  className="relative overflow-hidden rounded-3xl"
                  style={{ minHeight: "40svh" }}
                >
                  <PairMedia
                    pair={pair}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <p
                      className="text-[11px] uppercase tracking-[0.35em] mb-3"
                      style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}
                    >
                      {String(i + 2).padStart(2, "0")}
                    </p>
                    <h3
                      className="font-light text-white mb-3 leading-tight"
                      style={{
                        fontFamily: "'Bodoni Moda', serif",
                        fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      }}
                    >
                      {pair.service.name}
                    </h3>
                    <span
                      className="text-xl font-light"
                      style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
                    >
                      {formatPrice(pair.service.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
  }
}

// ─────────────────────────────────────────
// SECTION: GridLayout
// WHAT: Pure service grid in the alabaster light palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   This component renders only the "Our Services" catalogue grid.
// PHASE 4: allServices from DB replaces the old static SERVICES array.
// ─────────────────────────────────────────
function GridLayout({ allServices }: LayoutProps) {
  return (
    <section className="px-5 py-20 max-w-7xl mx-auto" style={{ background: "#F9F7F2" }}>
      <div className="text-center mb-14">
        <p
          className="uppercase tracking-[0.3em] text-xs mb-3"
          style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
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
          style={{ width: "40px", height: "1px", background: "rgba(11,19,43,0.25)" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* WHY: i % 3 === 1 reproduces alternating dark-card rhythm without a
            static `dark` flag — DB services have no such column. */}
        {allServices.map((s, i) => {
          const dark = i % 3 === 1;
          return (
            <div
              key={s.id}
              className="group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{
                background: dark ? "#0B132B" : "#FFFFFF",
                border: dark ? "none" : "1px solid rgba(11,19,43,0.07)",
                boxShadow: dark
                  ? "0 8px 40px rgba(11,19,43,0.25)"
                  : "0 2px 20px rgba(11,19,43,0.05)",
              }}
            >
              {s.image && (
                <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-8">
                <h3
                  className="text-2xl font-light mb-3"
                  style={{
                    fontFamily: "'Bodoni Moda', serif",
                    color: dark ? "#F9F7F2" : "#0B132B",
                  }}
                >
                  {s.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{
                    color: dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {s.description}
                </p>
                <div
                  className="flex justify-between items-end pt-5"
                  style={{
                    borderTop: `1px solid ${dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,
                  }}
                >
                  <span
                    className="text-2xl font-light"
                    style={{
                      fontFamily: "'Bodoni Moda', serif",
                      color: dark ? "#F9F7F2" : "#0B132B",
                    }}
                  >
                    {typeof s.price === "number" ? `$${s.price}` : s.price}
                  </span>
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{
                      color: dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    {s.duration ?? ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// SECTION: EditorialLayout
// WHAT: Magazine-style typographic service menu.
// WHY: Hero and featured slots hoisted; this component is a pure service list.
//   The "expanding row" hover effect and ghost watermark number are kept intact.
// PHASE 4: allServices from DB.
// ─────────────────────────────────────────
function EditorialLayout({ allServices }: LayoutProps) {
  return (
    <section
      className="px-8 md:px-16 py-24"
      style={{ background: "#F9F7F2", borderTop: "1px solid rgba(11,19,43,0.1)" }}
    >
      <div className="max-w-6xl mx-auto">
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
              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
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
          {allServices.map((s, i) => (
            <div
              key={s.id}
              // hover:-mx-6 + hover:px-6 creates an "expanding" row that fills
              // into the gutter — no height change means no layout shift.
              className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300 hover:bg-white hover:px-6 hover:rounded-2xl hover:-mx-6"
              style={{
                borderBottom:
                  i < allServices.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",
              }}
            >
              <div className="flex items-start gap-4">
                {s.image && (
                  <div className="w-20 h-28 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={s.image}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      alt={s.name}
                    />
                  </div>
                )}
                <div>
                  <h3
                    className="text-xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="text-xs uppercase tracking-widest mt-1"
                    style={{ color: "rgba(11,19,43,0.35)", fontFamily: "'Manrope', sans-serif" }}
                  >
                    {s.duration ?? ""}
                  </p>
                </div>
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
                  {typeof s.price === "number" ? `$${s.price}` : s.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// SECTION: HomePage (Page Entry Point)
// WHAT: Root component — owns all data fetching and the Global Identity Layer.
// WHY: Single fetch point (services + featured_services config) resolves both
//   featuredPairs and allServices, passed down with no redundant round-trips.
//   GlobalHero is rendered statically here so it never re-mounts on layout switch.
// PHASE 4: No changes needed — already wired to live Supabase tables.
// ─────────────────────────────────────────
export default function HomePage() {
  const [siteAppearance, setSiteAppearance] = useState<{
    activeLayout: Layout;
    globalHeroUrl: string;
  }>({
    activeLayout: "cinematic",
    globalHeroUrl: DEFAULT_GLOBAL_HERO_URL,
  });
  const [featuredPairs, setFeaturedPairs] = useState<FeaturedPair[]>([]);
  const [allServices, setAllServices] = useState<DbService[]>([]);

  // WHY: Single parallel fetch resolves both allServices and featuredPairs —
  // every downstream consumer shares one network round-trip.
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      try {
        const [servicesRes, configRes, appearanceRes] = await Promise.all([
          supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("site_config")
            .select("value")
            .eq("key", "featured_services")
            .single(),
          supabase
            .from("site_config")
            .select("key, value")
            .in("key", ["active_layout", "global_hero_url"]),
        ]);

        if (!isMounted) return;

        const services = servicesRes.data ?? [];
        setAllServices(services);

        const activeLayoutFromDb = appearanceRes.data?.find((row) => row.key === "active_layout")?.value;
        const globalHeroFromDb = appearanceRes.data?.find((row) => row.key === "global_hero_url")?.value;
        setSiteAppearance({
          activeLayout:
            activeLayoutFromDb === "cinematic" ||
            activeLayoutFromDb === "grid" ||
            activeLayoutFromDb === "editorial"
              ? activeLayoutFromDb
              : "cinematic",
          globalHeroUrl: globalHeroFromDb || DEFAULT_GLOBAL_HERO_URL,
        });

        if (configRes.error || !configRes.data?.value) return;

        const rawPairs = JSON.parse(configRes.data.value) as Array<
          number | null | { serviceId: number | null; mediaUrl: string | null }
        >;
        const serviceMap = new Map(services.map((s) => [s.id, s]));

        // WHY: flatMap skips null serviceIds and unresolved references so
        // featuredPairs only ever contains complete, live data.
        const resolved: FeaturedPair[] = [0, 1, 2].flatMap((index) => {
          const row = rawPairs[index];
          const serviceId = typeof row === "number" ? row : (row?.serviceId ?? null);
          const mediaUrl =
            typeof row === "object" && row !== null ? (row.mediaUrl ?? null) : null;
          if (serviceId === null) return [];
          const service = serviceMap.get(serviceId);
          if (!service) return [];
          return [{ serviceId, mediaUrl, service }];
        });

        if (isMounted) setFeaturedPairs(resolved);
      } catch {
        // Fail silently — page degrades gracefully to default hero fallback with
        // empty featured section and empty service lists.
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* ── Global Identity Hero — database-driven via global_hero_url ── */}
      <section className="relative w-full h-[100svh] overflow-hidden">
        {isVideoMedia(siteAppearance.globalHeroUrl) ? (
          <video
            src={siteAppearance.globalHeroUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 15%" }}
          />
        ) : (
          <img
            src={siteAppearance.globalHeroUrl}
            alt="Fades and Facials atmosphere"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 15%" }}
          />
        )}
        {/* Cinematic vignette: dark at top → transparent → dark at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,19,43,0.55) 0%, rgba(11,19,43,0.1) 40%, rgba(11,19,43,0.75) 85%, rgba(11,19,43,0.95) 100%)",
          }}
        />
        <div className="relative z-20 flex flex-col items-center justify-end h-full text-center pb-40 px-6">
          <p
            className="uppercase tracking-[0.35em] text-xs mb-5"
            style={{ color: "rgba(249,247,242,0.6)", fontFamily: "'Manrope', sans-serif" }}
          >
            Luxury Grooming & Spa · Cumming, Georgia
          </p>
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

      {/* ── FeaturedServicesSection — flickers design with activeLayout ── */}
      <FeaturedServicesSection
        activeLayout={siteAppearance.activeLayout}
        featuredPairs={featuredPairs}
      />

      {/* ── Active layout — pure menu list, receives only allServices ──
          Inactive layouts are fully unmounted (no hidden DOM, no opacity tricks). */}
      {siteAppearance.activeLayout === "cinematic" && <CinematicLayout allServices={allServices} />}
      {siteAppearance.activeLayout === "grid"      && <GridLayout      allServices={allServices} />}
      {siteAppearance.activeLayout === "editorial" && <EditorialLayout allServices={allServices} />}

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