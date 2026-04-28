"use client";

// ─────────────────────────────────────────
// SECTION: Navbar
// WHAT: Floating luxury pill nav with Drop Out Flip — transparent over hero, surface on scroll.
// WHY: Pill shape is centered via a flex wrapper (not CSS transform) so Framer Motion's
//   height spring composes cleanly. Mobile overlay is a Fragment sibling so it isn't
//   clipped by the pill's overflow:hidden or trapped in its transform stacking context.
//   MagneticBookNow adds spring-physics cursor tracking to the desktop CTA only.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery",  label: "Gallery"  },
  { href: "/book",     label: "Book Now" },
  { href: "/admin",    label: "Studio"   },
] as const;

const MOBILE_LINKS = [
  { href: "/",         label: "Home"               },
  { href: "/services", label: "Services"          },
  { href: "/gallery",  label: "Gallery"           },
  { href: "/book",     label: "Book Appointment" },
  { href: "/admin",    label: "Studio Dashboard"  },
] as const;

// ─────────────────────────────────────────
// SECTION: MagneticBookNow
// WHAT: Book Now CTA with spring-physics cursor attraction (magnetic button pattern).
// WHY: Gives the primary desktop CTA a satisfying tactile feel that draws the eye.
//   Uses useMotionValue + useSpring so movement stays on the compositor layer
//   (transform only — no layout/paint). Resets smoothly on mouse leave.
// ─────────────────────────────────────────
const MotionBookLink = motion.create(Link);

function MagneticBookNow({ isActive, reduced }: { isActive: boolean; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 380, damping: 28, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 380, damping: 28, mass: 0.6 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    rawX.set(dx * 0.28);
    rawY.set(dy * 0.28);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: "inline-flex" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* WHY: Toned-down size — pill is a hint, not a shout. Accent border only,
          no fill unless active, so it sits lightly alongside the other nav links. */}
      <MotionBookLink
        href="/book"
        className={`relative inline-flex items-center justify-center rounded-lg px-4 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold shadow-md transition-colors duration-200 touch-manipulation min-h-[44px] border border-theme-3 ${
          isActive ? "bg-theme-5 text-black" : "bg-theme-4 text-theme-1 hover:bg-theme-5 hover:text-black"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
      >
        Book Now
      </MotionBookLink>
    </motion.div>
  );
}

export default function Navbar() {
  const pathname    = usePathname();
  const isHomePage  = pathname === "/";
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const reduced = useReducedMotion();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const showSolid = isScrolled || !isHomePage;

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
        className="fixed z-[9999] border overflow-hidden pointer-events-auto"
        animate={{
          width: isScrolled ? "92%" : "100%",
          top: isScrolled ? "16px" : "0px",
          borderRadius: isScrolled ? "9999px" : "0px",
          /* WHY: Scrolled pill tints from --theme-1 so it tracks the active palette. */
          backgroundColor: isScrolled
            ? "color-mix(in srgb, var(--theme-1) 94%, transparent)"
            : "color-mix(in srgb, var(--theme-1) 0%, transparent)",
          boxShadow: isScrolled
            ? "0 8px 28px -8px color-mix(in srgb, var(--theme-4) 18%, transparent)"
            : "0 0 0 rgba(0,0,0,0)",
          borderColor: isScrolled
            ? "color-mix(in srgb, var(--theme-4) 12%, transparent)"
            : "color-mix(in srgb, var(--theme-4) 0%, transparent)",
          height: isScrolled ? "56px" : "66px",
        }}
        transition={{ type: "spring", stiffness: 95, damping: 24, mass: 0.85 }}
        style={{
          left: "50%",
          x: "-50%",
          /* WHY: Lavender pill is light, so scrolled/solid states use jet-black theme-text.
             Over the dark hero media only (not scrolled, on homepage) use near-white. */
          color: showSolid || isScrolled ? "var(--theme-text)" : "color-mix(in srgb, var(--theme-1) 92%, white)",
          transition: "color 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Content row */}
        <div className="relative z-10 h-full px-4 md:px-5 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group touch-manipulation min-h-[44px]"
          >
            <Image
              src="/images/logo.png"
              alt="Fades & Facials"
              width={32}
              height={32}
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
              priority
            />
            <span
              className="hidden sm:block text-base font-light tracking-[0.03em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Fades &amp; Facials
            </span>
          </Link>

          {/* Desktop Links — Book Now gets magnetic treatment; others stay standard */}
          <div className="hidden md:flex items-center gap-5 text-[12px] uppercase tracking-[0.22em] font-medium">
            {NAV_LINKS.map(({ href, label }) => {
              if (href === "/book") {
                return (
                  <MagneticBookNow key={href} isActive={pathname === href} reduced={reduced ?? false} />
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  className="hover:text-[var(--theme-accent)] transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center"
                  style={{ color: pathname === href ? "var(--theme-accent)" : "inherit" }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-11 h-11 touch-manipulation rounded-full hover:bg-white/10 transition-colors"
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
                    onClick={() => {
                      setMenuOpen(false);
                    }}
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
              © sourc3code @2026 • @fadesandfacials 2026
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
