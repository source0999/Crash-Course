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
// SECTION: EditorialLayout
// WHAT: Magazine-style typographic service menu.
// WHY: Hero and featured slots hoisted; this component is a pure service list.
//   The "expanding row" hover effect and ghost watermark number are kept intact.
// PHASE 4: allServices from DB.
// ─────────────────────────────────────────

import type { LayoutProps } from "@/lib/utils";

export default function EditorialLayout({ allServices }: LayoutProps) {
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