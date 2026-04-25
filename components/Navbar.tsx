"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // ─────────────────────────────────────────
  // iOS FIX: Scroll on documentElement + body as scroll container
  // CAUSE: iOS Safari often does not fire scroll on window/document; use documentElement/body scrollTop.
  // FIX: getScrollY + listeners on window, document, documentElement, and body (globals.css overflow-y).
  // ─────────────────────────────────────────
  useEffect(() => {
    const getScrollY = (): number =>
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      document.body.scrollTop ??
      0

    const handleScroll = () => {
      const y = getScrollY()
      setScrolled(y > 80)
    }

    // iOS Safari fires scroll on documentElement, not window
    // All four targets are registered to cover every browser
    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("scroll", handleScroll, { passive: true })
    document.documentElement.addEventListener("scroll", handleScroll, { passive: true })
    document.body.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("scroll", handleScroll)
      document.documentElement.removeEventListener("scroll", handleScroll)
      document.body.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // ─────────────────────────────────────────
  // iOS FIX: Scrolled bar background (no backdrop-blur)
  // CAUSE: backdrop-filter can fail under GPU memory pressure on iOS Safari, breaking navbar visibility.
  // FIX: Use a higher-opacity frosted look with bg-white/40 and drop backdrop-blur entirely.
  // ─────────────────────────────────────────

  // ─────────────────────────────────────────
  // iOS FIX: Hamburger touch target
  // CAUSE: Small tap targets and iOS click delay make the hamburger feel unresponsive.
  // FIX: 44pt min target, touch-manipulation, onTouchEnd with preventDefault, and functional setState toggles.
  // ─────────────────────────────────────────
  const mobileMenuButton = (
    <button
      type="button"
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
      onClick={() => setMenuOpen((prev) => !prev)}
      onTouchEnd={(e) => {
        e.preventDefault()
        setMenuOpen((prev) => !prev)
      }}
    >
      <span className="text-2xl text-white select-none">
        {menuOpen ? "✕" : "☰"}
      </span>
    </button>
  )

  return (
    <nav
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 text-white transition-all duration-300 will-change-transform ${
        scrolled
          ? "mt-4 mx-4 md:mx-8 rounded-2xl bg-white/40 py-3 shadow-lg"
          : isHomePage
            ? "pt-4 mx-0 bg-transparent pb-4 border-b border-white/25"
            : "pt-4 mx-0 bg-[#1e3a5f] pb-4"
      }`}
    >
      <div className="flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Fades & Facials"
            quality={100}
            width={50}
            height={30}
          />
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex gap-8">
          <Link href="/" className="text-white">Home</Link>
          <Link href="/services" className="text-white">Services</Link>
          <Link href="/gallery" className="text-white">Gallery</Link>
          <Link href="/booking" className="text-white">Book Now</Link>
        </div>

        {/* Hamburger — visible on mobile only */}
        {mobileMenuButton}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          <Link href="/" className="text-white" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" className="text-white" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/gallery" className="text-white" onClick={() => setMenuOpen(false)}>Gallery</Link>
          <Link href="/booking" className="text-white" onClick={() => setMenuOpen(false)}>Book Now</Link>
        </div>
      )}
    </nav>
  )
}