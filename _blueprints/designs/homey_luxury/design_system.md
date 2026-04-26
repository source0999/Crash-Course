# Design System: Homey Luxury
> **Extracted from:** `app/globals.css`, `app/layout.tsx`, `app/page.tsx`  
> **Design language:** Warm, editorial luxury — cinematic spacing, serif-led typography, cream-and-ink palette  
> **Mobile target:** 60fps on mid-range iOS and Android devices

---

## Design Philosophy

"Homey Luxury" sits at the intersection of **warmth and prestige**. It avoids cold, high-contrast tech aesthetics in favour of a palette derived from fine paper, dark ink, and natural greenery. Every interaction should feel intentional and unhurried — like a well-designed printed menu, not a SaaS dashboard.

**Three core words:** Warm. Editorial. Precise.

---

## Color Palette

### Tailwind v4 `@theme` Block

Paste this into your project's `app/globals.css` (the single source of truth for all tokens in Tailwind v4 — no `tailwind.config.ts` needed):

```css
@import "tailwindcss";

@theme {
  /* ── Homey Luxury Palette ── */

  /* Alabaster — the primary surface color.
   * A warm, slightly yellow-tinted white. Far more inviting than #ffffff.
   * Use as: page background, card backgrounds, light section fills. */
  --color-alabaster: #f9f7f2;

  /* Ink — the primary text and dark surface color.
   * Midnight blue, NOT pure black (#000). Softer on the eye at large sizes,
   * still authoritative for headings and dark card backgrounds. */
  --color-ink: #0b132b;

  /* Sage — the accent color.
   * Muted, natural green. Communicates calm and wellness without shouting.
   * Use sparingly: CTAs, active states, accent borders. */
  --color-sage: #7e9a7e;
}
```

### Color Usage Map

| Token | Hex | Tailwind Class | Primary Use |
|-------|-----|----------------|-------------|
| `alabaster` | `#f9f7f2` | `bg-alabaster`, `text-alabaster` | Page background, light cards |
| `ink` | `#0b132b` | `bg-ink`, `text-ink` | Body text, headings, dark cards |
| `sage` | `#7e9a7e` | `bg-sage`, `text-sage` | Accent, brand color, active states |

### Opacity Scale (how these colors are used at varying opacities)

The palette relies heavily on Tailwind's built-in opacity modifier (`color/opacity`)
rather than hardcoded semi-transparent hex values:

```tsx
// Text hierarchy using ink at different opacities
className="text-ink"            // 100% — headings, primary text
className="text-ink/60"         // 60%  — body copy, descriptions
className="text-ink/40"         // 40%  — metadata, labels, subheadings
className="text-ink/20"         // 20%  — decorative dividers, ghost elements

// Borders using ink at low opacity
style={{ border: "1px solid rgba(11,19,43,0.07)" }}  // card borders (light)
style={{ border: "1px solid rgba(11,19,43,0.1)" }}   // section dividers

// Light overlays using alabaster
style={{ background: "rgba(249,247,242,0.92)" }}     // frosted nav bar background
```

### Dark Card Treatment

When a card uses ink as its background, flip text to alabaster using the same opacity pattern:

```tsx
// Dark card — ink background, alabaster text hierarchy
style={{
  background: "#0b132b",                          // --color-ink
  color: "#f9f7f2",                               // --color-alabaster
}}

// Body text on dark: alabaster at 55%
style={{ color: "rgba(249,247,242,0.55)" }}

// Borders on dark: alabaster at 12%
style={{ borderTop: "1px solid rgba(249,247,242,0.12)" }}
```

---

## Typography

### Active Font Stack (loaded via `next/font/google` in `app/layout.tsx`)

```tsx
import { Playfair_Display, DM_Sans } from "next/font/google";

// Playfair Display — the editorial serif.
// Use for: all headings (h1–h3), prices, pull quotes, display text.
// The italic variant is essential — used for poetic phrases and emphasis.
const playfair = Playfair_Display({
  variable: "--font-playfair",   // CSS var: var(--font-playfair)
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],   // italic is a first-class citizen in this system
  display: "swap",               // prevents FOIT (flash of invisible text)
});

// DM Sans — the humanist sans-serif.
// Use for: body copy, labels, navigation, UI text, metadata.
// Light weight (300) for long-form descriptions; Medium (500) for emphasis.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",    // CSS var: var(--font-dm-sans)
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});
```

Apply both variables to the `<html>` element so every component can access them:

```tsx
<html className={`${playfair.variable} ${dmSans.variable}`}>
```

### Font Usage in Components

