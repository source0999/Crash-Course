# Blueprint: Supabase Magic Link Authentication
> **Extracted from:** Fades & Facials — `lib/supabase.ts`, `lib/url.ts`, `app/admin/page.tsx`,  
> `app/admin/callback/route.ts`, `middleware.ts`  
> **Pattern type:** Passwordless auth with PKCE, environment-aware redirects, and Edge middleware protection  
> **Reuse target:** Any Next.js App Router project that needs secure, password-free admin access

---

## Why Magic Links?

Magic links (OTP via email) eliminate:
- Passwords to store, hash, and rotate
- Password reset flows
- Credential stuffing attacks

The user enters their email, clicks a link, and they are in. The link is single-use
and short-lived. Supabase handles the token generation and email delivery. Your app
handles the code exchange and the session cookie.

---

## System Overview — The Full Pipeline

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. User visits /admin                                   │
│     └─ middleware.ts checks → no session → allow through │
│                                                          │
│  2. User submits email in login form                     │
│     └─ app/admin/page.tsx calls signInWithOtp()          │
│        emailRedirectTo = getURL() + "/admin/callback"    │
│                                                          │
│  3. Supabase sends the magic link email                  │
│     └─ Link points to: your-domain.com/admin/callback    │
│        ?code=PKCE_AUTH_CODE                              │
│                                                          │
│  4. User clicks the link in their email                  │
│     └─ app/admin/callback/route.ts receives GET request  │
│        exchanges ?code= for a session cookie via PKCE    │
│        redirects to /admin/dashboard on success          │
│                                                          │
│  5. User hits any /admin/* route going forward           │
│     └─ middleware.ts reads the session cookie            │
│        session valid → allow through                     │
│        session missing/expired → redirect to /admin      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**5 files. 5 responsibilities. No overlap.**

---

## File 1 — `lib/url.ts` — Environment-Aware Base URL

### The Problem This Solves

The magic link email contains a hardcoded URL: `emailRedirectTo: "https://mysite.com/admin/callback"`.  
This works in production. But it breaks in:
- **Local dev** — you need `http://localhost:3000/admin/callback`
- **Vercel preview deployments** — each PR gets a unique URL like `https://mysite-abc123.vercel.app`

If you hardcode the production URL, clicking a magic link in local dev sends you to
the production site instead of your local server. The PKCE code has already been consumed
by the time you realize what happened — the link is dead.

### The Solution

```ts
// lib/url.ts
export function getURL(): string {
  let url =
    // Priority 1: Explicit production URL set in your environment variables.
    // Set this in Vercel → Project Settings → Environment Variables (Production only).
    process.env.NEXT_PUBLIC_SITE_URL ??

    // Priority 2: Vercel auto-sets this for every deployment (preview AND production).
    // It does NOT include https://, so we add it below.
    process.env.NEXT_PUBLIC_VERCEL_URL ??

    // Priority 3: Local development fallback.
    "http://localhost:3000";

  // NEXT_PUBLIC_VERCEL_URL comes back as "mysite-abc123.vercel.app" (no protocol).
  // NEXT_PUBLIC_SITE_URL should already have https:// — this guard handles both cases.
  url = url.includes("http") ? url : `https://${url}`;

  // Strip a trailing slash so "/admin/callback" concatenation doesn't produce
  // "https://mysite.com//admin/callback".
  url = url.endsWith("/") ? url.slice(0, -1) : url;

  return url;
}
```

### Usage

```ts
// In any file that needs the current environment's base URL:
import { getURL } from "@/lib/url";

const redirectUrl = `${getURL()}/admin/callback`;
// Local:      "http://localhost:3000/admin/callback"
// Preview:    "https://mysite-git-feature-abc.vercel.app/admin/callback"
// Production: "https://mysite.com/admin/callback"
```

### Critical Note: Why This Is in Its Own File

`lib/supabase.ts` re-exports `getURL` for convenience (`export { getURL } from "@/lib/url"`),
but the function itself must live in `lib/url.ts` — NOT inside `lib/supabase.ts`.

Reason: `lib/supabase.ts` imports `next/headers`, which is a **server-only** API.
If a `"use client"` component imports anything from `lib/supabase.ts` at runtime,
the bundler pulls in `next/headers` and the build fails.  
`lib/url.ts` has zero server-only imports — it is safe to import anywhere.

---

## File 2 — `lib/supabase.ts` — Three Clients for Three Contexts

Supabase requires a different client depending on WHERE in Next.js you are.
Using the wrong client for the context either silently breaks auth or
throws a runtime error.

```
┌────────────────────┬──────────────────────────────────┬────────────────────────┐
│ Client             │ Where to use it                  │ How it handles cookies │
├────────────────────┼──────────────────────────────────┼────────────────────────┤
│ createClient()     │ "use client" components          │ Browser localStorage / │
│ (module-level)     │ for non-auth queries             │ in-memory (no cookies) │
├────────────────────┼──────────────────────────────────┼────────────────────────┤
│ createServerSupa-  │ Server Components, Route         │ Reads/writes via the   │
│ baseClient()       │ Handlers (async functions)       │ next/headers cookies() │
│                    │                                  │ API                    │
├────────────────────┼──────────────────────────────────┼────────────────────────┤
│ createMiddleware-  │ middleware.ts ONLY               │ Reads from NextRequest │
│ SupabaseClient()   │ (Edge runtime)                   │ writes to NextResponse │
└────────────────────┴──────────────────────────────────┴────────────────────────┘
```

### The Three Client Implementations

```ts
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// ── Client 1: Simple module-level client ──
// Use for public data queries in "use client" components.
// Does NOT persist auth sessions — use createBrowserClient from @supabase/ssr
// inside components if you need to call auth methods from the browser.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── Client 2: Server Component / Route Handler client ──
// Async because cookies() in Next.js 15 is async.
// This client can read and SET session cookies — required for the auth callback.
export async function createServerSupabaseClient() {
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
            // setAll throws in Server Components (read-only context).
            // Safe to ignore — the session is read-only there anyway.
          }
        },
      },
    },
  );
}

// ── Client 3: Middleware / Edge client ──
// Does NOT use next/headers — middleware runs on the Edge before the Node.js
// runtime. Instead it reads cookies from the incoming request object and
// writes them to the outgoing response object.
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
          // Write to both request (for downstream middleware) and
          // response (to send Set-Cookie headers to the browser).
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
```

---

## File 3 — `app/admin/page.tsx` — The Login Form

This is a `"use client"` component. It collects the user's email and calls
`supabase.auth.signInWithOtp()`. Supabase then emails a magic link.

### Key Implementation Points

```tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getURL } from "@/lib/url";  // NOT from @/lib/supabase — see File 1 note

// The Supabase browser client is created inside the component, not at module level,
// because it needs to be instantiated in the browser context.
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function handleSubmit() {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      // getURL() resolves to the correct base URL for the current environment.
      // The callback route must be registered in your Supabase dashboard
      // under Auth → URL Configuration → Redirect URLs.
      emailRedirectTo: `${getURL()}/admin/callback`,
    },
  });
  // error here means Supabase rejected the request (rate limit, invalid email, etc.)
  // It does NOT mean the email was not delivered — that failure is silent.
}
```

### The Resend Cooldown

```tsx
// Supabase rate-limits OTP requests per email per minute.
// A 60-second cooldown timer prevents users from hammering the button
// and hitting the rate limit, which produces a confusing silent failure.
const [cooldown, setCooldown] = useState(0);

// After successful send:
setCooldown(60);

// The countdown effect:
useEffect(() => {
  if (cooldown <= 0) return;
  const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
  return () => clearTimeout(t);
}, [cooldown]);
```

### Error Display from URL Params

```tsx
// The callback route forwards Supabase errors back to the login page
// via URL search params: /admin?error=otp_expired
// Read them here and show a human-readable message.
const searchParams = useSearchParams();
const urlError = searchParams.get("error");

{urlError === "otp_expired" && <p>Link expired — request a new one.</p>}
{urlError === "exchange_failed" && <p>Auth failed — try again.</p>}
{urlError === "no_code" && <p>Invalid link — request a new one.</p>}
```

### Wrapping in `<Suspense>`

```tsx
// useSearchParams() causes the component to suspend during SSR.
// Wrap it in Suspense to prevent the entire page from failing to render.
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
```

---

## File 4 — `app/admin/callback/route.ts` — The PKCE Exchange

When the user clicks the magic link, Supabase redirects them to
`/admin/callback?code=XXXX`. This Route Handler:

1. Reads the `?code=` parameter
2. Exchanges it for a real session (the PKCE handshake)
3. The session is stored as a cookie by `createServerSupabaseClient`
4. Redirects the user to the dashboard on success, or back to login with an error on failure

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Supabase puts error info in the URL if the link has already been used,
  // has expired, or was tampered with.
  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${error}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();

    // exchangeCodeForSession is the PKCE step.
    // It sends the code to Supabase, receives a session token,
    // and createServerSupabaseClient automatically writes it as a cookie.
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Session cookie is now set. Redirect to the protected area.
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    }

    // Exchange failed — the code may have already been used (common if the
    // user clicks the link twice) or the Supabase project URL is misconfigured.
    return NextResponse.redirect(`${origin}/admin?error=exchange_failed`);
  }

  // No code and no error — someone hit /admin/callback directly.
  return NextResponse.redirect(`${origin}/admin?error=no_code`);
}
```

### Why PKCE?

PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks.
Instead of sending a session token directly in the email link (which can be leaked
from server logs, browser history, or referrer headers), Supabase sends a short-lived
code. Your server then exchanges that code for the real session. The exchange can only
succeed once — the code is consumed.

Mobile apps and SPAs require PKCE because they cannot keep a secret. Supabase uses
PKCE by default for OTP flows as of v2.

---

## File 5 — `middleware.ts` — Route Protection

The middleware runs on every request to `/admin/*` before any page or Route Handler
loads. It is the security layer that enforces the "logged in" requirement.

```ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // ── Allowlist: routes that must be reachable without a session ──

  // The callback route sets the session — if we blocked it here,
  // no one could ever log in. Always let it through.
  if (pathname === "/admin/callback") {
    return response;
  }

  // The login page itself must be reachable unauthenticated.
  // Without this, an unauthenticated user would be redirected to /admin,
  // which would redirect back to /admin — an infinite redirect loop.
  if (pathname === "/admin") {
    return response;
  }

  // ── For all other /admin/* routes: check session ──
  const supabase = createMiddlewareSupabaseClient(request, response);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No session — send them to the login page.
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Session exists — allow the request through.
  return response;
}

// The matcher limits this middleware to /admin routes only.
// Without the matcher, this runs on every request including static assets,
// which wastes Edge compute and slows down the entire site.
export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## Environment Variables

### Required in all environments

```env
# Your Supabase project's API URL (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# Your Supabase project's anon/public key (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required in production only

```env
# Your live domain. Must include https:// and NO trailing slash.
# Set this in Vercel → Project Settings → Environment Variables
# and set the "Environment" to "Production" only.
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Auto-provided by Vercel (no action needed)

```env
# Vercel sets this automatically for every deployment.
# The getURL() function uses it for preview deployments.
# Do NOT set this manually — Vercel owns it.
NEXT_PUBLIC_VERCEL_URL=your-project-git-branch-abc123.vercel.app
```

---

## Supabase Dashboard Configuration

### 1. Site URL
`Authentication → URL Configuration → Site URL`

Set this to your **production domain only**:
```
https://your-domain.com
```

### 2. Redirect URLs (Allowed Redirect URLs)
`Authentication → URL Configuration → Redirect URLs`

Add all three patterns:

```
http://localhost:3000/admin/callback
https://your-domain.com/admin/callback
https://*.vercel.app/admin/callback
```

The wildcard `*.vercel.app` covers every Vercel preview deployment automatically.
Without this, every magic link clicked on a preview URL returns a
`redirect_uri_mismatch` error from Supabase.

### 3. Email Templates (Optional)
`Authentication → Email Templates → Magic Link`

Customize the email subject and body. The `{{ .ConfirmationURL }}` variable
is where Supabase injects the magic link.

---

## Drop-In Checklist for a New Project

### Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Files to Copy

- [ ] `lib/url.ts` — copy as-is, no changes needed
- [ ] `lib/supabase.ts` — copy as-is, re-exports `getURL` from `lib/url.ts`
- [ ] `app/admin/callback/route.ts` — copy as-is, redirects to `/admin/dashboard`
- [ ] `middleware.ts` — copy as-is, adjust the redirect target if your login page is not `/admin`
- [ ] `app/admin/page.tsx` — copy the login form; restyle the UI to match your project

### Configuration Steps

- [ ] Create a Supabase project at supabase.com
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API
- [ ] Add both keys to your `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env.local` for local testing (use `http://localhost:3000`)
- [ ] In the Supabase dashboard, set Site URL to your production domain
- [ ] In the Supabase dashboard, add all three Redirect URL patterns (localhost, production, `*.vercel.app`)
- [ ] In Vercel, add `NEXT_PUBLIC_SITE_URL` as a Production-only environment variable
- [ ] Verify the callback route path matches `emailRedirectTo` in the login form and the Redirect URL list

### Smoke Test

1. Run `npm run dev`
2. Visit `http://localhost:3000/admin/your-protected-page` — confirm you are redirected to `/admin`
3. Submit your email in the login form — confirm "Magic link sent" appears
4. Click the link in your email — confirm you land on `/admin/dashboard`
5. Visit `http://localhost:3000/admin/your-protected-page` again — confirm you are NOT redirected
6. Clear your cookies — confirm you ARE redirected again

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `exchange_failed` after clicking link | Link already used (double-click) or Supabase URL mismatch | Request a new link; verify `NEXT_PUBLIC_SUPABASE_URL` matches your project |
| `redirect_uri_mismatch` in Supabase logs | The `emailRedirectTo` URL is not in your Redirect URL allowlist | Add the URL to Supabase Auth → URL Configuration → Redirect URLs |
| Redirect loop at `/admin` | The login page is not in the middleware allowlist | Confirm `pathname === "/admin"` is explicitly allowed in `middleware.ts` |
| Magic link sends to production from local dev | `NEXT_PUBLIC_SITE_URL` is set globally instead of production-only | Set `NEXT_PUBLIC_SITE_URL` in Vercel only for the Production environment; remove it from `.env.local` |
| `useSearchParams` causes hydration error | Missing `<Suspense>` wrapper | Wrap the login form component in `<Suspense>` in the page export |
| Session not persisting after callback | Wrong Supabase client used in the callback route | The callback route MUST use `createServerSupabaseClient` — it writes the session cookie. Never use the module-level `supabase` client here |
