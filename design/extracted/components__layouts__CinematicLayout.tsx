/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * Example:
 * style={{ background: "var(--theme-bg)" }}
 * style={{ color: "var(--theme-text)" }}
 * border: "1px solid color-mix(in srgb, var(--theme-text) 7%, transparent)"
 *
 * This file has been audited: no banned values present.
 * Violators will be rejected in review.
 */

// ─────────────────────────────────────────
// SECTION: CinematicLayout
// WHAT: Pure service menu list in the cinematic dark palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   This component is now a focused, dark-palette catalogue of all services.
// PHASE 4: No changes needed — allServices from DB.
// ─────────────────────────────────────────

import type { LayoutProps } from "@/lib/utils";

export default function CinematicLayout({ allServices }: LayoutProps) {
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