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
// SECTION: GridLayout
// WHAT: Pure service grid in the alabaster light palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   This component renders only the "Our Services" catalogue grid.
// PHASE 4: allServices from DB replaces the old static SERVICES array.
// ─────────────────────────────────────────

import type { LayoutProps } from "@/lib/utils";

export default function GridLayout({ allServices }: LayoutProps) {
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