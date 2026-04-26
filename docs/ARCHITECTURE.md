# Fades & Facials — AGI System Blueprint

> **Audience:** Future LLMs and engineers onboarding to this codebase.
> This document describes the *why* behind architectural decisions — the code
> itself documents the *what*. Read this before touching any cross-cutting system.

---

## 1. The Database Engine

### `site_config` Table

The single source of truth for all runtime-configurable site settings.

| Column | Type | Notes |
|---|---|---|
| `key` | `text` (PK) | Unique string identifier |
| `value` | `text` | JSON-serialized or raw string value |
| `updated_at` | `timestamptz` | Auto-updated by DB trigger |

**RLS Policy:** Public `SELECT` (anonymous read), authenticated `INSERT/UPDATE` (admin write only).

**Known Keys:**

| Key | Value shape | Consumer |
|---|---|---|
| `active_layout` | `"cinematic" \| "grid" \| "editorial"` | `app/page.tsx` → which layout component renders |
| `global_hero_url` | URL string | `app/page.tsx` → `<img src>` in GlobalHero section |
| `featured_services` | JSON array of `{ serviceId, mediaUrl }` objects | `app/page.tsx` → `featuredPairs` resolved in `HomePage` |
| `category_order` | JSON array of category name strings | `app/services/page.tsx`, `app/admin/services/page.tsx` |
| `services_layout` | `"cards" \| "list" \| "minimal"` | `app/services/page.tsx` |

**Upsert pattern** (always use `onConflict: "key"` — never raw INSERT):
```typescript
await supabase
  .from("site_config")
  .upsert({ key: "active_layout", value: "grid" }, { onConflict: "key" });
```

**Batch read pattern** (one round-trip, not N):
```typescript
const { data } = await supabase
  .from("site_config")
  .select("key, value")
  .in("key", ["active_layout", "global_hero_url", "featured_services"]);

const getConfig = (key: string) => data?.find(c => c.key === key)?.value ?? null;
```

---

## 2. The Component Strategy

### Global Identity Layer vs. Layout Discovery Zone

The homepage (`app/page.tsx`) is split into two conceptually distinct zones:

```
┌─────────────────────────────────────────┐
│  GLOBAL IDENTITY LAYER                  │  ← Never remounts. No flickering.
│  GlobalHero (full-viewport GIF/video)   │
├─────────────────────────────────────────┤
│  LAYOUT DISCOVERY ZONE                  │  ← Flickers with activeLayout.
│  FeaturedServicesSection                │  (3 designs: cinematic/grid/editorial)
│  ─────────────────────────────          │
│  Active Layout Component                │  (CinematicLayout | GridLayout |
│  (pure menu list — allServices only)    │   EditorialLayout)
└─────────────────────────────────────────┘
```

**Why they're separated:**

The `GlobalHero` section is rendered directly in `HomePage`'s JSX return, outside any conditionally-mounted component. This means when the user switches layouts, React keeps the `<img>` or `<video>` tag mounted — no reload, no flash, no GIF restart.

If the hero were inside a layout component, every layout switch would unmount/remount it and the GIF would reset to frame 0.

**`FeaturedServicesSection`** sits between them. It receives both `activeLayout` and `featuredPairs` as props and uses `switch(activeLayout)` to render 3 visually distinct designs. It flickers because its *visual design* changes — but the underlying data (`featuredPairs`) is stable.

**Layout components** (`CinematicLayout`, `GridLayout`, `EditorialLayout`) are pure menu lists. They receive only `allServices: DbService[]` and render a catalogue. They contain no hero, no featured slots, no media state machines.

---

## 3. The Z-Index Hierarchy

All z-index values must come from this table. Do not invent new values without updating this document.

| Layer | z-index | Current Elements |
|---|---|---|
| Base content | 0–20 | Page sections, `VisitUsSection` (`z-20`) |
| Navbar | 50 | `<nav>` in `components/Navbar.tsx` |
| Fixed CTAs | 50 | `BookNowPill` in `app/page.tsx` |
| Admin pill nav | 40 | Floating layout selector (homepage, admin-facing) |
| Overlays / Modals | 90000 | Admin service modals, drawers |
| Layout swapper | 95000 | Reserved — do not use without architectural review |
| Critical toasts / Errors | 100000 | Save confirmations, error banners |

**Rules:**
- Never set `z-index` above 50 on public-facing page content.
- Admin UI modals live at 90000 to stay above all page content without affecting the public z-stack.
- Do not use `z-index: 9999` — it falls between layers and causes stacking ambiguity.

