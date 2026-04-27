"use client";

// ─────────────────────────────────────────
// SECTION: Navbar
// WHAT: Floating luxury pill nav with Drop Out Flip — transparent over hero, surface on scroll.
// WHY: Pill shape is centered via a flex wrapper (not CSS transform) so Framer Motion's
//   height spring composes cleanly. Mobile overlay is a Fragment sibling so it isn't
//   clipped by the pill's overflow:hidden or trapped in its transform stacking context.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery",  label: "Gallery"  },
  { href: "/book",     label: "Book Now" },
  { href: "/admin",    label: "Studio"   },
] as const;

const MOBILE_LINKS = [
  { href: "/services", label: "Services"         },
  { href: "/gallery",  label: "Gallery"          },
  { href: "/book",     label: "Book Appointment" },
  { href: "/admin",    label: "Studio Dashboard" },
] as const;

export default function Navbar() {
  const pathname    = usePathname();
  const isHomePage  = pathname === "/";
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const showSolid = isScrolled || !isHomePage;

  useEffect(() => {
    const navs = Array.from(document.querySelectorAll<HTMLElement>('nav[aria-label="Main navigation"]'));
    const shells = Array.from(document.querySelectorAll<HTMLElement>('[data-navbar-shell="true"]'));
    const bgLayers = Array.from(document.querySelectorAll<HTMLElement>('[data-navbar-bg-layer="true"]'));
    const firstNav = navs[0] ?? null;
    const firstBg = bgLayers[0] ?? null;
    const navStyle = firstNav ? getComputedStyle(firstNav) : null;
    const bgStyle = firstBg ? getComputedStyle(firstBg) : null;

    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "pre-refactor",
        hypothesisId: "H16",
        location: "components/Navbar.tsx:56",
        message: "Navbar instance count and shell count",
        data: { navCount: navs.length, shellCount: shells.length, bgLayerCount: bgLayers.length },
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
        runId: "pre-refactor",
        hypothesisId: "H17",
        location: "components/Navbar.tsx:57",
        message: "Computed nav chrome during morph",
        data: {
          isScrolled,
          isHomePage,
          showSolid,
          navTop: navStyle?.top ?? "missing",
          navWidth: navStyle?.width ?? "missing",
          navHeight: navStyle?.height ?? "missing",
          navBorderRadius: navStyle?.borderRadius ?? "missing",
          navBackground: navStyle?.backgroundColor ?? "missing",
          navBorderColor: navStyle?.borderColor ?? "missing",
        },
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
        runId: "pre-refactor",
        hypothesisId: "H18",
        location: "components/Navbar.tsx:58",
        message: "Background layer opacity and color",
        data: {
          bgOpacity: bgStyle?.opacity ?? "missing",
          bgColor: bgStyle?.backgroundColor ?? "missing",
          bgPosition: bgStyle?.position ?? "missing",
        },
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
        runId: "pre-refactor",
        hypothesisId: "H19",
        location: "components/Navbar.tsx:59",
        message: "Navbar text color state",
        data: {
          showSolid,
          resolvedTextColor: navStyle?.color ?? "missing",
          pathname,
          menuOpen,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [isScrolled, isHomePage, menuOpen, pathname, showSolid]);

  return (
    <>
      {/* ── Morphing luxury pill nav ────────────────────────────────────────────
          Single motion.nav owns all geometry + chrome animation to avoid layer
          desync/ghosting. It starts as full-width transparent line at the top
          and condenses into a centered floating pill on scroll.
          ─────────────────────────────────────────────────────────────────── */}
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        data-navbar-shell="true"
        className="fixed z-[9999] border overflow-hidden pointer-events-auto"
        animate={{
          width: isScrolled ? "92%" : "100%",
          top: isScrolled ? "16px" : "0px",
          borderRadius: isScrolled ? "9999px" : "0px",
          backgroundColor: isScrolled ? "rgba(30, 41, 59, 0.85)" : "rgba(15, 23, 42, 0)",
          boxShadow: isScrolled ? "0 18px 38px -12px rgba(2, 8, 20, 0.55)" : "0 0 0 rgba(0,0,0,0)",
          borderColor: isScrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
          height: isScrolled ? "72px" : "88px",
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{
          left: "50%",
          x: "-50%",
          color: showSolid ? "var(--theme-text)" : "var(--color-alabaster)",
          transition: "color 0.3s ease-in-out",
        }}
      >
        {/* Content row */}
        <div className="relative z-10 h-full px-8 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group touch-manipulation min-h-[48px]"
          >
            <Image
              src="/images/logo.png"
              alt="Fades & Facials"
              width={44}
              height={44}
              className="transition-transform duration-300 group-hover:scale-110"
              priority
            />
            <span
              className="hidden sm:block text-xl font-light tracking-[0.04em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Fades &amp; Facials
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-[var(--theme-accent)] transition-colors duration-200 touch-manipulation min-h-[48px] flex items-center"
                style={{ color: pathname === href ? "var(--theme-accent)" : "inherit" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-12 h-12 touch-manipulation rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            onTouchEnd={(e) => { e.preventDefault(); setMenuOpen((prev) => !prev); }}
            whileTap={{ scale: 0.95 }}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu Overlay ────────────────────────────────────────────────
          Sibling (not child) of the pill nav — avoids being clipped by the
          nav's overflow:hidden and correctly covers the full viewport.
          z-[9998] keeps the pill floating visibly above the overlay so the
          hamburger/X icon remains tappable at all times.
          ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 z-[9998] overflow-y-auto"
            style={{ background: "var(--theme-bg)", color: "var(--theme-text)" }}
          >
            <div className="flex flex-col px-8 pt-32">
              {MOBILE_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.1, type: "spring", stiffness: 200, damping: 26 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    onTouchEnd={(e) => { e.preventDefault(); setMenuOpen(false); }}
                    className="block py-5 text-2xl font-light border-b touch-manipulation transition-colors hover:text-[var(--theme-accent)]"
                    style={{
                      borderColor: "color-mix(in srgb, var(--theme-text) 10%, transparent)",
                      color: pathname === link.href ? "var(--theme-accent)" : "var(--theme-text)",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div
              className="pt-12 pb-8 text-xs uppercase tracking-widest text-center opacity-50"
              style={{ color: "var(--theme-text)" }}
            >
              © sourc3code @2026 • @fadesandfacials
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
