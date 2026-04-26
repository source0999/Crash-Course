# Blueprint: Dynamic Layout Toggler
> **Extracted from:** `app/page.tsx` — Fades & Facials homepage  
> **Pattern type:** Runtime UI switcher — zero routing, zero reloads  
> **Reuse target:** Any project that needs to offer multiple visual presentations of the same data

---

## What This Pattern Does

A floating pill-shaped nav bar lets the user switch between **completely different page layouts** at runtime. Under the hood it is a single `useState` call. Each layout is a fully self-contained React component — its own HTML structure, colors, typography, and composition. Switching layouts mounts one component and unmounts the other. No shared internal state. No URL changes.

**Real-world use cases:**
- Public site: Cinematic / Grid / Editorial views of the same content
- Admin dashboard: Table / Kanban / Timeline view of the same data
- Portfolio: Dark / Light / Minimal theme toggle
- Product page: Gallery / Specs / Reviews tab system (without a router)

---

## The 4-Piece Architecture

```
┌─────────────────────────────────────────────────────┐
│  1. Layout Union Type     ← TypeScript contract      │
│  2. LAYOUTS Registry      ← config array (data)      │
│  3. useState<Layout>      ← single source of truth   │
│  4. Pill Nav + Renderer   ← the UI wired to 1-3      │
└─────────────────────────────────────────────────────┘
```

---

## Piece 1 — The Union Type

```ts
// This is the entire "contract" for valid layouts.
// TypeScript will error at compile time if you try to use
// a string that isn't listed here. Add a layout? Add it here first.
type Layout = "cinematic" | "grid" | "editorial";
```

**Why a union type and not a plain string?**  
Because `useState<string>` lets any typo compile silently. `useState<Layout>` makes
`setActiveLayout("cniematic")` a build error, not a runtime mystery.

---

## Piece 2 — The LAYOUTS Registry

```ts
// A static array that maps each layout ID to its human-readable
// label and icon. This is the ONLY place you register a new layout.
// The nav bar renders itself from this array — you never touch the
// nav bar code to add a new option.
const LAYOUTS: { id: Layout; label: string; icon: string }[] = [
  { id: "cinematic", label: "Cinematic", icon: "◈" },
  { id: "grid",      label: "Grid",      icon: "⊞" },
  { id: "editorial", label: "Editorial", icon: "≡" },
];
```

**Key principle: data drives UI.** The nav bar is a `map()` over this array.
You add a fourth layout by adding one object here and creating the component.
Nothing else changes.

---

## Piece 3 — The State Hook

```tsx
// Must be in a "use client" component.
// Default to whichever layout you want shown on first load.
const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");
```

That's the entire state management. One value. One setter.

---

## Piece 4 — The Pill Nav + Conditional Renderer

### The Nav Bar

```tsx
// Fixed to the top of the viewport, centered horizontally.
// Floats above all page content via z-40.
// The frosted-glass effect (backdrop-filter) is optional — swap for
// a solid background if you need iOS WebKit compatibility in prod.
<div
  className="fixed z-40 flex items-center gap-1 p-1 rounded-full shadow-lg"
  style={{
    top: "76px",              // position below any fixed site header
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(249,247,242,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(11,19,43,0.1)",
  }}
>
  {/* Map over the registry — never hardcode individual buttons */}
  {LAYOUTS.map((l) => (
    <button
      key={l.id}
      onClick={() => setActiveLayout(l.id)}
      style={{
        // Active pill: filled background + light text
        // Inactive pill: transparent background + muted text
        background: activeLayout === l.id ? "#0B132B" : "transparent",
        color:      activeLayout === l.id ? "#F9F7F2" : "rgba(11,19,43,0.45)",
        fontWeight: activeLayout === l.id ? 500 : 400,
        minHeight: "44px",    // 44px minimum — iOS touch target requirement
        borderRadius: "9999px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        transition: "all 0.25s",
      }}
    >
      <span style={{ fontSize: "14px" }}>{l.icon}</span>
      {/* Hide label on mobile to keep the pill compact */}
      <span className="hidden sm:inline" style={{ marginLeft: "0.5rem" }}>
        {l.label}
      </span>
    </button>
  ))}
</div>
```

### The Conditional Renderer

