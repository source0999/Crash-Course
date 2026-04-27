/* Fades & Facials — Services / Gallery / Book pages */

const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP } = React;

// ── ServicesPage ──
function ServicesPage({ activeLayout, featuredIds, onNav }) {
  const categories = useMemoP(() => {
    const order = ["Cuts", "Beard Care", "Hair Care"];
    return order.map(cat => ({
      cat,
      items: ALL_SERVICES.filter(s => s.category === cat),
    }));
  }, []);

  const [layoutPick, setLayoutPick] = useStateP("cards"); // cards / list / minimal — admin-controlled in prod
  const featured = featuredIds.map(id => ALL_SERVICES.find(s => s.id === id)).filter(Boolean);

  return (
    <main className="page-enter" style={{ background: "var(--theme-bg)", paddingTop: 120, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 1100, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="overline reveal" style={{ color: "var(--ink-40)" }}>Fades &amp; Facials · The Catalog</p>
          <h1 className="reveal delay-1" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", margin: "16px 0 8px", fontWeight: 300, lineHeight: 1 }}>
            Services.
          </h1>
          <p className="reveal delay-2 serif italic" style={{ color: "var(--ink-55)", fontSize: 20 }}>
            Everything we do. Nothing we don't.
          </p>
          <div className="divider reveal delay-3" />
        </div>

        {featured.length > 0 && (
          <section className="reveal" style={{ marginBottom: 56 }}>
            <p className="overline" style={{ color: "var(--ink-40)", marginBottom: 14 }}>Featured Hero · Admin-picked</p>
            <div className="grid" style={{ display: "grid", gridTemplateColumns: `repeat(${featured.length}, minmax(0,1fr))`, gap: 12 }}>
              {featured.map((s, i) => (
                <div key={s.id} className="reveal" style={{
                  animationDelay: `${i*0.1}s`,
                  position: "relative", borderRadius: 18, overflow: "hidden",
                  border: "1px solid var(--ink-07)", aspectRatio: "4/5",
                  background: "var(--theme-text)",
                }}>
                  <div className="placeholder dark" style={{ position: "absolute", inset: 0, padding: 0, fontSize: 10 }}>
                    {s.name.toUpperCase()} — 1200×1500
                  </div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(11,19,43,0.85) 0%, rgba(11,19,43,0.0) 60%)" }}/>
                  <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, color: "#F9F7F2" }}>
                    <p className="overline" style={{ color: "var(--theme-accent)" }}>{s.category}</p>
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, margin: "6px 0 0", fontWeight: 300 }}>{s.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Layout switch (admin in prod; surfaced here for demo) */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 28, padding: "14px 18px",
          border: "1px solid var(--ink-07)", borderRadius: 999,
          background: "var(--theme-surface)",
        }}>
          <p className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-40)", margin: 0 }}>
            Display · admin-controlled
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {["cards","list","minimal"].map(o => (
              <button key={o} onClick={() => setLayoutPick(o)} className="pill" style={{
                padding: "0 14px", minHeight: 36, fontSize: 10,
                background: layoutPick === o ? "var(--theme-text)" : "transparent",
                color: layoutPick === o ? "var(--theme-bg)" : "var(--ink-55)",
              }}>{o}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {categories.map((c, ci) => (
            <div key={c.cat} className="reveal" style={{ animationDelay: `${ci*0.08}s` }}>
              <h2 style={{
                fontSize: 28, margin: 0, paddingBottom: 14,
                borderBottom: "1px solid var(--ink-10)", marginBottom: 22, fontWeight: 300,
              }}>
                {c.cat}
              </h2>

              {layoutPick === "cards" && (
                <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 }}>
                  {c.items.map(s => (
                    <div key={s.id} className="paper-card" style={{ padding: 20, background: "var(--theme-surface)" }}>
                      <div className="placeholder" style={{ aspectRatio: "16/10", borderRadius: 12, padding: 0, marginBottom: 14 }}>
                        {s.name.toUpperCase()}
                      </div>
                      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 300 }}>{s.name}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                        <span style={{ fontFamily: "var(--font-serif)", color: "var(--theme-accent)", fontSize: 22 }}>${s.price}</span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-40)" }}>{s.duration}</span>
                      </div>
                      <p style={{ color: "var(--ink-55)", fontSize: 14, lineHeight: 1.6, margin: "12px 0 0" }}>{s.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {layoutPick === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {c.items.map(s => (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "16px 18px", borderRadius: 18,
                      background: "var(--theme-surface)", border: "1px solid var(--ink-07)",
                    }}>
                      <div className="placeholder" style={{ width: 64, height: 64, borderRadius: 10, padding: 0, fontSize: 9 }}>{s.category.slice(0,2).toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, margin: 0, fontWeight: 300 }}>{s.name}</p>
                        <p style={{ color: "var(--ink-55)", fontSize: 13, margin: "4px 0 0" }}>{s.description}</p>
                      </div>
                      <span style={{ fontFamily: "var(--font-serif)", color: "var(--theme-accent)", fontSize: 22 }}>${s.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {layoutPick === "minimal" && (
                <div>
                  {c.items.map((s, i) => (
                    <div key={s.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "baseline",
                      padding: "14px 0",
                      borderBottom: i < c.items.length - 1 ? "1px dashed var(--ink-10)" : "none",
                    }}>
                      <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 300 }}>{s.name}</span>
                      <span style={{
                        flex: 1, margin: "0 14px", borderBottom: "1px dotted var(--ink-25)", transform: "translateY(-6px)",
                      }} />
                      <span style={{ fontFamily: "var(--font-serif)", color: "var(--theme-accent)", fontSize: 22 }}>${s.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 72 }}>
          <button onClick={() => onNav("book")} className="pill pill-ink">Book Now →</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .svc-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .svc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}

// ── GalleryPage ──
function GalleryPage() {
  const [layout, setLayout] = useStateP("masonry"); // masonry / grid / fullwidth
  const [filter, setFilter] = useStateP("All");
  const items = GALLERY_ITEMS;

  return (
    <main className="page-enter" style={{ background: "var(--theme-text)", color: "var(--theme-bg)", paddingTop: 120, paddingBottom: 80, minHeight: "100vh" }}>
      <div className="container" style={{ padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="overline reveal" style={{ color: "var(--paper-55)" }}>The Portfolio</p>
          <h1 className="reveal delay-1" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", margin: "16px 0 8px", fontWeight: 300, lineHeight: 1, color: "var(--theme-bg)" }}>
            Gallery.
          </h1>
          <p className="reveal delay-2 serif italic" style={{ color: "var(--paper-55)", fontSize: 20 }}>
            Receipts. Not promises.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All","Fades","Beard","Shop"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="pill" style={{
                padding: "0 14px", minHeight: 36, fontSize: 10,
                background: filter === f ? "var(--theme-accent)" : "transparent",
                color: filter === f ? "var(--theme-text)" : "var(--paper-75)",
                border: "1px solid var(--paper-25)",
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "masonry", label: "Masonry" },
              { id: "grid",    label: "Grid" },
              { id: "fullwidth", label: "Wide" },
            ].map(o => (
              <button key={o.id} onClick={() => setLayout(o.id)} className="pill" style={{
                padding: "0 14px", minHeight: 36, fontSize: 10,
                background: layout === o.id ? "var(--theme-bg)" : "transparent",
                color: layout === o.id ? "var(--theme-text)" : "var(--paper-75)",
                border: "1px solid var(--paper-25)",
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        {layout === "grid" && (
          <div className="gal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
            {items.map((it, i) => (
              <div key={it.id} style={{
                aspectRatio: "1/1", overflow: "hidden", borderRadius: 12,
                animation: `gallery-enter 0.6s var(--ease-out) both`,
                animationDelay: `${i*60}ms`,
              }}>
                <img src={it.file_url} alt={it.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
            ))}
          </div>
        )}

        {layout === "masonry" && (
          <div style={{ columns: "var(--gal-cols)", columnGap: 12 }} className="gal-cols">
            {items.map((it, i) => (
              <div key={it.id} style={{
                marginBottom: 12, breakInside: "avoid", overflow: "hidden", borderRadius: 12,
                animation: `gallery-enter 0.6s var(--ease-out) both`,
                animationDelay: `${i*60}ms`,
              }}>
                <img src={it.file_url} alt={it.title} loading="lazy" style={{ width: "100%", display: "block" }}/>
              </div>
            ))}
          </div>
        )}

        {layout === "fullwidth" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880, margin: "0 auto" }}>
            {items.slice(0,6).map((it, i) => (
              <div key={it.id} style={{
                overflow: "hidden", borderRadius: 18,
                animation: `gallery-enter 0.6s var(--ease-out) both`,
                animationDelay: `${i*60}ms`,
              }}>
                <img src={it.file_url} alt={it.title} loading="lazy" style={{ width: "100%", maxHeight: "78vh", objectFit: "cover", display: "block" }}/>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .gal-cols { --gal-cols: 4; }
        @media (max-width: 1000px) { .gal-cols { --gal-cols: 3; } .gal-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 700px)  { .gal-cols { --gal-cols: 2; } .gal-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </main>
  );
}

// ── BookPage (luxury frame around real Vagaro embed — purged hallucinations) ──
function BookPage({ onNav }) {
  return (
    <main className="page-enter" style={{ background: "var(--theme-bg)", paddingTop: 120, paddingBottom: 80, minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 1080, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="overline reveal" style={{ color: "var(--theme-accent)" }}>Fades &amp; Facials · Suwanee, GA</p>
          <h1 className="reveal delay-1" style={{
            fontSize: "clamp(3rem, 7vw, 5rem)", margin: "16px 0 12px", fontWeight: 400, lineHeight: 1,
            letterSpacing: "-0.02em",
          }}>
            Book Your Experience.
          </h1>
          <p className="reveal delay-2 serif italic" style={{ color: "var(--ink-55)", fontSize: 20, maxWidth: 560, margin: "0 auto" }}>
            Reserve your chair with our premium booking system.
          </p>
          <div className="divider reveal delay-3" />
        </div>

        {/* Luxury frame around Vagaro iframe */}
        <div className="frame reveal delay-4" style={{
          maxWidth: 960, margin: "0 auto",
          background: "var(--theme-surface)",
          boxShadow: "0 30px 80px rgba(10,20,33,0.18)",
        }}>
          <div className="frame-deco" />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 22px", borderBottom: "1px solid var(--ink-07)",
            background: "var(--theme-bg)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: "var(--ink-25)" }} />)}
            </div>
            <p className="mono" style={{ margin: 0, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-40)" }}>
              vagaro.com/fadesandfacials · secure
            </p>
            <span className="mono" style={{ fontSize: 10, color: "var(--theme-accent)", letterSpacing: "0.2em" }}>● LIVE</span>
          </div>

          {/* Vagaro embed placeholder — production renders real iframe here */}
          <div style={{
            position: "relative", height: 720, background: "var(--theme-surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundImage: `repeating-linear-gradient(135deg,
              var(--ink-04) 0 18px, transparent 18px 36px)`,
          }}>
            <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
              <div className="barber-pole" style={{ margin: "0 auto 28px" }} />
              <p className="overline" style={{ color: "var(--theme-accent)", marginBottom: 12 }}>Vagaro Booking Widget</p>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: 28, lineHeight: 1.2,
                fontWeight: 400, color: "var(--theme-text)", margin: 0,
              }}>
                Live availability loads here.
              </p>
              <p className="serif italic" style={{ color: "var(--ink-55)", fontSize: 16, marginTop: 14 }}>
                Pick a time. Show up clean. Leave cleaner.
              </p>
              <p className="mono" style={{
                marginTop: 28, color: "var(--ink-40)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              }}>
                ↳ &lt;iframe src="https://www.vagaro.com/fadesandfacials" /&gt;
              </p>
            </div>
          </div>
        </div>

        <p className="mono" style={{
          textAlign: "center", marginTop: 36, color: "var(--ink-40)",
          fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
        }}>
          No card on file · Pay in shop · We text you a reminder
        </p>
      </div>
    </main>
  );
}

Object.assign(window, { ServicesPage, GalleryPage, BookPage });
