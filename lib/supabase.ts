/**
 * @file lib/supabase.ts
 *
 * Central Supabase module. Exports three clients for three distinct Next.js
 * execution contexts, plus shared database types.
 *
 * ─── CLIENT SELECTION GUIDE ────────────────────────────────────────────────
 *
 *  Context                          │ Client to use
 *  ─────────────────────────────────┼────────────────────────────────────────
 *  "use client" component           │ createBrowserClient from @supabase/ssr
 *  Server Component / Route Handler │ createServerSupabaseClient() (this file)
 *  middleware.ts                    │ createMiddlewareSupabaseClient() (this file)
 *  Simple public query (no auth)    │ supabase (module-level singleton, this file)
 *
 * Using the wrong client for the context either silently breaks session
 * persistence or throws a runtime error.
 *
 * ─── AUTH GOTCHAS — READ BEFORE TOUCHING THE AUTH FLOW ─────────────────────
 *
 *  WARNING: Magic link OTPs expire after 5 minutes (Supabase default).
 *           Users who open the email slowly or on a different device will
 *           hit "exchange_failed". The expiry is configurable in the Supabase
 *           dashboard under Auth → Settings → OTP Expiry, max 3600s (1 hour).
 *           Increasing it reduces security; document any change in the PR.
 *
 *  NOTE:    PKCE (Proof Key for Code Exchange) requires the magic link to be
 *           opened in the SAME BROWSER that sent the OTP request. The code
 *           verifier is stored in the browser's session storage. If the user
 *           opens the link in a different browser (e.g., email app's in-app
 *           browser vs Safari), the exchange will fail with "exchange_failed".
 *           This is a security feature, not a bug — but it must be documented
 *           in user-facing error messaging and support runbooks.
 *
 *  NOTE:    The module-level `supabase` singleton does NOT persist auth
 *           sessions. Never call supabase.auth.* from a Server Component —
 *           use createServerSupabaseClient() instead so the session cookie
 *           is read/written correctly.
 *
 * ─── console.log AUDIT ──────────────────────────────────────────────────────
 *
 *  No console.log statements are present in this file.
 *  If debugging Supabase responses, use the pattern:
 *
 *    if (process.env.NODE_ENV === 'development') {
 *      console.log('[supabase]', result);
 *    }
 *
 *  Never commit bare console.log to this file — it runs in middleware (Edge)
 *  and server-side, where logs surface in Vercel's production log stream.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────
// SECTION: URL Helper (re-exported)
// WHAT: Environment-aware base URL for auth redirect targets.
// WHY: getURL() lives in lib/url.ts — NOT here — because this file imports
//   next/headers (server-only). Any "use client" component that imports
//   getURL from here would pull in next/headers and break the client bundle.
//   Import getURL directly from "@/lib/url" in client components.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
export { getURL } from "@/lib/url";

// ─────────────────────────────────────────
// SECTION: Supabase Client
// WHAT: Creates a single reusable Supabase client instance.
// WHY: One client shared across the app prevents multiple connections.
// PHASE 4: This client is already configured for admin auth —
//   the service role key will be added in a separate server-only client
//   when the admin dashboard is built.
// ─────────────────────────────────────────

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

// Guard: createClient throws synchronously if the URL is empty or not http(s).
// Using a dummy URL allows the module to import cleanly in CI or when env vars
// are not yet set — queries will fail gracefully instead of crashing the build.
const supabaseUrl =
  envUrl && /^https?:\/\//i.test(envUrl) ? envUrl : "https://invalid.invalid";

export const supabase = createClient(supabaseUrl, envKey);

/**
 * Uploads a service image/video asset to Supabase Storage and returns a public URL.
 *
 * @param file - Raw browser File from an <input type="file"> control.
 * @returns Public URL for the uploaded object in the `service-media` bucket.
 */
