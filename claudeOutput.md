  media). Render them as a grid of <video> or <img> thumbnails. Allow the user to click one to select their Global Hero.                                                                                                                                                                            Add a "Save Appearance" button at the bottom of the page.                                                                                                                                                                                                                                         Step 4: Execute ARPA                                                                                                                                                                                                                                                                              Output your detailed plan and wait for my 'Proceed' command.                                                                                   
                                                      
● Reading the admin dashboard and checking for existing hero media references before planning.                                                   
                                                                                                                                                 
  Searched for 4 patterns, read 3 files (ctrl+o to expand)                                                                                       

● Full picture assembled. Here's the detailed plan:                                                                                              
                                                            
  ---                                                                                                                                            
  Analysis                                                                                                                                       
                                                                                                                                                   app/page.tsx — "use client" component. GIF_URL is a hardcoded module constant. activeLayout is useState driven by the pill nav buttons. The    
  Promise.all fetches only featured_services from site_config. The LAYOUTS array exists solely to power the pill nav buttons.                    

  app/admin/dashboard/page.tsx — currently a Server Component (async function, uses createServerSupabaseClient for auth guard). Adding
  useState/useEffect requires converting to "use client". Auth guard moves to a client-side useEffect pattern (same as LogoutButton.tsx already  
  uses).

  Hero media inventory (public/images/):
  - /images/lele1.gif — primary hero (current)
  - /images/lele2.gif — second hero option
  - /images/services/fade.gif, /images/services/barbergif1.gif, /images/services/facial.gif — service GIFs, includable as additional options     

  ---
  Planned Edits

  Step 1 — app/page.tsx

  Deletions:
  - const GIF_URL = ... — replaced by fetched heroUrl state
  - const LAYOUTS = [...] — only powered the pill nav, no other consumers
  - Entire floating pill nav JSX block (<div className="fixed z-40 ...">)
  - setActiveLayout call (state persists but is now set by DB, not user click)

  Additions:
  - const FALLBACK_HERO_URL = "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif" — fallback if
  global_hero_url is absent from DB
  - const [heroUrl, setHeroUrl] = useState<string>(FALLBACK_HERO_URL) in HomePage

  useEffect fetch refactor:
  Replace the two-item Promise.all with a single batched site_config query:
  supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["featured_services", "active_layout", "global_hero_url"])
  Parse results by key:
  const getConfig = (key: string) => configs.find(c => c.key === key)?.value ?? null;
  // then setActiveLayout / setHeroUrl from parsed values, with fallbacks

  Wirings:
  - <img src={heroUrl}> in GlobalHero section
  - activeLayout already wired to FeaturedServicesSection and layout conditionals — no change needed there

  ---
  Step 2 — app/admin/dashboard/page.tsx

  Convert to "use client" — remove async, createServerSupabaseClient, redirect. Add useRouter.

  Auth guard (client-side, same pattern as LogoutButton.tsx):
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/admin");
      else setIsAuthed(true);
    });
  }, []);

  New state:
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeLayout, setActiveLayout] = useState<"cinematic" | "grid" | "editorial">("cinematic");
  const [heroUrl, setHeroUrl] = useState("/images/lele1.gif");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect fetch (runs after auth confirmed):
  supabase.from("site_config")
    .select("key, value")
    .in("key", ["active_layout", "global_hero_url"])
  // parse both keys into state

  handleSaveAppearance:
  await supabase.from("site_config").upsert([
    { key: "active_layout", value: activeLayout },
    { key: "global_hero_url", value: heroUrl },
  ], { onConflict: "key" });
  setSaveSuccess(true);
  setTimeout(() => setSaveSuccess(false), 3000);

  ---
  Step 3 — Dashboard UI

  Layout Selector — 3 large toggle cards in a grid-cols-3 row. Each card:
  - Icon + name + one-line description
  - Active: dark #0B132B bg, cream text, sage border
  - Inactive: transparent bg, muted text, rgba(249,247,242,0.1) border
  - onClick + onTouchEnd with e.preventDefault(), minHeight: "44px"

  Hero Media Picker — labelled section, grid-cols-2 md:grid-cols-3 lg:grid-cols-5 thumbnail grid. Each cell:
  const HERO_MEDIA = [
    { url: "/images/lele1.gif", label: "Lele 1" },
    { url: "/images/lele2.gif", label: "Lele 2" },
    { url: "/images/services/fade.gif", label: "Fade" },
    { url: "/images/services/barbergif1.gif", label: "Barber" },
    { url: "/images/services/facial.gif", label: "Facial" },
  ];
  - <img> for .gif, <video autoPlay muted loop playsInline> for .mp4
  - Selected: sage #7E9A7E ring + checkmark overlay
  - Unselected: opacity-60 hover:opacity-100

  Save button + toast:
  - Primary CTA at the bottom, full-width on mobile, auto-width on desktop
  - saveSuccess renders an inline "Appearance saved" confirmation text in #7E9A7E that disappears after 3s
  - isSaving disables the button and shows "Saving…" text

  ---
  Risk Flags

  - activeLayout in page.tsx starts as "cinematic" on mount — same as current fallback — so there's no visible flash for most deployments        
  - Session email display in the dashboard header: without session from the server, I'll remove it from the header (or show the Supabase-provided
   email from supabase.auth.getUser() client-side)
  - No new packages needed — createBrowserClient already imported in LogoutButton.tsx

  ---
  Type 'Proceed' to execute.

✻ Brewed for 1m 53s

