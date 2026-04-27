/* Fades & Facials — shared React components.
   Production parity: Navbar (LifeTime Flip), BookNowPill (scroll physics),
   Footer (sourc3code 2026), VisitUsSection w/ luxury map ping. */

const { useState, useEffect, useRef, useMemo } = React;

// ── Service catalog (mirrors Supabase services rows + lib/services.ts) ──
const ALL_SERVICES = [
  { id: 1, category: "Cuts",       name: "Fade Cut",            price: 42, duration: "45 min", description: "Clean, precise fades tailored to your style." },
  { id: 2, category: "Cuts",       name: "Specialty Fade Cut",  price: 42, duration: "60 min", description: "Advanced fade techniques for a signature look." },
  { id: 3, category: "Cuts",       name: "Children's Fade",     price: 32, duration: "30 min", description: "Kid-friendly cuts with the same precision." },
  { id: 4, category: "Beard Care", name: "Beard Care",          price: 35, duration: "30 min", description: "Shape and condition your beard to perfection." },
  { id: 5, category: "Beard Care", name: "Fade and Shave",      price: 60, duration: "75 min", description: "Full fade paired with a clean straight razor shave." },
  { id: 6, category: "Beard Care", name: "Hot Shave",           price: 35, duration: "30 min", description: "Classic hot towel straight razor shave." },
  { id: 7, category: "Hair Care",  name: "Shampoo",             price: 12, duration: "15 min", description: "Deep cleanse and scalp treatment." },
  { id: 8, category: "Hair Care",  name: "Line Up",             price: 26, duration: "20 min", description: "Sharp, defined edges for a clean finish." },
  { id: 9, category: "Hair Care",  name: "Enhancement",         price: 12, duration: "15 min", description: "Color and texture enhancements." },
  { id: 10,category: "Hair Care",  name: "Bald Fade",           price: 40, duration: "45 min", description: "Seamless fade down to skin." },
];

// Default featured slot ids (admin-controlled in prod)
const DEFAULT_FEATURED = [5, 1, 6];

