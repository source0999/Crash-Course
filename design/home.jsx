/* Fades & Facials — Home page with three Dual-Flicker layouts.
   - Hero (full-bleed image w/ overlaid wordmark)
   - FeaturedServicesSection (adapts to active layout)
   - CinematicLayout / GridLayout / EditorialLayout
   - VisitUsSection (last before footer)
*/

const { useState: useStateH, useEffect: useEffectH, useMemo: useMemoH } = React;

// ── Hero ──
function Hero({ heroUrl, manifesto }) {
  return (
    <section className="hero-wrap">
      <img className="hero-media" src={heroUrl} alt="" />
      <div className="hero-grad" />
      <div className="hero-content">
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div className="barber-pole" style={{ margin: "0 auto" }} />
        </div>
        <p className="overline reveal delay-1" style={{ color: "rgba(249,247,242,0.7)", marginBottom: 20 }}>
          Suwanee, GA · Est. 2017
        </p>
        <h1 className="reveal delay-2" style={{
          fontSize: "clamp(3rem, 11vw, 7.5rem)",
          margin: 0, lineHeight: 0.95, letterSpacing: "-0.02em",
        }}>
          <span style={{ display: "block", fontStyle: "italic", fontWeight: 300 }}>Fades</span>
          <span style={{
            display: "block", fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 1.6vw, 1rem)",
            letterSpacing: "0.5em", textTransform: "uppercase",
            margin: "18px 0", color: "rgba(249,247,242,0.7)", fontWeight: 500,
          }}>
            ——— & ———
          </span>
          <span style={{ display: "block", fontStyle: "italic", fontWeight: 300 }}>Facials</span>
        </h1>
        <p className="reveal delay-4 serif italic" style={{
          marginTop: 28, fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
          color: "rgba(249,247,242,0.78)", maxWidth: 540,
        }}>
          {manifesto}
        </p>
        <div className="reveal delay-5" style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#services-anchor" className="pill pill-accent">Book a Chair</a>
          <a href="#menu-anchor" className="pill pill-ghost" style={{ color: "#F9F7F2", borderColor: "rgba(249,247,242,0.6)" }}>See the Menu</a>
        </div>
      </div>
    </section>
  );
}

