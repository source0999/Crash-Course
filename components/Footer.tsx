/** @file components/Footer.tsx */

// ─────────────────────────────────────────
// SECTION: Footer
// WHAT: Site-wide footer with brand, nav links, and barber pole animation.
// WHY: Consistent closure for every page — signals the brand and provides
//   navigation anchors without requiring the user to scroll back to the top.
// PHASE 4: No changes needed — static content, no DB dependency.
// ─────────────────────────────────────────

import Link from "next/link";

const NAV_LINKS = [
  { href: "/",        label: "Home"     },
  { href: "/services", label: "Services" },
  { href: "/gallery",  label: "Gallery"  },
  { href: "/book",     label: "Book Now" },
] as const;

export default function Footer() {
  const topBarHeight = "5px";
  const topBarBackgroundSize = "72px 100%";
  const topBarAnimation = "barber-pole-h 5.2s linear infinite";
  const topBarPatternType = "repeating-linear-gradient";
  const brandPoleAnimation = "barber-pole 3.8s linear infinite";
  const brandPoleBackgroundSize = "100% 36px";

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "components/Footer.tsx:23",
      message: "Footer rendered and top barber bar is active",
      data: { topBarHeight },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "post-fix",
      hypothesisId: "H11",
      location: "components/Footer.tsx:28",
      message: "Brand vertical pole smoothing config",
      data: { brandPoleAnimation, brandPoleBackgroundSize },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "components/Footer.tsx:24",
      message: "Top barber bar animation config",
      data: { topBarAnimation },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "components/Footer.tsx:25",
      message: "Top barber bar stripe density config",
      data: { topBarBackgroundSize },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "components/Footer.tsx:26",
      message: "Top barber bar gradient direction for horizontal motion",
      data: { gradientDirection: "135deg" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-next-fix",
      hypothesisId: "H6",
      location: "components/Footer.tsx:26",
      message: "Top barber bar currently uses repeating pattern",
      data: { topBarPatternType },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
    body: JSON.stringify({
      sessionId: "82ce2f",
      runId: "pre-next-fix",
      hypothesisId: "H7",
      location: "components/Footer.tsx:27",
      message: "Top barber bar stripe stop widths can cause visible borders",
      data: { accentPx: 5, mutedPx: 5 },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <footer
      style={{
        background: "var(--theme-surface)",
        borderTop: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)",
      }}
    >
      {/* ── Barber pole horizontal cap ───────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          height: topBarHeight,
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--theme-accent) 0px, var(--theme-accent) 18px, color-mix(in srgb, var(--theme-accent) 18%, transparent) 18px, color-mix(in srgb, var(--theme-accent) 18%, transparent) 36px)",
          backgroundSize: topBarBackgroundSize,
          animation: topBarAnimation,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">

          {/* Brand column */}
          <div>
            <p
              className="text-2xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
            >
              Fades &amp; Facials
            </p>
            <p
              className="text-xs uppercase tracking-[0.25em] mb-6"
              style={{ color: "color-mix(in srgb, var(--theme-text) 45%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Suwanee, GA
            </p>
            {/* Inline barber pole accent element */}
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "40px",
                  borderRadius: "99px",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, color-mix(in srgb, var(--theme-accent) 92%, white) 0px, color-mix(in srgb, var(--theme-accent) 92%, white) 8px, color-mix(in srgb, var(--theme-accent) 40%, black) 8px, color-mix(in srgb, var(--theme-accent) 40%, black) 16px)",
                  backgroundSize: brandPoleBackgroundSize,
                  animation: brandPoleAnimation,
                }}
              />
              <p
                className="text-xs"
                style={{ color: "color-mix(in srgb, var(--theme-text) 35%, transparent)", fontFamily: "var(--font-sans)" }}
              >
                Premium grooming, every visit.
              </p>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-5"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Navigate
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-all duration-200 touch-manipulation min-h-[44px] flex items-center"
                  style={{
                    color: "color-mix(in srgb, var(--theme-text) 70%, transparent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact / social column */}
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-5"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Connect
            </p>
            <a
              href="https://instagram.com/fadesandfacials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm touch-manipulation min-h-[44px] flex items-center"
              style={{ color: "color-mix(in srgb, var(--theme-text) 70%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              @fadesandfacials
            </a>
            <p
              className="text-sm mt-2"
              style={{ color: "color-mix(in srgb, var(--theme-text) 45%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Suwanee, GA 30024
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-12 pt-6"
          style={{ borderTop: "1px solid color-mix(in srgb, var(--theme-text) 6%, transparent)" }}
        >
          <p
            className="text-[11px] text-center"
            style={{ color: "color-mix(in srgb, var(--theme-text) 30%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            © sourc3code 2026 • @fadesandfacials 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
