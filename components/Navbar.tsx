/** @file components/Navbar.tsx */

// ─────────────────────────────────────────
// SECTION: Navbar
// WHAT: Fixed top navigation — transparent over hero, solid surface on scroll.
// WHY: Transparent state lets the hero breathe; the solid state maintains
//   readability at all scroll depths without backdrop-blur (iOS WebKit safe).
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",         label: "Home"     },
  { href: "/services", label: "Services" },
  { href: "/gallery",  label: "Gallery"  },
  { href: "/book",     label: "Book"     },
] as const;

export default function Navbar() {
  const pathname   = usePathname();
  const isHomePage = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerPoleBackgroundSize = "100% 40px";
  const headerPoleAnimation = "barber-pole 2.2s linear infinite";
  const headerPoleAccentPx = 5;
  const headerPoleMutedPx = 5;
  const debugVersion = "navbar-debug-v1-logo-investigation";
  const logoMarkupPresentInComponent = true;

  // ── iOS Safari scroll detection ───────────────────────────────────────────
  // iOS Safari fires scroll on documentElement, not window. All four targets
  // registered to cover every browser/webview combination.
  useEffect(() => {
    const getScrollY = (): number =>
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      document.body.scrollTop ??
      0;

    const handleScroll = () => setScrolled(getScrollY() > 80);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "pre-header-fix",
        hypothesisId: "H8",
        location: "components/Navbar.tsx:64",
        message: "Header pole animation config",
        data: { headerPoleAnimation, headerPoleBackgroundSize },
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
        runId: "pre-header-fix",
        hypothesisId: "H9",
        location: "components/Navbar.tsx:65",
        message: "Header pole stripe widths can create border artifact",
        data: { accentPx: headerPoleAccentPx, mutedPx: headerPoleMutedPx },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // #region agent log H1_component_mounted
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"bfa565"},body:JSON.stringify({sessionId:"bfa565",runId:"initial",hypothesisId:"H1",location:"components/Navbar.tsx:63",message:"Navbar mounted (component identity)",data:{debugVersion,pathname},timestamp:Date.now()})}).catch(()=>{});
    // #region agent log H1_component_mounted_console_fallback
    console.log("[agent-debug][H1] Navbar mounted", { debugVersion, pathname, logoMarkupPresentInComponent });
    // #endregion
    // #endregion
  }, [debugVersion, headerPoleAccentPx, headerPoleAnimation, headerPoleBackgroundSize, headerPoleMutedPx, pathname]);

  useEffect(() => {
    const logoInNavCount = document.querySelectorAll('nav img[src*="logo.png"]').length;
    const navAnchorCount = document.querySelectorAll("nav a").length;
    // #region agent log H2_dom_probe
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"bfa565"},body:JSON.stringify({sessionId:"bfa565",runId:"initial",hypothesisId:"H2",location:"components/Navbar.tsx:71",message:"DOM probe for logo image in nav",data:{logoInNavCount,navAnchorCount,pathname,scrolled},timestamp:Date.now()})}).catch(()=>{});
    // #region agent log H2_dom_probe_console_fallback
    console.log("[agent-debug][H2] DOM probe", {
      debugVersion,
      pathname,
      scrolled,
      logoInNavCount,
      navAnchorCount,
    });
    // #endregion
    // #endregion
  }, [pathname, scrolled]);

  // ── Visual state logic ────────────────────────────────────────────────────
  // transparent: home page, not yet scrolled → white text over hero
  // solid: scrolled anywhere, OR any non-home page → theme-text over surface
  const isTransparent = isHomePage && !scrolled;

  const navBackground = scrolled
    ? "color-mix(in srgb, var(--theme-surface) 95%, transparent)"
    : isHomePage
      ? "transparent"
      : "var(--theme-surface)";

  const textColor = isTransparent ? "white" : "var(--theme-text)";
  const borderColor = scrolled
    ? "color-mix(in srgb, var(--theme-text) 8%, transparent)"
    : isHomePage
      ? "transparent"
      : "color-mix(in srgb, var(--theme-text) 8%, transparent)";

  useEffect(() => {
    // #region agent log H3_state_snapshot
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"bfa565"},body:JSON.stringify({sessionId:"bfa565",runId:"initial",hypothesisId:"H3",location:"components/Navbar.tsx:85",message:"Navbar visual state snapshot",data:{isHomePage,isTransparent,scrolled,menuOpen,navBackground,textColor},timestamp:Date.now()})}).catch(()=>{});
    // #region agent log H3_state_snapshot_console_fallback
    console.log("[agent-debug][H3] visual state", {
      debugVersion,
      isHomePage,
      isTransparent,
      scrolled,
      menuOpen,
      navBackground,
      textColor,
    });
    // #endregion
    // #endregion
  }, [isHomePage, isTransparent, scrolled, menuOpen, navBackground, textColor]);

  useEffect(() => {
    const activeTheme = document.documentElement.getAttribute("data-theme") ?? "unknown";
    const computedThemeBg = getComputedStyle(document.documentElement).getPropertyValue("--theme-bg").trim();
    const computedThemeSurface = getComputedStyle(document.documentElement).getPropertyValue("--theme-surface").trim();
    const bodyBackground = getComputedStyle(document.body).backgroundColor;

    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "theme-audit",
        hypothesisId: "H12",
        location: "components/Navbar.tsx:124",
        message: "Runtime active theme and resolved base tokens",
        data: { activeTheme, computedThemeBg, computedThemeSurface, bodyBackground },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [pathname, scrolled]);

  return (
    <nav
      data-navbar-debug-version={debugVersion}
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
        scrolled ? "mt-3 mx-4 md:mx-6 rounded-2xl shadow-2xl" : "mx-0"
      }`}
    >
      <div
        style={{
          background: navBackground,
          borderBottom: scrolled ? "none" : `1px solid ${borderColor}`,
          border: scrolled
            ? `1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)`
            : undefined,
          borderRadius: scrolled ? "16px" : undefined,
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
        className="px-5 md:px-8 py-3.5"
      >
        <div className="flex items-center justify-between">

          {/* ── Logo + Barber Pole ──────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 touch-manipulation min-h-[44px]">
            {/* Barber pole accent — vertical striped cylinder animation */}
            <div
              aria-hidden="true"
              style={{
                width: "7px",
                height: "38px",
                borderRadius: "99px",
                overflow: "hidden",
                flexShrink: 0,
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 5px, color-mix(in srgb, var(--theme-text) 10%, transparent) 5px, color-mix(in srgb, var(--theme-text) 10%, transparent) 10px)",
                backgroundSize: headerPoleBackgroundSize,
                animation: headerPoleAnimation,
              }}
            />
            <div className="ml-5 flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt="Fades & Facials"
                quality={100}
                width={44}
                height={28}
                className="h-7 w-auto shrink-0"
              />
              <span
                className="hidden sm:block text-sm font-semibold tracking-tight leading-none"
                style={{ color: textColor, fontFamily: "var(--font-display)", transition: "color 0.3s ease" }}
              >
                Fades &amp; Facials
              </span>
            </div>
          </Link>

          {/* ── Desktop links ────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium tracking-wide transition-all duration-200 touch-manipulation min-h-[44px] flex items-center"
                style={{
                  color: pathname === href ? "var(--theme-accent)" : textColor,
                  fontFamily: "var(--font-sans)",
                  transition: "color 0.3s ease",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation"
            onClick={() => setMenuOpen((prev) => !prev)}
            onTouchEnd={(e) => { e.preventDefault(); setMenuOpen((prev) => !prev); }}
          >
            {/* Custom animated icon — no emoji */}
            <div
              className="flex flex-col gap-1.5 w-5"
              style={{ transition: "all 0.2s ease" }}
            >
              <span
                style={{
                  height: "1.5px",
                  borderRadius: "2px",
                  background: textColor,
                  display: "block",
                  transition: "all 0.25s ease",
                  transformOrigin: "center",
                  transform: menuOpen
                    ? "translate3d(0, 6px, 0) rotate(45deg)"
                    : "translate3d(0, 0, 0) rotate(0deg)",
                }}
              />
              <span
                style={{
                  height: "1.5px",
                  borderRadius: "2px",
                  background: textColor,
                  display: "block",
                  transition: "all 0.25s ease",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  height: "1.5px",
                  borderRadius: "2px",
                  background: textColor,
                  display: "block",
                  transition: "all 0.25s ease",
                  transformOrigin: "center",
                  transform: menuOpen
                    ? "translate3d(0, -6px, 0) rotate(-45deg)"
                    : "translate3d(0, 0, 0) rotate(0deg)",
                }}
              />
            </div>
          </button>
        </div>

        {/* ── Mobile dropdown ──────────────────────────────────────────────── */}
        {menuOpen && (
          <div
            className="flex flex-col md:hidden mt-4 pb-2"
            style={{ borderTop: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)` }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-3 text-sm font-medium tracking-wide touch-manipulation min-h-[44px] flex items-center"
                style={{
                  color: pathname === href ? "var(--theme-accent)" : textColor,
                  fontFamily: "var(--font-sans)",
                  borderBottom: "1px solid color-mix(in srgb, var(--theme-text) 5%, transparent)",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
