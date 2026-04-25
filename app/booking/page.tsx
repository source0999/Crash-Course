export default function BookingPage() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_URL !== undefined;

  // ─────────────────────────────────────────
  // SECTION: Vagaro Booking Widget
  // WHAT: Renders live Vagaro booking iframe on production, placeholder on localhost.
  // WHY: Vagaro's iframe requires HTTPS — it silently fails on http://localhost.
  //      Showing a clear message prevents confusion during development.
  // PRODUCTION: The iframe src URL comes from Vagaro dashboard → Promote →
  //             Booking Widget. If the barber regenerates the widget, update the src.
  // ─────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0f1e2e] text-white">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Book Your Appointment
        </h1>

        {isProduction ? (
          <div className="mt-10 bg-white rounded-2xl overflow-hidden text-left shadow-xl">
            {/* VAGARO EMBED — live booking widget for Fades & Facials Barbershop, Suwanee GA
                To update: log into Vagaro dashboard → Promote → Booking Widget → copy new src URL
                The enc= parameter is unique to this business account */}
            <iframe
              src="https://www.vagaro.com/Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVCGo+Ra0FiSg17zHqo8Cvgt5dx5q5uTy3XYvAHiBYwCT6NRx6QAfMibDNs+0/QQlBOcfdqL5Ol+0o9meGD1BMLds5HBOy3IQA2df/ex8RHErqgA+46Edc5NzPu3sGXbtRDXut1UEqiFOk7soZssDsQJw2AIoPOYNxp83BlmaFnaKtHtZJI6ZldMd9steX8SnCF2eBNpsIXUnFT54S8Uxb0xVQ1SzRu69h0yaMYx+ReHNbuTQpzWremtAEw2ns9ztoMPIHulfhz3leV75xjRrswup17TEOQlKhLsIVYJ3zLohvtTd9JX0qT6KP+DMrD/C8k0GgCJQrcsS5u6mLLD0IDs/daxL544lWraK2UQAXXdofd++Dd+/MBCV4dx/PT16rYH7IB1bTRmY5floTs1x7NQ="
              width="100%"
              height="900"
              frameBorder="0"
              scrolling="auto"
              title="Book an appointment at Fades and Facials Barbershop"
            />
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-12 text-center">
            <p className="text-lg font-semibold text-white">
              Vagaro Booking Widget
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Live booking is only available on the production URL.
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600">
              Requires HTTPS — deploy to Vercel to test the full booking flow.
            </p>
            <a
              href={
                process.env.NEXT_PUBLIC_VERCEL_URL
                  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/booking`
                  : "https://fades-and-facials.vercel.app/booking"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-xl border border-amber-500/50 px-6 py-3 font-semibold text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              Open on Vercel to test booking →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
