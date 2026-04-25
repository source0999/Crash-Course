# Fades & Facials — AI Agent Guide

## Project
Barbershop site for Fades & Facials, Suwanee GA. Real client. Deployed on Vercel.
Repo: https://github.com/source0999/Crash-Course

## Stack
- Next.js 16.2.4 (App Router, Turbopack)
- TypeScript strict
- Tailwind CSS v4 (no tailwind.config.ts — @theme in globals.css only)
- Supabase (PostgreSQL + Auth + Storage)
- @supabase/ssr for cookie-aware auth
- Vercel deployment

## Critical Rules — Never Violate
1. No backdrop-filter or backdrop-blur anywhere — breaks iOS WebKit silently
2. All animations use translate3d/scale3d — never translateX/scaleX
3. Every interactive element needs onTouchEnd with e.preventDefault()
4. Minimum 44x44px touch targets on all clickable elements
5. touch-manipulation class on all buttons/links
6. No opacity-0 for hidden — use conditional DOM mounting
7. No new packages without explicit instruction
8. Server Components by default — use client only when state/interactivity needed
9. No tailwind.config.ts — all tokens in globals.css @theme block
10. No src/ directory — files at root of their directories
11. Comment block required above every major section (see format below)

## Comment Format (required in all files)
// ─────────────────────────────────────────
// SECTION: [name]
// WHAT: [one sentence]
// WHY: [one sentence]
// PHASE 4: [what changes when database is connected]
// ─────────────────────────────────────────

## Auth Pattern
- Browser client: createBrowserClient from @supabase/ssr (in use client components)
- Server client: createServerSupabaseClient() from @/lib/supabase (in server components/route handlers)
- Middleware client: createMiddlewareSupabaseClient() from @/lib/supabase (in middleware.ts only)
- Magic link only — no passwords

## Cursor Prompt Footer (always append to prompts)
Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
Mobile-first. No external CSS files. All styling via Tailwind classes.