// ── Featured Services Section (adapts to layout) ──
function FeaturedServicesSection({ activeLayout, featuredPairs }) {
  if (!featuredPairs.length) return null;
  const fmt = p => typeof p === "number" ? `$${p}` : p;

  if (activeLayout === "cinematic") {
    return (
      <section style={{ background: "var(--theme-text)", color: "var(--theme-bg)" }}>
        <div className="container" style={{ padding: "72px 28px 24px" }}>
          <p className="overline" style={{ color: "var(--paper-35)", marginBottom: 12 }}>Featured Services</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: 0, color: "var(--theme-bg)" }}>Signature Menu.</h2>
        </div>
        {featuredPairs.map((pair, i) => (
          <div key={pair.serviceId} className="cinema-row reveal" style={{
            display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
            direction: i % 2 === 0 ? "ltr" : "rtl",
          }}>
            <div style={{ direction: "ltr", position: "relative", height: "55svh", minHeight: 420, overflow: "hidden" }}>
              <img src={pair.mediaUrl} alt={pair.service.name} style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              }}/>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(11,19,43,0.15) 0%, rgba(11,19,43,0.55) 100%)",
              }}/>
              <span className="mono" style={{
                position: "absolute", top: 24, left: 24, color: "rgba(249,247,242,0.6)",
                fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              }}>
                {String(i + 1).padStart(2, "0")} / {String(featuredPairs.length).padStart(2, "0")}
              </span>
            </div>
            <div style={{
              direction: "ltr", display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "56px 48px", background: "var(--theme-text)",
            }}>
              <p className="overline" style={{ color: "var(--paper-35)", marginBottom: 16 }}>Featured · {pair.service.category}</p>
              <h3 style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05,
                color: "var(--theme-bg)", margin: 0, fontWeight: 300,
              }}>{pair.service.name}</h3>
              <p className="serif italic" style={{ color: "var(--paper-55)", fontSize: 18, maxWidth: 420, marginTop: 18 }}>
                {pair.service.description}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 28 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "var(--theme-accent)", fontWeight: 300 }}>{fmt(pair.service.price)}</span>
                <span className="mono" style={{ color: "var(--paper-35)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>{pair.service.duration}</span>
              </div>
            </div>
          </div>
        ))}
        <style>{`
          @media (max-width: 860px) { .cinema-row { grid-template-columns: 1fr !important; direction: ltr !important; } }
        `}</style>
      </section>
    );
  }

  if (activeLayout === "grid") {
    return (
      <section style={{ background: "var(--theme-bg)" }} className="section">
        <div className="container">
          <p className="overline reveal" style={{ color: "var(--ink-40)", marginBottom: 12 }}>Featured Services</p>
          <h2 className="reveal delay-1" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: 0, marginBottom: 40 }}>Signature Menu.</h2>
          <div className="grid-feature" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 28 }}>
            {featuredPairs.map((pair, i) => (
              <article key={pair.serviceId} className="reveal paper-card" style={{
                animationDelay: `${i*0.12}s`, overflow: "hidden", padding: 0, borderRadius: 24,
                background: "var(--theme-surface)",
              }}>
                <div style={{ position: "relative", aspectRatio: "3/4" }}>
                  <img src={pair.mediaUrl} alt={pair.service.name} style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                  }}/>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(0deg, rgba(11,19,43,0.85) 0%, rgba(11,19,43,0.25) 50%, transparent 100%)",
                  }}/>
                  <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, color: "#F9F7F2" }}>
                    <p className="overline" style={{ color: "rgba(249,247,242,0.6)", marginBottom: 8 }}>{pair.service.category}</p>
                    <h3 style={{ fontSize: 28, margin: 0, lineHeight: 1.05 }}>{pair.service.name}</h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
                      <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--theme-accent)" }}>{fmt(pair.service.price)}</span>
                      <span className="mono" style={{ color: "rgba(249,247,242,0.55)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>{pair.service.duration}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <p style={{ color: "var(--ink-55)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{pair.service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 880px) { .grid-feature { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    );
  }

  // editorial
  return (
    <section style={{ background: "var(--theme-bg)" }} className="section">
      <div className="container">
        <p className="overline reveal" style={{ color: "var(--ink-40)", marginBottom: 12 }}>Featured Services</p>
        <h2 className="reveal delay-1" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: 0, marginBottom: 36 }}>Signature Menu.</h2>

        {featuredPairs[0] && (
          <div className="reveal" style={{
            position: "relative", borderRadius: 28, overflow: "hidden", minHeight: "60svh", marginBottom: 22,
          }}>
            <img src={featuredPairs[0].mediaUrl} alt={featuredPairs[0].service.name} style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            }}/>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.7) 100%)",
            }}/>
            <div style={{
              position: "absolute", inset: 0, color: "#F9F7F2",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              padding: "48px",
            }}>
              <p className="overline" style={{ color: "rgba(249,247,242,0.55)" }}>01 · The Headliner</p>
              <h3 style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)", margin: "12px 0 0", lineHeight: 1, fontWeight: 300,
              }}>{featuredPairs[0].service.name}</h3>
              <p className="serif italic" style={{ fontSize: 20, color: "rgba(249,247,242,0.78)", maxWidth: 520, marginTop: 14 }}>
                {featuredPairs[0].service.description}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 18 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--theme-accent)" }}>{fmt(featuredPairs[0].service.price)}</span>
                <span className="mono" style={{ color: "rgba(249,247,242,0.55)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>{featuredPairs[0].service.duration}</span>
              </div>
            </div>
          </div>
        )}

        <div className="ed-feature" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {featuredPairs.slice(1, 3).map((pair, i) => (
            <div key={pair.serviceId} className="reveal" style={{
              animationDelay: `${(i+1)*0.12}s`,
              position: "relative", borderRadius: 28, overflow: "hidden", minHeight: 360,
            }}>
              <img src={pair.mediaUrl} alt={pair.service.name} style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,19,43,0.15) 0%, rgba(11,19,43,0.7) 100%)" }}/>
              <div style={{ position: "absolute", inset: 0, color: "#F9F7F2", padding: 32, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <p className="overline" style={{ color: "rgba(249,247,242,0.55)" }}>{String(i+2).padStart(2,"0")} · {pair.service.category}</p>
                <h3 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", margin: "10px 0 0", fontWeight: 300 }}>{pair.service.name}</h3>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--theme-accent)", marginTop: 10 }}>{fmt(pair.service.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 800px) { .ed-feature { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── CinematicLayout (full menu on dark) ──
function CinematicLayout({ allServices }) {
  return (
    <section id="menu-anchor" style={{ background: "var(--theme-text)", color: "var(--theme-bg)" }} className="section">
      <div className="container">
        <p className="overline reveal" style={{ color: "var(--paper-35)", marginBottom: 12 }}>The Full Menu</p>
        <h2 className="reveal delay-1" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", marginTop: 0, marginBottom: 12, color: "var(--theme-bg)" }}>Our Services.</h2>
        <p className="reveal delay-2 serif italic" style={{ color: "var(--paper-55)", fontSize: 18, marginBottom: 40, maxWidth: 540 }}>
          Ten things we do better than the place down the street.
        </p>
        <div>
          {allServices.map((s, i) => (
            <div key={s.id} className="reveal" style={{
              animationDelay: `${i*0.04}s`,
              display: "grid", gridTemplateColumns: "60px auto 1fr auto", gap: 24, alignItems: "center",
              padding: "22px 0",
              borderBottom: i < allServices.length - 1 ? "1px solid var(--paper-12)" : "none",
            }}>
              <span className="mono" style={{ color: "var(--paper-25)", fontSize: 11, letterSpacing: "0.18em" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="placeholder dark" style={{ width: 72, height: 72, borderRadius: 14, padding: 0 }}>
                {s.category.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: 22, margin: 0, color: "var(--theme-bg)", fontWeight: 300 }}>{s.name}</h3>
                <p className="mono" style={{ color: "var(--paper-35)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "6px 0 0" }}>
                  {s.duration} · {s.category}
                </p>
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--theme-accent)", fontWeight: 300 }}>${s.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── GridLayout ──
function GridLayout({ allServices }) {
  return (
    <section id="menu-anchor" style={{ background: "var(--theme-bg)" }} className="section">
      <div className="container">
        <SectionHeading overline="What We Offer" title="Our Services." kicker="Pick one. Sit down. Look better." />
        <div className="grid-menu" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 22, marginTop: 24 }}>
          {allServices.map((s, i) => {
            const dark = i % 3 === 1;
            return (
              <article key={s.id} className="reveal" style={{
                animationDelay: `${i*0.06}s`,
                background: dark ? "var(--theme-text)" : "var(--theme-surface)",
                color: dark ? "var(--theme-bg)" : "var(--theme-text)",
                borderRadius: 24, overflow: "hidden",
                border: dark ? "none" : "1px solid var(--ink-07)",
                boxShadow: dark ? "0 8px 40px rgba(11,19,43,0.25)" : "0 2px 20px rgba(11,19,43,0.05)",
                transition: "transform 500ms var(--ease-out)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translate3d(0,-8px,0)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translate3d(0,0,0)"}>
                <div className={dark ? "placeholder dark" : "placeholder"} style={{ aspectRatio: "16/10", borderRadius: 0, padding: 0 }}>
                  {s.name} · IMAGERY
                </div>
                <div style={{ padding: 26 }}>
                  <h3 style={{ fontSize: 24, margin: 0, fontWeight: 300 }}>{s.name}</h3>
                  <p style={{ color: dark ? "var(--paper-55)" : "var(--ink-55)", fontSize: 14, lineHeight: 1.6, margin: "12px 0 22px" }}>
                    {s.description}
                  </p>
                  <div style={{
                    paddingTop: 18, borderTop: `1px solid ${dark ? "var(--paper-12)" : "var(--ink-07)"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: dark ? "var(--theme-bg)" : "var(--theme-text)", fontWeight: 300 }}>
                      ${s.price}
                    </span>
                    <span className="mono" style={{ color: dark ? "var(--paper-35)" : "var(--ink-35)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                      {s.duration}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 1000px) { .grid-menu { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .grid-menu { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── EditorialLayout (typographic stack) ──
function EditorialLayout({ allServices }) {
  return (
    <section id="menu-anchor" style={{ background: "var(--theme-bg)", borderTop: "1px solid var(--ink-10)" }} className="section">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 32, marginBottom: 56 }}>
          <span className="reveal" style={{
            fontFamily: "var(--font-serif)", fontSize: "clamp(5rem, 12vw, 9rem)",
            lineHeight: 1, color: "rgba(11,19,43,0.06)", fontWeight: 300,
          }}>02</span>
          <div style={{ paddingTop: 12 }}>
            <p className="overline reveal delay-1" style={{ color: "var(--ink-40)", marginBottom: 10 }}>The Menu</p>
            <h2 className="reveal delay-2" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", margin: 0 }}>Our Services.</h2>
            <p className="reveal delay-3 serif italic" style={{ color: "var(--ink-55)", fontSize: 19, marginTop: 12 }}>
              Read the menu. Then we get to work.
            </p>
          </div>
        </div>

        <div>
          {allServices.map((s, i) => (
            <div key={s.id} className="reveal ed-row" style={{
              animationDelay: `${i*0.05}s`,
              display: "grid", gridTemplateColumns: "1.1fr 2fr auto", gap: 36, alignItems: "center",
              padding: "26px 0",
              borderBottom: i < allServices.length - 1 ? "1px solid var(--ink-10)" : "none",
              transition: "transform 320ms var(--ease-out), background 320ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--theme-surface)"; e.currentTarget.style.transform = "translate3d(0,-2px,0)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translate3d(0,0,0)"; }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div className="placeholder" style={{ width: 72, height: 96, borderRadius: 8, padding: 0, fontSize: 9 }}>
                  {s.category.split(" ")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 22, margin: 0, fontWeight: 300 }}>{s.name}</h3>
                  <p className="mono" style={{ color: "var(--ink-35)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "6px 0 0" }}>{s.duration}</p>
                </div>
              </div>
              <p style={{ color: "var(--ink-55)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.description}</p>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--theme-text)", fontWeight: 300 }}>${s.price}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .ed-row { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
    </section>
  );
}

// ── HomePage shell ──
function HomePage({ activeLayout, heroUrl, featuredIds, manifesto, onNav }) {
  const featuredPairs = useMemoH(() => {
    return featuredIds.map((id, i) => {
      const service = ALL_SERVICES.find(s => s.id === id) || ALL_SERVICES[0];
      const media = HERO_MEDIA[(i + 1) % HERO_MEDIA.length].url;
      return { serviceId: id, service, mediaUrl: media };
    });
  }, [featuredIds]);

  const Layout = activeLayout === "cinematic" ? CinematicLayout
               : activeLayout === "grid"      ? GridLayout
               : EditorialLayout;

  return (
    <main className="page-enter">
      <Hero heroUrl={heroUrl} manifesto={manifesto} />
      <FeaturedServicesSection activeLayout={activeLayout} featuredPairs={featuredPairs} />
      <Layout allServices={ALL_SERVICES} />
      <VisitUsSection />
    </main>
  );
}

Object.assign(window, { Hero, FeaturedServicesSection, CinematicLayout, GridLayout, EditorialLayout, HomePage });
