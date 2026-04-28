/** @file app/book/page.tsx */

// ─────────────────────────────────────────
// SECTION: Book Page
// WHAT: Luxurious glass-style wrapper around the Vagaro booking iframe.
// WHY: Single canonical /book route for all site CTAs. The iframe is the actual
//   booking engine — premium wrapper elevates it to feel native to the brand.
// PHASE 4: No changes needed — VAGARO_SRC is stable unless the barber regenerates
//   the widget in Vagaro dashboard → Promote → Booking Widget.
// ─────────────────────────────────────────

// WHY: Vagaro embed URL is extracted to a constant so any future URL rotation
// requires a single-line change rather than hunting through JSX.
const VAGARO_SRC =
  "https://www.vagaro.com/Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVCGo+Ra0FiSg17zHqo8Cvgt5dx5q5uTy3XYvAHiBYwCT6NRx6QAfMibDNs+0/QQlBOcfdqL5Ol+0o9meGD1BMLds5HBOy3IQA2df/ex8RHErqgA+46Edc5NzPu3sGXbtRDXut1UEqiFOk7soZssDsQJw2AIoPOYNxp83BlmaFnaKtHtZJI6ZldMd9steX8SnCF2eBNpsIXUnFT54S8Uxb0xVQ1SzRu69h0yaMYx+ReHNbuTQpzWremtAEw2ns9ztoMPIHulfhz3leV75xjRrswup17TEOQlKhLsIVYJ3zLohvtTd9JX0qT6KP+DMrD/C8k0GgCJQrcsS5u6mLLD0IDs/daxL544lWraK2UQAXXdofd++Dd+/MBCV4dx/PT16rYH7IB1bTRmY5floTs1x7NQ=";

export default function BookPage() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_URL !== undefined;

  return (
    <main
      className="min-h-[100svh] pt-24 pb-16 px-4"
      style={{ background: "var(--theme-bg)" }}
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Page header ── */}
        <div className="text-center mb-12">
          <p
            className="text-[11px] uppercase tracking-[0.35em] mb-4"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Fades &amp; Facials · Suwanee, GA
          </p>
          <h1
            className="font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--theme-text)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.05,
            }}
          >
            Book Your Chair
          </h1>
          <div
            className="mx-auto mt-5"
            style={{
              width: "48px",
              height: "2px",
              background: "var(--theme-accent)",
              borderRadius: "1px",
            }}
          />
          <p
            className="mt-5 text-sm"
            style={{
              color: "color-mix(in srgb, var(--theme-text) 50%, transparent)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Select your service, pick a time, and lock in your spot.
          </p>
        </div>

        {/* ── Vagaro widget or dev placeholder ── */}
        {isProduction ? (
          // WHY: Vagaro requires HTTPS — silently fails on http://localhost.
          // The outer ring adds a premium accent glow. The inner container handles
          // iOS momentum scrolling via -webkit-overflow-scrolling:touch.
          <div className="relative">
            {/* WHY: Accent ring gives the iframe a native, brand-integrated feel. */}
            <div
              className="absolute -inset-px rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 30%, transparent) 0%, transparent 50%, color-mix(in srgb, var(--theme-accent) 15%, transparent) 100%)",
              }}
            />
            <div
              className="relative w-full rounded-3xl overflow-hidden"
              style={{
                border: "1px solid color-mix(in srgb, var(--theme-accent) 22%, transparent)",
                boxShadow:
                  "0 24px 80px color-mix(in srgb, var(--theme-accent) 12%, transparent), 0 4px 24px color-mix(in srgb, var(--theme-bg) 40%, transparent)",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                background: "var(--theme-surface)",
              }}
            >
              <iframe
                src={VAGARO_SRC}
                width="100%"
                height="900"
                frameBorder="0"
                scrolling="yes"
                title="Book an appointment at Fades and Facials Barbershop"
                style={{ display: "block" }}
              />
            </div>
          </div>
        ) : (
          <div
            className="rounded-3xl p-12 text-center"
            style={{
              border: "2px dashed color-mix(in srgb, var(--theme-text) 12%, transparent)",
              background: "color-mix(in srgb, var(--theme-text) 3%, transparent)",
            }}
          >
            <p
              className="text-lg font-light mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
            >
              Vagaro Booking Widget
            </p>
            <p
              className="text-sm mb-1"
              style={{ color: "color-mix(in srgb, var(--theme-text) 50%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Live booking is only available on the production URL.
            </p>
            <p
              className="text-xs font-mono mb-8"
              style={{ color: "color-mix(in srgb, var(--theme-text) 30%, transparent)" }}
            >
              Requires HTTPS — deploy to Vercel to test the full booking flow.
            </p>
            <a
              href={
                process.env.NEXT_PUBLIC_VERCEL_URL
                  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/book`
                  : "https://fades-and-facials.vercel.app/book"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation min-h-[44px] px-8 py-3 rounded-full"
              style={{
                background: "var(--theme-accent)",
                color: "var(--theme-bg)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Open on Vercel to test booking
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