// Hero media — Unsplash stand-ins (per user choice)
const HERO_MEDIA = [
  { id: "hero-barber",   url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=2000&q=80", label: "Barber chair, low light" },
  { id: "hero-fade",     url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2000&q=80", label: "Fade closeup" },
  { id: "hero-shave",    url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=2000&q=80", label: "Hot towel shave" },
  { id: "hero-storefront",url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=2000&q=80", label: "Shop interior" },
];

// Gallery items
const GALLERY_ITEMS = [
  { id: 1, file_url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=900&q=80", title: "Skin fade",       file_type: "image" },
  { id: 2, file_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80", title: "Beard sculpt",    file_type: "image" },
  { id: 3, file_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80", title: "Hot shave",       file_type: "image" },
  { id: 4, file_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80", title: "Chair",           file_type: "image" },
  { id: 5, file_url: "https://images.unsplash.com/photo-1593702288056-f173cdfd66bf?auto=format&fit=crop&w=900&q=80", title: "Line up",          file_type: "image" },
  { id: 6, file_url: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80", title: "Tools",            file_type: "image" },
  { id: 7, file_url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80", title: "Storefront",       file_type: "image" },
  { id: 8, file_url: "https://images.unsplash.com/photo-1635273051937-f54c8d22b8d3?auto=format&fit=crop&w=900&q=80", title: "Pomade",           file_type: "image" },
  { id: 9, file_url: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=900&q=80", title: "Texture",          file_type: "image" },
  { id:10, file_url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=900&q=80", title: "Detail",           file_type: "image" },
  { id:11, file_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80", title: "Trim",             file_type: "image" },
  { id:12, file_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80", title: "Mood",             file_type: "image" },
];

// ── useScrollY: scroll listener compatible with iOS Safari ──
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const get = () => window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
    const onScroll = () => setY(get());
    const targets = [window, document, document.documentElement, document.body];
    targets.forEach(t => t.addEventListener("scroll", onScroll, { passive: true }));
    onScroll();
    return () => targets.forEach(t => t.removeEventListener("scroll", onScroll));
  }, []);
  return y;
}

// ── Logo Mark (compact wordmark in nav, full mark on hero) ──
function LogoMark({ tone = "light", size = 44 }) {
  // tone: "light" = white text, "dark" = ink text
  const color = tone === "light" ? "#F9F7F2" : "var(--theme-text)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <span style={{
        width: size * 0.16, height: size * 0.9, borderRadius: 999,
        background: "repeating-linear-gradient(135deg, var(--theme-accent) 0 6px, currentColor 6px 12px, var(--theme-bg) 12px 18px)",
        opacity: 0.95, animation: "pole-stripes 3s linear infinite",
        backgroundSize: "100% 32px",
      }}/>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontStyle: "italic", fontSize: size * 0.5 }}>Fades</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.18, letterSpacing: "0.4em", textTransform: "uppercase", marginTop: 2, opacity: 0.7 }}>& facials</div>
      </div>
    </div>
  );
}

// ── Navbar (LifeTime Flip) ──
function Navbar({ route, onNav, isHome }) {
  const y = useScrollY();
  const scrolled = y > 80;
  const [open, setOpen] = useState(false);

  const links = [
    { id: "home",     label: "Home" },
    { id: "services", label: "Services" },
    { id: "gallery",  label: "Gallery" },
    { id: "book",     label: "Book" },
  ];

  // Above hero: transparent + paper text. Scrolled: glass ink chip.
  const containerStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
    transform: "translate3d(0,0,0)",
    transition: "transform 320ms var(--ease-out), opacity 320ms",
    padding: scrolled ? "12px 16px 0" : (isHome ? "20px 0 0" : "16px 0 0"),
    pointerEvents: "auto",
  };

  const innerStyle = scrolled
    ? {
        margin: "0 auto",
        maxWidth: 1180,
        padding: "10px 14px 10px 18px",
        background: "color-mix(in srgb, var(--theme-bg) 78%, transparent)",
        borderRadius: 999,
        border: "1px solid var(--ink-10)",
        boxShadow: "0 18px 48px rgba(11,19,43,0.10)",
        color: "var(--theme-text)",
        backdropFilter: "saturate(140%) blur(8px)",
      }
    : {
        margin: 0,
        padding: isHome ? "16px 28px" : "16px 28px",
        background: isHome ? "transparent" : "var(--theme-deep)",
        borderBottom: isHome ? "1px solid rgba(255,255,255,0.18)" : "none",
        color: "#F9F7F2",
      };

  const linkColor = scrolled ? "var(--theme-text)" : "#F9F7F2";

  return (
    <nav style={containerStyle}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        ...innerStyle,
      }}>
        <button onClick={() => onNav("home")} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "inherit" }} aria-label="Home">
          <LogoMark tone={scrolled ? "dark" : "light"} size={scrolled ? 36 : 44} />
        </button>

        <div className="nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {links.map(l => (
            <button key={l.id} onClick={() => onNav(l.id)}
              style={{
                background: "none", border: 0, cursor: "pointer", color: linkColor,
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em",
                textTransform: "uppercase", padding: "10px 4px", minHeight: 44,
                opacity: route === l.id ? 1 : 0.72,
                position: "relative",
              }}>
              {l.label}
              {route === l.id && (
                <span style={{
                  position: "absolute", left: 4, right: 4, bottom: 4, height: 1,
                  background: "var(--theme-accent)",
                  transformOrigin: "left",
                  animation: "line-grow 320ms var(--ease-out) both",
                }} />
              )}
            </button>
          ))}
          <button onClick={() => onNav("book")}
            className="pill pill-accent"
            style={{ marginLeft: 12 }}>
            Book Now
          </button>
        </div>

        <button onClick={() => setOpen(o => !o)}
          className="nav-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            display: "none",
            minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center",
            background: "none", border: 0, cursor: "pointer", color: linkColor,
            fontSize: 22,
          }}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div style={{
          margin: "8px 16px 0", borderRadius: 24, padding: 16,
          background: "var(--theme-text)", color: "var(--theme-bg)",
          animation: "fade-rise 280ms var(--ease-out) both",
        }}>
          {links.map((l, i) => (
            <button key={l.id} onClick={() => { onNav(l.id); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "14px 8px", background: "none", border: 0,
                color: "inherit", fontFamily: "var(--font-serif)",
                fontSize: 28, fontWeight: 300, cursor: "pointer",
                borderBottom: i < links.length - 1 ? "1px solid var(--paper-12)" : "none",
                animation: `fade-rise ${300 + i*60}ms var(--ease-out) both`,
              }}>
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* Local CSS — burger only on small screens */}
      <style>{`
        @media (max-width: 880px) {
          nav .nav-links { display: none !important; }
          nav .nav-burger { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}

// ── BookNowPill ──
function BookNowPill({ onNav }) {
  const y = useScrollY();
  const [lastY, setLastY] = useState(0);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(y > 120 && y > lastY);
    setLastY(y);
  }, [y]);
  return (
    <div style={{
      position: "fixed", left: "50%", bottom: "max(20px, env(safe-area-inset-bottom))",
      transform: `translate3d(-50%, ${hidden ? 80 : 0}px, 0)`,
      transition: "transform 380ms var(--ease-out)",
      zIndex: 45, pointerEvents: "auto",
    }}>
      <button onClick={() => onNav("book")} className="pill pill-accent"
        style={{ position: "relative", boxShadow: "0 12px 28px rgba(11,19,43,0.22)" }}>
        <span style={{ position: "relative", zIndex: 2 }}>Book Now</span>
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, borderRadius: 999,
          border: "1px solid var(--theme-accent)",
          animation: "ping-luxury 1.8s var(--ease-out) infinite",
          opacity: 0.45, pointerEvents: "none",
        }} />
      </button>
    </div>
  );
}

// ── Section header ──
function SectionHeading({ overline, title, kicker }) {
  return (
    <div style={{ textAlign: "center" }}>
      {overline && <p className="overline reveal" style={{ color: "var(--ink-40)", marginBottom: 12 }}>{overline}</p>}
      <h2 className="reveal delay-1" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", margin: 0, lineHeight: 1.05 }}>{title}</h2>
      {kicker && <p className="reveal delay-2 italic serif" style={{ marginTop: 14, color: "var(--ink-55)", fontSize: 18 }}>{kicker}</p>}
      <div className="divider reveal delay-3" />
    </div>
  );
}

// ── VisitUsSection (luxury ping on map) ──
function VisitUsSection() {
  const embedSrc = "https://maps.google.com/maps?q=4090+Johns+Creek+Pkwy+%23+E,+Suwanee,+GA+30024&t=&z=15&ie=UTF8&iwloc=&output=embed";
  return (
    <section className="section" style={{ background: "var(--theme-deep)", color: "#F9F7F2" }}>
      <div className="container">
        <div style={{
          display: "grid", gap: 48,
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          alignItems: "center",
        }} className="visit-grid">
          <div style={{
            position: "relative", aspectRatio: "1 / 1",
            borderRadius: 28, overflow: "hidden",
            border: "1px solid var(--paper-25)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}>
            <iframe src={embedSrc}
              loading="lazy"
              style={{ width: "100%", height: "100%", border: 0, filter: "invert(100%) hue-rotate(180deg) brightness(85%) contrast(115%)" }}
              title="Fades and Facials location" />
            {/* Luxury ping on shop pin */}
            <div style={{
              position: "absolute", left: "50%", top: "50%", transform: "translate3d(-50%,-50%,0)",
              pointerEvents: "none",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 999,
                background: "var(--theme-accent)",
                boxShadow: "0 0 0 4px rgba(126,154,126,0.35)",
                position: "relative", zIndex: 2,
              }}/>
              <div style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate3d(-50%,-50%,0)",
                width: 14, height: 14, borderRadius: 999,
                border: "1px solid var(--theme-accent)",
                animation: "ping-luxury 1.8s var(--ease-out) infinite",
              }}/>
              <div style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate3d(-50%,-50%,0)",
                width: 14, height: 14, borderRadius: 999,
                border: "1px solid var(--theme-accent)",
                animation: "ping-luxury 1.8s var(--ease-out) infinite",
                animationDelay: "0.6s",
              }}/>
            </div>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 65%, rgba(11,19,43,0.45) 100%)",
              pointerEvents: "none",
            }}/>
          </div>

          <div>
            <p className="overline" style={{ color: "var(--paper-55)", marginBottom: 14 }}>Find Us</p>
            <h2 style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", margin: 0, color: "#F9F7F2" }}>Visit the chair.</h2>
            <p className="serif italic" style={{ color: "var(--paper-55)", fontSize: 19, marginTop: 12 }}>
              No appointment? Walk in. We'll make time.
            </p>

            <div style={{ marginTop: 28, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F9F7F2", lineHeight: 1.9 }}>
              <div>Shops at Johns Creek</div>
              <div style={{ color: "var(--paper-55)" }}>4090 Johns Creek Pkwy # E</div>
              <div style={{ color: "var(--paper-55)" }}>Suwanee, GA 30024</div>
            </div>

            <a href="https://maps.google.com/?q=4090+Johns+Creek+Pkwy+E+Suwanee+GA+30024" target="_blank" rel="noopener noreferrer"
              className="pill pill-ghost" style={{ marginTop: 22, color: "#F9F7F2", borderColor: "var(--paper-35)" }}>
              Get Directions →
            </a>

            <div style={{
              marginTop: 36, display: "grid", gap: 12,
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            }}>
              {[
                { day: "Mon – Tue", hours: "Closed" },
                { day: "Wed – Fri", hours: "10am – 7pm" },
                { day: "Saturday",  hours: "9am – 6pm" },
                { day: "Sunday",    hours: "11am – 4pm" },
              ].map(({ day, hours }) => (
                <div key={day} style={{
                  borderRadius: 20, padding: "16px 18px",
                  background: "rgba(249,247,242,0.05)",
                  border: "1px solid var(--paper-25)",
                  fontFamily: "var(--font-mono)",
                }}>
                  <div className="overline" style={{ color: "var(--paper-55)", marginBottom: 6 }}>{day}</div>
                  <div style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: hours === "Closed" ? "var(--paper-35)" : "#F9F7F2", fontWeight: 500 }}>
                    {hours}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .visit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Footer ──
function Footer({ onNav }) {
  return (
    <footer style={{ background: "var(--theme-text)", color: "var(--theme-bg)", padding: "64px 24px 28px" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 48 }} >
        <div>
          <LogoMark tone="light" size={56} />
          <p className="serif italic" style={{ marginTop: 18, color: "var(--paper-55)", fontSize: 18, maxWidth: 360 }}>
            Ten chairs. Zero small talk. We cut on time, we shut on time.
          </p>
        </div>
        <div>
          <p className="overline" style={{ color: "var(--paper-35)", marginBottom: 14 }}>Visit</p>
          <p className="mono" style={{ fontSize: 12, letterSpacing: "0.18em", lineHeight: 1.9, textTransform: "uppercase", color: "var(--paper-75)" }}>
            4090 Johns Creek Pkwy # E<br/>Suwanee, GA 30024
          </p>
          <p className="overline" style={{ color: "var(--paper-35)", margin: "20px 0 10px" }}>Hours</p>
          <p className="mono" style={{ fontSize: 12, letterSpacing: "0.18em", lineHeight: 1.9, textTransform: "uppercase", color: "var(--paper-75)" }}>
            Wed – Sun · See site
          </p>
        </div>
        <div>
          <p className="overline" style={{ color: "var(--paper-35)", marginBottom: 14 }}>Site</p>
          {["home","services","gallery","book"].map(r => (
            <button key={r} onClick={() => onNav(r)} style={{
              display: "block", background: "none", border: 0, cursor: "pointer",
              color: "var(--paper-75)", fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 300,
              padding: "6px 0", textTransform: "capitalize",
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{
        marginTop: 56, paddingTop: 24,
        borderTop: "1px solid var(--paper-12)",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        color: "var(--paper-55)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
      }}>
        <span>© sourc3code 2026 · @fadesandfacials 2026</span>
        <span>Suwanee, GA · Open to all</span>
      </div>

      <style>{`
        @media (max-width: 800px) {
          footer .container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// expose
Object.assign(window, {
  ALL_SERVICES, DEFAULT_FEATURED, HERO_MEDIA, GALLERY_ITEMS,
  useScrollY, LogoMark, Navbar, BookNowPill, SectionHeading, VisitUsSection, Footer,
});
