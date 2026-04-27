/* Fades & Facials — Admin Creative Studio (layout + hero + featured) */

const { useState: useStateA, useEffect: useEffectA } = React;

function AdminPage({
  activeLayout, setActiveLayout,
  heroUrl, setHeroUrl,
  featuredIds, setFeaturedIds,
  manifesto, setManifesto,
}) {
  const [tab, setTab] = useStateA("appearance");

  const LAYOUTS = [
    { id: "cinematic", icon: "◈", label: "Cinematic", desc: "Alternating full-bleed panels on dark." },
    { id: "grid",      icon: "⊞", label: "Grid",      desc: "Portrait luxury cards on alabaster." },
    { id: "editorial", icon: "≡", label: "Editorial", desc: "Magazine stack — typographic, restrained." },
  ];

  function toggleFeatured(id) {
    if (featuredIds.includes(id)) {
      setFeaturedIds(featuredIds.filter(x => x !== id));
    } else if (featuredIds.length < 3) {
      setFeaturedIds([...featuredIds, id]);
    } else {
      // replace last
      setFeaturedIds([...featuredIds.slice(0, 2), id]);
    }
  }

  return (
    <main className="page-enter" style={{ background: "var(--theme-deep)", color: "#F9F7F2", minHeight: "100vh", paddingTop: 96, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 1080, padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <div>
            <p className="overline reveal" style={{ color: "var(--theme-accent)" }}>Fades &amp; Facials · Admin</p>
            <h1 className="reveal delay-1" style={{ fontSize: "clamp(2.6rem, 5vw, 3.8rem)", margin: "10px 0 0", color: "#F9F7F2", fontWeight: 400, letterSpacing: "-0.02em" }}>
              Creative Studio.
            </h1>
            <p className="reveal delay-2" style={{ color: "var(--paper-55)", fontSize: 15, marginTop: 8 }}>
              Signed in as <span style={{ color: "var(--theme-accent)" }}>marco@fadesandfacials.com</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="pill" style={{ background: "rgba(249,247,242,0.06)", color: "#F9F7F2", border: "1px solid var(--paper-25)" }}>Preview Site →</button>
            <button className="pill pill-accent">Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { id: "appearance", label: "Appearance" },
            { id: "services",   label: "Services" },
            { id: "gallery",    label: "Gallery" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="pill" style={{
              padding: "0 18px", minHeight: 44, fontSize: 11,
              background: tab === t.id ? "var(--theme-accent)" : "transparent",
              color: tab === t.id ? "var(--theme-text)" : "var(--paper-75)",
              border: "1px solid var(--paper-25)",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "appearance" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>

            {/* Layout picker */}
            <section className="reveal" style={{
              borderRadius: 24, padding: 28,
              border: "1px solid var(--paper-25)", background: "rgba(249,247,242,0.04)",
            }}>
              <p className="overline" style={{ color: "var(--theme-accent)" }}>Layout · Dual Flicker</p>
              <h2 style={{ fontSize: 24, margin: "10px 0 4px", color: "#F9F7F2", fontWeight: 300 }}>Pick a layout for the home page.</h2>
              <p style={{ color: "var(--paper-55)", fontSize: 14, margin: "0 0 22px" }}>
                Applied immediately. Visitors will see the new layout on next page load.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }} className="lay-grid">
                {LAYOUTS.map(opt => {
                  const active = activeLayout === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setActiveLayout(opt.id)} style={{
                      textAlign: "left", padding: 20, borderRadius: 20, cursor: "pointer", minHeight: 130,
                      border: active ? "1.5px solid var(--theme-accent)" : "1px solid var(--paper-25)",
                      background: active ? "rgba(126,154,126,0.12)" : "rgba(249,247,242,0.03)",
                      color: "inherit",
                      transition: "transform 220ms var(--ease-out)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translate3d(0,-3px,0)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translate3d(0,0,0)"}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{
                          fontSize: 24, color: active ? "var(--theme-accent)" : "var(--paper-55)",
                          width: 36, height: 36, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center",
                          background: active ? "rgba(126,154,126,0.18)" : "rgba(249,247,242,0.05)",
                        }}>{opt.icon}</span>
                        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 22, color: "#F9F7F2", fontWeight: 300 }}>{opt.label}</p>
                      </div>
                      <p style={{ color: "var(--paper-55)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{opt.desc}</p>
                      {active && <p className="mono" style={{ color: "var(--theme-accent)", fontSize: 10, letterSpacing: "0.22em", margin: "12px 0 0" }}>● ACTIVE · SAVED</p>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Hero picker */}
            <section className="reveal delay-1" style={{
              borderRadius: 24, padding: 28,
              border: "1px solid var(--paper-25)", background: "rgba(249,247,242,0.04)",
            }}>
              <p className="overline" style={{ color: "var(--theme-accent)" }}>Global Hero</p>
              <h2 style={{ fontSize: 24, margin: "10px 0 4px", color: "#F9F7F2", fontWeight: 300 }}>Hero media.</h2>
              <p style={{ color: "var(--paper-55)", fontSize: 14, margin: "0 0 18px" }}>
                Used at the top of every layout. Picture should be cropped tall — text overlays bottom-center.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }} className="hero-grid">
                {HERO_MEDIA.map(m => {
                  const active = heroUrl === m.url;
                  return (
                    <button key={m.id} onClick={() => setHeroUrl(m.url)} style={{
                      position: "relative", aspectRatio: "16/10", borderRadius: 14, overflow: "hidden",
                      border: 0, padding: 0, cursor: "pointer",
                      outline: active ? "2px solid var(--theme-accent)" : "2px solid transparent",
                      outlineOffset: 2,
                    }}>
                      <img src={m.url} alt={m.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                      {!active && <div style={{ position: "absolute", inset: 0, background: "rgba(11,19,43,0.4)" }}/>}
                      {active && (
                        <div style={{
                          position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 999,
                          background: "var(--theme-accent)", color: "var(--theme-text)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                        }}>✓</div>
                      )}
                      <span className="mono" style={{
                        position: "absolute", left: 8, bottom: 8, color: "#F9F7F2",
                        fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                      }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button className="pill" style={{ background: "rgba(249,247,242,0.06)", color: "#F9F7F2", border: "1px solid var(--paper-25)" }}>
                  ⬆ Upload Hero Media
                </button>
                <button className="pill pill-accent">Save Global Hero</button>
                <span className="mono" style={{ alignSelf: "center", color: "var(--theme-accent)", fontSize: 10, letterSpacing: "0.22em" }}>● SAVED</span>
              </div>
            </section>

            {/* Featured slots */}
            <section className="reveal delay-2" style={{
              borderRadius: 24, padding: 28,
              border: "1px solid var(--paper-25)", background: "rgba(249,247,242,0.04)",
            }}>
              <p className="overline" style={{ color: "var(--theme-accent)" }}>Featured Services · 3 slots</p>
              <h2 style={{ fontSize: 24, margin: "10px 0 4px", color: "#F9F7F2", fontWeight: 300 }}>What goes in the signature menu.</h2>
              <p style={{ color: "var(--paper-55)", fontSize: 14, margin: "0 0 16px" }}>
                Tap to add or remove. Order = display order. Drag handle (≡) reorders in production.
              </p>

              {/* Active slots */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 22 }} className="slot-grid">
                {[0,1,2].map(i => {
                  const id = featuredIds[i];
                  const s = id ? ALL_SERVICES.find(x => x.id === id) : null;
                  return (
                    <div key={i} style={{
                      minHeight: 100, borderRadius: 18, padding: 16,
                      background: s ? "rgba(126,154,126,0.10)" : "rgba(249,247,242,0.02)",
                      border: s ? "1.5px solid var(--theme-accent)" : "1px dashed var(--paper-25)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span className="mono" style={{ color: "var(--theme-accent)", fontSize: 10, letterSpacing: "0.22em" }}>SLOT {String(i+1).padStart(2,"0")}</span>
                        <span className="mono" style={{ color: "var(--paper-35)", fontSize: 11 }}>≡</span>
                      </div>
                      {s ? (
                        <>
                          <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, margin: 0, color: "#F9F7F2", fontWeight: 300 }}>{s.name}</p>
                          <p style={{ color: "var(--paper-55)", fontSize: 12, margin: "4px 0 0" }}>${s.price} · {s.duration}</p>
                        </>
                      ) : (
                        <p style={{ color: "var(--paper-35)", fontSize: 13, margin: 0, fontStyle: "italic" }}>Empty — pick a service below</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* All services list */}
              <p className="mono" style={{ color: "var(--paper-55)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>All services</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }} className="all-svc">
                {ALL_SERVICES.map(s => {
                  const picked = featuredIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleFeatured(s.id)} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 14,
                      background: picked ? "rgba(126,154,126,0.15)" : "rgba(249,247,242,0.04)",
                      border: picked ? "1px solid var(--theme-accent)" : "1px solid var(--paper-25)",
                      color: "#F9F7F2", cursor: "pointer", minHeight: 44, textAlign: "left",
                    }}>
                      <div>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, margin: 0, fontWeight: 300 }}>{s.name}</p>
                        <p className="mono" style={{ color: "var(--paper-35)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", margin: "4px 0 0" }}>{s.category} · {s.duration}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "var(--font-serif)", color: "var(--theme-accent)", fontSize: 18 }}>${s.price}</span>
                        <span style={{
                          width: 22, height: 22, borderRadius: 999,
                          background: picked ? "var(--theme-accent)" : "transparent",
                          border: picked ? "0" : "1px solid var(--paper-35)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          color: "var(--theme-text)", fontSize: 13,
                        }}>{picked ? "✓" : "+"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {tab === "services" && (
          <div style={{ borderRadius: 24, padding: 32, border: "1px solid var(--paper-25)", background: "rgba(249,247,242,0.04)", textAlign: "center" }}>
            <p className="overline" style={{ color: "var(--theme-accent)" }}>Services CRUD</p>
            <p className="serif italic" style={{ color: "var(--paper-55)", fontSize: 18, margin: "10px 0 0" }}>
              dnd-kit list lives here in production — preserved as-is per Grok's rules.
            </p>
          </div>
        )}
        {tab === "gallery" && (
          <div style={{ borderRadius: 24, padding: 32, border: "1px solid var(--paper-25)", background: "rgba(249,247,242,0.04)", textAlign: "center" }}>
            <p className="overline" style={{ color: "var(--theme-accent)" }}>Gallery Manager</p>
            <p className="serif italic" style={{ color: "var(--paper-55)", fontSize: 18, margin: "10px 0 0" }}>
              Drag-and-drop media reordering preserved — chrome-only redesign.
            </p>
          </div>
        )}

        <p className="mono" style={{ marginTop: 36, color: "var(--paper-35)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "center" }}>
          Optimized for iPhone 15/16 Pro · 44px touch targets · @dnd-kit untouched
        </p>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .lay-grid, .hero-grid, .slot-grid, .all-svc { grid-template-columns: 1fr !important; }
          .hero-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </main>
  );
}

Object.assign(window, { AdminPage });
