"use client";

/** @file components/layouts/CinematicLayout.tsx */

// ─────────────────────────────────────────
// SECTION: CinematicLayout
// WHAT: Service menu list on bg-theme-2 with dark ink (theme-4) for all type.
// WHY: theme-text inverts on earth/neon; soft bands always use theme-4. Reveal wraps in LayoutOrchestrator.
// PHASE 4: allServices from DB.
// ─────────────────────────────────────────

import { formatServicePrice, type LayoutProps } from "@/lib/utils";

const MUTED = "color-mix(in srgb, var(--theme-4) 40%, transparent)";
const SUBTLE = "color-mix(in srgb, var(--theme-4) 22%, transparent)";

export default function CinematicLayout({ allServices }: LayoutProps) {
  return (
    <section data-home-band="menu" className="px-6 md:px-8 py-20 bg-theme-2 text-theme-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: MUTED, fontFamily: "var(--font-sans)" }}>
          The Full Menu
        </p>
        <h2 className="text-4xl md:text-5xl font-light mb-12" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
          Our Services
        </h2>
        <div>
          {allServices.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-6"
              style={{
                borderBottom:
                  i < allServices.length - 1 ? `1px solid color-mix(in srgb, var(--theme-4) 10%, transparent)` : "none",
              }}
            >
              <div className="flex items-center gap-5">
                <span className="text-xs tabular-nums shrink-0" style={{ color: SUBTLE, fontFamily: "var(--font-sans)" }}>
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
                  <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
                    {s.name}
                  </h3>
                  {s.duration && (
                    <p
                      className="text-xs uppercase tracking-widest mt-0.5"
                      style={{ color: MUTED, fontFamily: "var(--font-sans)" }}
                    >
                      {s.duration}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xl font-bold text-theme-4" style={{ fontFamily: "var(--font-display)" }}>
                {formatServicePrice(s.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
