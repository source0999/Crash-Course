"use client";

/** @file components/layouts/FeaturedServicesSection.tsx */

// ─────────────────────────────────────────
// SECTION: FeaturedServicesSection
// WHAT: Featured showcase bands; copy uses --ink-on-light-surface on soft bands.
// WHY: Scroll reveal is owned by LayoutOrchestrator (RevealOnScroll) so page.tsx controls motion.
// PHASE 4: featuredPairs still resolved server-side in app/page.tsx.
// ─────────────────────────────────────────

import Image from "next/image";
import { isVideoMedia, formatServicePrice, type Layout, type FeaturedPair } from "@/lib/utils";

const INK = "var(--ink-on-light-surface)";
function inkMuted(pct: number) {
  return `color-mix(in srgb, var(--ink-on-light-surface) ${pct}%, transparent)`;
}

export default function FeaturedServicesSection({
  activeLayout,
  featuredPairs,
}: {
  activeLayout: Layout;
  featuredPairs: FeaturedPair[];
}) {
  if (featuredPairs.length === 0) return null;

  function PairMedia({
    pair,
    className,
  }: {
    pair: FeaturedPair;
    className: string;
  }) {
    if (!pair.mediaUrl)
      return <div className={className} style={{ background: "var(--theme-surface)" }} />;
    if (isVideoMedia(pair.mediaUrl, pair.service.media_type)) {
      return (
        <video
          src={pair.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className={className}
        />
      );
    }
    return (
      <Image
        src={pair.mediaUrl}
        alt={pair.service.name}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={75}
        className="object-cover"
      />
    );
  }

  switch (activeLayout) {
    case "cinematic":
      return (
        <section data-home-band="featured" className="bg-theme-2 text-theme-4">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-6">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-2"
              style={{ color: inkMuted(42), fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              Signature Menu
            </h2>
          </div>
          {featuredPairs.slice(0, 6).map((pair, i) => (
            <div
              key={pair.serviceId}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="relative w-full md:w-1/2 overflow-hidden" style={{ height: "55svh" }}>
                <PairMedia
                  pair={pair}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, color-mix(in srgb, black 55%, transparent) 0%, color-mix(in srgb, black 22%, transparent) 100%)",
                  }}
                />
              </div>
              <div
                data-featured-panel="true"
                data-featured-panel-index={i}
                data-home-panel={i % 2 === 0 ? "light" : "tint"}
                className={`w-full md:w-1/2 flex flex-col justify-center px-6 md:px-10 py-10 md:py-14 ${
                  i % 2 === 0 ? "bg-white" : "bg-theme-1"
                }`}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.35em] mb-4"
                  style={{ color: inkMuted(38), fontFamily: "var(--font-sans)" }}
                >
                  Featured
                </p>
                <h3
                  className="font-light mb-4 leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    color: "inherit",
                  }}
                >
                  {pair.service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8 max-w-sm"
                  style={{
                    color: inkMuted(48),
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                  }}
                >
                  {pair.service.description}
                </p>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "inherit" }}
                >
                  {formatServicePrice(pair.service.price)}
                </span>
              </div>
            </div>
          ))}
        </section>
      );

    case "grid":
      return (
        <section data-home-band="featured" className="bg-theme-2 text-theme-4 px-4 md:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: inkMuted(42), fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-10"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              Signature Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPairs.slice(0, 6).map((pair) => (
                <article
                  key={pair.serviceId}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "var(--theme-surface)",
                    boxShadow: "0 8px 40px color-mix(in srgb, var(--theme-bg) 10%, transparent)",
                  }}
                >
                  <div className="relative aspect-[3/4]">
                    <PairMedia
                      pair={pair}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, color-mix(in srgb, black 78%, transparent) 0%, color-mix(in srgb, black 18%, transparent) 50%, transparent 100%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-6 py-6 text-white">
                      <h3
                        className="text-2xl font-light mb-1 drop-shadow-sm"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {pair.service.name}
                      </h3>
                      <span className="text-lg font-light text-white/90" style={{ fontFamily: "var(--font-display)" }}>
                        {formatServicePrice(pair.service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <p
                      className="text-sm"
                      style={{
                        color: inkMuted(42),
                        fontFamily: "var(--font-sans)",
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

    case "editorial":
    default:
      return (
        <section data-home-band="featured" className="bg-theme-2 text-theme-4 px-4 md:px-16 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: inkMuted(42), fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-8"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              Signature Menu
            </h2>

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
                      "linear-gradient(to bottom, color-mix(in srgb, black 45%, transparent) 0%, color-mix(in srgb, black 62%, transparent) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-8 text-white">
                  <p
                    className="text-[11px] uppercase tracking-[0.35em] mb-4 text-white/75"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    01
                  </p>
                  <h3
                    className="font-light mb-4 leading-tight drop-shadow-sm"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                    }}
                  >
                    {featuredPairs[0].service.name}
                  </h3>
                  <span className="text-2xl font-light text-white/90" style={{ fontFamily: "var(--font-display)" }}>
                    {formatServicePrice(featuredPairs[0].service.price)}
                  </span>
                </div>
              </div>
            )}

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
                        "linear-gradient(to bottom, color-mix(in srgb, black 45%, transparent) 0%, color-mix(in srgb, black 62%, transparent) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">
                    <p
                      className="text-[11px] uppercase tracking-[0.35em] mb-3 text-white/75"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {String(i + 2).padStart(2, "0")}
                    </p>
                    <h3
                      className="font-light mb-3 leading-tight drop-shadow-sm"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      }}
                    >
                      {pair.service.name}
                    </h3>
                    <span className="text-xl font-light text-white/90" style={{ fontFamily: "var(--font-display)" }}>
                      {formatServicePrice(pair.service.price)}
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
