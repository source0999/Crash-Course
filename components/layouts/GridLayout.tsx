"use client";

/** @file components/layouts/GridLayout.tsx */

// ─────────────────────────────────────────
// SECTION: GridLayout
// WHAT: Service grid on bg-theme-2; card copy uses theme-4 for contrast on light surfaces.
// PHASE 4: allServices from DB.
// ─────────────────────────────────────────

import Image from "next/image";
import { formatServicePrice, type LayoutProps } from "@/lib/utils";

const M = (a: number) => `color-mix(in srgb, var(--theme-4) ${a}%, transparent)`;

export default function GridLayout({ allServices }: LayoutProps) {
  return (
    <section data-home-band="menu" className="px-4 md:px-5 py-20 max-w-7xl mx-auto bg-theme-2 text-theme-4">
      <div className="text-center mb-14">
        <p className="uppercase tracking-[0.3em] text-xs mb-3" style={{ color: M(40), fontFamily: "var(--font-sans)" }}>
          What We Offer
        </p>
        <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
          Our Services
        </h2>
        <div className="mx-auto mt-5" style={{ width: "40px", height: "1px", background: M(25) }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allServices.map((s, i) => {
          const alt = i % 3 === 1;
          return (
            <div
              key={s.id}
              className="group rounded-3xl overflow-hidden transition-shadow duration-500 hover:shadow-lg"
              style={{
                background: alt ? "var(--theme-surface)" : "color-mix(in srgb, var(--theme-4) 4%, white)",
                border: alt ? "none" : `1px solid ${M(10)}`,
                boxShadow: alt
                  ? "0 8px 40px color-mix(in srgb, var(--theme-bg) 25%, transparent)"
                  : "0 2px 20px color-mix(in srgb, var(--theme-bg) 5%, transparent)",
              }}
            >
              {s.image && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={75}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 md:p-8 text-theme-4">
                <h3 className="text-2xl font-light mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
                  {s.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{
                    color: M(45),
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                  }}
                >
                  {s.description}
                </p>
                <div
                  className="flex justify-between items-end pt-5"
                  style={{ borderTop: `1px solid ${M(12)}` }}
                >
                  <span className="text-xl font-bold text-theme-4" style={{ fontFamily: "var(--font-display)" }}>
                    {formatServicePrice(s.price)}
                  </span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: M(35), fontFamily: "var(--font-sans)" }}>
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