```tsx
// Mount/unmount based on active state.
// Each layout component is entirely independent — no props passed down,
// no shared context. They fetch or receive their own data.
{activeLayout === "cinematic" && <CinematicLayout />}
{activeLayout === "grid"      && <GridLayout />}
{activeLayout === "editorial" && <EditorialLayout />}
```

**Why not a switch statement or a map to components?**  
These three lines are intentionally explicit. A `switch` or a `componentMap[activeLayout]`
trick saves a few lines but hides which components exist at a glance. Explicitness
wins for maintainability. If you have 6+ layouts, a map is reasonable — but document it.

---

## Full Minimal Implementation (copy-paste starter)

```tsx
"use client";

import { useState } from "react";

// ── 1. Define valid layouts ──
type Layout = "a" | "b" | "c";

// ── 2. Registry ──
const LAYOUTS: { id: Layout; label: string; icon: string }[] = [
  { id: "a", label: "View A", icon: "◈" },
  { id: "b", label: "View B", icon: "⊞" },
  { id: "c", label: "View C", icon: "≡" },
];

// ── 3. Layout components (self-contained) ──
function LayoutA() { return <main>Layout A content</main>; }
function LayoutB() { return <main>Layout B content</main>; }
function LayoutC() { return <main>Layout C content</main>; }

// ── 4. Page component ──
export default function Page() {
  const [activeLayout, setActiveLayout] = useState<Layout>("a");

  return (
    <>
      {/* Floating pill nav */}
      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 40, display: "flex", gap: 4, padding: 4, background: "white", borderRadius: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayout(l.id)}
            style={{
              background: activeLayout === l.id ? "#111" : "transparent",
              color:      activeLayout === l.id ? "#fff" : "#888",
              borderRadius: 9999,
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </div>

      {/* Conditional renderer */}
      {activeLayout === "a" && <LayoutA />}
      {activeLayout === "b" && <LayoutB />}
      {activeLayout === "c" && <LayoutC />}
    </>
  );
}
```

---

## Adapting for Common Use Cases

### Theme Switcher (light / dark / high-contrast)

```ts
type Theme = "light" | "dark" | "highContrast";

const THEMES = [
  { id: "light",        label: "Light",    icon: "☀" },
  { id: "dark",         label: "Dark",     icon: "◑" },
  { id: "highContrast", label: "Contrast", icon: "◐" },
];
```

Pass `activeTheme` as a prop into a single `<Page theme={activeTheme} />` component
if the difference is just CSS tokens rather than whole component trees.

### Dashboard View Switcher (table / kanban / timeline)

```ts
type DashView = "table" | "kanban" | "timeline";
```

Each view component receives the same `data` prop. The nav state just controls
which renderer gets to consume it.

### Persisting the Layout Choice

```tsx
// Read from localStorage on mount so the user's preference survives a refresh.
const [activeLayout, setActiveLayout] = useState<Layout>(() => {
  if (typeof window === "undefined") return "cinematic"; // SSR safety
  return (localStorage.getItem("preferred-layout") as Layout) ?? "cinematic";
});

// Write to localStorage on every change.
function handleLayoutChange(id: Layout) {
  setActiveLayout(id);
  localStorage.setItem("preferred-layout", id);
}
```

---

## Implementation Checklist

- [ ] Add `"use client"` to the page component — `useState` requires it
- [ ] Define `type Layout = "x" | "y" | "z"` with all valid layout names
- [ ] Create the `LAYOUTS` registry array with `{ id, label, icon }` per option
- [ ] Add `useState<Layout>("default")` — pick your default layout
- [ ] Render the pill nav by mapping over `LAYOUTS` — never hardcode buttons
- [ ] Apply active state styles using `activeLayout === l.id`
- [ ] Conditionally mount each layout: `{activeLayout === "x" && <XLayout />}`
- [ ] Ensure each layout component is fully self-contained (no cross-layout state)
- [ ] Enforce 44px minimum height on all nav buttons (iOS touch target)
- [ ] (Optional) Persist choice to `localStorage` for returning users

---

## Rules of the Pattern

1. **The registry is the only place you register a layout.** Add to it, and the nav bar updates automatically.
2. **Layout components are islands.** They do not share state, refs, or contexts with each other.
3. **The union type is the contract.** A string not in the type cannot be set. TypeScript enforces this.
4. **One `useState`. One value.** If you find yourself adding a second piece of state to manage layout switching, the pattern is being misapplied.
