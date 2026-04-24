"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav
      className={`fixed top-4 left-0 right-0 z-50 px-6 text-white transition-all duration-300 ${
        scrolled
          ? "mx-4 md:mx-8 rounded-2xl bg-white/25 py-3 shadow-lg backdrop-blur-sm"
          : "mx-0 bg-transparent py-4 border-b border-white/25"
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
          <Link href="/booking" className="text-white">Book Now</Link>
        </div>

        {/* Hamburger — visible on mobile only */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          <Link href="/" className="text-white" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" className="text-white" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/booking" className="text-white" onClick={() => setMenuOpen(false)}>Book Now</Link>
        </div>
      )}
    </nav>
  )
}