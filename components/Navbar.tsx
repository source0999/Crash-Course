"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-[#1e3a5f] text-white px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Fades & Facials"
            width={120}
            height={40}
          />
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex gap-8">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/booking">Book Now</Link>
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
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/booking" onClick={() => setMenuOpen(false)}>Book Now</Link>
        </div>
      )}
    </nav>
  )
}