※ recap: Decoupling layout and hero controls from the public frontend and moving them to the admin dashboard. Waiting for 'Proceed' to execute     the planned edits across app/page.tsx and app/admin/dashboard/page.tsx.
                                                                                                                                                 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ Role: Lead Full-Stack Architect.
  Mandatory Workflow: Analyze, Research, Plan, Ask Permission. Do not modify files until I type 'Proceed'.                                       
  Goal: Build the Vagaro Booking Bridge, sweep all global CTAs, apply iOS/Android native polish, and generate the AGI System Blueprint.          

  Step 1: The Booking Wrapper (app/book/page.tsx)

  Create a new Next.js page component.

  Design: A clean, minimal wrapper (bg-[#F9F7F2] min-h-[100svh] pt-24 pb-12 w-full flex justify-center).

  The Widget: Translate the standard Vagaro embed into valid React JSX. Crucial: Strip out any browser-extension injected attributes (like       
  bis_skin_checked, bis_size, bis_depth, bis_id).

  Iframe Specs: Ensure the iframe has width="100%" (max 840px), scrolling="yes", and is wrapped in a native-scrolling container so iOS handles   
  it smoothly.

  Step 2: The Global Link Sweep

  Audit the entire app/ and components/ directories for "Book Now" buttons (specifically check BookNowPill, Navbar, and GlobalHero /
  app/page.tsx).

  Replace all external Vagaro href strings or placeholder # links with the Next.js <Link href="/book">.

  Step 3: Native Mobile Polish (app/globals.css & app/page.tsx)

  In app/globals.css, add: * { -webkit-tap-highlight-color: transparent; } to remove Android/iOS tap flashes.

  Locate the BookNowPill component (or wherever the sticky bottom CTA lives). Add pb-[max(1rem,env(safe-area-inset-bottom))] to its container    
  so it rests safely above the iPhone home indicator.

  Step 4: The AGI Blueprint (docs/ARCHITECTURE.md)

                                                                                                                                                   Draft a comprehensive system blueprint designed specifically to give future LLMs context about this codebase.                                                                                                                                                                                     Include: >   1. The Database Engine (site_config handling active_layout and global_hero_url).                                                    2. The Component Strategy (Global Identity vs. Layout Discovery).                                                                                3. The Z-Index Hierarchy (Base: 0, Overlays: 90000, Swapper: 95000, Critical Errors/Toasts: 100000).                                             4. Rules for building new Layouts (Must accept allServices, must map isVideoMedia correctly, no hardcoded heroes).                                                                                                                                                                                Step 5: Execute ARPA                                                                                                                                                                                                                                                                              Output your plan and wait for my 'Proceed' command.                                                                                            
                                             
● Reading all relevant files before planning.                                                                                                    
                                                                                                                                                 
  Searched for 2 patterns, read 4 files (ctrl+o to expand)                                                                                       
                          
● Full picture assembled. Here's the complete plan:                                                                                              
                                                    
  ---                                                                                                                                            
  Research Findings                                                                                                                              
                                                                                                                                                   app/booking/page.tsx — already exists with the live Vagaro iframe src URL. The spec creates a new cleaner /book route, not a replacement. I'll 
  reuse the existing src string.                                                                                                                 

  CTA audit across all files:
  - components/Navbar.tsx line 108 → href="/booking" (desktop) and line 121 → href="/booking" (mobile dropdown) — both need updating to /book    
  - app/page.tsx BookNowPill component → href="https://www.vagaro.com/fadesandfacials" (external) — replace with <Link href="/book">
  - GlobalHero in app/page.tsx — no "Book Now" button present, just headline copy

  app/globals.css — * selector does not exist yet, only html, body and body. One line to add.

  docs/ folder — does not exist.

  ---
  Planned Edits (5 files, 1 new folder)

  ---
  Step 1 — Create app/book/page.tsx

  New file. Mirrors the isProduction guard from /booking and reuses its iframe src. Clean layout per spec:

  // outer: bg-[#F9F7F2] min-h-[100svh] pt-24 pb-12 px-4 flex flex-col items-center
  // inner: w-full max-w-[840px]
  // iframe wrapper: overflow-y-auto with -webkit-overflow-scrolling: touch (iOS scroll fix)
  // iframe: width="100%" height="900" scrolling="yes" frameBorder="0"

  Dev state shows a dashed placeholder (identical pattern to existing /booking page). Production renders the live widget.

  The bis_* attributes from browser extensions are runtime-injected by the React DevTools extension — they never appear in authored JSX. Writing 
  clean JSX is sufficient; no stripping logic needed.

  ---
  Step 2 — Global Link Sweep

  components/Navbar.tsx — 2 edits, lines 108 and 121:
  - href="/booking" → href="/book" (both desktop and mobile dropdown)

  app/page.tsx BookNowPill — 1 edit, line 74:
  - href="https://www.vagaro.com/fadesandfacials" target="_blank" → href="/book", remove target and rel props, keep <Link> (already imported)    

  ---
  Step 3 — Native Mobile Polish

  app/globals.css — add after the body block:
  /* WHY: Removes the grey tap-flash Android/iOS applies to interactive elements on touch. */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  app/page.tsx BookNowPill — container currently fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto. Change to fixed bottom-0 left-1/2
  -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]. This ensures on iPhones (safe-area ≈ 34px / 2.125rem) the pill floats 
  above the home indicator; on Android/non-notch devices the 2rem floor applies.

  ---
  Step 4 — docs/ARCHITECTURE.md

  New folder docs/, new file ARCHITECTURE.md. Content sections:

  1. Database Engine — site_config table schema, all known keys (featured_services, active_layout, global_hero_url, category_order,
  services_layout), upsert pattern, RLS rules (public read / authenticated write).

  2. Component Strategy — Global Identity Layer (static GlobalHero, never remounts) vs. Layout Discovery Zone (FeaturedServicesSection + active  
  layout component, flickers on activeLayout change). Why they're separated: prevents hero flash on layout switch.

  3. Z-Index Hierarchy — as specified:

  ┌─────────────────┬─────────┬───────────────────────┐
  │      Layer      │ z-index │       Elements        │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Base content    │ 0–20    │ page sections         │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Navbar          │ 50      │ <nav>                 │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Fixed CTAs      │ 50      │ BookNowPill           │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Overlays        │ 90000   │ modals, drawers       │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Layout swapper  │ 95000   │ reserved              │
  ├─────────────────┼─────────┼───────────────────────┤
  │ Critical toasts │ 100000  │ errors, confirmations │
  └─────────────────┴─────────┴───────────────────────┘

  4. Rules for New Layouts — checklist:
  - Must accept { allServices: DbService[] } — no other props
  - Must call isVideoMedia(url, media_type) for any media rendering — never branch on extension alone
  - No GIF_URL / hero rendering inside layout components — hero lives only in HomePage return
  - No internal Supabase fetches — all data flows down from HomePage
  - CLAUDE.md rules: translate3d only, onTouchEnd + e.preventDefault() on all interactive elements, 44px min touch targets, no opacity-0 hiding  

  ---
  Risk Flags

  - The existing /booking route stays live — no redirect needed, Navbar will just point to /book going forward
  - bottom-0 pb-[max(2rem,...)] shifts from the current bottom-8 (32px) to dynamic safe-area padding — on non-iOS devices this is visually       
  identical (2rem = 32px)
  - docs/ is not a Next.js route — creating it at project root has no routing side-effects

  ---
  Type 'Proceed' to execute.

✻ Brewed for 1m 20s

❯ The plan is 100% airtight. One minor addition: Please completely delete the old app/booking directory after you extract the Vagaro URL from      it, so we don't have duplicate routes confusing the codebase in the future.                                                                                                                                                                                                                       Proceed. Execute the full plan                                                                                                                 
                                 
● Executing all steps now. Creating new files and edits in parallel.                                                                             
                                                                                                                                                 
● Write(app\book\page.tsx)     
  ⎿  Wrote 121 lines to app\book\page.tsx                                                                                                        
       1 // ─────────────────────────────────────────                                                                                            
       2 // SECTION: Book Page                                                                                                                          3 // WHAT: Canonical /book route — clean Vagaro widget wrapper for all site CTAs.                                                         
       4 // WHY: Single booking destination replaces the old /booking route. All "Book Now"                                                             5 //   links across the site point here. Design matches the site's alabaster palette.
       6 // PHASE 4: No changes needed — VAGARO_SRC is stable unless the barber regenerates                                                      
       7 //   the widget in Vagaro dashboard → Promote → Booking Widget.
       8 // ─────────────────────────────────────────
       9
      10 // WHY: Vagaro embed URL is extracted to a constant so any future URL rotation
     … +115 lines (ctrl+o to expand)

● Bash(rm -rf "C:/Projects/fades-and-facials/app/booking")    
  ⎿  Done         

● Update(components\Navbar.tsx)                                                                                                                  
  ⎿  Added 1 line, removed 1 line
      105            <Link href="/" className="text-white">Home</Link>                                                                           
      106            <Link href="/services" className="text-white">Services</Link>        
      107            <Link href="/gallery" className="text-white">Gallery</Link>
      108 -          <Link href="/booking" className="text-white">Book Now</Link>                                                                      108 +          <Link href="/book" className="text-white">Book Now</Link>                                                                   
      109          </div>                                                                                                                              110                                                                                                                                              111          {/* Hamburger — visible on mobile only */}                                                                                    

● Update(components\Navbar.tsx) 
  ⎿  Added 1 line, removed 1 line
      118            <Link href="/" className="text-white" onClick={() => setMenuOpen(false)}>Home</Link>
      119            <Link href="/services" className="text-white" onClick={() => setMenuOpen(false)}>Services</Link>                                  120            <Link href="/gallery" className="text-white" onClick={() => setMenuOpen(false)}>Gallery</Link>
      121 -          <Link href="/booking" className="text-white" onClick={() => setMenuOpen(false)}>Book Now</Link>                                   121 +          <Link href="/book" className="text-white" onClick={() => setMenuOpen(false)}>Book Now</Link>
      122          </div>                                                                                                                        
      123        )}
      124      </nav>

