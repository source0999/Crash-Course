
❯ The plan looks perfect. As you refactor the FeaturedServicesSection, ensure it uses the same media-type logic as the layouts: if the mediaUrl    is an .mp4 or the service media_type is 'video', render the <video autoPlay muted loop playsInline /> tag.                                                                                                                                                                                        You have permission to Proceed. Execute the full plan now                                                                                      
                                                                                                                                                 
● Let me check the DbService type before writing a single line so I know exactly which fields are available.                                     
                                                                                                                                                 
  Read 1 file (ctrl+o to expand)                                                                                                                 
                                                                                                                                                 
● Good — media_type is "image" | "gif" | "video" | undefined on DbService. "gif" renders as <img>, only "video" or .mp4 extension triggers       
  <video>. Now writing the full rewrite.                                                                                                         

● Write(app\page.tsx)                                                                                                                            
  ⎿  Added 305 lines, removed 356 lines                                                                                                                26  import type { DbService } from "@/lib/supabase";                                                                                       
      27                                                                                                                                               28  // ─────────────────────────────────────────
      29 +// SECTION: Constants & Shared Types                                                                                                   
      30 +// WHAT: GIF fallback URL, FeaturedPair shape, and shared LayoutProps interface.
      31 +// WHY: A single GIF_URL constant prevents drift — update here and it propagates
      32 +//   to all three layouts and FeaturedServicesSection automatically.                                                                   
      33 +// PHASE 4: No changes needed.                                                                                                         
      34 +// ─────────────────────────────────────────                                                                                           
      35 +                                                                                                                                       
      36 +const GIF_URL =                                                                                                                        
      37 +  "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif";                                            
      38 +                                                                                                                                       
      39 +/** A resolved featured slot: the config mediaUrl paired with its live DbService. */                                                   
      40 +type FeaturedPair = {                                                                                                                  
      41 +  serviceId: number;                                                                                                                   
      42 +  mediaUrl: string | null;                                                                                                             
      43 +  service: DbService;                                                                                                                  
      44 +};                                                                                                                                     
      45 +                                                                                                                                       
      46 +/** Props contract shared by all three layout components. */                                                                           
      47 +type LayoutProps = {                                                                                                                   
      48 +  featuredPairs: FeaturedPair[];                                                                                                       
      49 +  allServices: DbService[];                                                                                                            
      50 +};                                                                                                                                     
      51 +                                                                                                                                       
      52 +// WHY: Centralises the video-vs-image branch — .mp4 extension OR media_type='video'                                                   
      53 +// both qualify as video. Called in all three layouts and FeaturedServicesSection                                                      
      54 +// so the logic is never duplicated.                                                                                                   
      55 +function isVideoMedia(url: string | null, mediaType?: string | null): boolean {                                                        
      56 +  if (mediaType === "video") return true;                                                                                              
      57 +  return /\.mp4(\?|$)/i.test(url ?? "");                                                                                               
      58 +}                                                                                                                                      
      59 +                                                                                                                                       
      60 +// ─────────────────────────────────────────                                                                                           
      61  // SECTION: BookNowPill
      62  // WHAT: Persistent floating CTA anchored to the viewport bottom-center.
      63  // WHY: Keeps the booking action reachable regardless of scroll position or
     ...
      260  // WHAT: Full-viewport hero with gradient overlay and bottom-anchored text.
      261  // WHY: Maximum visual impact on first load — the GIF fills the entire screen
      262  //   and the copy emerges from the bottom like a film title card.
      231 -// PHASE 4: No changes needed — purely presentational.                                                                                
      263 +// PHASE 4: featuredPairs[0].mediaUrl drives the hero; GIF_URL is the fallback.                                                       
      264  // ─────────────────────────────────────────
      265
      266  /**
     ...
      271   * layout fills the visible viewport on iOS Safari without being obscured
      272   * by the browser chrome (URL bar + tab bar).
      273   *
      242 - * The gradient overlay (`rgba` linear-gradient) creates a cinematic vignette:                                                        
      243 - * dark at the top and bottom, transparent in the middle, so the GIF reads                                                            
      244 - * clearly at the centre while text remains legible at the edges.                                                                     
      274 + * Hero media source: featuredPairs[0].mediaUrl, falling back to GIF_URL when                                                         
      275 + * no featured pair is configured. isVideoMedia() selects <video> vs <img>.                                                           
      276   *
      277   * @returns A full-screen cinematic hero page with location section below.
      278   */
      248 -function CinematicLayout({ heroMediaUrl }: { heroMediaUrl: string | null }) {                                                         
      279 +function CinematicLayout({ featuredPairs }: LayoutProps) {                                                                            
      280 +  const heroUrl = featuredPairs[0]?.mediaUrl ?? GIF_URL;                                                                              
      281 +  const heroMediaType = featuredPairs[0]?.service.media_type;                                                                         
      282 +                                                                                                                                      
      283    return (
      284      <main style={{ background: "#0B132B", color: "#F9F7F2" }}>
      285        <section className="relative w-full h-[100svh] overflow-hidden">
      286          <div className="absolute inset-0 z-0">
      253 -          {heroMediaUrl ? (                                                                                                           
      254 -            /\.mp4(\?|$)/i.test(heroMediaUrl) ? (                                                                                     
      255 -              <video                                                                                                                  
      256 -                src={heroMediaUrl}                                                                                                    
      257 -                autoPlay                                                                                                              
      258 -                muted                                                                                                                 
      259 -                loop                                                                                                                  
      260 -                playsInline                                                                                                           
      261 -                className="w-full h-full object-cover"                                                                                
      262 -                style={{ objectPosition: "center 15%" }}                                                                              
      263 -              />                                                                                                                      
      264 -            ) : (                                                                                                                     
      265 -              <img                                                                                                                    
      266 -                src={heroMediaUrl}                                                                                                    
      267 -                alt="Fades and Facials atmosphere"                                                                                    
      268 -                className="w-full h-full object-cover"                                                                                
      269 -                style={{ objectPosition: "center 15%" }}                                                                              
      270 -              />                                                                                                                      
      271 -            )                                                                                                                         
      287 +          {isVideoMedia(heroUrl, heroMediaType) ? (                                                                                   
      288 +            <video                                                                                                                    
      289 +              src={heroUrl}                                                                                                           
      290 +              autoPlay                                                                                                                
      291 +              muted                                                                                                                   
      292 +              loop                                                                                                                    
      293 +              playsInline                                                                                                             
      294 +              className="w-full h-full object-cover"                                                                                  
      295 +              style={{ objectPosition: "center 15%" }}                                                                                
      296 +            />                                                                                                                        
      297            ) : (
      273 -            <div className="w-full h-full bg-[#0b132b]" />                                                                            
      298 +            <img                                                                                                                      
      299 +              src={heroUrl}                                                                                                           
      300 +              alt="Fades and Facials atmosphere"                                                                                      
      301 +              className="w-full h-full object-cover"                                                                                  
      302 +              style={{ objectPosition: "center 15%" }}                                                                                
      303 +            />                                                                                                                        
      304            )}
      305            {/* Cinematic vignette: dark at top (55%) → transparent (10%) → dark at bottom (95%) */}
      306            <div
     ...
      340            </h1>
      341          </div>
      342        </section>
      313 -                                                                                                                                      
      343      </main>
      344    );
      345  }
      346
      347  // ─────────────────────────────────────────
      319 -// SECTION: Services Data                                                                                                             
      320 -// WHAT: Static array of service objects used by GridLayout and EditorialLayout.                                                      
      321 -// WHY: Hardcoded for now — these services are stable and don't require a DB                                                          
      322 -//   round-trip on the public homepage. The admin Services Manager in                                                                 
      323 -//   /admin/services is the live source of truth for the actual menu.                                                                 
      324 -// PHASE 4: Consider replacing with a live fetch from the services table                                                              
      325 -//   so admin edits propagate to the homepage without a code deployment.                                                              
      348 +// SECTION: FeaturedServicesSection                                                                                                   
      349 +// WHAT: Global featured cards strip — rendered beneath every active layout.                                                          
      350 +// WHY: Separated from the layout components so it persists across all three                                                          
      351 +//   views without each layout owning a copy. Data is fetched once in HomePage                                                        
      352 +//   and passed down — no internal fetch, no redundant round-trips.                                                                   
      353 +// PHASE 4: No changes needed — already wired to live DB via featuredPairs prop.                                                      
      354  // ─────────────────────────────────────────
      355
      356  /**
      329 - * Static service data for the public homepage.                                                                                       
      357 + * FeaturedServicesSection                                                                                                            
      358   *
      331 - * `dark: true` marks a card to render with an Ink (#0B132B) background                                                               
      332 - * instead of white — used to create visual rhythm in the grid by alternating                                                         
      333 - * light and dark cards.                                                                                                              
      359 + * Renders up to three featured service cards using the resolved FeaturedPair[]                                                       
      360 + * array from HomePage. Each card shows the service's mediaUrl (video or image),                                                      
      361 + * name, description, and price.                                                                                                      
      362   *
      335 - * @remarks                                                                                                                           
      336 - * This data is intentionally separate from the Supabase `services` table.                                                            
      337 - * The admin panel manages live services; this array manages the homepage                                                             
      338 - * presentation. If they diverge, the admin panel is the source of truth.                                                             
      363 + * Media type logic: isVideoMedia() selects <video autoPlay muted loop playsInline>                                                   
      364 + * for .mp4 URLs or media_type='video'; all other media renders as <img>.                                                             
      365 + *                                                                                                                                    
      366 + * @param featuredPairs - Resolved featured slots from the DB. Rendered in order.                                                     
      367   */
      340 -const SERVICES = [                                                                                                                    
      341 -  {                                                                                                                                   
      342 -    name: "The Signature Fade",                                                                                                       
      343 -    description:                                                                                                                      
      344 -      "Precision fading, hot towel neck shave, and premium styling product application.",                                             
      345 -    price: "$45",                                                                                                                     
      346 -    duration: "45 Min",                                                                                                               
      347 -    dark: false,                                                                                                                      
      348 -  },                                                                                                                                  
      349 -  {                                                                                                                                   
      350 -    name: "Luxury Facial",                                                                                                            
      351 -    description:                                                                                                                      
      352 -      "Deep pore cleansing, exfoliation, custom mask, and a relaxing facial massage.",                                                
      353 -    price: "$65",                                                                                                                     
      354 -    duration: "60 Min",                                                                                                               
      355 -    dark: true, // dark card for visual rhythm alternation                                                                            
      356 -  },                                                                                                                                  
      357 -  {                                                                                                                                   
      358 -    name: "Beard Sculpting",                                                                                                          
      359 -    description:                                                                                                                      
      360 -      "Detailed trimming, straight razor line-up, and conditioning beard oil treatment.",                                             
      361 -    price: "$30",                                                                                                                     
      362 -    duration: "30 Min",                                                                                                               
      363 -    dark: false,                                                                                                                      
      364 -  },                                                                                                                                  
      365 -  {                                                                                                                                   
      366 -    name: "The Full Experience",                                                                                                      
      367 -    description:                                                                                                                      
      368 -      "Fade + facial combo. The complete luxury grooming treatment in a single session.",                                             
      369 -    price: "$100",                                                                                                                    
      370 -    duration: "90 Min",                                                                                                               
      371 -    dark: false,                                                                                                                      
      372 -  },                                                                                                                                  
      373 -  {                                                                                                                                   
      374 -    name: "Hot Towel Shave",                                                                                                          
      375 -    description:                                                                                                                      
      376 -      "Classic straight razor shave with steamed hot towels, pre-shave oil, and aftercare balm.",                                     
      377 -    price: "$35",                                                                                                                     
      378 -    duration: "40 Min",                                                                                                               
      379 -    dark: true, // dark card for visual rhythm alternation                                                                            
      380 -  },                                                                                                                                  
      381 -  {                                                                                                                                   
      382 -    name: "Brow Architecture",                                                                                                        
      383 -    description:                                                                                                                      
      384 -      "Precision threading and shaping with a hot towel finish. Clean lines, defined face.",                                          
      385 -    price: "$20",                                                                                                                     
      386 -    duration: "20 Min",                                                                                                               
      387 -    dark: false,                                                                                                                      
      388 -  },                                                                                                                                  
      389 -];                                                                                                                                    
      368 +function FeaturedServicesSection({ featuredPairs }: { featuredPairs: FeaturedPair[] }) {                                              
      369 +  if (featuredPairs.length === 0) return null;                                                                                        
      370
      391 -function FeaturedServicesSection() {                                                                                                  
      392 -  const [featuredServices, setFeaturedServices] = useState<DbService[]>([]);                                                          
      393 -  const [featuredMediaById, setFeaturedMediaById] = useState<Record<number, string | null>>({});                                      
      394 -                                                                                                                                      
      395 -  useEffect(() => {                                                                                                                   
      396 -    let isMounted = true;                                                                                                             
      397 -    async function loadFeaturedServices() {                                                                                           
      398 -      const supabase = createBrowserClient(                                                                                           
      399 -        process.env.NEXT_PUBLIC_SUPABASE_URL!,                                                                                        
      400 -        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,                                                                                   
      401 -      );                                                                                                                              
      402 -                                                                                                                                      
      403 -      try {                                                                                                                           
      404 -        const [featuredConfigRes, servicesRes] = await Promise.all([                                                                  
      405 -          supabase.from("site_config").select("value").eq("key", "featured_services").single(),                                       
      406 -          supabase.from("services").select("*").eq("is_active", true),                                                                
      407 -        ]);                                                                                                                           
      408 -        if (featuredConfigRes.error || servicesRes.error) return;                                                                     
      409 -                                                                                                                                      
      410 -        const featuredPairsRaw = featuredConfigRes.data?.value                                                                        
      411 -          ? (JSON.parse(featuredConfigRes.data.value) as Array<                                                                       
      412 -              number | null | { serviceId: number | null; mediaUrl: string | null }                                                   
      413 -            >)                                                                                                                        
      414 -          : [null, null, null];                                                                                                       
      415 -        const normalizedPairs = [0, 1, 2].map((index) => {                                                                            
      416 -          const row = featuredPairsRaw[index];                                                                                        
      417 -          if (typeof row === "number" || row === null) {                                                                              
      418 -            return { serviceId: row ?? null, mediaUrl: null };                                                                        
      419 -          }                                                                                                                           
      420 -          return {                                                                                                                    
      421 -            serviceId: row?.serviceId ?? null,                                                                                        
      422 -            mediaUrl: row?.mediaUrl ?? null,                                                                                          
      423 -          };                                                                                                                          
      424 -        });                                                                                                                           
      425 -        const featuredIds = normalizedPairs                                                                                           
      426 -          .map((pair) => pair.serviceId)                                                                                              
      427 -          .filter((id): id is number => id !== null);                                                                                 
      428 -        const serviceMap = new Map((servicesRes.data ?? []).map((service) => [service.id, service]));                                 
      429 -        const resolved = featuredIds                                                                                                  
      430 -          .map((id) => serviceMap.get(id))                                                                                            
      431 -          .filter((service): service is DbService => Boolean(service));                                                               
      432 -        const mediaLookup = normalizedPairs.reduce<Record<number, string | null>>((acc, pair) => {                                    
      433 -          if (pair.serviceId !== null) acc[pair.serviceId] = pair.mediaUrl;                                                           
      434 -          return acc;                                                                                                                 
      435 -        }, {});                                                                                                                       
      436 -        if (isMounted) {                                                                                                              
      437 -          setFeaturedServices(resolved);                                                                                              
      438 -          setFeaturedMediaById(mediaLookup);                                                                                          
      439 -        }                                                                                                                             
      440 -      } catch {                                                                                                                       
      441 -        if (isMounted) {                                                                                                              
      442 -          setFeaturedServices([]);                                                                                                    
      443 -          setFeaturedMediaById({});                                                                                                   
      444 -        }                                                                                                                             
      445 -      }                                                                                                                               
      446 -    }                                                                                                                                 
      447 -                                                                                                                                      
      448 -    loadFeaturedServices();                                                                                                           
      449 -    return () => {                                                                                                                    
      450 -      isMounted = false;                                                                                                              
      451 -    };                                                                                                                                
      452 -  }, []);                                                                                                                             
      453 -                                                                                                                                      
      454 -  if (featuredServices.length === 0) return null;                                                                                     
      455 -                                                                                                                                      
      371    return (
      372      <section className="w-full bg-alabaster px-6 py-16">
      373        <div className="max-w-6xl mx-auto">
     ...
      381            Signature Menu
      382          </h2>
      383          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      469 -          {featuredServices.map((s) => (                                                                                              
      384 +          {featuredPairs.map((pair) => (                                                                                              
      385              <article
      471 -              key={s.id}                                                                                                              
      386 +              key={pair.serviceId}                                                                                                    
      387                className="rounded-2xl border border-ink/10 bg-white p-6"
      388              >
      474 -              {/* WHY: DB-First mutation flow ensures the UI never shows selections that don't exist in Supabase. */}                 
      475 -              {featuredMediaById[s.id] && /\.mp4(\?|$)/i.test(featuredMediaById[s.id] ?? "") ? (                                      
      389 +              {/* WHY: isVideoMedia() mirrors the admin media_type state machine —                                                    
      390 +                  .mp4 extension OR media_type='video' both render as <video>. */}                                                    
      391 +              {pair.mediaUrl && isVideoMedia(pair.mediaUrl, pair.service.media_type) ? (                                              
      392                  <video
      477 -                  src={featuredMediaById[s.id] ?? ""}                                                                                 
      393 +                  src={pair.mediaUrl}                                                                                                 
      394                    className="mb-4 h-40 w-full rounded-xl object-cover"
      395                    autoPlay
      396                    muted
      397                    loop
      398                    playsInline
      399                  />
      484 -              ) : featuredMediaById[s.id] ? (                                                                                         
      400 +              ) : pair.mediaUrl ? (                                                                                                   
      401                  <img
      486 -                  src={featuredMediaById[s.id] ?? ""}                                                                                 
      487 -                  alt={`${s.name} featured media`}                                                                                    
      402 +                  src={pair.mediaUrl}                                                                                                 
      403 +                  alt={`${pair.service.name} featured media`}                                                                         
      404                    className="mb-4 h-40 w-full rounded-xl object-cover"
      405                  />
      406                ) : null}
     ...
      408                  className="text-2xl font-light text-ink mb-2"
      409                  style={{ fontFamily: "'Bodoni Moda', serif" }}
      410                >
      495 -                {s.name}                                                                                                              
      411 +                {pair.service.name}                                                                                                   
      412                </h3>
      497 -              <p className="text-sm text-ink/60 mb-5">{s.description}</p>                                                             
      413 +              <p className="text-sm text-ink/60 mb-5">{pair.service.description}</p>                                                  
      414                <div className="flex items-end justify-between border-t border-ink/10 pt-4">
      415                  <span
      416                    className="text-2xl text-ink font-light"
      417                    style={{ fontFamily: "'Bodoni Moda', serif" }}
      418                  >
      503 -                  {typeof s.price === "number" ? `$${s.price}` : s.price}                                                             
      419 +                  {typeof pair.service.price === "number"                                                                             
      420 +                    ? `$${pair.service.price}`                                                                                        
      421 +                    : pair.service.price}                                                                                             
      422                  </span>
      423                  <span className="text-[11px] uppercase tracking-widest text-ink/45">
      506 -                  {s.duration ?? "Featured"}                                                                                          
      424 +                  {pair.service.duration ?? "Featured"}                                                                               
      425                  </span>
      426                </div>
      427              </article>
     ...
      437  // WHAT: Service grid with a hero header and alternating light/dark cards.
      438  // WHY: Shows all services at a glance — best for users who know what
      439  //   they want and are comparison-shopping price and duration.
      522 -// PHASE 4: No changes needed — purely presentational.                                                                                
      440 +// PHASE 4: allServices from DB replaces the static SERVICES array.                                                                   
      441  // ─────────────────────────────────────────
      442
      443  /**
      444   * GridLayout
      445   *
      446   * A 65svh hero image followed by a 3-column responsive service grid.
      529 - * Cards alternate between white ("Paper") and Ink ("Dark") backgrounds                                                               
      530 - * using the `dark` flag on each SERVICES entry, creating visual rhythm                                                               
      531 - * without requiring the user to consciously scan a list.                                                                             
      447 + * Cards at index i where i % 3 === 1 render with the Ink dark background                                                             
      448 + * for visual rhythm — this replaces the static `dark` flag that was on                                                               
      449 + * the old hardcoded SERVICES array.                                                                                                  
      450   *
      533 - * Card hover uses `hover:-translate-y-2` (compositor-safe transform) with                                                            
      534 - * `transition-all duration-500` for a slow, luxurious lift effect.                                                                   
      451 + * Hero media source: featuredPairs[0].mediaUrl ?? GIF_URL.                                                                           
      452   *
      536 - * @returns A light-background grid page with all services and location section.                                                      
      453 + * @returns A light-background grid page with all live services and location section.                                                 
      454   */
      538 -function GridLayout({ heroMediaUrl }: { heroMediaUrl: string | null }) {                                                              
      455 +function GridLayout({ featuredPairs, allServices }: LayoutProps) {                                                                    
      456 +  const heroUrl = featuredPairs[0]?.mediaUrl ?? GIF_URL;                                                                              
      457 +  const heroMediaType = featuredPairs[0]?.service.media_type;                                                                         
      458 +                                                                                                                                      
      459    return (
      460      <main style={{ background: "#F9F7F2", color: "#0B132B" }}>
      461        <section
      462          className="relative w-full overflow-hidden flex items-center justify-center"
      463          style={{ height: "65svh" }}
      464        >
      545 -        {heroMediaUrl ? (                                                                                                             
      546 -          /\.mp4(\?|$)/i.test(heroMediaUrl) ? (                                                                                       
      547 -            <video                                                                                                                    
      548 -              src={heroMediaUrl}                                                                                                      
      549 -              autoPlay                                                                                                                
      550 -              muted                                                                                                                   
      551 -              loop                                                                                                                    
      552 -              playsInline                                                                                                             
      553 -              className="absolute inset-0 w-full h-full object-cover"                                                                 
      554 -              style={{ objectPosition: "top center" }}                                                                                
      555 -            />                                                                                                                        
      556 -          ) : (                                                                                                                       
      557 -            <img                                                                                                                      
      558 -              src={heroMediaUrl}                                                                                                      
      559 -              alt="Fades and Facials"                                                                                                 
      560 -              className="absolute inset-0 w-full h-full object-cover"                                                                 
      561 -              style={{ objectPosition: "top center" }}                                                                                
      562 -            />                                                                                                                        
      563 -          )                                                                                                                           
      465 +        {isVideoMedia(heroUrl, heroMediaType) ? (                                                                                     
      466 +          <video                                                                                                                      
      467 +            src={heroUrl}                                                                                                             
      468 +            autoPlay                                                                                                                  
      469 +            muted                                                                                                                     
      470 +            loop                                                                                                                      
      471 +            playsInline                                                                                                               
      472 +            className="absolute inset-0 w-full h-full object-cover"                                                                   
      473 +            style={{ objectPosition: "top center" }}                                                                                  
      474 +          />                                                                                                                          
      475          ) : (
      565 -          <div className="absolute inset-0 w-full h-full bg-[#0b132b]" />                                                             
      476 +          <img                                                                                                                        
      477 +            src={heroUrl}                                                                                                             
      478 +            alt="Fades and Facials"                                                                                                   
      479 +            className="absolute inset-0 w-full h-full object-cover"                                                                   
      480 +            style={{ objectPosition: "top center" }}                                                                                  
      481 +          />                                                                                                                          
      482          )}
      483          <div
      484            className="absolute inset-0"
     ...
      537          </div>
      538
      539          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      624 -          {SERVICES.map((s) => (                                                                                                      
      625 -            <div                                                                                                                      
      626 -              key={s.name}                                                                                                            
      627 -              className="group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"                                      
      628 -              style={{                                                                                                                
      629 -                // dark flag drives the card variant — Ink bg or white bg                                                             
      630 -                background: s.dark ? "#0B132B" : "#FFFFFF",                                                                           
      631 -                border: s.dark ? "none" : "1px solid rgba(11,19,43,0.07)",                                                            
      632 -                boxShadow: s.dark                                                                                                     
      633 -                  ? "0 8px 40px rgba(11,19,43,0.25)"                                                                                  
      634 -                  : "0 2px 20px rgba(11,19,43,0.05)",                                                                                 
      635 -              }}                                                                                                                      
      636 -            >                                                                                                                         
      637 -              <h3                                                                                                                     
      638 -                className="text-2xl font-light mb-3"                                                                                  
      639 -                style={{                                                                                                              
      640 -                  fontFamily: "'Bodoni Moda', serif",                                                                                 
      641 -                  color: s.dark ? "#F9F7F2" : "#0B132B",                                                                              
      642 -                }}                                                                                                                    
      643 -              >                                                                                                                       
      644 -                {s.name}                                                                                                              
      645 -              </h3>                                                                                                                   
      646 -              <p                                                                                                                      
      647 -                className="text-sm leading-relaxed mb-8"                                                                              
      648 -                style={{                                                                                                              
      649 -                  color: s.dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",                                                   
      650 -                  fontFamily: "'Manrope', sans-serif",                                                                                
      651 -                  fontWeight: 300,                                                                                                    
      652 -                }}                                                                                                                    
      653 -              >                                                                                                                       
      654 -                {s.description}                                                                                                       
      655 -              </p>                                                                                                                    
      540 +          {/* WHY: i % 3 === 1 reproduces the original alternating dark-card rhythm                                                   
      541 +              without a static `dark` flag — DB services have no such field. */}                                                      
      542 +          {allServices.map((s, i) => {                                                                                                
      543 +            const dark = i % 3 === 1;                                                                                                 
      544 +            return (                                                                                                                  
      545                <div
      657 -                className="flex justify-between items-end pt-5"                                                                       
      546 +                key={s.id}                                                                                                            
      547 +                className="group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"                                    
      548                  style={{
      659 -                  borderTop: `1px solid ${s.dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,                                
      549 +                  background: dark ? "#0B132B" : "#FFFFFF",                                                                           
      550 +                  border: dark ? "none" : "1px solid rgba(11,19,43,0.07)",                                                            
      551 +                  boxShadow: dark                                                                                                     
      552 +                    ? "0 8px 40px rgba(11,19,43,0.25)"                                                                                
      553 +                    : "0 2px 20px rgba(11,19,43,0.05)",                                                                               
      554                  }}
      555                >
      662 -                <span                                                                                                                 
      663 -                  className="text-2xl font-light"                                                                                     
      556 +                <h3                                                                                                                   
      557 +                  className="text-2xl font-light mb-3"                                                                                
      558                    style={{
      559                      fontFamily: "'Bodoni Moda', serif",
      666 -                    color: s.dark ? "#F9F7F2" : "#0B132B",                                                                            
      560 +                    color: dark ? "#F9F7F2" : "#0B132B",                                                                              
      561                    }}
      562                  >
      669 -                  {s.price}                                                                                                           
      670 -                </span>                                                                                                               
      671 -                <span                                                                                                                 
      672 -                  className="text-xs uppercase tracking-widest"                                                                       
      563 +                  {s.name}                                                                                                            
      564 +                </h3>                                                                                                                 
      565 +                <p                                                                                                                    
      566 +                  className="text-sm leading-relaxed mb-8"                                                                            
      567                    style={{
      674 -                    color: s.dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",                                                 
      568 +                    color: dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",                                                   
      569                      fontFamily: "'Manrope', sans-serif",
      570 +                    fontWeight: 300,                                                                                                  
      571                    }}
      572                  >
      678 -                  {s.duration}                                                                                                        
      679 -                </span>                                                                                                               
      573 +                  {s.description}                                                                                                     
      574 +                </p>                                                                                                                  
      575 +                <div                                                                                                                  
      576 +                  className="flex justify-between items-end pt-5"                                                                     
      577 +                  style={{                                                                                                            
      578 +                    borderTop: `1px solid ${dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,                                
      579 +                  }}                                                                                                                  
      580 +                >                                                                                                                     
      581 +                  <span                                                                                                               
      582 +                    className="text-2xl font-light"                                                                                   
      583 +                    style={{                                                                                                          
      584 +                      fontFamily: "'Bodoni Moda', serif",                                                                             
      585 +                      color: dark ? "#F9F7F2" : "#0B132B",                                                                            
      586 +                    }}                                                                                                                
      587 +                  >                                                                                                                   
      588 +                    {typeof s.price === "number" ? `$${s.price}` : s.price}                                                           
      589 +                  </span>                                                                                                             
      590 +                  <span                                                                                                               
      591 +                    className="text-xs uppercase tracking-widest"                                                                     
      592 +                    style={{                                                                                                          
      593 +                      color: dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",                                                 
      594 +                      fontFamily: "'Manrope', sans-serif",                                                                            
      595 +                    }}                                                                                                                
      596 +                  >                                                                                                                   
      597 +                    {s.duration ?? ""}                                                                                                
      598 +                  </span>                                                                                                             
      599 +                </div>                                                                                                                
      600                </div>
      681 -            </div>                                                                                                                    
      682 -          ))}                                                                                                                         
      601 +            );                                                                                                                        
      602 +          })}                                                                                                                         
      603          </div>
      604        </section>
      685 -                                                                                                                                      
      605      </main>
      606    );
      607  }
     ...
      611  // WHAT: Split-screen hero with a magazine-style service menu below.
      612  // WHY: Targets users who respond to luxury editorial aesthetics — feels
      613  //   closer to a high-end print menu than a website.
      695 -// PHASE 4: No changes needed — purely presentational.                                                                                
      614 +// PHASE 4: featuredPairs drives the price preview strip; allServices drives                                                          
      615 +//   the full menu list. Both replace the old static SERVICES array.                                                                  
      616  // ─────────────────────────────────────────
      617
      618  /**
     ...
      620   *
      621   * A two-column split-screen hero (text left, image right) followed by a
      622   * typographic service list. The service rows use `hover:bg-white hover:-mx-6
      703 - * hover:px-6` to create a "expanding highlight" effect on hover — the row                                                            
      704 - * grows to a white background and gains padding, pushing into the gutter,                                                            
      705 - * without changing its height (no layout shift). This is a CSS-only illusion                                                         
      706 - * that runs on the compositor thread.                                                                                                
      623 + * hover:px-6` to create an "expanding highlight" effect on hover.                                                                    
      624   *
      708 - * The large ghost number ("01") behind the section heading is decorative                                                             
      709 - * only, using `rgba(11,19,43,0.06)` (6% ink) so it reads as a watermark                                                              
      710 - * rather than competing with the heading.                                                                                            
      625 + * Hero right-panel media: featuredPairs[0].mediaUrl ?? GIF_URL.                                                                      
      626 + * Price preview strip: up to 3 entries from featuredPairs (live DB data).                                                            
      627 + * Full menu: allServices mapped directly from the services table.                                                                    
      628   *
      629   * @returns An editorial split-screen page with typographic service menu
      630   *          and location section below.
      631   */
      715 -function EditorialLayout({ heroMediaUrl }: { heroMediaUrl: string | null }) {                                                         
      632 +function EditorialLayout({ featuredPairs, allServices }: LayoutProps) {                                                               
      633 +  const heroUrl = featuredPairs[0]?.mediaUrl ?? GIF_URL;                                                                              
      634 +  const heroMediaType = featuredPairs[0]?.service.media_type;                                                                         
      635 +  // Up to 3 preview entries — fewer are fine if less than 3 featured pairs exist.                                                    
      636 +  const previewPairs = featuredPairs.slice(0, 3);                                                                                     
      637 +                                                                                                                                      
      638    return (
      639      <main style={{ background: "#F9F7F2", color: "#0B132B" }}>
      640        <section className="min-h-[100svh] grid grid-cols-1 md:grid-cols-2">
     ...
      685              style={{ height: "1px", background: "rgba(11,19,43,0.1)" }}
      686            />
      687
      766 -          {/* Price preview — three signature services only, not the full menu */}                                                    
      767 -          <div                                                                                                                        
      768 -            className="grid grid-cols-3 gap-4"                                                                                        
      769 -            style={{ fontFamily: "'Manrope', sans-serif" }}                                                                           
      770 -          >                                                                                                                           
      771 -            {[                                                                                                                        
      772 -              { label: "Signature Fade", price: "$45" },                                                                              
      773 -              { label: "Luxury Facial", price: "$65" },                                                                               
      774 -              { label: "Beard Sculpt", price: "$30" },                                                                                
      775 -            ].map((item) => (                                                                                                         
      776 -              <div key={item.label} className="flex flex-col gap-1">                                                                  
      777 -                <span                                                                                                                 
      778 -                  className="text-lg font-light"                                                                                      
      779 -                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                    
      780 -                >                                                                                                                     
      781 -                  {item.price}                                                                                                        
      782 -                </span>                                                                                                               
      783 -                <span                                                                                                                 
      784 -                  className="text-xs uppercase tracking-widest leading-tight"                                                         
      785 -                  style={{ color: "rgba(11,19,43,0.4)" }}                                                                             
      786 -                >                                                                                                                     
      787 -                  {item.label}                                                                                                        
      788 -                </span>                                                                                                               
      789 -              </div>                                                                                                                  
      790 -            ))}                                                                                                                       
      791 -          </div>                                                                                                                      
      688 +          {/* Price preview — up to 3 featured services from DB, not hardcoded */}                                                    
      689 +          {previewPairs.length > 0 && (                                                                                               
      690 +            <div                                                                                                                      
      691 +              className="grid grid-cols-3 gap-4"                                                                                      
      692 +              style={{ fontFamily: "'Manrope', sans-serif" }}                                                                         
      693 +            >                                                                                                                         
      694 +              {previewPairs.map((pair) => (                                                                                           
      695 +                <div key={pair.serviceId} className="flex flex-col gap-1">                                                            
      696 +                  <span                                                                                                               
      697 +                    className="text-lg font-light"                                                                                    
      698 +                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                  
      699 +                  >                                                                                                                   
      700 +                    {typeof pair.service.price === "number"                                                                           
      701 +                      ? `$${pair.service.price}`                                                                                      
      702 +                      : pair.service.price}                                                                                           
      703 +                  </span>                                                                                                             
      704 +                  <span                                                                                                               
      705 +                    className="text-xs uppercase tracking-widest leading-tight"                                                       
      706 +                    style={{ color: "rgba(11,19,43,0.4)" }}                                                                           
      707 +                  >                                                                                                                   
      708 +                    {pair.service.name}                                                                                               
      709 +                  </span>                                                                                                             
      710 +                </div>                                                                                                                
      711 +              ))}                                                                                                                     
      712 +            </div>                                                                                                                    
      713 +          )}                                                                                                                          
      714          </div>
      715
      716          {/* Right panel — media */}
      717          <div className="relative overflow-hidden order-1 md:order-2" style={{ minHeight: "55svh" }}>
      796 -          {heroMediaUrl ? (                                                                                                           
      797 -            /\.mp4(\?|$)/i.test(heroMediaUrl) ? (                                                                                     
      798 -              <video                                                                                                                  
      799 -                src={heroMediaUrl}                                                                                                    
      800 -                autoPlay                                                                                                              
      801 -                muted                                                                                                                 
      802 -                loop                                                                                                                  
      803 -                playsInline                                                                                                           
      804 -                className="absolute inset-0 w-full h-full object-cover"                                                               
      805 -                style={{ objectPosition: "top center" }}                                                                              
      806 -              />                                                                                                                      
      807 -            ) : (                                                                                                                     
      808 -              <img                                                                                                                    
      809 -                src={heroMediaUrl}                                                                                                    
      810 -                alt="Fades and Facials craft"                                                                                         
      811 -                className="absolute inset-0 w-full h-full object-cover"                                                               
      812 -                style={{ objectPosition: "top center" }}                                                                              
      813 -              />                                                                                                                      
      814 -            )                                                                                                                         
      718 +          {isVideoMedia(heroUrl, heroMediaType) ? (                                                                                   
      719 +            <video                                                                                                                    
      720 +              src={heroUrl}                                                                                                           
      721 +              autoPlay                                                                                                                
      722 +              muted                                                                                                                   
      723 +              loop                                                                                                                    
      724 +              playsInline                                                                                                             
      725 +              className="absolute inset-0 w-full h-full object-cover"                                                                 
      726 +              style={{ objectPosition: "top center" }}                                                                                
      727 +            />                                                                                                                        
      728            ) : (
      816 -            <div className="absolute inset-0 w-full h-full bg-[#0b132b]" />                                                           
      729 +            <img                                                                                                                      
      730 +              src={heroUrl}                                                                                                           
      731 +              alt="Fades and Facials craft"                                                                                           
      732 +              className="absolute inset-0 w-full h-full object-cover"                                                                 
      733 +              style={{ objectPosition: "top center" }}                                                                                
      734 +            />                                                                                                                        
      735            )}
      736            <div
      737              className="absolute inset-0"
     ...
      752                  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
      753                }}
      754              >
      837 -              "A quiet room. A precise cut."                                                                                          
      755 +              &ldquo;A quiet room. A precise cut.&rdquo;                                                                              
      756              </p>
      757            </div>
      758          </div>
     ...
      796            </div>
      797
      798            <div className="space-y-0">
      881 -            {SERVICES.map((s, i) => (                                                                                                 
      799 +            {allServices.map((s, i) => (                                                                                              
      800                <div
      883 -                key={s.name}                                                                                                          
      801 +                key={s.id}                                                                                                            
      802                  // hover:-mx-6 + hover:px-6 creates an "expanding" row effect
      803                  // that fills into the gutter. No height change = no layout shift.
      804                  className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300        
           hover:bg-white hover:px-6 hover:rounded-2xl hover:-mx-6"
      805                  style={{
      888 -                  borderBottom: i < SERVICES.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",                                   
      806 +                  borderBottom:                                                                                                       
      807 +                    i < allServices.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",                                            
      808                  }}
      809                >
      810                  <div>
     ...
      821                        fontFamily: "'Manrope', sans-serif",
      822                      }}
      823                    >
      905 -                    {s.duration}                                                                                                      
      824 +                    {s.duration ?? ""}                                                                                                
      825                    </p>
      826                  </div>
      827                  <p
     ...
      839                      className="text-2xl font-light"
      840                      style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}
      841                    >
      923 -                    {s.price}                                                                                                         
      842 +                    {typeof s.price === "number" ? `$${s.price}` : s.price}                                                           
      843                    </span>
      844                  </div>
      845                </div>
     ...
      847            </div>
      848          </div>
      849        </section>
      931 -                                                                                                                                      
      850      </main>
      851    );
      852  }
     ...
      862  /**
      863   * Union type for all valid layout identifiers.
      864   *
      947 - * This is the compile-time contract for the layout switcher. TypeScript will                                                         
      948 - * error if any code attempts to set an unknown layout string — typos like                                                            
      949 - * "cinematc" are caught at build time, not discovered in production.                                                                 
      950 - *                                                                                                                                    
      951 - * To add a new layout: add a string literal here, a matching object in                                                               
      952 - * LAYOUTS, and a new layout component + conditional render in HomePage.                                                              
      865 + * TypeScript will error on unknown layout strings — typos like "cinematc"                                                            
      866 + * are caught at build time. To add a layout: add a literal here, a matching                                                          
      867 + * entry in LAYOUTS, and a conditional render in HomePage.                                                                            
      868   */
      869  type Layout = "cinematic" | "grid" | "editorial";
      870
      871  /**
      872   * The layout registry — the single place where layouts are registered.
      873   *
      959 - * The floating pill nav bar renders itself by mapping over this array, so                                                            
      960 - * adding a new layout to the nav requires only adding one object here.                                                               
      874 + * The floating pill nav renders itself by mapping over this array.                                                                   
      875   * Never hardcode individual nav buttons — always extend this array instead.
      876   */
      877  const LAYOUTS: { id: Layout; label: string; icon: string }[] = [
     ...
       882
       883  // ─────────────────────────────────────────
       884  // SECTION: HomePage (Page Entry Point)
       971 -// WHAT: Root page component — renders the floating layout switcher and the                                                          
       972 -//   currently active layout component.                                                                                              
       973 -// WHY: Combines the registry, state, and conditional renderer in one place.                                                         
       974 -// PHASE 4: No changes needed.                                                                                                       
       885 +// WHAT: Root page component — fetches all service data once, renders the                                                            
       886 +//   floating layout switcher, active layout, featured section, and footer.                                                          
       887 +// WHY: Single fetch point prevents redundant round-trips — featuredPairs and                                                        
       888 +//   allServices are computed here and passed down as props to every consumer.                                                       
       889 +// PHASE 4: No changes needed — already wired to live Supabase tables.                                                               
       890  // ─────────────────────────────────────────
       891
       892  /**
       893   * HomePage
       894   *
       980 - * The root page component for `/`. Owns the layout switcher state and                                                               
       981 - * renders the floating pill nav above whichever layout is currently active.                                                         
       895 + * The root page component for `/`. Owns the layout switcher state and the                                                           
       896 + * single unified data fetch that resolves both `allServices` and `featuredPairs`.                                                   
       897   *
       983 - * Layout switcher rationale: Three radically different visual layouts are                                                           
       984 - * provided here for rapid local prototyping — each demonstrates a different                                                         
       985 - * application of the Homey Luxury design system. In production, the active                                                          
       986 - * layout can be locked to a single value by removing the state and hardcoding                                                       
       987 - * `<CinematicLayout />` (or whichever the client approves). The switcher                                                            
       988 - * itself has zero performance cost when only one layout is rendered, since                                                          
       989 - * the inactive components are not mounted.                                                                                          
       898 + * Data pipeline:                                                                                                                    
       899 + *   1. Parallel fetch: services table (active, ordered) + site_config featured_services key                                         
       900 + *   2. Cross-reference: map config pairs → attach matching DbService + mediaUrl                                                     
       901 + *   3. Pass resolved data down: all three layouts + FeaturedServicesSection                                                         
       902   *
       991 - * The pill nav uses `backdropFilter: "blur(12px)"` for a frosted-glass                                                              
       992 - * effect. Note: backdrop-filter is disabled in all other components per                                                             
       993 - * CLAUDE.md rule #1 (iOS WebKit breakage). The nav is the intentional                                                               
       994 - * exception — it is admin/dev-facing context where that tradeoff is acceptable.                                                     
       903 + * The pill nav uses `backdropFilter: "blur(12px)"` for a frosted-glass effect.                                                      
       904 + * Note: backdrop-filter is disabled in all other components per CLAUDE.md rule #1                                                   
       905 + * (iOS WebKit breakage). The nav is the intentional exception — it is                                                               
       906 + * admin/dev-facing context where that tradeoff is acceptable.                                                                       
       907   *
       996 - * @returns The full homepage: floating pill nav + active layout + booking pill.                                                     
       908 + * @returns The full homepage: floating pill nav + active layout + featured                                                          
       909 + *          services section + booking pill + visit/footer section.                                                                  
       910   */
       911  export default function HomePage() {
       999 -  // Single piece of state drives the entire layout system.                                                                          
      1000 -  // For rapid prototyping: change "cinematic" to lock a default on load.                                                            
      1001 -  // For production lock: remove useState, delete the pill nav, and render                                                           
      1002 -  // one layout component directly.                                                                                                  
       912    const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");
      1004 -  const [heroMediaUrl, setHeroMediaUrl] = useState<string | null>(null);                                                             
       913 +  const [featuredPairs, setFeaturedPairs] = useState<FeaturedPair[]>([]);                                                            
       914 +  const [allServices, setAllServices] = useState<DbService[]>([]);                                                                   
       915
       916 +  // WHY: Single parallel fetch resolves both allServices and featuredPairs so                                                       
       917 +  // every layout and FeaturedServicesSection share one network round-trip.                                                          
       918    useEffect(() => {
       919      let isMounted = true;
      1008 -    async function loadHomepageHeroMedia() {                                                                                         
       920 +    async function loadData() {                                                                                                      
       921        const supabase = createBrowserClient(
       922          process.env.NEXT_PUBLIC_SUPABASE_URL!,
       923          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       924        );
       925 +                                                                                                                                     
       926        try {
      1014 -        const featuredConfigRes = await supabase                                                                                     
      1015 -          .from("site_config")                                                                                                       
      1016 -          .select("value")                                                                                                           
      1017 -          .eq("key", "featured_services")                                                                                            
      1018 -          .single();                                                                                                                 
      1019 -        if (featuredConfigRes.error || !featuredConfigRes.data?.value) return;                                                       
      1020 -        const pairs = JSON.parse(featuredConfigRes.data.value) as Array<                                                             
       927 +        const [servicesRes, configRes] = await Promise.all([                                                                         
       928 +          supabase                                                                                                                   
       929 +            .from("services")                                                                                                        
       930 +            .select("*")                                                                                                             
       931 +            .eq("is_active", true)                                                                                                   
       932 +            .order("sort_order", { ascending: true }),                                                                               
       933 +          supabase                                                                                                                   
       934 +            .from("site_config")                                                                                                     
       935 +            .select("value")                                                                                                         
       936 +            .eq("key", "featured_services")                                                                                          
       937 +            .single(),                                                                                                               
       938 +        ]);                                                                                                                          
       939 +                                                                                                                                     
       940 +        if (!isMounted) return;                                                                                                      
       941 +                                                                                                                                     
       942 +        const services = servicesRes.data ?? [];                                                                                     
       943 +        setAllServices(services);                                                                                                    
       944 +                                                                                                                                     
       945 +        if (configRes.error || !configRes.data?.value) return;                                                                       
       946 +                                                                                                                                     
       947 +        const rawPairs = JSON.parse(configRes.data.value) as Array<                                                                  
       948            number | null | { serviceId: number | null; mediaUrl: string | null }
       949          >;
      1023 -        const firstPair = pairs.find((row) =>                                                                                        
      1024 -          typeof row === "object" && row !== null && Boolean(row.mediaUrl),                                                          
      1025 -        ) as { serviceId: number | null; mediaUrl: string | null } | undefined;                                                      
      1026 -        if (isMounted) setHeroMediaUrl(firstPair?.mediaUrl ?? null);                                                                 
       950 +        const serviceMap = new Map(services.map((s) => [s.id, s]));                                                                  
       951 +                                                                                                                                     
       952 +        // WHY: flatMap skips null serviceIds and unresolved service references                                                      
       953 +        // so featuredPairs only ever contains complete, live data.                                                                  
       954 +        const resolved: FeaturedPair[] = [0, 1, 2].flatMap((index) => {                                                              
       955 +          const row = rawPairs[index];                                                                                               
       956 +          const serviceId =                                                                                                          
       957 +            typeof row === "number" ? row : (row?.serviceId ?? null);                                                                
       958 +          const mediaUrl =                                                                                                           
       959 +            typeof row === "object" && row !== null ? (row.mediaUrl ?? null) : null;                                                 
       960 +          if (serviceId === null) return [];                                                                                         
       961 +          const service = serviceMap.get(serviceId);                                                                                 
       962 +          if (!service) return [];                                                                                                   
       963 +          return [{ serviceId, mediaUrl, service }];                                                                                 
       964 +        });                                                                                                                          
       965 +                                                                                                                                     
       966 +        if (isMounted) setFeaturedPairs(resolved);                                                                                   
       967        } catch {
      1028 -        if (isMounted) setHeroMediaUrl(null);                                                                                        
       968 +        // Fail silently — page renders with empty states; no user-facing error                                                      
       969 +        // needed since the public homepage degrades gracefully to GIF_URL fallback.                                                 
       970        }
       971      }
      1031 -    loadHomepageHeroMedia();                                                                                                         
       972 +                                                                                                                                     
       973 +    loadData();                                                                                                                      
       974      return () => {
       975        isMounted = false;
       976      };
     ...
       986            left: "50%",
       987            transform: "translateX(-50%)",
       988            background: "rgba(249,247,242,0.92)",
      1047 -          backdropFilter: "blur(12px)",         // intentional exception — see JSDoc                                                 
      1048 -          WebkitBackdropFilter: "blur(12px)",   // Safari prefix required alongside standard                                         
       989 +          backdropFilter: "blur(12px)",        // intentional exception — see JSDoc                                                  
       990 +          WebkitBackdropFilter: "blur(12px)",  // Safari prefix required alongside standard                                          
       991            border: "1px solid rgba(11,19,43,0.1)",
       992          }}
       993        >
     ...
      1020
      1021        {/* Conditional layout mount — only one component is in the DOM at a time.
      1022            Inactive layouts are fully unmounted (no hidden DOM, no opacity tricks). */}
      1081 -      {activeLayout === "cinematic" && <CinematicLayout heroMediaUrl={heroMediaUrl} />}                                              
      1082 -      {activeLayout === "grid"      && <GridLayout heroMediaUrl={heroMediaUrl} />}                                                   
      1083 -      {activeLayout === "editorial" && <EditorialLayout heroMediaUrl={heroMediaUrl} />}                                              
      1023 +      {activeLayout === "cinematic" && (                                                                                             
      1024 +        <CinematicLayout featuredPairs={featuredPairs} allServices={allServices} />                                                  
      1025 +      )}                                                                                                                             
      1026 +      {activeLayout === "grid" && (                                                                                                  
      1027 +        <GridLayout featuredPairs={featuredPairs} allServices={allServices} />                                                       
      1028 +      )}                                                                                                                             
      1029 +      {activeLayout === "editorial" && (                                                                                             
      1030 +        <EditorialLayout featuredPairs={featuredPairs} allServices={allServices} />                                                  
      1031 +      )}                                                                                                                             
      1032
      1085 -      <FeaturedServicesSection />                                                                                                    
      1033 +      {/* Global featured cards — rendered beneath every layout, data from unified fetch */}                                         
      1034 +      <FeaturedServicesSection featuredPairs={featuredPairs} />                                                                      
      1035
      1036        {/* BookNowPill floats above all layouts at z-50 */}
      1037        <BookNowPill />

● Now verify the file compiles cleanly by checking for type errors.

● Bash(npx tsc --noEmit --project tsconfig.json 2>&1 | head -60)                                                                                   ⎿  npm notice                                                                                                                                       npm notice New major version of npm available! 10.9.2 -> 11.13.0
     npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.13.0                                                                      
     … +2 lines (ctrl+o to expand)
                                                                                                                                                 
● Clean — no type errors. Let me do a final sanity read of the key sections to confirm the data pipeline and each layout's hero source look      
  correct.                                                                                                                                       
                                                                                                                                                   Searched for 1 pattern (ctrl+o to expand)                                                                                                      
                                                                                                                                                 
● Everything checks out. Here's a precise summary of every change made:                                                                          
                                                                                                                                                 
  ---                                                                                                                                            
  Deleted                                                                                                                                        
  - SERVICES static array (6 fake services with hardcoded prices/descriptions)                                                                     - FeaturedServicesSection's internal useState + useEffect + Supabase fetch                                                                     
  - heroMediaUrl state + loadHomepageHeroMedia effect in HomePage                                                                                

  Added
  - GIF_URL constant — the GitHub raw asset URL, used as the hero fallback across all three layouts when no featuredPairs[0].mediaUrl is
  available
  - FeaturedPair type — { serviceId, mediaUrl, service: DbService }
  - LayoutProps type — { featuredPairs, allServices } — shared contract for all layouts
  - isVideoMedia(url, mediaType) — single helper: returns true for .mp4 extension OR media_type === "video"; "gif" renders as <img>

  Updated — HomePage
  - Single Promise.all fetches services (active, ordered by sort_order) and site_config.featured_services in parallel
  - Cross-references config pairs → DbService via serviceMap, skipping null/unresolved slots with flatMap
  - Passes { featuredPairs, allServices } to all three layouts and <FeaturedServicesSection featuredPairs={featuredPairs} />

  Updated — layouts
  - CinematicLayout: hero = featuredPairs[0]?.mediaUrl ?? GIF_URL, isVideoMedia() selects <video> vs <img>
  - GridLayout: same hero logic; service grid maps allServices with i % 3 === 1 for dark card rhythm
  - EditorialLayout: same hero logic; price preview maps featuredPairs.slice(0, 3) (live names + prices); full menu maps allServices

  Updated — FeaturedServicesSection
  - Accepts { featuredPairs: FeaturedPair[] } prop only — no internal fetch
  - Maps featuredPairs directly; uses isVideoMedia(pair.mediaUrl, pair.service.media_type) to choose <video autoPlay muted loop playsInline> vs  
  <img>

✻ Crunched for 4m 45s    

※ recap: Wiring the public homepage to live Supabase data. Completed the data pipeline and layout refactor in page.tsx. Next: test the homepage    in the browser to confirm featured services render correctly. (disable recaps in /config)                                                      
                                                                                                                                                 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯                                                                                                           