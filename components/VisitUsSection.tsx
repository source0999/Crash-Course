// ─────────────────────────────────────────
// SECTION: VisitUsSection
// WHAT: Shared "Find Us" section — map embed, address, and hours grid.
// WHY: Identical across all three layouts, extracted to avoid duplication.
// PHASE 4: Hours data is hardcoded. Could be moved to site_config table.
// ─────────────────────────────────────────

export default function VisitUsSection() {
  const embedSrc =
    "https://maps.google.com/maps?q=4090+Johns+Creek+Pkwy+%23+E,+Suwanee,+GA+30024&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section
      data-home-band="visit"
      className="relative z-20 px-6 py-24"
      style={{
        background: "var(--home-band-a, var(--theme-surface))",
        color: "var(--home-band-text, var(--theme-text))",
        ["--theme-text" as string]: "var(--home-band-text, var(--theme-text))",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className="relative w-full aspect-video lg:aspect-square rounded-3xl overflow-hidden"
            style={{
              border: "1px solid rgba(249,247,242,0.18)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            <iframe
              src={embedSrc}
              width="100%"
              height="100%"
              style={{
                border: 0,
                minHeight: "400px",
                filter: "invert(100%) hue-rotate(180deg) brightness(85%) contrast(115%)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Fades and Facials location"
            />
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 70%, rgba(11,19,43,0.35) 100%)",
              }}
            />
          </div>

          <div style={{ fontFamily: "'Manrope', sans-serif" }}>
            <p
              className="uppercase tracking-[0.3em] text-xs mb-3"
              style={{ color: "#F9F7F2", opacity: 0.65, fontFamily: "'Manrope', sans-serif" }}
            >
              Find Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}
            >
              Visit Us
            </h2>
            <p className="text-sm tracking-widest uppercase font-medium mb-1" style={{ color: "#F9F7F2" }}>
              Shops at Johns Creek
            </p>
            <p className="text-sm tracking-widest uppercase" style={{ color: "#F9F7F2", opacity: 0.75 }}>
              4090 Johns Creek Pkwy # E
            </p>
            <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "#F9F7F2", opacity: 0.75 }}>
              Suwanee, GA 30024
            </p>
            <a
              href="https://maps.google.com/?q=4090+Johns+Creek+Pkwy+E+Suwanee+GA+30024"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "#F9F7F2", fontFamily: "'Manrope', sans-serif" }}
            >
              Get Directions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div className="mt-8 grid grid-cols-2 gap-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {[
                { day: "Mon – Tue", hours: "Closed" },
                { day: "Wed – Fri", hours: "10am – 7pm" },
                { day: "Saturday", hours: "9am – 6pm" },
                { day: "Sunday", hours: "11am – 4pm" },
              ].map(({ day, hours }) => (
                <div
                  key={day}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(249,247,242,0.06)",
                    border: "1px solid rgba(249,247,242,0.18)",
                  }}
                >
                  <p className="text-sm uppercase tracking-widest mb-1" style={{ color: "#F9F7F2", opacity: 0.65 }}>
                    {day}
                  </p>
                  <p
                    className="text-sm font-medium uppercase tracking-widest"
                    style={{ color: hours === "Closed" ? "rgba(249,247,242,0.45)" : "#F9F7F2" }}
                  >
                    {hours}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
