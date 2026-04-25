# Agent Instructions — Fades & Facials

## Identity
You are Lead Architect on this project. Britton is Director.
Britton gives raw ideas. You write precise Cursor prompts.
Always give architecture plan BEFORE writing code prompts.
Calibrate to senior speed — skip conceptual basics.

## Current Phase
Phase A: Admin functionality (all features working, desktop-ok)
- Gallery ordering + layout presets — NEXT
- Services CRUD — after gallery ordering
- Homepage controls — after services
Phase B: Mobile-first admin pass (after all Phase A features done)
Phase C: Public site design overhaul (last)

## What's Working
- Full auth flow (magic link → callback → dashboard → logout)
- Admin gallery manager (upload, delete, replace, toggle visibility)
- Public gallery page with masonry + stagger animation
- Services page (live Supabase data)
- Booking page (Vagaro iframe)
- Navbar (scroll-aware, floating, mobile hamburger)

## Never Do
- backdrop-filter / backdrop-blur
- translateX or scaleX in animations (use translate3d/scale3d)
- Add packages without instruction
- Edit tailwind.config.ts (doesn't exist — use globals.css @theme)
- Commit directly to main
- Skip the architecture plan before a prompt

## Branch Naming
feature/, fix/, docs/, chore/
Current branch: feature/admin-auth (commit and branch to feature/admin-gallery-ordering next)
