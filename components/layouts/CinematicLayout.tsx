/** @file components/layouts/CinematicLayout.tsx */

/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * This file has been audited: no banned values present.
 */

// ─────────────────────────────────────────
// SECTION: CinematicLayout
// WHAT: Pure service menu list styled in the active theme palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   This component is a focused catalogue of all services.
// PHASE 4: No changes needed — allServices from DB.
// ─────────────────────────────────────────

import type { LayoutProps } from "@/lib/utils";

export default function CinematicLayout({ allServices }: LayoutProps) {
  return (
    <section
      data-home-band="menu"
      className="px-6 md:px-8 py-20"
      style={{
        background: "var(--home-band-b, var(--theme-bg))",
        color: "var(--home-band-text, var(--theme-text))",
        ["--theme-text" as string]: "var(--home-band-text, var(--theme-text))",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <p
          className="text-[11px] uppercase tracking-[0.3em] mb-3"
          style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
        >
          The Full Menu
        </p>
        <h2
          className="text-4xl md:text-5xl font-light mb-12"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
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
                  i < allServices.length - 1
                    ? "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-5">
                <span
                  className="text-xs tabular-nums shrink-0"
                  style={{ color: "color-mix(in srgb, var(--theme-text) 20%, transparent)", fontFamily: "var(--font-sans)" }}
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
                    style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
                  >
                    {s.name}
                  </h3>
                  {s.duration && (
                    <p
                      className="text-xs uppercase tracking-widest mt-0.5"
                      style={{ color: "color-mix(in srgb, var(--theme-text) 30%, transparent)", fontFamily: "var(--font-sans)" }}
                    >
                      {s.duration}
                    </p>
                  )}
                </div>
              </div>
              <span
                className="text-2xl font-light"
                style={{ fontFamily: "var(--font-display)", color: "var(--theme-accent)" }}
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
