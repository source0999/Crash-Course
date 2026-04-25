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
│   │   └── page.tsx        ← stub only, NOT built yet
│   │   ├── services/
│   │   │   └── page.tsx    ← stub only
│   │   └── gallery/
│   │       └── page.tsx    ← stub only
│   ├── booking/
│   │   └── page.tsx        ← Vagaro iframe (production) / placeholder (localhost)
│   └── services/
│       └── page.tsx        ← async Server Component, fetches from Supabase
├── components/
│   └── Navbar.tsx          ← "use client", scroll-aware floating navbar, iOS-fixed
├── lib/
│   ├── services.ts         ← hardcoded fallback data (used if Supabase fails)
│   └── supabase.ts         ← Supabase client + DbService type
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

`gallery` (created, empty)
- id, title, file_url, file_type ('image'|'video'), category, sort_order, is_active, created_at
- RLS: public read (is_active=true), authenticated write

`site_config` (created, seeded with defaults)
- key (primary), value, updated_at
- Seeded: hero_media_url='/images/lele1.gif', hero_media_type='gif', featured_service_ids='1,4,6'
- RLS: public read, authenticated write

**Storage buckets:** NOT yet created — Britton still needs to do this:
- `gallery` bucket (public)
- `hero` bucket (public)
Both need policies: public read + authenticated upload/delete

**Auth:**
- Magic link only (no passwords)
- Site URL: set to Vercel URL ✅
- Redirect URLs: need `/admin/callback` added for both Vercel and localhost
- Britton's user: created (id: d3bfa8f4-7f48-419e-b6c5-ba52cba1e4aa), NOT yet confirmed (hasn't clicked magic link)
- Barber's user: NOT yet created (no email yet)

---

## WHAT'S BUILT AND WORKING

✅ Navbar — floating scroll-aware, transparent on hero, solid on other pages
✅ iOS scroll fixes — passive listeners on window+document+documentElement+body, translateZ(0) GPU layer, 44px touch targets, onTouchEnd handlers
✅ Homepage — hero GIF background with overlay, services preview (3 cards zigzag)
✅ Services page — live Supabase data, grouped by category, responsive grid
✅ Booking page — Vagaro iframe on production (HTTPS), placeholder on localhost
✅ Supabase connection — live data pipeline working
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

### 1. Supabase Storage Buckets (Britton does manually)
- Create `gallery` and `hero` buckets in Supabase Storage
- Set policies: public read, authenticated upload/delete

### 2. Auth Callback Route
Create `app/admin/callback/route.ts` — handles magic link redirect from Supabase.

### 3. Admin Login Page (`/admin`)
- Magic link form — email input + send button
- On submit: call `supabase.auth.signInWithOtp({ email })`
- Show "Check your email" confirmation state
- Clean dark design matching site aesthetic

### 4. Admin Middleware (route protection)
Create `middleware.ts` at project root:
- Checks Supabase session on every `/admin/*` route
- Redirects to `/admin` login if no session
- Allows `/admin/callback` through unauthenticated

### 5. Admin Dashboard Hub (`/admin/dashboard`)
- Landing page after login
- Links to: Services, Gallery, Homepage Controls
- Shows who's logged in
- Logout button

### 6. Services CRUD (`/admin/services`)
- List all services from Supabase
- Edit name, price, description, image inline
- Toggle is_active (show/hide on public site)
- Add new service
- Delete service (with confirmation)

### 7. Gallery Management (`/admin/gallery`)
- Upload images AND videos directly from device
- Display uploaded media in masonry grid (Pinterest style)
- Delete media
- Files go to Supabase Storage `gallery` bucket
- Public gallery page at `/gallery` (add to Navbar)
- Gallery page: masonry grid, mix of `<video>` and `<img>` tags

### 8. Homepage Controls (`/admin/homepage`)
- Change hero background: upload new video/gif → saves URL to site_config
- Select which 3 services appear in the preview section
- Live preview of changes

### 9. Hero Video Migration
Current hero uses `lele1.gif` (large file). Should be `<video autoPlay muted loop playsInline>`.
- Add `hero` Supabase storage bucket
- Admin can upload MP4/WebM
- Homepage reads `hero_media_url` and `hero_media_type` from site_config
- Render as `<video>` or `<img>` based on type

### 10. Gallery Public Page
- Route: `/gallery`
- Add "Gallery" to Navbar
- Masonry grid layout (CSS columns or Masonry library)
- Mix of `<img>` and `<video autoPlay muted loop playsInline>` 
- Fetch from Supabase gallery table (is_active = true)

### 11. Invite System (Admin Panel)
- In admin dashboard: "Invite Admin" button
- Email input → calls `supabase.auth.admin.inviteUserByEmail()`
- Requires SERVICE ROLE KEY (not anon key — create separate server-only client)
- List current admins from profiles table
- Revoke access button (deletes from auth.users)
- NOTE: Service role key is SECRET — never expose to client. Must be in Server Action or Route Handler only.

### 12. Design Overhaul (Phase 3 polish — do LAST)
Britton wants the full lifetime.life aesthetic applied after all features work.
Use Cursor section by section:
- Full-bleed layouts, cinematic spacing
- Bold oversized typography
- Smooth scroll sections
- Premium button styles
- Keep all the scroll navbar behavior already built

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
