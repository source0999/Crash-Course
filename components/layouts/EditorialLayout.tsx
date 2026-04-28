"use client";

/** @file components/layouts/EditorialLayout.tsx */

// ─────────────────────────────────────────
// SECTION: EditorialLayout
// WHAT: Editorial menu on bg-theme-2; all type uses theme-4 / mixes for contrast.
// PHASE 4: allServices from DB.
// ─────────────────────────────────────────

import Image from "next/image";
import { formatServicePrice, type LayoutProps } from "@/lib/utils";

const M = (a: number) => `color-mix(in srgb, var(--theme-4) ${a}%, transparent)`;

export default function EditorialLayout({ allServices }: LayoutProps) {
  return (
    <section
      data-home-band="menu"
      className="px-6 md:px-16 py-24 bg-theme-2 text-theme-4 border-t border-theme-3"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-6 md:gap-8 mb-16">
          <span
            className="text-8xl md:text-9xl font-light leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: M(8),
            }}
          >
            01
          </span>
          <div className="pt-4">
            <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: M(40), fontFamily: "var(--font-sans)" }}>
              The Menu
            </p>
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
              Our Services
            </h2>
          </div>
        </div>

        <div className="space-y-0">
          {allServices.map((s, i) => (
            <div
              key={s.id}
              className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300 hover:px-6 hover:rounded-2xl hover:-mx-6"
              style={{
                borderBottom: i < allServices.length - 1 ? `1px solid ${M(10)}` : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--theme-4) 5%, transparent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div className="flex items-start gap-4">
                {s.image && (
                  <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="80px"
                      quality={75}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--theme-4)" }}>
                    {s.name}
                  </h3>
                  <p
                    className="text-xs uppercase tracking-widest mt-1"
                    style={{ color: M(35), fontFamily: "var(--font-sans)" }}
                  >
                    {s.duration ?? ""}
                  </p>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed self-center"
                style={{
                  color: M(48),
                  fontFamily: "var(--font-sans)",
                  fontWeight: 300,
                }}
              >
                {s.description}
              </p>
              <div className="self-center">
                <span className="text-xl font-bold text-theme-4" style={{ fontFamily: "var(--font-display)" }}>
                  {formatServicePrice(s.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
