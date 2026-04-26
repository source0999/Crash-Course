# Fades & Facials — Active Task Board

---

## [IN PROGRESS]

### [IN PROGRESS] TICKET-001: Remove Injected Agent Telemetry
**File:** `lib/supabase.ts:99,123,148` | `app/admin/services/page.tsx:295,331,368`
**Issue:** Six unauthorized `fetch` calls to `http://127.0.0.1:7551` are leaking file paths, file sizes, and error stack traces to an unknown local debug service on every upload attempt.
**Fix:** Delete all `#region agent log` blocks from both files — zero calls to that endpoint should remain.

### [IN PROGRESS] TICKET-002: Fix Upload — Anon Client Has No Auth Session
**File:** `lib/supabase.ts:94` (`uploadServiceMedia` function)
**Issue:** `uploadServiceMedia` uses the module-level anon `supabase` singleton (no session cookie), so if `service-media` bucket policies require `auth.role() = 'authenticated'`, every upload silently returns a 403 with no user-visible error.
**Fix:** Add a `client: SupabaseClient` parameter to `uploadServiceMedia`; all callers pass the auth-aware browser client so the bucket RLS sees `auth.uid()`.

### [IN PROGRESS] TICKET-003: Featured Services — `media_type` State Machine
**File:** `lib/supabase.ts:181` (DbService type) | `app/admin/services/page.tsx:236` (swap handler)
**Issue:** Media type (image/gif/video) is inferred by inspecting the `image` URL string, which is fragile. There is no enforced DB-level state for what a featured service's media type is after a swap.
**Fix:** Run `ALTER TABLE services ADD COLUMN media_type text NOT NULL DEFAULT 'image';`. Update `DbService` type. Set `media_type: 'image'` on promotion/demotion in `handleSwapFeaturedSlot`. Prompt admin to upload GIF/Video after promoting a service.

---

## [BLOCKER]

### [BLOCKER] TICKET-004: Draft Card Upload State Never Binds to Preview
**File:** `app/admin/services/page.tsx:488` (`handleDraftMediaUpload`)
**Issue:** Draft card upload calls `uploadServiceMedia` — but since TICKET-002 means the upload likely fails silently with a 403, `draftData.image` never gets set, and the preview placeholder never clears.
**Blocked-by:** TICKET-002 (fix the client first, then verify the state binding works)

---

## [BACKLOG]

### [BACKLOG] TICKET-005: Category Input Is a Blind Text Field
**File:** `app/admin/services/page.tsx:1046`
**Issue:** The category field in the draft form is freehand text, making typo-duplicated categories ("Haircuts" vs "Haircut") easy to create and painful to clean up.
**Fix:** On mount, fetch `SELECT DISTINCT category FROM services`. Render a combobox (`<datalist>` or custom) that autocompletes existing values but allows typing new ones.

### [BACKLOG] TICKET-006: Implement Global Service Layer
**File:** `app/admin/services/page.tsx` (entire file)
**Issue:** All `supabase.from()` calls live inside React component event handlers, coupling UI tightly to the DB client — untestable, and a single schema change breaks the whole page.
**Fix:** Create `lib/services/` directory with typed async functions: `getServices()`, `upsertService()`, `deleteService()`, `swapFeaturedSlot()`. Components call these functions and handle the returned data only.

### [BACKLOG] TICKET-007: Audit & Document Supabase RLS Policies
**File:** Supabase Dashboard → Authentication → Policies
**Issue:** No documented RLS boundaries exist. Anon reads on `services` and `site_config` may be unintentionally permissive — a direct API hit could expose or mutate data.
**Fix:** Review every table's RLS policy. Write exact boundaries in a `docs/rls-audit.md` file (what anon can read, what authenticated can write, what is blocked entirely).

### [BACKLOG] TICKET-008: Standardize Error Handling with Toast Variants
**File:** `app/admin/services/page.tsx:79` (feedback state)
**Issue:** `feedback` state clears after 4 seconds with no visual hierarchy — a catastrophic delete failure looks the same as a successful layout save.
**Fix:** Add `warning` as a third feedback variant. Standardize error messages from all DB calls to include the operation context ("Failed to delete service [Name].").

### [BACKLOG] TICKET-009: "Moody Luxury" Color Overhaul
**File:** `app/globals.css:3` (@theme block) | `app/admin/services/page.tsx:842` (hardcoded `#0f1e2e`)
**Issue:** Admin pages use hardcoded hex values (`#0f1e2e`, `#0b1624`) instead of @theme tokens, so a site-wide palette change requires manual find/replace across multiple files.
**Fix:** Add `--color-admin-bg` and `--color-admin-surface` to the @theme block. Replace all hardcoded hex values in admin routes with Tailwind token-based classes.

### [BACKLOG] TICKET-010: Change "Book Now" to Muted Olive/Slate
**File:** `app/page.tsx` (or wherever the booking CTA lives)
**Issue:** Current "Book Now" button color is unresolved — pending the full "Moody Luxury" pass.
**Fix:** Apply after TICKET-009 establishes the new palette tokens.

### [BACKLOG] TICKET-011: Google Maps Iframe Dark-Mode Filter
**File:** Wherever the Maps embed lives (check `app/page.tsx`)
**Issue:** Iframe uses a harsh blue dark-mode filter that clashes with the warm palette.
**Fix:** Apply a CSS `filter` with reduced saturation and warmer hue-rotate. No backdrop-filter.