```tsx
// All heading usage — Playfair Display, light weight, tight leading
style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}

// Italic emphasis (poetic phrases, pull quotes)
<em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
  A precise cut.
</em>

// Body / UI text — DM Sans
style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}

// Labels / metadata — DM Sans with tight letter-spacing
style={{ fontFamily: "'DM Sans', sans-serif" }}
className="text-xs uppercase tracking-[0.3em]"

// Price display — Playfair, light, large
style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
className="text-2xl"
```

### Responsive Type Scale

```tsx
// Fluid headline — scales from 48px (mobile) to 112px (desktop)
style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}

// Section headline
style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}

// Large editorial headline
style={{ fontSize: "clamp(3.5rem, 7vw, 6.5rem)" }}

// Body / description text
className="text-sm leading-relaxed"   // 14px, 1.625 line-height

// Labels / caps
className="text-xs uppercase tracking-[0.3em]"  // 12px, wide tracking
```

### Declared `@theme` Font Tokens (Phase 5 upgrade target)

These are declared in `globals.css` but **not yet applied** to components.
They represent the planned upgrade from Playfair+DM Sans to Cormorant+Montserrat:

```css
@theme {
  --font-serif: "Cormorant Garamond", serif;
  --font-sans:  "Montserrat", sans-serif;
}
```

When Phase 5 begins, swap `Playfair_Display` → `Cormorant_Garamond` and
`DM_Sans` → `Montserrat` in `layout.tsx`, then update component `fontFamily`
values to use `var(--font-serif)` and `var(--font-sans)`.

---

## Spacing & Layout Rhythm

```tsx
// Section vertical padding — generous breathing room
className="py-24"        // standard content sections
className="py-20"        // tighter content sections (service grid)

// Max content width — prevents over-wide lines on large screens
className="max-w-6xl mx-auto"   // most sections
className="max-w-7xl mx-auto"   // service grid

// Horizontal page padding
className="px-6"         // mobile
className="px-8 md:px-16" // editorial sections
className="px-5"         // compact sections

// Card internal padding
className="p-8"          // service cards — generous
className="p-4"          // compact cards

// Grid gap
className="gap-5"        // service card grid
className="gap-4"        // compact grid

// Section heading margin
className="mb-12"        // before major content blocks
className="mb-14"        // before feature grids
className="mb-16"        // editorial section heading margin
```

---

## 60fps Mobile Animation System

### The Golden Rule

> **Only animate `transform` and `opacity`.**  
> These two properties are handled entirely by the GPU compositor thread.  
> They never trigger layout recalculation or paint — they are always 60fps.

Every other CSS property (`width`, `height`, `top`, `left`, `margin`,
`background-color`, `border-radius`) triggers at minimum a paint pass when
animated. On a mid-range iPhone, that paints at ~20-30fps.

### Property Cheat Sheet

| Property | Thread | Cost | 60fps? |
|----------|--------|------|--------|
| `transform: translate3d()` | Compositor | Zero layout/paint | ✅ Always |
| `transform: scale3d()` | Compositor | Zero layout/paint | ✅ Always |
| `opacity` | Compositor | Zero layout/paint | ✅ Always |
| `background-color` | Main | Repaint | ⚠️ Use sparingly |
| `width` / `height` | Main | Reflow + Repaint | ❌ Never animate |
| `top` / `left` / `margin` | Main | Reflow + Repaint | ❌ Never animate |

### Rules for This Project (enforced in CLAUDE.md)

```
✅ DO:   transform: translate3d(x, y, 0)    — always 3D, forces GPU layer
✅ DO:   transform: scale3d(x, y, 1)        — always 3D, never 2D scaleX/scaleY
✅ DO:   opacity transitions                 — safe compositor property
✅ DO:   transition: transform, opacity      — explicit, fast
❌ DON'T: translateX(), translateY()         — falls back to main thread on some WebKit
❌ DON'T: scaleX(), scaleY()               — same issue
❌ DON'T: backdrop-filter / backdrop-blur   — crashes iOS WebKit silently
❌ DON'T: opacity: 0 to hide content        — use conditional DOM mounting instead
```

### Gallery Entrance Animation

The `gallery-enter` keyframe in `globals.css` is the canonical example of
correct 60fps animation in this system:

```css
/* ✅ Correct — all properties on the compositor thread */
@keyframes gallery-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale3d(1.18, 1.18, 1);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
  }
}
```

**Why `translate3d(0, 0, 0)` even with no translation?**  
It is a "null translate" — its sole purpose is to promote the element to its own
GPU compositing layer before the animation starts. Without it, the browser may
defer compositing until mid-animation, causing a visible first-frame jank.

Apply it to any element that will animate:

```tsx
<div
  className="gallery-item"
  style={{ animation: "gallery-enter 0.6s ease-out forwards" }}
/>
```

### Hover Transitions (Tailwind)

```tsx
// Card lift — translates UP, never changes height
className="transition-all duration-500 hover:-translate-y-2"

// Subtle scale — fast, snappy
className="transition-all hover:scale-[1.02]"

// Arrow nudge on CTAs — only the icon moves
className="transition-transform group-hover:translate-x-1"
```

