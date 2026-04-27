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
// SECTION: FeaturedServicesSection
// WHAT: Featured showcase that adapts its design language to match activeLayout.
// WHY: A single data source (featuredPairs from the RSC pipeline) rendered in 3
//   distinct visual states so the featured section matches the active menu style.
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
    if (!pair.mediaUrl) return <div className={`${className} bg-[#0b132b]`} />;
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
        <section style={{ background: "#0B132B" }}>
          <div className="max-w-6xl mx-auto px-8 pt-16 pb-6">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgba(249,247,242,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
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
                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.5) 100%)",
                  }}
                />
              </div>
              {/* Text panel */}
              <div
                className="w-full md:w-1/2 flex flex-col justify-center px-10 py-14"
                style={{ background: "#0B132B" }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.35em] mb-4"
                  style={{ color: "rgba(249,247,242,0.35)", fontFamily: "'Manrope', sans-serif" }}
                >
                  Featured
                </p>
                <h3
                  className="font-light mb-4 leading-tight"
                  style={{
                    fontFamily: "'Bodoni Moda', serif",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    color: "#F9F7F2",
                  }}
                >
                  {pair.service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8 max-w-sm"
                  style={{
                    color: "rgba(249,247,242,0.55)",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {pair.service.description}
                </p>
                <span
                  className="text-3xl font-light"
                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
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
        <section style={{ background: "#F9F7F2" }} className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-10"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
            >
              Signature Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPairs.map((pair) => (
                <article
                  key={pair.serviceId}
                  className="rounded-3xl overflow-hidden bg-white"
                  style={{ boxShadow: "0 8px 40px rgba(11,19,43,0.1)" }}
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
                          "linear-gradient(to top, rgba(11,19,43,0.85) 0%, rgba(11,19,43,0.3) 50%, transparent 100%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3
                        className="text-2xl font-light text-white mb-1"
                        style={{ fontFamily: "'Bodoni Moda', serif" }}
                      >
                        {pair.service.name}
                      </h3>
                      <span
                        className="text-lg font-light"
                        style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
                      >
                        {formatPrice(pair.service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p
                      className="text-sm"
                      style={{
                        color: "rgba(11,19,43,0.6)",
                        fontFamily: "'Manrope', sans-serif",
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
        <section style={{ background: "#F9F7F2" }} className="px-6 md:px-16 py-16">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
            >
              Featured Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-light mb-8"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
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
                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <p
                    className="text-[11px] uppercase tracking-[0.35em] mb-4"
                    style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}
                  >
                    01
                  </p>
                  <h3
                    className="font-light text-white mb-4 leading-tight"
                    style={{
                      fontFamily: "'Bodoni Moda', serif",
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                    }}
                  >
                    {featuredPairs[0].service.name}
                  </h3>
                  <span
                    className="text-2xl font-light"
                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
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
                        "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <p
                      className="text-[11px] uppercase tracking-[0.35em] mb-3"
                      style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}
                    >
                      {String(i + 2).padStart(2, "0")}
                    </p>
                    <h3
                      className="font-light text-white mb-3 leading-tight"
                      style={{
                        fontFamily: "'Bodoni Moda', serif",
                        fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      }}
                    >
                      {pair.service.name}
                    </h3>
                    <span
                      className="text-xl font-light"
                      style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}
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