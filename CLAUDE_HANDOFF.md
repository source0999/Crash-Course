# Fades & Facials 2.0 — Claude Handoff Document
> Written by Claude for the next Claude instance taking over this project.
> Britton's email confirmed. Barber's email TBD — she'll be invited when ready.

---

## WHO IS BRITTON

- Bachelor's in Web Dev, ~5 years rust. Refreshing, not starting from zero.
- Calibrate to senior speed — skip conceptual basics, focus on modern patterns.
- He works as Director, you work as Lead Architect.
- He gives raw ideas, you write the precise Cursor prompts.
- He uses Cursor IDE for all code generation. You write the prompts, he pastes them.
- Always ask for architecture plan/prediction BEFORE telling him to run code.
- No scaffolded solutions — give him the goal, let him fill in what he can.

---

## THE PROJECT

**Fades & Facials Barbershop** — Suwanee, GA
Real client site being rebuilt from scratch. Deployed on Vercel.

**Stack:**
- Next.js 16.2.4 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 (no tailwind.config.ts — configured via @theme in globals.css)
- Supabase (PostgreSQL + Auth + Storage)
- Vercel (deployment)
- Vagaro (third-party booking system, iframe embed only)

**Repo:** https://github.com/source0999/Crash-Course
**Vercel URL:** https://fades-and-facials-6x0rscn7e-sources-projects-0aed7c2a.vercel.app

---

## CURRENT FILE STRUCTURE

```
fades-and-facials/
├── app/
│   ├── layout.tsx          ← root shell, Navbar imported here
│   ├── page.tsx            ← homepage (async Server Component, fetches from Supabase)
│   ├── globals.css         ← Tailwind v4 @import + @theme tokens + body styles
│   ├── admin/
│   │   ├── page.tsx              ← magic link login form (use client)
│   │   ├── callback/
│   │   │   └── route.ts          ← exchanges magic link code for session, redirects to dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx          ← protected hub, links to Gallery + Services admin
│   │   │   └── LogoutButton.tsx  ← use client, calls supabase.auth.signOut()
│   │   ├── services/
│   │   │   └── page.tsx          ← stub only
│   │   └── gallery/
│   │       └── page.tsx          ← full client CRUD manager (upload/replace/toggle/delete)
│   ├── booking/
│   │   └── page.tsx        ← Vagaro iframe (production) / placeholder (localhost)
│   ├── gallery/
│   │   ├── page.tsx              ← async Server Component, fetches gallery table, revalidate=60
│   │   └── GalleryGrid.tsx       ← use client, masonry CSS columns, stagger animation
│   └── services/
│       └── page.tsx        ← async Server Component, fetches from Supabase
├── components/
│   └── Navbar.tsx          ← "use client", scroll-aware floating navbar, iOS-fixed
├── lib/
│   ├── services.ts         ← hardcoded fallback data (used if Supabase fails)
│   └── supabase.ts         ← Supabase client + DbService + DbGalleryItem + server/middleware helpers
├── middleware.ts           ← protects /admin/* routes, allows /admin and /admin/callback through
├── public/
│   └── images/
│       ├── logo.png
│       ├── logo.ico
│       ├── lele1.gif       ← current hero background (to be replaced with video)
│       ├── lele2.gif
│       ├── cuts/
│       ├── hair/
│       └── services/
│           ├── fade.gif
│           ├── facial.gif
│           └── barbergif1.gif
└── next.config.ts          ← allowedDevOrigins: ['10.0.0.126'] for mobile dev
```

---

## ENVIRONMENT VARIABLES

In `.env.local` (gitignored) and Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

`.gitignore` has `.env*` — all env files are safe.

Note: @supabase/ssr is installed. createBrowserClient used in client components, createServerSupabaseClient used in server components and route handlers, createMiddlewareSupabaseClient used in middleware.ts.

---

## SUPABASE STATE

