// ─────────────────────────────────────────
// SECTION: Book Page
// WHAT: Canonical /book route — clean Vagaro widget wrapper for all site CTAs.
// WHY: Single booking destination replaces the old /booking route. All "Book Now"
//   links across the site point here. Design matches the site's alabaster palette.
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
      className="min-h-[100svh] pt-24 pb-12 px-4 w-full flex flex-col items-center"
      style={{ background: "#F9F7F2" }}
    >
      <div className="w-full max-w-[840px]">
        <div className="mb-8 text-center">
          <p
            className="uppercase tracking-[0.3em] text-xs mb-3"
            style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}
          >
            Fades &amp; Facials · Suwanee, GA
          </p>
          <h1
            className="text-4xl md:text-5xl font-light"
            style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
          >
            Book Your Appointment
          </h1>
        </div>

        {isProduction ? (
          // WHY: Vagaro requires HTTPS — silently fails on http://localhost.
          // The overflow wrapper with -webkit-overflow-scrolling enables native
          // momentum scrolling inside the iframe on iOS Safari, preventing the
          // scroll-lock trap where the page freezes inside the iframe bounds.
          <div
            className="w-full rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(11,19,43,0.1)]"
            style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
          >
            <iframe
              src={VAGARO_SRC}
              width="100%"
              height="900"
              frameBorder="0"
              scrolling="yes"
              title="Book an appointment at Fades and Facials Barbershop"
            />
          </div>
        ) : (
          <div
            className="rounded-3xl p-12 text-center"
            style={{
              border: "2px dashed rgba(11,19,43,0.15)",
              background: "rgba(11,19,43,0.03)",
            }}
          >
            <p
              className="text-lg font-light mb-2"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
            >
              Vagaro Booking Widget
            </p>
            <p
              className="text-sm mb-1"
              style={{ color: "rgba(11,19,43,0.5)", fontFamily: "'Manrope', sans-serif" }}
            >
              Live booking is only available on the production URL.
            </p>
            <p
              className="text-xs font-mono mb-6"
              style={{ color: "rgba(11,19,43,0.3)" }}
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
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-70 touch-manipulation min-h-[44px] px-6 py-3 rounded-full"
              style={{
                background: "#0B132B",
                color: "#F9F7F2",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Open on Vercel to test booking
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7v10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