### Pulsing FAB (Book Now Button)

The floating "Book Appointment" button uses a CSS `animate-ping` ring to signal
interactivity without requiring JavaScript or continuous repaints:

```tsx
<Link className="group relative ...">
  <span className="relative z-10">Book Appointment</span>

  {/* Pulsing ring — pure CSS, compositor-only, zero JS */}
  <span
    className="absolute inset-0 rounded-full border animate-ping opacity-20"
    style={{ borderColor: "#0B132B" }}
  />
</Link>
```

`animate-ping` is Tailwind's name for a `scale` + `opacity` keyframe —
both compositor properties. The ring grows and fades on a loop with no
JavaScript involvement and no layout thrashing.

### iOS-Specific Scroll Performance

```css
/* In globals.css — applied to html and body */
html, body {
  -webkit-overflow-scrolling: touch;  /* momentum scrolling on iOS */
  overflow-x: hidden;                 /* prevent accidental horizontal scroll */
}
```

```tsx
/* On all interactive elements */
className="touch-manipulation"   /* disables 300ms tap delay on iOS */
```

---

## Component Patterns

### The "Paper" Card (light surface)

```tsx
<div
  className="rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"
  style={{
    background: "#FFFFFF",
    border: "1px solid rgba(11,19,43,0.07)",
    boxShadow: "0 2px 20px rgba(11,19,43,0.05)",
  }}
>
  {/* Heading */}
  <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#0B132B" }}>
    Service Name
  </h3>
  {/* Body */}
  <p style={{ color: "rgba(11,19,43,0.55)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
    Description text.
  </p>
</div>
```

### The "Ink" Card (dark surface)

```tsx
<div
  className="rounded-3xl p-8"
  style={{
    background: "#0B132B",
    boxShadow: "0 8px 40px rgba(11,19,43,0.25)",
  }}
>
  <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F9F7F2" }}>
    Service Name
  </h3>
  <p style={{ color: "rgba(249,247,242,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
    Description text.
  </p>
</div>
```

### Section Label + Heading Pattern

Every major section uses a consistent 3-part header:
`overline label → serif heading → optional divider`

```tsx
<div className="text-center mb-14">
  {/* Overline — always uppercase, tracked out, muted */}
  <p
    className="uppercase tracking-[0.3em] text-xs mb-3"
    style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'DM Sans', sans-serif" }}
  >
    What We Offer
  </p>

  {/* Heading — always Playfair, light weight */}
  <h2
    className="text-4xl md:text-5xl font-light"
    style={{ fontFamily: "'Playfair Display', serif", color: "#0B132B" }}
  >
    Our Services
  </h2>

  {/* Thin divider line — decorative only, not a semantic hr */}
  <div
    className="mx-auto mt-5"
    style={{ width: "40px", height: "1px", background: "rgba(11,19,43,0.25)" }}
  />
</div>
```

### Full-Bleed Hero Section

```tsx
<section className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
  {/* Background media — GIF, video, or image */}
  <img
    className="absolute inset-0 w-full h-full object-cover"
    style={{ objectPosition: "top center" }}
    src={mediaUrl}
    alt=""
  />

  {/* Gradient overlay — dark at top and bottom, transparent in middle */}
  <div
    className="absolute inset-0 z-10"
    style={{
      background: "linear-gradient(to bottom, rgba(11,19,43,0.55) 0%, rgba(11,19,43,0.1) 40%, rgba(11,19,43,0.75) 85%, rgba(11,19,43,0.95) 100%)",
    }}
  />

  {/* Text content — anchored to bottom */}
  <div className="relative z-20 flex flex-col items-center justify-end h-full text-center pb-40 px-6">
    {/* overline → h1 → CTA */}
  </div>
</section>
```

---

## Checklist: Applying This Design System to a New Project

- [ ] Copy `@theme` block into `app/globals.css`
- [ ] Add `Playfair_Display` and `DM_Sans` (or Cormorant + Montserrat) to `app/layout.tsx`
- [ ] Apply font CSS variables to `<html>` element
- [ ] Set `body { background-color: var(--color-alabaster); color: var(--color-ink); }`
- [ ] Add `-webkit-overflow-scrolling: touch` and `overflow-x: hidden` to `html, body`
- [ ] Add `touch-manipulation` to all interactive elements
- [ ] Confirm all animations use only `transform: translate3d()/scale3d()` and `opacity`
- [ ] Confirm zero `backdrop-filter` usage in any mobile-rendered component
- [ ] Confirm `opacity-0` is not used to hide elements — use conditional mounting
- [ ] Test on a mid-range Android (Chrome DevTools → CPU 4x throttle) before shipping