**Project:** fades-and-facials (source0999's Org)

**Tables created and seeded:**

`services` (10 rows, live)
- id, name, category, price, description, image, is_active, created_at
- RLS: public read, authenticated write
- Categories: "Cuts", "Beard Care", "Hair Care"

`profiles` (created, trigger attached)
- id (references auth.users), email, role (default 'admin'), created_at
- Auto-populated via trigger on_auth_user_created
- RLS: authenticated read/write

`gallery` (created, live with uploaded rows)
- id, title, file_url, file_type ('image'|'video'), category, sort_order, is_active, created_at
- RLS: public read (is_active=true), authenticated write

`site_config` (created, seeded with defaults)
- key (primary), value, updated_at
- Seeded: hero_media_url='/images/lele1.gif', hero_media_type='gif', featured_service_ids='1,4,6'
- RLS: public read, authenticated write

**Storage buckets:** CREATED ✅
- `gallery` bucket (public)
- `hero` bucket (public)
- Policies set: public read + authenticated upload/delete

**Auth:**
- Magic link only (no passwords)
- Site URL: set to Vercel URL ✅
- Redirect URLs: `/admin/callback` working ✅
- Britton's user: confirmed and working ✅
- Magic link flow tested end-to-end ✅
- Barber's user: NOT yet created (no email yet)

---

## WHAT'S BUILT AND WORKING

✅ Navbar — floating scroll-aware, transparent on hero, solid on other pages
✅ iOS scroll fixes — passive listeners on window+document+documentElement+body, translateZ(0) GPU layer, 44px touch targets, onTouchEnd handlers
✅ Homepage — hero GIF background with overlay, services preview (3 cards zigzag)
✅ Services page — live Supabase data, grouped by category, responsive grid
✅ Booking page — Vagaro iframe on production (HTTPS), placeholder on localhost
✅ Public gallery page (/gallery) — masonry grid, staggered entrance animation, live Supabase data
✅ Admin auth — magic link login, callback route, middleware protection, session-aware dashboard
✅ Admin gallery manager — upload (multi-file), delete (with confirm), replace/swap, toggle visibility (show/hide)
✅ Supabase connection — live data pipeline working
✅ Supabase Storage — gallery + hero buckets created, public read + authenticated write policies set
✅ DbGalleryItem type — added to lib/supabase.ts
✅ createServerSupabaseClient + createMiddlewareSupabaseClient — added to lib/supabase.ts
✅ @supabase/ssr installed — cookie-aware auth for App Router
✅ Vercel deployment — live and working
✅ allowedDevOrigins — mobile dev testing works on local network
✅ lib/services.ts — fallback data if Supabase fails
✅ lib/supabase.ts — Supabase client with DbService type
✅ Debug overlays — ALL removed, clean codebase

---

## DESIGN SYSTEM

```css
/* globals.css @theme tokens */
--color-brand-navy: #1e3a5f
--color-brand-white: #f8fafc
--color-brand-bg: #0f1e2e       ← page background
--color-brand-text: #f8fafc
--color-brand-accent: #c9a96e   ← gold accent (prices, highlights)
```

**Inspiration:** lifetime.life — premium, cinematic, minimal text, bold headers
**Mobile-first:** 375px base, scale up. iOS WebKit nuclear rules enforced throughout.

**iOS WebKit rules (CRITICAL — never violate):**
- No `backdrop-filter` or `backdrop-blur` — silently breaks on iOS
- All animations use `translate3d`/`scale3d`, never `translateX`/`scaleX`
- Every interactive element has `onTouchEnd` with `e.preventDefault()`
- Minimum 44×44px touch targets (`min-h-[44px] min-w-[44px]`)
- `touch-manipulation` on all clickable elements
- No `opacity-0` for "hidden" — use conditional DOM mounting (`{condition && <Component />}`)

---

## WHAT'S NOT BUILT YET — PRIORITY ORDER

### 1. Gallery Ordering + Layout Presets (Admin)
- Drag-to-reorder updates sort_order in gallery table
- Layout preset picker: Masonry / Grid / Fullwidth
- Layout choice persists to site_config table (key: gallery_layout)
- Public /gallery page reads layout from site_config and renders accordingly

### 2. Services CRUD (/admin/services)
- List all services from Supabase
- List all services, inline edit name/price/description
- Toggle is_active per service
- Add new service
- Delete service (with confirmation)

### 3. Homepage Controls (/admin/homepage)
- Change hero background: upload new video/gif → saves URL to site_config
- Select which 3 services appear in the preview section

### 4. Mobile-First Admin Pass (after all features functional)
- Full /admin/* mobile redesign for iPhone use
- Bottom-sheet controls, thumb-friendly layout, camera roll optimized

### 5. Public Site Design Overhaul (Phase 3 polish — do LAST)
- lifetime.life aesthetic applied section by section
- Full-bleed cinematic layouts, bold typography, scroll animations

---

## VAGARO BOOKING

**The embed works on HTTPS only** (Vercel URL, not localhost). This is expected — Vagaro requires HTTPS for iframe.

The iframe src URL is hardcoded in `app/booking/page.tsx`. If the barber regenerates the widget in Vagaro (Promote → Booking Widget → Embed), update the `src` attribute with the new `enc=` parameter.

**Vagaro does NOT have a public API.** Cannot pull service data from Vagaro programmatically. Supabase is the source of truth for services.

---

## KEY ARCHITECTURAL DECISIONS (don't re-debate these)

1. **Services data source:** Supabase `services` table. `lib/services.ts` is fallback only.
2. **Booking:** Vagaro iframe only. No custom booking system.
3. **Auth:** Supabase magic link. No passwords.
4. **Images/Videos:** Native `<video>` tags for motion content, not GIFs. Better performance.
5. **Admin invite:** Supabase `auth.admin.inviteUserByEmail()` — requires service role key in server-only context.
6. **No `src/` directory** — all files at root level of their directories.
7. **Tailwind v4** — no `tailwind.config.ts`, use `@theme` in globals.css.
8. **Server Components by default** — only add `"use client"` when state/interactivity is required.
9. **Gallery:** Pinterest masonry, native video support, no GIF conversion needed.

---

## GIT WORKFLOW

Branch naming: `feature/`, `fix/`, `docs/`, `chore/`
Commit format: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`)
Never commit directly to `main`. Branch → PR → merge.

Current branch state: Should be on `main` with everything pushed.
Next branch to create: `feature/admin-auth`

---

## CURSOR PROMPT RULES (for writing prompts)

Always end prompts with:
```
Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
Mobile-first. No external CSS files. All styling via Tailwind classes.
```

Always specify:
- Exact files to edit (and files NOT to touch)
- No new packages unless explicitly needed
- Comment block format above every major section
- TypeScript strict — no `any` types

Comment format required in all files:
```typescript
// ─────────────────────────────────────────
// SECTION: [name]
// WHAT: [one sentence]
// WHY: [one sentence]
// PHASE 4: [what changes when database is connected]
// ─────────────────────────────────────────
```

---

## MOBILE DEV TESTING

Britton's local IP: `10.0.0.126`
`next.config.ts` has `allowedDevOrigins: ['10.0.0.126']`
Phone accesses dev server at: `http://10.0.0.126:3000`
Eruda (mobile console) was used but removed — don't add it again unless debugging.

**If scroll/interaction bugs appear on iOS:**
1. Check `allowedDevOrigins` first — if missing, phone loads cached version
2. Check for `backdrop-blur` — remove it
3. Check touch targets are 44×44px minimum
4. Check `onTouchEnd` exists on all interactive elements
5. Add `{ passive: true }` to all scroll listeners

---

## PHASE 1 CURRICULUM STATUS (Britton's learning)

Britton completed Phase 1 fundamentals in crash-course practice files:
✅ Terminal & Git (init, branch, merge, push, conventional commits)
✅ const vs let, data types
✅ Conditionals (if/else, ===)
✅ Functions, arrow functions
✅ Arrays, loops, forEach, map, filter
✅ Objects, destructuring
✅ Scope, closures
✅ Async/Await, event loop
✅ Error handling (try/catch/throw)

Practice files in `/c/projects/crash-course/`:
functions.js, arrays.js, objects.js, scope.js, async.js, errors.js

Phase 2 (Architecture) and Phase 3 (Frontend) are COMPLETE via the actual project.
Phase 4 (Admin Backend) is IN PROGRESS — Supabase set up, auth not yet built.
Phase 5 (Advanced — Docker, TypeScript, Zustand, Linux) — NOT started.
Phase 6 (AI + Deployment) — Vercel deployed ✅, rest not started.
