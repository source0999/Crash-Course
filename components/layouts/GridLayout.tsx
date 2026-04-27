/** @file components/layouts/GridLayout.tsx */

/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * This file has been audited: no banned values present.
 */

// ─────────────────────────────────────────
// SECTION: GridLayout
// WHAT: Pure service grid styled in the active theme palette.
// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.
//   Alternating card uses var(--theme-surface) for depth without hardcoded dark values.
// PHASE 4: allServices from DB replaces the old static SERVICES array.
// ─────────────────────────────────────────

import type { LayoutProps } from "@/lib/utils";

export default function GridLayout({ allServices }: LayoutProps) {
  return (
    <section
      data-home-band="menu"
      className="px-4 md:px-5 py-20 max-w-7xl mx-auto"
      style={{
        background: "var(--home-band-b, var(--theme-bg))",
        ["--theme-text" as string]: "var(--home-band-text, var(--theme-text))",
      }}
    >
      <div className="text-center mb-14">
        <p
          className="uppercase tracking-[0.3em] text-xs mb-3"
          style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
        >
          What We Offer
        </p>
        <h2
          className="text-4xl md:text-5xl font-light"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
        >
          Our Services
        </h2>
        <div
          className="mx-auto mt-5"
          style={{ width: "40px", height: "1px", background: "color-mix(in srgb, var(--theme-text) 25%, transparent)" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* WHY: i % 3 === 1 reproduces alternating surface-card rhythm without a
            static `dark` flag — DB services have no such column. */}
        {allServices.map((s, i) => {
          const alt = i % 3 === 1;
          return (
            <div
              key={s.id}
              className="group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{
                background: alt ? "var(--theme-surface)" : "color-mix(in srgb, var(--theme-text) 4%, transparent)",
                border: alt
                  ? "none"
                  : "1px solid color-mix(in srgb, var(--theme-text) 7%, transparent)",
                boxShadow: alt
                  ? "0 8px 40px color-mix(in srgb, var(--theme-bg) 25%, transparent)"
                  : "0 2px 20px color-mix(in srgb, var(--theme-bg) 5%, transparent)",
              }}
            >
              {s.image && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6 md:p-8">
                <h3
                  className="text-2xl font-light mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--theme-text)",
                  }}
                >
                  {s.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{
                    color: "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                  }}
                >
                  {s.description}
                </p>
                <div
                  className="flex justify-between items-end pt-5"
                  style={{
                    borderTop: "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
                  }}
                >
                  <span
                    className="text-2xl font-light"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--theme-accent)",
                    }}
                  >
                    {typeof s.price === "number" ? `$${s.price}` : s.price}
                  </span>
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{
                      color: "color-mix(in srgb, var(--theme-text) 35%, transparent)",
                      fontFamily: "var(--font-sans)",
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
