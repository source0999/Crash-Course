/** @file components/layouts/FeaturedServicesSection.tsx */

/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * This file has been audited: no banned values present.
 */

// ─────────────────────────────────────────
// SECTION: FeaturedServicesSection
// WHAT: Featured showcase that adapts its design language to match activeLayout.
// WHY: A single data source (featuredPairs from the RSC pipeline) rendered in 3
//   distinct visual states so the featured section matches the active menu style.
//   All hero/panel content uses px-4 minimum on mobile to prevent edge bleed.
// PHASE 4: No changes needed — featuredPairs resolved server-side in app/page.tsx.
// ─────────────────────────────────────────

import { isVideoMedia, type Layout, type FeaturedPair } from "@/lib/utils";

export default function FeaturedServicesSection({
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
        <section
          data-home-band="featured"
          style={{
            background: "var(--home-band-a, var(--theme-bg))",
            ["--theme-text" as string]: "var(--home-band-text, #1f3d63)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-6">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-2"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light"
              style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
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
                      "linear-gradient(to bottom, color-mix(in srgb, var(--theme-bg) 20%, transparent) 0%, color-mix(in srgb, var(--theme-bg) 50%, transparent) 100%)",
                  }}
                />
              </div>
              {/* Text panel — px-6 on mobile ensures no content touches screen edge */}
              <div
                data-featured-panel="true"
                data-featured-panel-index={i}
                className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-10 py-10 md:py-14"
                style={{
                  background: i % 2 === 0
                    ? "var(--home-band-b, var(--theme-surface))"
                    : "var(--home-band-a, var(--theme-bg))",
                  ["--theme-text" as string]: "var(--home-band-text, #1f3d63)",
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.35em] mb-4"
                  style={{ color: "color-mix(in srgb, var(--theme-text) 35%, transparent)", fontFamily: "var(--font-sans)" }}
                >
                  Featured
                </p>
                <h3
                  className="font-light mb-4 leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    color: "var(--theme-text)",
                  }}
                >
                  {pair.service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8 max-w-sm"
                  style={{
                    color: "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                  }}
                >
                  {pair.service.description}
                </p>
                <span
                  className="text-3xl font-light"
                  style={{ fontFamily: "var(--font-display)", color: "var(--theme-accent)" }}
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
        <section
          data-home-band="featured"
          style={{
            background: "var(--home-band-a, var(--theme-bg))",
            ["--theme-text" as string]: "var(--home-band-text, #1f3d63)",
          }}
          className="px-4 md:px-6 py-16"
        >
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-10"
              style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
            >
              Signature Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPairs.map((pair) => (
                <article
                  key={pair.serviceId}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "var(--theme-surface)",
                    boxShadow: "0 8px 40px color-mix(in srgb, var(--theme-bg) 10%, transparent)",
                  }}
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
                          "linear-gradient(to top, color-mix(in srgb, var(--theme-bg) 85%, transparent) 0%, color-mix(in srgb, var(--theme-bg) 30%, transparent) 50%, transparent 100%)",
                      }}
                    />
                    {/* px-6 ensures name/price never touch card edges on mobile */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 py-6">
                      <h3
                        className="text-2xl font-light mb-1"
                        style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
                      >
                        {pair.service.name}
                      </h3>
                      <span
                        className="text-lg font-light"
                        style={{ fontFamily: "var(--font-display)", color: "var(--theme-accent)" }}
                      >
                        {formatPrice(pair.service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <p
                      className="text-sm"
                      style={{
                        color: "color-mix(in srgb, var(--theme-text) 60%, transparent)",
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

    // ── Editorial: magazine stack — full-width hero + 2-col strip ──
    case "editorial":
    default:
      return (
        <section
          data-home-band="featured"
          style={{
            background: "var(--home-band-a, var(--theme-bg))",
            ["--theme-text" as string]: "var(--home-band-text, #1f3d63)",
          }}
          className="px-4 md:px-16 py-16"
        >
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
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
                      "linear-gradient(to bottom, color-mix(in srgb, var(--theme-bg) 20%, transparent) 0%, color-mix(in srgb, var(--theme-bg) 65%, transparent) 100%)",
                  }}
                />
                {/* px-6 minimum ensures content never touches rounded card edge on mobile */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-8">
                  <p
                    className="text-[11px] uppercase tracking-[0.35em] mb-4"
                    style={{ color: "color-mix(in srgb, var(--theme-text) 50%, transparent)", fontFamily: "var(--font-sans)" }}
                  >
                    01
                  </p>
                  <h3
                    className="font-light mb-4 leading-tight"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                      color: "var(--theme-text)",
                    }}
                  >
                    {featuredPairs[0].service.name}
                  </h3>
                  <span
                    className="text-2xl font-light"
                    style={{ fontFamily: "var(--font-display)", color: "var(--theme-accent)" }}
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
                        "linear-gradient(to bottom, color-mix(in srgb, var(--theme-bg) 20%, transparent) 0%, color-mix(in srgb, var(--theme-bg) 65%, transparent) 100%)",
                    }}
                  />
                  {/* px-6 minimum keeps text off rounded card edges on any screen width */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <p
                      className="text-[11px] uppercase tracking-[0.35em] mb-3"
                      style={{ color: "color-mix(in srgb, var(--theme-text) 50%, transparent)", fontFamily: "var(--font-sans)" }}
                    >
                      {String(i + 2).padStart(2, "0")}
                    </p>
                    <h3
                      className="font-light mb-3 leading-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                        color: "var(--theme-text)",
                      }}
                    >
                      {pair.service.name}
                    </h3>
                    <span
                      className="text-xl font-light"
                      style={{ fontFamily: "var(--font-display)", color: "var(--theme-accent)" }}
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