export async function uploadServiceMedia(file: File): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const safeName = sanitizedName.length > 0 ? sanitizedName : "service-media-upload";
  const filePath = `services/${Date.now()}-${safeName}`;
  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e7a726" },
    body: JSON.stringify({
      sessionId: "e7a726",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "lib/supabase.ts:uploadServiceMedia:beforeUpload",
      message: "Preparing storage upload",
      data: { bucket: "service-media", filePath, fileType: file.type, fileSize: file.size },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const { error: uploadError } = await supabase.storage
    .from("service-media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e7a726" },
      body: JSON.stringify({
        sessionId: "e7a726",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "lib/supabase.ts:uploadServiceMedia:uploadError",
        message: "Storage upload failed",
        data: {
          filePath,
          errorMessage: uploadError.message,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("service-media").getPublicUrl(filePath);
  if (!data.publicUrl) {
    throw new Error("Failed to resolve uploaded media URL.");
  }
  // #region agent log
  fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e7a726" },
    body: JSON.stringify({
      sessionId: "e7a726",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "lib/supabase.ts:uploadServiceMedia:success",
      message: "Storage upload succeeded",
      data: { filePath, publicUrl: data.publicUrl },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return data.publicUrl;
}

// ─────────────────────────────────────────
// SECTION: Database Types
// WHAT: TypeScript shapes that mirror the Supabase table schemas.
// WHY: Provides compile-time type safety for all data fetched from the DB,
//   catching column-name typos and missing fields before they reach prod.
// PHASE 4: No changes needed — these ARE the Phase 4 shapes.
// ─────────────────────────────────────────

/**
 * Mirrors the `services` table schema in Supabase.
 *
 * `price` is typed as `string | number` because it may be stored as "$45"
 * (legacy string format) or as a numeric `45`. Always coerce to the desired
 * type before display or calculation — never assume one or the other.
 */
export type DbService = {
  id: number;
  name: string;
  category: string;
  /** May be a formatted string ("$45") or a raw number (45). Coerce before use. */
  price: string | number;
  description: string | null;
  /** Placeholder URLs are acceptable until real service media is uploaded. */
  image: string | null;
  duration?: string | null;
  is_premium?: boolean;
  /** Legacy/admin visibility flag still used by existing manager UI. */
  is_active?: boolean;
  /** Legacy/admin ordering field still used by drag-reorder flows. */
  sort_order?: number;
  created_at: string;
};

/**
 * Mirrors the `gallery` table schema in Supabase.
 *
 * `file_url` is the full public CDN URL returned by Supabase Storage.
 * To derive the storage path for deletion, use `extractStoragePath()`
 * in `app/admin/gallery/page.tsx` — do not attempt to parse the URL manually.
 */
export type DbGalleryItem = {
  id: number;
  title: string | null;
  /** Full Supabase Storage public URL. Use extractStoragePath() to get the path. */
  file_url: string;
  file_type: "image" | "video";
  category: string | null;
  sort_order: number;
  /** When false, the image background is removed (transparent). */
  show_bg: boolean;
  is_active: boolean;
  created_at: string;
};

// ─────────────────────────────────────────
// SECTION: Server Supabase Client (App Router)
// WHAT: Creates a cookie-aware Supabase client for Server Components and Route Handlers.
// WHY: The default anon client has no cookie access — auth sessions require cookies.
// PHASE 4: No changes needed — this IS the Phase 4 auth client.
// ─────────────────────────────────────────

/**
 * Creates a cookie-aware Supabase client for use in Server Components and
 * Route Handlers (Node.js runtime only — not Edge/middleware).
 *
 * This is the ONLY client that can write session cookies, making it required
 * for the PKCE callback (`exchangeCodeForSession`) and any server-side
 * operation that must respect the logged-in user's session.
 *
 * @returns A fully configured `SupabaseClient` with cookie read/write access.
 *
 * @example
 * // In a Route Handler (app/admin/callback/route.ts):
 * const supabase = await createServerSupabaseClient();
 * const { error } = await supabase.auth.exchangeCodeForSession(code);
 *
 * @remarks
 * - Must be `await`ed — `cookies()` is async in Next.js 15+.
 * - The `setAll` try/catch is intentional: Server Components have read-only
 *   cookie stores. The catch suppresses the write error because in that
 *   context we only need to read the session, not refresh it.
 * - Do NOT use this client in middleware — it relies on `next/headers` which
 *   is unavailable in the Edge runtime. Use createMiddlewareSupabaseClient().
 */
export async function createServerSupabaseClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Intentionally swallowed: Server Components have a read-only
            // cookie store. The session is readable but not refreshable here.
            // The middleware handles session refresh on subsequent requests.
          }
        },
      },
    },
  );
}

// ─────────────────────────────────────────
// SECTION: Middleware Supabase Client
// WHAT: Creates a Supabase client that works inside Next.js middleware (no cookies() API).
// WHY: Middleware runs on the Edge — needs request/response objects to read/write cookies.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

/**
 * Creates a Supabase client for use exclusively inside `middleware.ts`.
 *
 * Middleware runs on the Edge runtime, where `next/headers` and its `cookies()`
 * API are unavailable. This client reads cookies from the incoming `NextRequest`
 * and writes refreshed session cookies onto the outgoing `NextResponse`, keeping
 * the session alive across navigations without a full server round-trip.
 *
 * @param request  - The incoming Edge request (provides cookie read access).
 * @param response - The outgoing Edge response (receives Set-Cookie headers).
 * @returns A configured `SupabaseClient` bound to the request/response cookie pair.
 *
 * @example
 * // In middleware.ts:
 * const supabase = createMiddlewareSupabaseClient(request, response);
 * const { data: { session } } = await supabase.auth.getSession();
 *
 * @remarks
 * - Always pass BOTH `request` AND `response` — writing to only one will
 *   cause the session cookie to be lost on the next request.
 * - This function is synchronous (no `await` needed at the call site).
 * - Never import this function into a Server Component or Route Handler;
 *   those should use createServerSupabaseClient() instead.
 */
export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies to both the request (for any downstream
          // middleware in the chain) and the response (to send Set-Cookie
          // headers back to the browser so the session is persisted).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
}