● Now the BookNowPill — two targeted edits:

● Update(app\page.tsx)
  ⎿  Added 2 lines, removed 3 lines                                                                                                              
      67  // ─────────────────────────────────────────        
      68  function BookNowPill() {                                                                                                                     69    return (
      70 -    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto">                                                                   70 +    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      71        <Link                                                                                                                            
      72 -        href="https://www.vagaro.com/fadesandfacials"
      73 -        target="_blank"
      72 +        href="/book"                                                                                                                   
      73          className="group relative inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.24e       
          m] uppercase font-sans font-medium shadow-[0_4px_20px_rgba(11,19,43,0.15)] transition-all duration-300 hover:scale-[1.02] active       
          :scale-95 min-h-[40px]"
      74          style={{
      75            background: "#7E9A7E",

● Update(app\globals.css)       
  ⎿  Added 6 lines
      26    -webkit-font-smoothing: antialiased;
      27  }                                                                                                                                            28  
      29 +/* WHY: Removes the grey/blue tap flash that Android and iOS apply to interactive                                                            30 +   elements on touch — prevents the flicker on every pill, button, and card tap. */
      31 +* {                                                                                                                                    
      32 +  -webkit-tap-highlight-color: transparent;
      33 +}
      34 +                                                                                                                                       
      35  /* ─── Gallery entrance animation ─── */
      36  @keyframes gallery-enter {
      37    from {

● Now the architecture doc:     

● Bash(mkdir -p "C:/Projects/fades-and-facials/docs")
  ⎿  Done                                                                                                                                           
● Write(docs\ARCHITECTURE.md)                                                                                                                      ⎿  Wrote 207 lines to docs\ARCHITECTURE.md
      1 # Fades & Facials — AGI System Blueprint                                                                                                 
      2                                                                                                                                                3 > **Audience:** Future LLMs and engineers onboarding to this codebase.
      4 > This document describes the *why* behind architectural decisions — the code                                                            
      5 > itself documents the *what*. Read this before touching any cross-cutting system.
      6
      7 ---
      8
      9 ## 1. The Database Engine
     … +208 lines (ctrl+o to expand)

● Now verify everything:        

● Bash(npx tsc --noEmit 2>&1 && echo "TSC CLEAN")
  ⎿  Error: Exit code 2                                                                                                                               .next/types/validator.ts(89,39): error TS2307: Cannot find module '../../app/booking/page.js' or its corresponding type declarations.
                                                                                                                                                 
  Listed 1 directory (ctrl+o to expand)  
                                                                                                                                                 
● Stale .next build cache still references the deleted /booking route. Clearing it:                                                              
                                                                   
● Bash(rm -rf "C:/Projects/fades-and-facials/.next" && npx tsc --noEmit 2>&1 && echo "TSC CLEAN")                                                
  ⎿  Error: Exit code 1                                                                                                                          
     rm: cannot remove 'C:/Projects/fades-and-facials/.next/dev/cache/turbopack/2275bd85': Directory not empty                                   
                                                                                                                                                 
● PowerShell(Remove-Item -Recurse -Force "C:\Projects\fades-and-facials\.next"; npx --prefix "C:\Projects\fades-and-facials" tsc --noEmit 2>&1;  
            if ($?) { "TSC CLEAN" })                                                                                                             
  ⎿  Running…                                                                                                                                    
                                                                                                                                                 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────● Cogitating… (3m 40s · ↓ 9.5k tokens)                                                                                                             ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work                                                       
   ReTSC CLEAN                     Projects\fades-and-facials\.next"; npx --prefix "C:\Projects\fades-and-facials" tsc --noEmit 2>&1; if ($?)    
  ⎿  (timeout 1m 30s)             ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
                         h            cript check                                                                                                
● Zero TypeScript errors. Here's a summary of everything executed:                        ───────────────────────────────────────────────────────
                                                                                                                               ● high · /effort
  ┌────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   
  │          File          │                                                     Change                                                      │     ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ app/book/page.tsx      │ Created — clean alabaster wrapper, VAGARO_SRC constant, iOS scroll fix, dev placeholder                         │     ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤     │ app/booking/           │ Deleted — old duplicate route removed                                                                           │     ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤     │ components/Navbar.tsx  │ Both "Book Now" links updated /booking → /book                                                                  │   
  ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ app/page.tsx           │ href changed to /book (internal), bottom-0 pb-[max(2rem,env(safe-area-inset-bottom))] for iPhone home indicator │   
  │ BookNowPill            │  clearance                                                                                                      │   
  ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ app/globals.css        │ * { -webkit-tap-highlight-color: transparent } added — eliminates Android/iOS tap flash globally                │   
  ├────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ docs/ARCHITECTURE.md   │ Created — 7-section LLM context blueprint covering DB engine, component strategy, z-index hierarchy, layout     │   
  │                        │ rules, booking flow, auth pattern, and file conventions                                                         │   
  └────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   

✻ Churned for 3m 48s      

※ recap: Decoupling homepage controls to the admin dashboard and cleaning up public routes. The immediate next step is implementing the admin      dashboard appearance panel with layout selector and hero media picker.                                                                         
                                                                                                                                                 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ Role: Lead Full-Stack Architect.                                                                                                               
  Mandatory Workflow: Analyze, Research, Plan, Ask Permission.                                                                                   
  Goal: Transform the Admin Dashboard into the "Site Appearance" Command Center.

  Step 1: Dashboard Refactor (app/admin/dashboard/page.tsx)

  Convert to a "use client" component.

  Implement fetching for active_layout and global_hero_url from the site_config table.

  Fetch all items from the media_library table to provide thumbnails for the Hero picker.

  Step 2: Build the UI

  Layout Selector: Render 3 large, luxury-styled buttons/cards for "Cinematic", "Grid", and "Editorial". Use a border-highlight (Sage #7E9A7E)   
  to show which one is currently active.

  Global Hero Picker: Render a grid of thumbnails from your media_library. When a user clicks a thumbnail, it updates the global_hero_url        
                                                                                                                                                   Step 3: Save Logic                                                                                                                                                                                                                                                                                Create a handleSaveAppearance function.                                                                                                                                                                                                                                                           Use supabase.from('site_config').upsert() to save both the active_layout and the global_hero_url.                                                                                                                                                                                                 Add a success toast: "Site appearance updated successfully."                                                                                                                                                                                                                                      Step 4: Execute ARPA                                                                                                                                                                                                                                                                              Analyze the dashboard file, output your plan, and wait for my 'Proceed' command.                                                               
                                                                          
● Reading the dashboard and checking for media_library table references across the codebase.                                                     
                                                                                                                                                 
  Searched for 1 pattern, read 1 file (ctrl+o to expand)                                                                                         

● Key finding before planning: media_library is not a separate Supabase table — it's stored as a JSON-serialized array of URLs inside the        
  site_config table under key = "media_library". The admin services page already reads and writes it there. The fetch pattern is
  supabase.from("site_config").select("value").eq("key", "media_library").single() and the value is parsed as string[].                          
                                                                                                                                                   ---                                                                                                                                              Full Plan                                                                                                                                      
                                                                                                                                                 
  Current state of app/admin/dashboard/page.tsx

  Server Component — async function, createServerSupabaseClient, redirect. Has two nav link cards (Gallery, Services) and a LogoutButton.        
  Displays session.user.email in the header.

  ---
  Step 1 — Structural Conversion

  Remove: async, redirect, createServerSupabaseClient import, import { redirect } from next/navigation.

  Add: "use client" directive, useEffect, useState, useRouter, createBrowserClient.

  State:
  const [userEmail, setUserEmail]           = useState<string | null>(null);
  const [activeLayout, setActiveLayout]     = useState<"cinematic"|"grid"|"editorial">("cinematic");
  const [heroUrl, setHeroUrl]               = useState<string>("");
  const [mediaLibrary, setMediaLibrary]     = useState<string[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isSaving, setIsSaving]             = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);

  Auth guard useEffect (same pattern as LogoutButton.tsx):
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { router.push("/admin"); return; }
  setUserEmail(session.user.email ?? null);

  ---
  Step 2 — Data Fetch

  Single batch query after auth confirmed — one round-trip for all three keys:
  const { data } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["active_layout", "global_hero_url", "media_library"]);

  const get = (key: string) => data?.find(c => c.key === key)?.value ?? null;

  const layout = get("active_layout");
  if (layout) setActiveLayout(layout as "cinematic" | "grid" | "editorial");

  const hero = get("global_hero_url");
  if (hero) setHeroUrl(hero);

  const lib = get("media_library");
  if (lib) setMediaLibrary(JSON.parse(lib) as string[]);

  ---
  Step 3 — Save Logic

  async function handleSaveAppearance() {
    setIsSaving(true);
    try {
      await supabase.from("site_config").upsert(
        [
          { key: "active_layout",    value: activeLayout,    updated_at: new Date().toISOString() },
          { key: "global_hero_url",  value: heroUrl,         updated_at: new Date().toISOString() },
        ],
        { onConflict: "key" },
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  ---
  Step 4 — UI Layout

  Page shell — same dark bg-[#0f1e2e] palette as today. Keeps the existing nav cards (Gallery, Services) at top. "Site Appearance" section       
  appears below them as a clearly labelled new panel.

  Layout Selector — 3 cards in grid-cols-3 gap-3:

  ┌─────────────────────────────────┬─────────────────────────┬─────────────────────┐
  │           Cinematic ◈           │         Grid ⊞          │     Editorial ≡     │
  ├─────────────────────────────────┼─────────────────────────┼─────────────────────┤
  │ Dark atmosphere                 │ Portrait grid           │ Magazine            │
  ├─────────────────────────────────┼─────────────────────────┼─────────────────────┤
  │ "Alternating full-bleed panels" │ "Portrait luxury cards" │ "Typographic stack" │
  └─────────────────────────────────┴─────────────────────────┴─────────────────────┘

  - Active card: border-[#7E9A7E] sage border + bg-white/10, name in #7E9A7E
  - Inactive: border-white/10 bg-white/5, muted text
  - onClick + onTouchEnd with e.preventDefault(), minHeight: "44px"

  Global Hero Picker:

  - Section label + current selected URL preview (truncated)
  - grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 thumbnail grid
  - Each cell: aspect-video rounded-xl overflow-hidden relative cursor-pointer
  - .mp4 → <video autoPlay muted loop playsInline className="w-full h-full object-cover" />
  - All others → <img className="w-full h-full object-cover" loading="lazy" />
  - Selected state: ring-2 ring-[#7E9A7E] outer ring + small ✓ badge overlay (sage bg)
  - If mediaLibrary is empty: muted placeholder — "No hero media found. Upload via the Services manager."

  Save button + toast:

  - "Save Appearance" CTA — full-width, sage bg #7E9A7E, dark text #0B132B
  - isSaving → "Saving…" + disabled
  - saveSuccess → inline "Site appearance updated successfully." in sage, fades after 3s (state-driven, no animation libraries)

  Loading state — while isLoading is true, show a minimal skeleton or just null to avoid flash of unsaved defaults.

  ---
  Risk Flags

  - Keeping LogoutButton.tsx as-is — no changes needed there
  - updated_at included in upsert rows for consistency with existing site_config writes in the services page
  - heroUrl starts as "" — the save button will be disabled (or the handler will guard) if no hero is selected yet
  - mediaLibrary is a Supabase Storage URL array — thumbnails render via the same isVideoMedia branch used in app/page.tsx

  ---
  Type 'Proceed' to execute.

✻ Baked for 54s         

❯ proceed                                                                                                                                        
                                                                                                                                                 
● Writing the complete new dashboard file now.                                                                                                   
                                                                                                                                                 
● Write(app\admin\dashboard\page.tsx)                                                                                                            
  ⎿  Added 316 lines, removed 27 lines                                                                                                           
        1 +"use client";                                                                                                                         
        2 +                                                                                                                                              3  // ─────────────────────────────────────────
        2 -// SECTION: Admin Dashboard Hub                                                                                                               3 -// WHAT: Protected landing page after login — shows session info and nav to admin sections.
        4 -// WHY: Central control panel for the barber to manage site content.                                                                  
        5 -// PHASE 4: No changes needed — session check is live.
        4 +// SECTION: Admin Dashboard — Site Appearance Command Center
        5 +// WHAT: Protected control panel for layout selection and global hero media.                                                          
        6 +// WHY: Decouples homepage design controls from the public frontend — the barber                                                      
        7 +//   switches layouts and hero media here without touching code or the DB directly.                                                   
        8 +// PHASE 4: No changes needed — reads/writes live site_config table.                                                                  
        9  // ─────────────────────────────────────────
       10 +                                                                                                                                      
       11 +import { useEffect, useState } from "react";                                                                                          
       12 +import { useRouter } from "next/navigation";                                                                                          
       13  import Link from "next/link";
        8 -import { redirect } from "next/navigation";                                                                                           
        9 -import { createServerSupabaseClient } from "@/lib/supabase";                                                                          
       14 +import { createBrowserClient } from "@supabase/ssr";                                                                                  
       15  import LogoutButton from "./LogoutButton";
       16
       12 -export default async function AdminDashboard() {                                                                                      
       13 -  const supabase = await createServerSupabaseClient();                                                                                
       14 -  const {                                                                                                                             
       15 -    data: { session },                                                                                                                
       16 -  } = await supabase.auth.getSession();                                                                                               
       17 +// ── Module-level Supabase client (matches pattern in other admin pages) ──                                                          
       18 +const supabase = createBrowserClient(                                                                                                 
       19 +  process.env.NEXT_PUBLIC_SUPABASE_URL!,                                                                                              
       20 +  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,                                                                                         
       21 +);                                                                                                                                    
       22
       18 -  if (!session) {                                                                                                                     
       19 -    redirect("/admin");                                                                                                               
       23 +type Layout = "cinematic" | "grid" | "editorial";                                                                                     
       24 +                                                                                                                                      
       25 +const LAYOUT_OPTIONS: { id: Layout; icon: string; label: string; description: string }[] = [                                          
       26 +  { id: "cinematic", icon: "◈", label: "Cinematic", description: "Alternating full-bleed panels" },                                   
       27 +  { id: "grid",      icon: "⊞", label: "Grid",      description: "Portrait luxury cards" },                                           
       28 +  { id: "editorial", icon: "≡", label: "Editorial", description: "Typographic stack" },                                               
       29 +];                                                                                                                                    
       30 +                                                                                                                                      
       31 +// WHY: Media library items are URLs only — no media_type field — so extension                                                        
       32 +// check is the correct branch. Mirrors the .mp4 arm of isVideoMedia in app/page.tsx.                                                 
       33 +function isVideoMedia(url: string): boolean {                                                                                         
       34 +  return /\.mp4(\?|$)/i.test(url);                                                                                                    
       35 +}                                                                                                                                     
       36 +                                                                                                                                      
       37 +export default function AdminDashboard() {                                                                                            
       38 +  const router = useRouter();                                                                                                         
       39 +                                                                                                                                      
       40 +  const [userEmail, setUserEmail]       = useState<string | null>(null);                                                              
       41 +  const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");                                                              
       42 +  const [heroUrl, setHeroUrl]           = useState<string>("");                                                                       
       43 +  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);                                                                     
       44 +  const [isLoading, setIsLoading]       = useState(true);                                                                             
       45 +  const [isSaving, setIsSaving]         = useState(false);                                                                            
       46 +  const [saveSuccess, setSaveSuccess]   = useState(false);                                                                            
       47 +                                                                                                                                      
       48 +  useEffect(() => {                                                                                                                   
       49 +    async function init() {                                                                                                           
       50 +      const { data: { session } } = await supabase.auth.getSession();                                                                 
       51 +      if (!session) { router.push("/admin"); return; }                                                                                
       52 +      setUserEmail(session.user.email ?? null);                                                                                       
       53 +                                                                                                                                      
       54 +      // WHY: Single batch query for all three keys — one round-trip, no waterfalls.                                                  
       55 +      const { data } = await supabase                                                                                                 
       56 +        .from("site_config")                                                                                                          
       57 +        .select("key, value")                                                                                                         
       58 +        .in("key", ["active_layout", "global_hero_url", "media_library"]);                                                            
       59 +                                                                                                                                      
       60 +      const get = (key: string) => data?.find((c) => c.key === key)?.value ?? null;                                                   
       61 +                                                                                                                                      
       62 +      const layout = get("active_layout");                                                                                            
       63 +      if (layout) setActiveLayout(layout as Layout);                                                                                  
       64 +                                                                                                                                      
       65 +      const hero = get("global_hero_url");                                                                                            
       66 +      if (hero) setHeroUrl(hero);                                                                                                     
       67 +                                                                                                                                      
       68 +      const lib = get("media_library");                                                                                               
       69 +      if (lib) {                                                                                                                      
       70 +        try { setMediaLibrary(JSON.parse(lib) as string[]); } catch { /* malformed JSON — skip */ }                                   
       71 +      }                                                                                                                               
       72 +                                                                                                                                      
       73 +      setIsLoading(false);                                                                                                            
       74 +    }                                                                                                                                 
       75 +    init();                                                                                                                           
       76 +  }, []);                                                                                                                             
       77 +                                                                                                                                      
       78 +  async function handleSaveAppearance() {                                                                                             
       79 +    if (isSaving || !heroUrl) return;                                                                                                 
       80 +    setIsSaving(true);                                                                                                                
       81 +    try {                                                                                                                             
       82 +      await supabase.from("site_config").upsert(                                                                                      
       83 +        [                                                                                                                             
       84 +          { key: "active_layout",   value: activeLayout, updated_at: new Date().toISOString() },                                      
       85 +          { key: "global_hero_url", value: heroUrl,      updated_at: new Date().toISOString() },                                      
       86 +        ],                                                                                                                            
       87 +        { onConflict: "key" },                                                                                                        
       88 +      );                                                                                                                              
       89 +      setSaveSuccess(true);                                                                                                           
       90 +      setTimeout(() => setSaveSuccess(false), 3000);                                                                                  
       91 +    } finally {                                                                                                                       
       92 +      setIsSaving(false);                                                                                                             
       93 +    }                                                                                                                                 
       94    }
       95
       96 +  // Prevent flash of un-fetched defaults while auth + data loads                                                                     
       97 +  if (isLoading) return null;                                                                                                         
       98 +                                                                                                                                      
       99    return (
      100      <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-6">
       24 -      <div className="max-w-2xl mx-auto">                                                                                             
       25 -        {/* Header */}                                                                                                                
      101 +      <div className="max-w-3xl mx-auto">                                                                                             
      102 +                                                                                                                                      
      103 +        {/* ── Header ── */}                                                                                                          
      104          <div className="mb-10">
       27 -          <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-2">                                                   
      105 +          <p                                                                                                                          
      106 +            className="text-xs tracking-[0.3em] uppercase mb-2"                                                                       
      107 +            style={{ color: "#7E9A7E", fontFamily: "'Manrope', sans-serif" }}                                                         
      108 +          >                                                                                                                           
      109              Admin Panel
      110            </p>
      111            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
       31 -          <p className="mt-2 text-white/50 text-sm">                                                                                  
       32 -            Signed in as <span className="text-brand-accent">{session.user.email}</span>                                              
       33 -          </p>                                                                                                                        
      112 +          {userEmail && (                                                                                                             
      113 +            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Manrope', sans-serif" }}>              
      114 +              Signed in as <span style={{ color: "#7E9A7E" }}>{userEmail}</span>                                                      
      115 +            </p>                                                                                                                      
      116 +          )}                                                                                                                          
      117          </div>
      118
       36 -        {/* Nav cards */}                                                                                                             
       37 -        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">                                                                       
      119 +        {/* ── Navigation Cards ── */}                                                                                                
      120 +        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-14">                                                                 
      121            <Link
      122              href="/admin/gallery"
       40 -            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition touch-manipulation min-h-[       
          -44px]"                                                                                                                                
      123 +            className="rounded-xl p-6 hover:bg-white/10 transition touch-manipulation"                                                
      124 +            style={{                                                                                                                  
      125 +              border: "1px solid rgba(255,255,255,0.1)",                                                                              
      126 +              background: "rgba(255,255,255,0.05)",                                                                                   
      127 +              minHeight: "44px",                                                                                                      
      128 +            }}                                                                                                                        
      129            >
      130              <p className="text-white font-semibold text-lg">Gallery</p>
       43 -            <p className="text-white/40 text-sm mt-1">Upload and manage media</p>                                                     
      131 +            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Manrope', sans-serif" }}>              
      132 +              Upload and manage media                                                                                                 
      133 +            </p>                                                                                                                      
      134            </Link>
       45 -                                                                                                                                      
      135            <Link
      136              href="/admin/services"
       48 -            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition touch-manipulation min-h-[       
          -44px]"                                                                                                                                
      137 +            className="rounded-xl p-6 hover:bg-white/10 transition touch-manipulation"                                                
      138 +            style={{                                                                                                                  
      139 +              border: "1px solid rgba(255,255,255,0.1)",                                                                              
      140 +              background: "rgba(255,255,255,0.05)",                                                                                   
      141 +              minHeight: "44px",                                                                                                      
      142 +            }}                                                                                                                        
      143            >
      144              <p className="text-white font-semibold text-lg">Services</p>
       51 -            <p className="text-white/40 text-sm mt-1">Edit service listings</p>                                                       
      145 +            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Manrope', sans-serif" }}>              
      146 +              Edit service listings                                                                                                   
      147 +            </p>                                                                                                                      
      148            </Link>
      149          </div>
      150
       55 -        {/* Logout */}                                                                                                                
      151 +        {/* ── Site Appearance ── */}                                                                                                 
      152 +        <div                                                                                                                          
      153 +          className="rounded-2xl p-6 md:p-8"                                                                                          
      154 +          style={{                                                                                                                    
      155 +            border: "1px solid rgba(255,255,255,0.08)",                                                                               
      156 +            background: "rgba(255,255,255,0.02)",                                                                                     
      157 +          }}                                                                                                                          
      158 +        >                                                                                                                             
      159 +          <div className="mb-8">                                                                                                      
      160 +            <p                                                                                                                        
      161 +              className="text-xs tracking-[0.3em] uppercase mb-1"                                                                     
      162 +              style={{ color: "#7E9A7E", fontFamily: "'Manrope', sans-serif" }}                                                       
      163 +            >                                                                                                                         
      164 +              Appearance                                                                                                              
      165 +            </p>                                                                                                                      
      166 +            <h2 className="text-2xl font-semibold text-white mb-1">Site Appearance</h2>                                               
      167 +            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Manrope', sans-serif" }}>                   
      168 +              Changes apply to the public homepage immediately on save.                                                               
      169 +            </p>                                                                                                                      
      170 +          </div>                                                                                                                      
      171 +                                                                                                                                      
      172 +          {/* ── Layout Selector ── */}                                                                                               
      173 +          <div className="mb-10">                                                                                                     
      174 +            <p                                                                                                                        
      175 +              className="text-xs uppercase tracking-widest mb-4"                                                                      
      176 +              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Manrope', sans-serif" }}                                         
      177 +            >                                                                                                                         
      178 +              Layout                                                                                                                  
      179 +            </p>                                                                                                                      
      180 +            <div className="grid grid-cols-3 gap-3">                                                                                  
      181 +              {LAYOUT_OPTIONS.map((opt) => {                                                                                          
      182 +                const active = activeLayout === opt.id;                                                                               
      183 +                return (                                                                                                              
      184 +                  <button                                                                                                             
      185 +                    key={opt.id}                                                                                                      
      186 +                    onClick={() => setActiveLayout(opt.id)}                                                                           
      187 +                    onTouchEnd={(e) => { e.preventDefault(); setActiveLayout(opt.id); }}                                              
      188 +                    className="rounded-2xl p-4 md:p-5 text-left transition-all duration-200 touch-manipulation"                       
      189 +                    style={{                                                                                                          
      190 +                      minHeight: "88px",                                                                                              
      191 +                      border: active ? "1.5px solid #7E9A7E" : "1px solid rgba(255,255,255,0.1)",                                     
      192 +                      background: active ? "rgba(126,154,126,0.1)" : "rgba(255,255,255,0.04)",                                        
      193 +                    }}                                                                                                                
      194 +                  >                                                                                                                   
      195 +                    <span                                                                                                             
      196 +                      className="text-xl block mb-2 leading-none"                                                                     
      197 +                      style={{ color: active ? "#7E9A7E" : "rgba(255,255,255,0.25)" }}                                                
      198 +                    >                                                                                                                 
      199 +                      {opt.icon}                                                                                                      
      200 +                    </span>                                                                                                           
      201 +                    <p                                                                                                                
      202 +                      className="text-sm font-semibold mb-1"                                                                          
      203 +                      style={{                                                                                                        
      204 +                        color: active ? "#7E9A7E" : "rgba(255,255,255,0.8)",                                                          
      205 +                        fontFamily: "'Manrope', sans-serif",                                                                          
      206 +                      }}                                                                                                              
      207 +                    >                                                                                                                 
      208 +                      {opt.label}                                                                                                     
      209 +                    </p>                                                                                                              
      210 +                    <p                                                                                                                
      211 +                      className="text-xs leading-snug hidden sm:block"                                                                
      212 +                      style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Manrope', sans-serif" }}                                 
      213 +                    >                                                                                                                 
      214 +                      {opt.description}                                                                                               
      215 +                    </p>                                                                                                              
      216 +                  </button>                                                                                                           
      217 +                );                                                                                                                    
      218 +              })}                                                                                                                     
      219 +            </div>                                                                                                                    
      220 +          </div>                                                                                                                      
      221 +                                                                                                                                      
      222 +          {/* ── Global Hero Picker ── */}                                                                                            
      223 +          <div className="mb-10">                                                                                                     
      224 +            <p                                                                                                                        
      225 +              className="text-xs uppercase tracking-widest mb-1"                                                                      
      226 +              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Manrope', sans-serif" }}                                         
      227 +            >                                                                                                                         
      228 +              Global Hero                                                                                                             
      229 +            </p>                                                                                                                      
      230 +            {heroUrl && (                                                                                                             
      231 +              <p                                                                                                                      
      232 +                className="text-xs font-mono mb-4 truncate"                                                                           
      233 +                style={{ color: "rgba(255,255,255,0.2)" }}                                                                            
      234 +                title={heroUrl}                                                                                                       
      235 +              >                                                                                                                       
      236 +                {heroUrl}                                                                                                             
      237 +              </p>                                                                                                                    
      238 +            )}                                                                                                                        
      239 +                                                                                                                                      
      240 +            {mediaLibrary.length === 0 ? (                                                                                            
      241 +              <div                                                                                                                    
      242 +                className="rounded-2xl py-10 text-center"                                                                             
      243 +                style={{ border: "1px dashed rgba(255,255,255,0.1)" }}                                                                
      244 +              >                                                                                                                       
      245 +                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Manrope', sans-serif" }}>               
      246 +                  No hero media found.                                                                                                
      247 +                </p>                                                                                                                  
      248 +                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Manrope', sans-serif" }}>          
      249 +                  Upload media via the Services manager to populate this picker.                                                      
      250 +                </p>                                                                                                                  
      251 +              </div>                                                                                                                  
      252 +            ) : (                                                                                                                     
      253 +              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">                                                  
      254 +                {mediaLibrary.map((url) => {                                                                                          
      255 +                  const selected = heroUrl === url;                                                                                   
      256 +                  return (                                                                                                            
      257 +                    <button                                                                                                           
      258 +                      key={url}                                                                                                       
      259 +                      onClick={() => setHeroUrl(url)}                                                                                 
      260 +                      onTouchEnd={(e) => { e.preventDefault(); setHeroUrl(url); }}                                                    
      261 +                      className="relative aspect-video rounded-xl overflow-hidden touch-manipulation block"                           
      262 +                      style={{                                                                                                        
      263 +                        outline: selected ? "2px solid #7E9A7E" : "2px solid transparent",                                            
      264 +                        outlineOffset: "2px",                                                                                         
      265 +                      }}                                                                                                              
      266 +                    >                                                                                                                 
      267 +                      {isVideoMedia(url) ? (                                                                                          
      268 +                        <video                                                                                                        
      269 +                          src={url}                                                                                                   
      270 +                          autoPlay                                                                                                    
      271 +                          muted                                                                                                       
      272 +                          loop                                                                                                        
      273 +                          playsInline                                                                                                 
      274 +                          className="w-full h-full object-cover"                                                                      
      275 +                        />                                                                                                            
      276 +                      ) : (                                                                                                           
      277 +                        <img                                                                                                          
      278 +                          src={url}                                                                                                   
      279 +                          alt=""                                                                                                      
      280 +                          className="w-full h-full object-cover"                                                                      
      281 +                          loading="lazy"                                                                                              
      282 +                        />                                                                                                            
      283 +                      )}                                                                                                              
      284 +                      {/* Dim overlay on unselected thumbnails */}                                                                    
      285 +                      {!selected && (                                                                                                 
      286 +                        <div                                                                                                          
      287 +                          className="absolute inset-0 transition-opacity hover:opacity-0"                                             
      288 +                          style={{ background: "rgba(15,30,46,0.5)" }}                                                                
      289 +                        />                                                                                                            
      290 +                      )}                                                                                                              
      291 +                      {/* Checkmark badge on selected thumbnail */}                                                                   
      292 +                      {selected && (                                                                                                  
      293 +                        <div                                                                                                          
      294 +                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"                
      295 +                          style={{ background: "#7E9A7E" }}                                                                           
      296 +                        >                                                                                                             
      297 +                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">                                                
      298 +                            <path                                                                                                     
      299 +                              d="M2 6l3 3 5-5"                                                                                        
      300 +                              stroke="#0f1e2e"                                                                                        
      301 +                              strokeWidth="1.8"                                                                                       
      302 +                              strokeLinecap="round"                                                                                   
      303 +                              strokeLinejoin="round"                                                                                  
      304 +                            />                                                                                                        
      305 +                          </svg>                                                                                                      
      306 +                        </div>                                                                                                        
      307 +                      )}                                                                                                              
      308 +                    </button>                                                                                                         
      309 +                  );                                                                                                                  
      310 +                })}                                                                                                                   
      311 +              </div>                                                                                                                  
      312 +            )}                                                                                                                        
      313 +          </div>                                                                                                                      
      314 +                                                                                                                                      
      315 +          {/* ── Save Button + Toast ── */}                                                                                           
      316 +          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">                                               
      317 +            <button                                                                                                                   
      318 +              onClick={handleSaveAppearance}                                                                                          
      319 +              onTouchEnd={(e) => { e.preventDefault(); handleSaveAppearance(); }}                                                     
      320 +              disabled={isSaving || !heroUrl}                                                                                         
      321 +              className="rounded-full px-8 py-3 text-sm uppercase tracking-widest font-medium transition-all duration-200 touch       
          +-manipulation"                                                                                                                        
      322 +              style={{                                                                                                                
      323 +                minHeight: "44px",                                                                                                    
      324 +                background: isSaving || !heroUrl ? "rgba(126,154,126,0.3)" : "#7E9A7E",                                               
      325 +                color: "#0f1e2e",                                                                                                     
      326 +                cursor: isSaving || !heroUrl ? "not-allowed" : "pointer",                                                             
      327 +                fontFamily: "'Manrope', sans-serif",                                                                                  
      328 +              }}                                                                                                                      
      329 +            >                                                                                                                         
      330 +              {isSaving ? "Saving…" : "Save Appearance"}                                                                              
      331 +            </button>                                                                                                                 
      332 +            {saveSuccess && (                                                                                                         
      333 +              <p                                                                                                                      
      334 +                className="text-sm"                                                                                                   
      335 +                style={{ color: "#7E9A7E", fontFamily: "'Manrope', sans-serif" }}                                                     
      336 +              >                                                                                                                       
      337 +                Site appearance updated successfully.                                                                                 
      338 +              </p>                                                                                                                    
      339 +            )}                                                                                                                        
      340 +          </div>                                                                                                                      
      341 +        </div>                                                                                                                        
      342 +                                                                                                                                      
      343 +        {/* ── Logout ── */}                                                                                                          
      344          <div className="mt-10">
      345            <LogoutButton />
      346          </div>
      347 +                                                                                                                                      
      348        </div>
      349      </main>
      350    );

● Bash(cd "C:/Projects/fades-and-facials" && npx tsc --noEmit 2>&1 && echo "TSC CLEAN")
  ⎿  TSC CLEAN

● Zero errors. Here's what was built:                                                                                                            

  Structural changes:                                                                                                                            
  - Converted from Server Component (async + redirect) to "use client" with a useEffect auth guard — redirects to /admin if no session             - supabase client promoted to module level, matching the pattern in app/admin/services/page.tsx
                                                                                                                                                 
  Data layer:
  - Single batch .in("key", [...]) query fetches active_layout, global_hero_url, and media_library in one round-trip
  - media_library JSON-parsed into string[] with a silent catch for malformed values
  - isLoading guard returns null until auth + data are confirmed — no flash of stale defaults

  UI sections:
  - Header with live userEmail from session
  - Existing nav cards (Gallery, Services) preserved
  - "Site Appearance" panel in a subtle bordered card:
    - Layout selector — 3 cards with sage #7E9A7E border/icon/label on the active selection
    - Hero picker — grid-cols-2 sm:grid-cols-3 md:grid-cols-4 thumbnails, <video> for .mp4, <img> for all others, sage outline + checkmark badge 
  on selected, dim overlay on unselected
    - Empty-state message if mediaLibrary is empty
    - Save button — disabled + muted when heroUrl is empty or saving; 3-second inline toast on success