---

## 4. Rules for Building New Layouts

A "layout" is a pure menu-list component that renders the full `services` catalogue in a distinct visual style. Follow this contract exactly:

### Required Props Contract

```typescript
type LayoutProps = { allServices: DbService[] };

function MyNewLayout({ allServices }: LayoutProps) { ... }
```

- **No other props.** If you need `featuredPairs`, you are building the wrong thing — that belongs in `FeaturedServicesSection`.
- **No internal Supabase fetches.** All data flows down from `HomePage`'s single `useEffect`.
- **No hero rendering.** The hero lives in `HomePage` return only.

### Media Rendering

Always call `isVideoMedia()` (defined in `app/page.tsx`) to branch between `<video>` and `<img>`. Never branch on file extension alone in component JSX:

```typescript
// CORRECT
if (isVideoMedia(s.image, s.media_type)) {
  return <video src={s.image} autoPlay muted loop playsInline ... />;
}
return <img src={s.image} ... />;

// WRONG — misses media_type='video' cases where the URL may not end in .mp4
if (s.image?.endsWith(".mp4")) { ... }
```

`isVideoMedia` logic: `media_type === "video"` OR `/\.mp4(\?|$)/i.test(url)`.

### iOS / Mobile Rules (from CLAUDE.md — enforced)

Every interactive element in a layout component must have:

```tsx
onClick={handler}
onTouchEnd={(e) => { e.preventDefault(); handler(); }}
className="touch-manipulation"
style={{ minHeight: "44px" }}  // or minWidth for icon-only buttons
```

Additional rules:
- **No `backdrop-filter` or `backdrop-blur`** — silently breaks on iOS WebKit under GPU memory pressure.
- **All animations use `translate3d`/`scale3d`** — never `translateX`/`scaleX` (forces compositor layer).
- **No `opacity-0` for hiding** — use conditional DOM mounting (`{condition && <Component />}`).

### Registration

After building the component, register it in the `switch(activeLayout)` block in `FeaturedServicesSection` and in the conditional render block in `HomePage`:

```tsx
// In FeaturedServicesSection switch:
case "my-new-layout":
  return <MyNewLayoutFeatured featuredPairs={featuredPairs} />;

// In HomePage return:
{activeLayout === "my-new-layout" && <MyNewLayout allServices={allServices} />}
```

Also add the new layout ID to the `Layout` union type at the top of `app/page.tsx`:
```typescript
type Layout = "cinematic" | "grid" | "editorial" | "my-new-layout";
```

---

## 5. The Booking Flow

All "Book Now" CTAs across the site point to `/book` (internal Next.js route). This was changed from the old `/booking` route and from direct external Vagaro links in a cleanup pass.

**`app/book/page.tsx`** wraps the Vagaro iframe with:
- An `isProduction` guard — Vagaro requires HTTPS, so localhost shows a placeholder
- An `overflowY: auto; WebkitOverflowScrolling: touch` wrapper to enable native momentum scrolling inside the iframe on iOS Safari
- `scrolling="yes"` on the `<iframe>` itself

If the barber regenerates the Vagaro widget URL, update the `VAGARO_SRC` constant at the top of `app/book/page.tsx` only — no other file references this URL.

---

## 6. Auth Pattern

| Context | Client | Import |
|---|---|---|
| `"use client"` component | `createBrowserClient` | `@supabase/ssr` |
| Server Component / Route Handler | `createServerSupabaseClient()` | `@/lib/supabase` |
| `middleware.ts` | `createMiddlewareSupabaseClient()` | `@/lib/supabase` |
| Simple public query (no auth) | `supabase` singleton | `@/lib/supabase` |

Auth is magic-link only. No passwords. PKCE flow requires the magic link to open in the **same browser** that sent the OTP — in-app email browsers will fail with `exchange_failed`.

Admin pages must check session and redirect to `/admin` if unauthenticated. Client components do this in `useEffect`; Server Components use `redirect()` from `next/navigation`.

---

## 7. File Conventions

- No `src/` directory — files live at the root of their directories.
- No `tailwind.config.ts` — all design tokens are in `app/globals.css` under `@theme`.
- No external CSS files — all styling via Tailwind classes and inline `style` props.
- Server Components by default; `"use client"` only when state or browser APIs are required.
- Comment block format required above every major section (see `CLAUDE.md` for template).
