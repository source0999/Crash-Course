      307 +    if (isVideoMedia(pair.mediaUrl, pair.service.media_type)) {                                                                       
      308 +      return (                                                                                                                        
      309 +        <video                                                                                                                        
      310 +          src={pair.mediaUrl}                                                                                                         
      311 +          autoPlay                                                                                                                    
      312 +          muted                                                                                                                       
      313 +          loop                                                                                                                        
      314 +          playsInline                                                                                                                 
      315 +          className={className}                                                                                                       
      316          />
      490 -        <div className="relative z-10 text-center px-6 flex flex-col items-center justify-end h-full pb-12">                          
      491 -          <h1                                                                                                                         
      492 -            className="font-light leading-tight text-white"                                                                           
      493 -            style={{                                                                                                                  
      494 -              fontFamily: "'Bodoni Moda', serif",                                                                                     
      495 -              fontSize: "clamp(2.5rem, 7vw, 5rem)",                                                                                   
      496 -            }}                                                                                                                        
      497 -          >                                                                                                                           
      498 -            Fades &amp; Facials                                                                                                       
      499 -          </h1>                                                                                                                       
      500 -          <p                                                                                                                          
      501 -            className="mt-3 uppercase tracking-[0.3em] text-xs"                                                                       
      502 -            style={{                                                                                                                  
      503 -              color: "rgba(249,247,242,0.65)",                                                                                        
      504 -              fontFamily: "'Manrope', sans-serif",                                                                                    
      505 -            }}                                                                                                                        
      506 -          >                                                                                                                           
      507 -            Luxury Grooming · Suwanee, Georgia                                                                                        
      508 -          </p>                                                                                                                        
      509 -        </div>                                                                                                                        
      510 -      </section>                                                                                                                      
      317 +      );                                                                                                                              
      318 +    }                                                                                                                                 
      319 +    return (                                                                                                                          
      320 +      <img                                                                                                                            
      321 +        src={pair.mediaUrl}                                                                                                           
      322 +        alt={pair.service.name}                                                                                                       
      323 +        className={className}                                                                                                         
      324 +      />                                                                                                                              
      325 +    );                                                                                                                                
      326 +  }                                                                                                                                   
      327
      512 -      <section className="px-5 py-20 max-w-7xl mx-auto">                                                                              
      513 -        <div className="text-center mb-14">                                                                                           
      514 -          <p                                                                                                                          
      515 -            className="uppercase tracking-[0.3em] text-xs mb-3"                                                                       
      516 -            style={{                                                                                                                  
      517 -              color: "rgba(11,19,43,0.4)",                                                                                            
      518 -              fontFamily: "'Manrope', sans-serif",                                                                                    
      519 -            }}                                                                                                                        
      520 -          >                                                                                                                           
      521 -            What We Offer                                                                                                             
      522 -          </p>                                                                                                                        
      523 -          <h2                                                                                                                         
      524 -            className="text-4xl md:text-5xl font-light"                                                                               
      525 -            style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                          
      526 -          >                                                                                                                           
      527 -            Our Services                                                                                                              
      528 -          </h2>                                                                                                                       
      529 -          <div                                                                                                                        
      530 -            className="mx-auto mt-5"                                                                                                  
      531 -            style={{                                                                                                                  
      532 -              width: "40px",                                                                                                          
      533 -              height: "1px",                                                                                                          
      534 -              background: "rgba(11,19,43,0.25)",                                                                                      
      535 -            }}                                                                                                                        
      536 -          />                                                                                                                          
      537 -        </div>                                                                                                                        
      328 +  const formatPrice = (price: string | number) =>                                                                                     
      329 +    typeof price === "number" ? `$${price}` : price;                                                                                  
      330
      539 -        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">                                                        
      540 -          {/* WHY: i % 3 === 1 reproduces the original alternating dark-card rhythm                                                   
      541 -              without a static `dark` flag — DB services have no such field. */}                                                      
      542 -          {allServices.map((s, i) => {                                                                                                
      543 -            const dark = i % 3 === 1;                                                                                                 
      544 -            return (                                                                                                                  
      331 +  switch (activeLayout) {                                                                                                             
      332 +    // ── Cinematic: alternating left/right full-bleed panels ──                                                                      
      333 +    case "cinematic":                                                                                                                 
      334 +      return (                                                                                                                        
      335 +        <section style={{ background: "#0B132B" }}>                                                                                   
      336 +          <div className="max-w-6xl mx-auto px-8 pt-16 pb-6">                                                                         
      337 +            <p                                                                                                                        
      338 +              className="text-[11px] uppercase tracking-[0.3em] mb-2"                                                                 
      339 +              style={{ color: "rgba(249,247,242,0.4)", fontFamily: "'Manrope', sans-serif" }}                                         
      340 +            >                                                                                                                         
      341 +              Featured Services                                                                                                       
      342 +            </p>                                                                                                                      
      343 +            <h2                                                                                                                       
      344 +              className="text-3xl md:text-4xl font-light"                                                                             
      345 +              style={{ fontFamily: "'Bodoni Moda', serif", color: "#F9F7F2" }}                                                        
      346 +            >                                                                                                                         
      347 +              Signature Menu                                                                                                          
      348 +            </h2>                                                                                                                     
      349 +          </div>                                                                                                                      
      350 +          {featuredPairs.map((pair, i) => (                                                                                           
      351 +            <div                                                                                                                      
      352 +              key={pair.serviceId}                                                                                                    
      353 +              // WHY: flex-col on mobile stacks media above text; md:flex-row-reverse                                                 
      354 +              // on odd indices creates the alternating left/right cinematic rhythm.                                                  
      355 +              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}                                      
      356 +            >                                                                                                                         
      357 +              {/* Media panel */}                                                                                                     
      358 +              <div className="relative w-full md:w-1/2 overflow-hidden" style={{ height: "55svh" }}>                                  
      359 +                <PairMedia                                                                                                            
      360 +                  pair={pair}                                                                                                         
      361 +                  className="absolute inset-0 w-full h-full object-cover"                                                             
      362 +                />                                                                                                                    
      363 +                <div                                                                                                                  
      364 +                  className="absolute inset-0"                                                                                        
      365 +                  style={{                                                                                                            
      366 +                    background:                                                                                                       
      367 +                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.5) 100%)",                                   
      368 +                  }}                                                                                                                  
      369 +                />                                                                                                                    
      370 +              </div>                                                                                                                  
      371 +              {/* Text panel */}                                                                                                      
      372                <div
      546 -                key={s.id}                                                                                                            
      547 -                className="group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"                                    
      548 -                style={{                                                                                                              
      549 -                  background: dark ? "#0B132B" : "#FFFFFF",                                                                           
      550 -                  border: dark ? "none" : "1px solid rgba(11,19,43,0.07)",                                                            
      551 -                  boxShadow: dark                                                                                                     
      552 -                    ? "0 8px 40px rgba(11,19,43,0.25)"                                                                                
      553 -                    : "0 2px 20px rgba(11,19,43,0.05)",                                                                               
      554 -                }}                                                                                                                    
      373 +                className="w-full md:w-1/2 flex flex-col justify-center px-10 py-14"                                                  
      374 +                style={{ background: "#0B132B" }}                                                                                     
      375                >
      376 +                <p                                                                                                                    
      377 +                  className="text-[11px] uppercase tracking-[0.35em] mb-4"                                                            
      378 +                  style={{ color: "rgba(249,247,242,0.35)", fontFamily: "'Manrope', sans-serif" }}                                    
      379 +                >                                                                                                                     
      380 +                  Featured                                                                                                            
      381 +                </p>                                                                                                                  
      382                  <h3
      557 -                  className="text-2xl font-light mb-3"                                                                                
      383 +                  className="font-light mb-4 leading-tight"                                                                           
      384                    style={{
      385                      fontFamily: "'Bodoni Moda', serif",
      560 -                    color: dark ? "#F9F7F2" : "#0B132B",                                                                              
      386 +                    fontSize: "clamp(2rem, 4vw, 3.5rem)",                                                                             
      387 +                    color: "#F9F7F2",                                                                                                 
      388                    }}
      389                  >
      563 -                  {s.name}                                                                                                            
      390 +                  {pair.service.name}                                                                                                 
      391                  </h3>
      392                  <p
      566 -                  className="text-sm leading-relaxed mb-8"                                                                            
      393 +                  className="text-sm leading-relaxed mb-8 max-w-sm"                                                                   
      394                    style={{
      568 -                    color: dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",                                                   
      395 +                    color: "rgba(249,247,242,0.55)",                                                                                  
      396                      fontFamily: "'Manrope', sans-serif",
      397                      fontWeight: 300,
      398                    }}
      399                  >
      573 -                  {s.description}                                                                                                     
      400 +                  {pair.service.description}                                                                                          
      401                  </p>
      402 +                <span                                                                                                                 
      403 +                  className="text-3xl font-light"                                                                                     
      404 +                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}                                                    
      405 +                >                                                                                                                     
      406 +                  {formatPrice(pair.service.price)}                                                                                   
      407 +                </span>                                                                                                               
      408 +              </div>                                                                                                                  
      409 +            </div>                                                                                                                    
      410 +          ))}                                                                                                                         
      411 +        </section>                                                                                                                    
      412 +      );                                                                                                                              
      413 +                                                                                                                                      
      414 +    // ── Grid: portrait luxury cards ──                                                                                              
      415 +    case "grid":                                                                                                                      
      416 +      return (                                                                                                                        
      417 +        <section style={{ background: "#F9F7F2" }} className="px-6 py-16">                                                            
      418 +          <div className="max-w-6xl mx-auto">                                                                                         
      419 +            <p                                                                                                                        
      420 +              className="text-[11px] uppercase tracking-[0.3em] mb-3"                                                                 
      421 +              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}                                            
      422 +            >                                                                                                                         
      423 +              Featured Services                                                                                                       
      424 +            </p>                                                                                                                      
      425 +            <h2                                                                                                                       
      426 +              className="text-3xl md:text-4xl font-light mb-10"                                                                       
      427 +              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                        
      428 +            >                                                                                                                         
      429 +              Signature Menu                                                                                                          
      430 +            </h2>                                                                                                                     
      431 +            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">                                                                   
      432 +              {featuredPairs.map((pair) => (                                                                                          
      433 +                <article                                                                                                              
      434 +                  key={pair.serviceId}                                                                                                
      435 +                  className="rounded-3xl overflow-hidden bg-white"                                                                    
      436 +                  style={{ boxShadow: "0 8px 40px rgba(11,19,43,0.1)" }}                                                              
      437 +                >                                                                                                                     
      438 +                  {/* Portrait media with bottom gradient overlay for name + price */}                                                
      439 +                  <div className="relative aspect-[3/4]">                                                                             
      440 +                    <PairMedia                                                                                                        
      441 +                      pair={pair}                                                                                                     
      442 +                      className="absolute inset-0 w-full h-full object-cover"                                                         
      443 +                    />                                                                                                                
      444 +                    <div                                                                                                              
      445 +                      className="absolute inset-0"                                                                                    
      446 +                      style={{                                                                                                        
      447 +                        background:                                                                                                   
      448 +                          "linear-gradient(to top, rgba(11,19,43,0.85) 0%, rgba(11,19,43,0.3) 50%, transparent 100%)",                
      449 +                      }}                                                                                                              
      450 +                    />                                                                                                                
      451 +                    <div className="absolute bottom-0 left-0 right-0 p-6">                                                            
      452 +                      <h3                                                                                                             
      453 +                        className="text-2xl font-light text-white mb-1"                                                               
      454 +                        style={{ fontFamily: "'Bodoni Moda', serif" }}                                                                
      455 +                      >                                                                                                               
      456 +                        {pair.service.name}                                                                                           
      457 +                      </h3>                                                                                                           
      458 +                      <span                                                                                                           
      459 +                        className="text-lg font-light"                                                                                
      460 +                        style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}                                              
      461 +                      >                                                                                                               
      462 +                        {formatPrice(pair.service.price)}                                                                             
      463 +                      </span>                                                                                                         
      464 +                    </div>                                                                                                            
      465 +                  </div>                                                                                                              
      466 +                  <div className="p-5">                                                                                               
      467 +                    <p                                                                                                                
      468 +                      className="text-sm"                                                                                             
      469 +                      style={{                                                                                                        
      470 +                        color: "rgba(11,19,43,0.6)",                                                                                  
      471 +                        fontFamily: "'Manrope', sans-serif",                                                                          
      472 +                        fontWeight: 300,                                                                                              
      473 +                      }}                                                                                                              
      474 +                    >                                                                                                                 
      475 +                      {pair.service.description}                                                                                      
      476 +                    </p>                                                                                                              
      477 +                  </div>                                                                                                              
      478 +                </article>                                                                                                            
      479 +              ))}                                                                                                                     
      480 +            </div>                                                                                                                    
      481 +          </div>                                                                                                                      
      482 +        </section>                                                                                                                    
      483 +      );                                                                                                                              
      484 +                                                                                                                                      
      485 +    // ── Editorial: magazine stack — full-width hero + 2-col strip ──                                                                
      486 +    case "editorial":                                                                                                                 
      487 +    default:                                                                                                                          
      488 +      return (                                                                                                                        
      489 +        <section style={{ background: "#F9F7F2" }} className="px-6 md:px-16 py-16">                                                   
      490 +          <div className="max-w-6xl mx-auto">                                                                                         
      491 +            <p                                                                                                                        
      492 +              className="text-[11px] uppercase tracking-[0.3em] mb-3"                                                                 
      493 +              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}                                            
      494 +            >                                                                                                                         
      495 +              Featured Services                                                                                                       
      496 +            </p>                                                                                                                      
      497 +            <h2                                                                                                                       
      498 +              className="text-3xl md:text-4xl font-light mb-8"                                                                        
      499 +              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                        
      500 +            >                                                                                                                         
      501 +              Signature Menu                                                                                                          
      502 +            </h2>                                                                                                                     
      503 +                                                                                                                                      
      504 +            {/* Slot 0 — full-width hero */}                                                                                          
      505 +            {featuredPairs[0] && (                                                                                                    
      506 +              <div                                                                                                                    
      507 +                className="relative w-full overflow-hidden rounded-3xl mb-5"                                                          
      508 +                style={{ minHeight: "60svh" }}                                                                                        
      509 +              >                                                                                                                       
      510 +                <PairMedia                                                                                                            
      511 +                  pair={featuredPairs[0]}                                                                                             
      512 +                  className="absolute inset-0 w-full h-full object-cover"                                                             
      513 +                />                                                                                                                    
      514                  <div
      576 -                  className="flex justify-between items-end pt-5"                                                                     
      515 +                  className="absolute inset-0"                                                                                        
      516                    style={{
      578 -                    borderTop: `1px solid ${dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,                                
      517 +                    background:                                                                                                       
      518 +                      "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",                                  
      519                    }}
      580 -                >                                                                                                                     
      581 -                  <span                                                                                                               
      582 -                    className="text-2xl font-light"                                                                                   
      520 +                />                                                                                                                    
      521 +                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">                         
      522 +                  <p                                                                                                                  
      523 +                    className="text-[11px] uppercase tracking-[0.35em] mb-4"                                                          
      524 +                    style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}                                   
      525 +                  >                                                                                                                   
      526 +                    01                                                                                                                
      527 +                  </p>                                                                                                                
      528 +                  <h3                                                                                                                 
      529 +                    className="font-light text-white mb-4 leading-tight"                                                              
      530                      style={{
      531                        fontFamily: "'Bodoni Moda', serif",
      585 -                      color: dark ? "#F9F7F2" : "#0B132B",                                                                            
      532 +                      fontSize: "clamp(2.5rem, 6vw, 5rem)",                                                                           
      533                      }}
      534                    >
      588 -                    {typeof s.price === "number" ? `$${s.price}` : s.price}                                                           
      589 -                  </span>                                                                                                             
      535 +                    {featuredPairs[0].service.name}                                                                                   
      536 +                  </h3>                                                                                                               
      537                    <span
      591 -                    className="text-xs uppercase tracking-widest"                                                                     
      592 -                    style={{                                                                                                          
      593 -                      color: dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",                                                 
      594 -                      fontFamily: "'Manrope', sans-serif",                                                                            
      595 -                    }}                                                                                                                
      538 +                    className="text-2xl font-light"                                                                                   
      539 +                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}                                                  
      540                    >
      597 -                    {s.duration ?? ""}                                                                                                
      541 +                    {formatPrice(featuredPairs[0].service.price)}                                                                     
      542                    </span>
      543                  </div>
      544                </div>
      601 -            );                                                                                                                        
      602 -          })}                                                                                                                         
      603 -        </div>                                                                                                                        
      604 -      </section>                                                                                                                      
      605 -    </main>                                                                                                                           
      606 -  );                                                                                                                                  
      545 +            )}                                                                                                                        
      546 +                                                                                                                                      
      547 +            {/* Slots 1 & 2 — CRITICAL: grid-cols-1 on mobile, md:grid-cols-2 on desktop */}                                          
      548 +            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">                                                                   
      549 +              {featuredPairs.slice(1, 3).map((pair, i) => (                                                                           
      550 +                <div                                                                                                                  
      551 +                  key={pair.serviceId}                                                                                                
      552 +                  className="relative overflow-hidden rounded-3xl"                                                                    
      553 +                  style={{ minHeight: "40svh" }}                                                                                      
      554 +                >                                                                                                                     
      555 +                  <PairMedia                                                                                                          
      556 +                    pair={pair}                                                                                                       
      557 +                    className="absolute inset-0 w-full h-full object-cover"                                                           
      558 +                  />                                                                                                                  
      559 +                  <div                                                                                                                
      560 +                    className="absolute inset-0"                                                                                      
      561 +                    style={{                                                                                                          
      562 +                      background:                                                                                                     
      563 +                        "linear-gradient(to bottom, rgba(11,19,43,0.2) 0%, rgba(11,19,43,0.65) 100%)",                                
      564 +                    }}                                                                                                                
      565 +                  />                                                                                                                  
      566 +                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">                       
      567 +                    <p                                                                                                                
      568 +                      className="text-[11px] uppercase tracking-[0.35em] mb-3"                                                        
      569 +                      style={{ color: "rgba(249,247,242,0.5)", fontFamily: "'Manrope', sans-serif" }}                                 
      570 +                    >                                                                                                                 
      571 +                      {String(i + 2).padStart(2, "0")}                                                                                
      572 +                    </p>                                                                                                              
      573 +                    <h3                                                                                                               
      574 +                      className="font-light text-white mb-3 leading-tight"                                                            
      575 +                      style={{                                                                                                        
      576 +                        fontFamily: "'Bodoni Moda', serif",                                                                           
      577 +                        fontSize: "clamp(1.5rem, 3vw, 2.5rem)",                                                                       
      578 +                      }}                                                                                                              
      579 +                    >                                                                                                                 
      580 +                      {pair.service.name}                                                                                             
      581 +                    </h3>                                                                                                             
      582 +                    <span                                                                                                             
      583 +                      className="text-xl font-light"                                                                                  
      584 +                      style={{ fontFamily: "'Bodoni Moda', serif", color: "#7E9A7E" }}                                                
      585 +                    >                                                                                                                 
      586 +                      {formatPrice(pair.service.price)}                                                                               
      587 +                    </span>                                                                                                           
      588 +                  </div>                                                                                                              
      589 +                </div>                                                                                                                
      590 +              ))}                                                                                                                     
      591 +            </div>                                                                                                                    
      592 +          </div>                                                                                                                      
      593 +        </section>                                                                                                                    
      594 +      );                                                                                                                              
      595 +  }                                                                                                                                   
      596  }
      597
      598  // ─────────────────────────────────────────
      610 -// SECTION: EditorialLayout                                                                                                           
      611 -// WHAT: Split-screen hero with a magazine-style service menu below.                                                                  
      612 -// WHY: Targets users who respond to luxury editorial aesthetics — feels                                                              
      613 -//   closer to a high-end print menu than a website.                                                                                  
      614 -// PHASE 4: featuredPairs drives the price preview strip; allServices drives                                                          
      615 -//   the full menu list. Both replace the old static SERVICES array.                                                                  
      599 +// SECTION: GridLayout                                                                                                                
      600 +// WHAT: Pure service grid in the alabaster light palette.                                                                            
      601 +// WHY: Hero hoisted to GlobalHero; featured slots hoisted to FeaturedServicesSection.                                                
      602 +//   This component renders only the "Our Services" catalogue grid.                                                                   
      603 +// PHASE 4: allServices from DB replaces the old static SERVICES array.                                                               
      604  // ─────────────────────────────────────────
      617 -                                                                                                                                      
      618 -/**                                                                                                                                   
      619 - * EditorialLayout                                                                                                                    
      620 - *                                                                                                                                    
      621 - * A two-column split-screen hero (text left, image right) followed by a                                                              
      622 - * typographic service list. The service rows use `hover:bg-white hover:-mx-6                                                         
      623 - * hover:px-6` to create an "expanding highlight" effect on hover.                                                                    
      624 - *                                                                                                                                    
      625 - * Hero right-panel media: featuredPairs[0].mediaUrl ?? GIF_URL.                                                                      
      626 - * Price preview strip: up to 3 entries from featuredPairs (live DB data).                                                            
      627 - * Full menu: allServices mapped directly from the services table.                                                                    
      628 - *                                                                                                                                    
      629 - * @returns An editorial split-screen page with typographic service menu                                                              
      630 - *          and location section below.                                                                                               
      631 - */                                                                                                                                   
      632 -function EditorialLayout({ featuredPairs, allServices }: LayoutProps) {                                                               
      633 -  const heroUrl = featuredPairs[0]?.mediaUrl ?? GIF_URL;                                                                              
      634 -  const heroMediaType = featuredPairs[0]?.service.media_type;                                                                         
      635 -  // Up to 3 preview entries — fewer are fine if less than 3 featured pairs exist.                                                    
      636 -  const previewPairs = featuredPairs.slice(0, 3);                                                                                     
      637 -                                                                                                                                      
      605 +function GridLayout({ allServices }: LayoutProps) {                                                                                   
      606    return (
      639 -    <main style={{ background: "#F9F7F2", color: "#0B132B" }}>                                                                        
      640 -      <section className="min-h-[100svh] grid grid-cols-1 md:grid-cols-2">                                                            
      641 -        {/* Left panel — text content */}                                                                                             
      642 -        <div                                                                                                                          
      643 -          className="flex flex-col justify-end px-8 md:px-16 py-20 order-2 md:order-1"                                                
      644 -          style={{ borderRight: "1px solid rgba(11,19,43,0.1)" }}                                                                     
      607 +    <section className="px-5 py-20 max-w-7xl mx-auto" style={{ background: "#F9F7F2" }}>                                              
      608 +      <div className="text-center mb-14">                                                                                             
      609 +        <p                                                                                                                            
      610 +          className="uppercase tracking-[0.3em] text-xs mb-3"                                                                         
      611 +          style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}                                                
      612          >
      646 -          <div className="flex items-center gap-4 mb-12">                                                                             
      647 -            <div style={{ width: "32px", height: "1px", background: "rgba(11,19,43,0.3)" }} />                                        
      648 -            <p                                                                                                                        
      649 -              className="uppercase tracking-[0.35em] text-xs"                                                                         
      650 -              style={{ color: "rgba(11,19,43,0.45)", fontFamily: "'Manrope', sans-serif" }}                                           
      651 -            >                                                                                                                         
      652 -              Est. Cumming, Georgia                                                                                                   
      653 -            </p>                                                                                                                      
      654 -          </div>                                                                                                                      
      613 +          What We Offer                                                                                                               
      614 +        </p>                                                                                                                          
      615 +        <h2                                                                                                                           
      616 +          className="text-4xl md:text-5xl font-light"                                                                                 
      617 +          style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                            
      618 +        >                                                                                                                             
      619 +          Our Services                                                                                                                
      620 +        </h2>                                                                                                                         
      621 +        <div                                                                                                                          
      622 +          className="mx-auto mt-5"                                                                                                    
      623 +          style={{ width: "40px", height: "1px", background: "rgba(11,19,43,0.25)" }}                                                 
      624 +        />                                                                                                                            
      625 +      </div>                                                                                                                          
      626
      656 -          {/* clamp() fluid type: 56px mobile → 104px desktop */}                                                                     
      657 -          <h1                                                                                                                         
      658 -            className="font-light leading-[0.92] mb-8"                                                                                
      659 -            style={{                                                                                                                  
      660 -              fontFamily: "'Bodoni Moda', serif",                                                                                     
      661 -              fontSize: "clamp(3.5rem, 7vw, 6.5rem)",                                                                                 
      662 -              color: "#0B132B",                                                                                                       
      663 -            }}                                                                                                                        
      664 -          >                                                                                                                           
      665 -            Fades                                                                                                                     
      666 -            <br />                                                                                                                    
      667 -            &amp;                                                                                                                     
      668 -            <br />                                                                                                                    
      669 -            <em style={{ fontStyle: "italic" }}>Facials.</em>                                                                         
      670 -          </h1>                                                                                                                       
      671 -                                                                                                                                      
      672 -          <p                                                                                                                          
      673 -            className="text-sm leading-loose mb-10 max-w-xs"                                                                          
      674 -            style={{                                                                                                                  
      675 -              color: "rgba(11,19,43,0.55)",                                                                                           
      676 -              fontFamily: "'Manrope', sans-serif",                                                                                    
      677 -              fontWeight: 300,                                                                                                        
      678 -            }}                                                                                                                        
      679 -          >                                                                                                                           
      680 -            Where the precision of a master barber meets the serenity of a luxury spa. Every visit is intentional.                    
      681 -          </p>                                                                                                                        
      682 -                                                                                                                                      
      683 -          <div                                                                                                                        
      684 -            className="w-full mb-10"                                                                                                  
      685 -            style={{ height: "1px", background: "rgba(11,19,43,0.1)" }}                                                               
      686 -          />                                                                                                                          
      687 -                                                                                                                                      
      688 -          {/* Price preview — up to 3 featured services from DB, not hardcoded */}                                                    
      689 -          {previewPairs.length > 0 && (                                                                                               
      627 +      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">                                                          
      628 +        {/* WHY: i % 3 === 1 reproduces alternating dark-card rhythm without a                                                        
      629 +            static `dark` flag — DB services have no such column. */}                                                                 
      630 +        {allServices.map((s, i) => {                                                                                                  
      631 +          const dark = i % 3 === 1;                                                                                                   
      632 +          return (                                                                                                                    
      633              <div
      691 -              className="grid grid-cols-3 gap-4"                                                                                      
      692 -              style={{ fontFamily: "'Manrope', sans-serif" }}                                                                         
      634 +              key={s.id}                                                                                                              
      635 +              className="group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2"                                      
      636 +              style={{                                                                                                                
      637 +                background: dark ? "#0B132B" : "#FFFFFF",                                                                             
      638 +                border: dark ? "none" : "1px solid rgba(11,19,43,0.07)",                                                              
      639 +                boxShadow: dark                                                                                                       
      640 +                  ? "0 8px 40px rgba(11,19,43,0.25)"                                                                                  
      641 +                  : "0 2px 20px rgba(11,19,43,0.05)",                                                                                 
      642 +              }}                                                                                                                      
      643              >
      694 -              {previewPairs.map((pair) => (                                                                                           
      695 -                <div key={pair.serviceId} className="flex flex-col gap-1">                                                            
      696 -                  <span                                                                                                               
      697 -                    className="text-lg font-light"                                                                                    
      698 -                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                  
      699 -                  >                                                                                                                   
      700 -                    {typeof pair.service.price === "number"                                                                           
      701 -                      ? `$${pair.service.price}`                                                                                      
      702 -                      : pair.service.price}                                                                                           
      703 -                  </span>                                                                                                             
      704 -                  <span                                                                                                               
      705 -                    className="text-xs uppercase tracking-widest leading-tight"                                                       
      706 -                    style={{ color: "rgba(11,19,43,0.4)" }}                                                                           
      707 -                  >                                                                                                                   
      708 -                    {pair.service.name}                                                                                               
      709 -                  </span>                                                                                                             
      710 -                </div>                                                                                                                
      711 -              ))}                                                                                                                     
      644 +              <h3                                                                                                                     
      645 +                className="text-2xl font-light mb-3"                                                                                  
      646 +                style={{                                                                                                              
      647 +                  fontFamily: "'Bodoni Moda', serif",                                                                                 
      648 +                  color: dark ? "#F9F7F2" : "#0B132B",                                                                                
      649 +                }}                                                                                                                    
      650 +              >                                                                                                                       
      651 +                {s.name}                                                                                                              
      652 +              </h3>                                                                                                                   
      653 +              <p                                                                                                                      
      654 +                className="text-sm leading-relaxed mb-8"                                                                              
      655 +                style={{                                                                                                              
      656 +                  color: dark ? "rgba(249,247,242,0.55)" : "rgba(11,19,43,0.55)",                                                     
      657 +                  fontFamily: "'Manrope', sans-serif",                                                                                
      658 +                  fontWeight: 300,                                                                                                    
      659 +                }}                                                                                                                    
      660 +              >                                                                                                                       
      661 +                {s.description}                                                                                                       
      662 +              </p>                                                                                                                    
      663 +              <div                                                                                                                    
      664 +                className="flex justify-between items-end pt-5"                                                                       
      665 +                style={{                                                                                                              
      666 +                  borderTop: `1px solid ${dark ? "rgba(249,247,242,0.12)" : "rgba(11,19,43,0.08)"}`,                                  
      667 +                }}                                                                                                                    
      668 +              >                                                                                                                       
      669 +                <span                                                                                                                 
      670 +                  className="text-2xl font-light"                                                                                     
      671 +                  style={{                                                                                                            
      672 +                    fontFamily: "'Bodoni Moda', serif",                                                                               
      673 +                    color: dark ? "#F9F7F2" : "#0B132B",                                                                              
      674 +                  }}                                                                                                                  
      675 +                >                                                                                                                     
      676 +                  {typeof s.price === "number" ? `$${s.price}` : s.price}                                                             
      677 +                </span>                                                                                                               
      678 +                <span                                                                                                                 
      679 +                  className="text-xs uppercase tracking-widest"                                                                       
      680 +                  style={{                                                                                                            
      681 +                    color: dark ? "rgba(249,247,242,0.35)" : "rgba(11,19,43,0.35)",                                                   
      682 +                    fontFamily: "'Manrope', sans-serif",                                                                              
      683 +                  }}                                                                                                                  
      684 +                >                                                                                                                     
      685 +                  {s.duration ?? ""}                                                                                                  
      686 +                </span>                                                                                                               
      687 +              </div>                                                                                                                  
      688              </div>
      713 -          )}                                                                                                                          
      714 -        </div>                                                                                                                        
      689 +          );                                                                                                                          
      690 +        })}                                                                                                                           
      691 +      </div>                                                                                                                          
      692 +    </section>                                                                                                                        
      693 +  );                                                                                                                                  
      694 +}                                                                                                                                     
      695
      716 -        {/* Right panel — media */}                                                                                                   
      717 -        <div className="relative overflow-hidden order-1 md:order-2" style={{ minHeight: "55svh" }}>                                  
      718 -          {isVideoMedia(heroUrl, heroMediaType) ? (                                                                                   
      719 -            <video                                                                                                                    
      720 -              src={heroUrl}                                                                                                           
      721 -              autoPlay                                                                                                                
      722 -              muted                                                                                                                   
      723 -              loop                                                                                                                    
      724 -              playsInline                                                                                                             
      725 -              className="absolute inset-0 w-full h-full object-cover"                                                                 
      726 -              style={{ objectPosition: "top center" }}                                                                                
      727 -            />                                                                                                                        
      728 -          ) : (                                                                                                                       
      729 -            <img                                                                                                                      
      730 -              src={heroUrl}                                                                                                           
      731 -              alt="Fades and Facials craft"                                                                                           
      732 -              className="absolute inset-0 w-full h-full object-cover"                                                                 
      733 -              style={{ objectPosition: "top center" }}                                                                                
      734 -            />                                                                                                                        
      735 -          )}                                                                                                                          
      736 -          <div                                                                                                                        
      737 -            className="absolute inset-0"                                                                                              
      696 +// ─────────────────────────────────────────                                                                                          
      697 +// SECTION: EditorialLayout                                                                                                           
      698 +// WHAT: Magazine-style typographic service menu.                                                                                     
      699 +// WHY: Hero and featured slots hoisted; this component is a pure service list.                                                       
      700 +//   The "expanding row" hover effect and ghost watermark number are kept intact.                                                     
      701 +// PHASE 4: allServices from DB.                                                                                                      
      702 +// ─────────────────────────────────────────                                                                                          
      703 +function EditorialLayout({ allServices }: LayoutProps) {                                                                              
      704 +  return (                                                                                                                            
      705 +    <section                                                                                                                          
      706 +      className="px-8 md:px-16 py-24"                                                                                                 
      707 +      style={{ background: "#F9F7F2", borderTop: "1px solid rgba(11,19,43,0.1)" }}                                                    
      708 +    >                                                                                                                                 
      709 +      <div className="max-w-6xl mx-auto">                                                                                             
      710 +        <div className="flex items-start gap-8 mb-16">                                                                                
      711 +          <span                                                                                                                       
      712 +            className="text-8xl md:text-9xl font-light leading-none"                                                                  
      713              style={{
      739 -              background:                                                                                                             
      740 -                "linear-gradient(to bottom, rgba(11,19,43,0.15) 0%, transparent 40%)",                                                
      714 +              fontFamily: "'Bodoni Moda', serif",                                                                                     
      715 +              // 6% ink opacity renders as a watermark — purely decorative                                                            
      716 +              color: "rgba(11,19,43,0.06)",                                                                                           
      717              }}
      742 -          />                                                                                                                          
      743 -          {/* Pull quote anchored to bottom-right of the image panel */}                                                              
      744 -          <div                                                                                                                        
      745 -            className="absolute bottom-8 right-8 text-right max-w-[200px]"                                                            
      718            >
      719 +            01                                                                                                                        
      720 +          </span>                                                                                                                     
      721 +          <div className="pt-4">                                                                                                      
      722              <p
      748 -              className="text-sm italic leading-relaxed"                                                                              
      749 -              style={{                                                                                                                
      750 -                color: "rgba(249,247,242,0.9)",                                                                                       
      751 -                fontFamily: "'Bodoni Moda', serif",                                                                                   
      752 -                textShadow: "0 1px 8px rgba(0,0,0,0.5)",                                                                              
      753 -              }}                                                                                                                      
      723 +              className="uppercase tracking-[0.3em] text-xs mb-2"                                                                     
      724 +              style={{ color: "rgba(11,19,43,0.4)", fontFamily: "'Manrope', sans-serif" }}                                            
      725              >
      755 -              &ldquo;A quiet room. A precise cut.&rdquo;                                                                              
      726 +              The Menu                                                                                                                
      727              </p>
      728 +            <h2                                                                                                                       
      729 +              className="text-4xl md:text-5xl font-light"                                                                             
      730 +              style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                        
      731 +            >                                                                                                                         
      732 +              Our Services                                                                                                            
      733 +            </h2>                                                                                                                     
      734            </div>
      735          </div>
      759 -      </section>                                                                                                                      
      736
      761 -      {/* Full service menu — editorial typographic list */}                                                                          
      762 -      <section                                                                                                                        
      763 -        className="px-8 md:px-16 py-24"                                                                                               
      764 -        style={{ borderTop: "1px solid rgba(11,19,43,0.1)" }}                                                                         
      765 -      >                                                                                                                               
      766 -        <div className="max-w-6xl mx-auto">                                                                                           
      767 -          {/* Section heading with ghost number watermark */}                                                                         
      768 -          <div className="flex items-start gap-8 mb-16">                                                                              
      769 -            <span                                                                                                                     
      770 -              className="text-8xl md:text-9xl font-light leading-none"                                                                
      737 +        <div className="space-y-0">                                                                                                   
      738 +          {allServices.map((s, i) => (                                                                                                
      739 +            <div                                                                                                                      
      740 +              key={s.id}                                                                                                              
      741 +              // hover:-mx-6 + hover:px-6 creates an "expanding" row that fills                                                       
      742 +              // into the gutter — no height change means no layout shift.                                                            
      743 +              className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300 ho       
          +ver:bg-white hover:px-6 hover:rounded-2xl hover:-mx-6"                                                                                
      744                style={{
      772 -                fontFamily: "'Bodoni Moda', serif",                                                                                   
      773 -                // 6% ink opacity renders as a watermark — purely decorative                                                          
      774 -                color: "rgba(11,19,43,0.06)",                                                                                         
      745 +                borderBottom:                                                                                                         
      746 +                  i < allServices.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",                                              
      747                }}
      748              >
      777 -              01                                                                                                                      
      778 -            </span>                                                                                                                   
      779 -            <div className="pt-4">                                                                                                    
      749 +              <div>                                                                                                                   
      750 +                <h3                                                                                                                   
      751 +                  className="text-xl font-light"                                                                                      
      752 +                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                    
      753 +                >                                                                                                                     
      754 +                  {s.name}                                                                                                            
      755 +                </h3>                                                                                                                 
      756 +                <p                                                                                                                    
      757 +                  className="text-xs uppercase tracking-widest mt-1"                                                                  
      758 +                  style={{ color: "rgba(11,19,43,0.35)", fontFamily: "'Manrope', sans-serif" }}                                       
      759 +                >                                                                                                                     
      760 +                  {s.duration ?? ""}                                                                                                  
      761 +                </p>                                                                                                                  
      762 +              </div>                                                                                                                  
      763                <p
      781 -                className="uppercase tracking-[0.3em] text-xs mb-2"                                                                   
      764 +                className="text-sm leading-relaxed self-center"                                                                       
      765                  style={{
      783 -                  color: "rgba(11,19,43,0.4)",                                                                                        
      766 +                  color: "rgba(11,19,43,0.55)",                                                                                       
      767                    fontFamily: "'Manrope', sans-serif",
      768 +                  fontWeight: 300,                                                                                                    
      769                  }}
      770                >
      787 -                The Menu                                                                                                              
      771 +                {s.description}                                                                                                       
      772                </p>
      789 -              <h2                                                                                                                     
      790 -                className="text-4xl md:text-5xl font-light"                                                                           
      791 -                style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                      
      792 -              >                                                                                                                       
      793 -                Our Services                                                                                                          
      794 -              </h2>                                                                                                                   
      795 -            </div>                                                                                                                    
      796 -          </div>                                                                                                                      
      797 -                                                                                                                                      
      798 -          <div className="space-y-0">                                                                                                 
      799 -            {allServices.map((s, i) => (                                                                                              
      800 -              <div                                                                                                                    
      801 -                key={s.id}                                                                                                            
      802 -                // hover:-mx-6 + hover:px-6 creates an "expanding" row effect                                                         
      803 -                // that fills into the gutter. No height change = no layout shift.                                                    
      804 -                className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-12 py-7 transition-all duration-300        
          -hover:bg-white hover:px-6 hover:rounded-2xl hover:-mx-6"                                                                              
      805 -                style={{                                                                                                              
      806 -                  borderBottom:                                                                                                       
      807 -                    i < allServices.length - 1 ? "1px solid rgba(11,19,43,0.08)" : "none",                                            
      808 -                }}                                                                                                                    
      809 -              >                                                                                                                       
      810 -                <div>                                                                                                                 
      811 -                  <h3                                                                                                                 
      812 -                    className="text-xl font-light"                                                                                    
      813 -                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                  
      814 -                  >                                                                                                                   
      815 -                    {s.name}                                                                                                          
      816 -                  </h3>                                                                                                               
      817 -                  <p                                                                                                                  
      818 -                    className="text-xs uppercase tracking-widest mt-1"                                                                
      819 -                    style={{                                                                                                          
      820 -                      color: "rgba(11,19,43,0.35)",                                                                                   
      821 -                      fontFamily: "'Manrope', sans-serif",                                                                            
      822 -                    }}                                                                                                                
      823 -                  >                                                                                                                   
      824 -                    {s.duration ?? ""}                                                                                                
      825 -                  </p>                                                                                                                
      826 -                </div>                                                                                                                
      827 -                <p                                                                                                                    
      828 -                  className="text-sm leading-relaxed self-center"                                                                     
      829 -                  style={{                                                                                                            
      830 -                    color: "rgba(11,19,43,0.55)",                                                                                     
      831 -                    fontFamily: "'Manrope', sans-serif",                                                                              
      832 -                    fontWeight: 300,                                                                                                  
      833 -                  }}                                                                                                                  
      773 +              <div className="self-center">                                                                                           
      774 +                <span                                                                                                                 
      775 +                  className="text-2xl font-light"                                                                                     
      776 +                  style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                    
      777                  >
      835 -                  {s.description}                                                                                                     
      836 -                </p>                                                                                                                  
      837 -                <div className="self-center">                                                                                         
      838 -                  <span                                                                                                               
      839 -                    className="text-2xl font-light"                                                                                   
      840 -                    style={{ fontFamily: "'Bodoni Moda', serif", color: "#0B132B" }}                                                  
      841 -                  >                                                                                                                   
      842 -                    {typeof s.price === "number" ? `$${s.price}` : s.price}                                                           
      843 -                  </span>                                                                                                             
      844 -                </div>                                                                                                                
      778 +                  {typeof s.price === "number" ? `$${s.price}` : s.price}                                                             
      779 +                </span>                                                                                                               
      780                </div>
      846 -            ))}                                                                                                                       
      847 -          </div>                                                                                                                      
      781 +            </div>                                                                                                                    
      782 +          ))}                                                                                                                         
      783          </div>
      849 -      </section>                                                                                                                      
      850 -    </main>                                                                                                                           
      784 +      </div>                                                                                                                          
      785 +    </section>                                                                                                                        
      786    );
      787  }
      788
      789  // ─────────────────────────────────────────
      855 -// SECTION: Layout Switcher Types & Registry                                                                                          
      856 -// WHAT: The type contract and data registry that power the layout toggler.                                                           
      857 -// WHY: Keeping these at module scope (not inside the component) means they                                                           
      858 -//   are defined once and never re-created on re-render.                                                                              
      790 +// SECTION: Layout Registry                                                                                                           
      791 +// WHAT: Data registry that drives the floating pill nav.                                                                             
      792 +// WHY: Adding a new layout requires only one entry here — the nav renders itself                                                     
      793 +//   by mapping over this array. Never hardcode individual buttons.                                                                   
      794  // PHASE 4: No changes needed.
      795  // ─────────────────────────────────────────
      861 -                                                                                                                                      
      862 -/**                                                                                                                                   
      863 - * Union type for all valid layout identifiers.                                                                                       
      864 - *                                                                                                                                    
      865 - * TypeScript will error on unknown layout strings — typos like "cinematc"                                                            
      866 - * are caught at build time. To add a layout: add a literal here, a matching                                                          
      867 - * entry in LAYOUTS, and a conditional render in HomePage.                                                                            
      868 - */                                                                                                                                   
      869 -type Layout = "cinematic" | "grid" | "editorial";                                                                                     
      870 -                                                                                                                                      
      871 -/**                                                                                                                                   
      872 - * The layout registry — the single place where layouts are registered.                                                               
      873 - *                                                                                                                                    
      874 - * The floating pill nav renders itself by mapping over this array.                                                                   
      875 - * Never hardcode individual nav buttons — always extend this array instead.                                                          
      876 - */                                                                                                                                   
      796  const LAYOUTS: { id: Layout; label: string; icon: string }[] = [
      797    { id: "cinematic", label: "Cinematic", icon: "◈" },
      798    { id: "grid",      label: "Grid",      icon: "⊞" },
     ...
      801
      802  // ─────────────────────────────────────────
      803  // SECTION: HomePage (Page Entry Point)
      885 -// WHAT: Root page component — fetches all service data once, renders the                                                             
      886 -//   floating layout switcher, active layout, featured section, and footer.                                                           
      887 -// WHY: Single fetch point prevents redundant round-trips — featuredPairs and                                                         
      888 -//   allServices are computed here and passed down as props to every consumer.                                                        
      804 +// WHAT: Root component — owns all data fetching and the Global Identity Layer.                                                       
      805 +// WHY: Single fetch point (services + featured_services config) resolves both                                                        
      806 +//   featuredPairs and allServices, passed down with no redundant round-trips.                                                        
      807 +//   GlobalHero is rendered statically here so it never re-mounts on layout switch.                                                   
      808  // PHASE 4: No changes needed — already wired to live Supabase tables.
      809  // ─────────────────────────────────────────
      891 -                                                                                                                                      
      892 -/**                                                                                                                                   
      893 - * HomePage                                                                                                                           
      894 - *                                                                                                                                    
      895 - * The root page component for `/`. Owns the layout switcher state and the                                                            
      896 - * single unified data fetch that resolves both `allServices` and `featuredPairs`.                                                    
      897 - *                                                                                                                                    
      898 - * Data pipeline:                                                                                                                     
      899 - *   1. Parallel fetch: services table (active, ordered) + site_config featured_services key                                          
      900 - *   2. Cross-reference: map config pairs → attach matching DbService + mediaUrl                                                      
      901 - *   3. Pass resolved data down: all three layouts + FeaturedServicesSection                                                          
      902 - *                                                                                                                                    
      903 - * The pill nav uses `backdropFilter: "blur(12px)"` for a frosted-glass effect.                                                       
      904 - * Note: backdrop-filter is disabled in all other components per CLAUDE.md rule #1                                                    
      905 - * (iOS WebKit breakage). The nav is the intentional exception — it is                                                                
      906 - * admin/dev-facing context where that tradeoff is acceptable.                                                                        
      907 - *                                                                                                                                    
      908 - * @returns The full homepage: floating pill nav + active layout + featured                                                           
      909 - *          services section + booking pill + visit/footer section.                                                                   
      910 - */                                                                                                                                   
      810  export default function HomePage() {
      811    const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");
      812    const [featuredPairs, setFeaturedPairs] = useState<FeaturedPair[]>([]);
      813    const [allServices, setAllServices] = useState<DbService[]>([]);
      814
      916 -  // WHY: Single parallel fetch resolves both allServices and featuredPairs so                                                        
      917 -  // every layout and FeaturedServicesSection share one network round-trip.                                                           
      815 +  // WHY: Single parallel fetch resolves both allServices and featuredPairs —                                                         
      816 +  // every downstream consumer shares one network round-trip.                                                                         
      817    useEffect(() => {
      818      let isMounted = true;
      819      async function loadData() {
     ...
      821          process.env.NEXT_PUBLIC_SUPABASE_URL!,
      822          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      823        );
      925 -                                                                                                                                      
      824        try {
      825          const [servicesRes, configRes] = await Promise.all([
      826            supabase
     ...
      847          >;
      848          const serviceMap = new Map(services.map((s) => [s.id, s]));
      849
      952 -        // WHY: flatMap skips null serviceIds and unresolved service references                                                       
      953 -        // so featuredPairs only ever contains complete, live data.                                                                   
      850 +        // WHY: flatMap skips null serviceIds and unresolved references so                                                            
      851 +        // featuredPairs only ever contains complete, live data.                                                                      
      852          const resolved: FeaturedPair[] = [0, 1, 2].flatMap((index) => {
      853            const row = rawPairs[index];
      956 -          const serviceId =                                                                                                           
      957 -            typeof row === "number" ? row : (row?.serviceId ?? null);                                                                 
      854 +          const serviceId = typeof row === "number" ? row : (row?.serviceId ?? null);                                                 
      855            const mediaUrl =
      856              typeof row === "object" && row !== null ? (row.mediaUrl ?? null) : null;
      857            if (serviceId === null) return [];
     ...
      862
      863          if (isMounted) setFeaturedPairs(resolved);
      864        } catch {
      968 -        // Fail silently — page renders with empty states; no user-facing error                                                       
      969 -        // needed since the public homepage degrades gracefully to GIF_URL fallback.                                                  
      865 +        // Fail silently — page degrades gracefully to GIF_URL fallback with                                                          
      866 +        // empty featured section and empty service lists.                                                                            
      867        }
      868      }
      869
     ...
      875
      876    return (
      877      <>
      981 -      {/* Floating pill nav — fixed, z-40, centered horizontally */}                                                                  
      878 +      {/* ── Floating pill nav — fixed, z-40, centered horizontally ──                                                                
      879 +          backdropFilter is the intentional exception to CLAUDE.md rule #1:                                                           
      880 +          this element is dev/admin-facing and the tradeoff is acceptable here. */}                                                   
      881        <div
      882          className="fixed z-40 flex items-center gap-1 p-1 rounded-full shadow-lg"
      883          style={{
      985 -          top: "76px", // sits below the Navbar (approx. 72px tall + 4px gap)                                                         
      884 +          top: "76px",                                                                                                                
      885            left: "50%",
      886            transform: "translateX(-50%)",
      887            background: "rgba(249,247,242,0.92)",
      989 -          backdropFilter: "blur(12px)",        // intentional exception — see JSDoc                                                   
      990 -          WebkitBackdropFilter: "blur(12px)",  // Safari prefix required alongside standard                                           
      888 +          backdropFilter: "blur(12px)",                                                                                               
      889 +          WebkitBackdropFilter: "blur(12px)",                                                                                         
      890            border: "1px solid rgba(11,19,43,0.1)",
      891          }}
      892        >
      994 -        {/* Map over LAYOUTS registry — never add individual buttons manually */}                                                     
      893          {LAYOUTS.map((l) => (
      894            <button
      895              key={l.id}
     ...
       897              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-all duratio       
            n-250"
       898              style={{
       899                fontFamily: "'Manrope', sans-serif",
      1002 -              // Active: filled Ink background, Alabaster text                                                                       
      1003 -              // Inactive: transparent, muted Ink text                                                                               
       900                background: activeLayout === l.id ? "#0B132B" : "transparent",
      1005 -              color:                                                                                                                 
      1006 -                activeLayout === l.id                                                                                                
      1007 -                  ? "#F9F7F2"                                                                                                        
      1008 -                  : "rgba(11,19,43,0.45)",                                                                                           
       901 +              color: activeLayout === l.id ? "#F9F7F2" : "rgba(11,19,43,0.45)",                                                      
       902                fontWeight: activeLayout === l.id ? 500 : 400,
       903                cursor: "pointer",
      1011 -              minHeight: "44px", // iOS 44px minimum touch target (CLAUDE.md rule #4)                                                
       904 +              minHeight: "44px",                                                                                                     
       905              }}
       906            >
       907              <span style={{ fontSize: "14px" }}>{l.icon}</span>
      1015 -            {/* Label hidden on mobile to keep pill compact; visible sm+ */}                                                         
       908              <span className="hidden sm:inline">{l.label}</span>
       909            </button>
       910          ))}
       911        </div>
       912
      1021 -      {/* Conditional layout mount — only one component is in the DOM at a time.                                                     
      1022 -          Inactive layouts are fully unmounted (no hidden DOM, no opacity tricks). */}                                               
      1023 -      {activeLayout === "cinematic" && (                                                                                             
      1024 -        <CinematicLayout featuredPairs={featuredPairs} allServices={allServices} />                                                  
      1025 -      )}                                                                                                                             
      1026 -      {activeLayout === "grid" && (                                                                                                  
      1027 -        <GridLayout featuredPairs={featuredPairs} allServices={allServices} />                                                       
      1028 -      )}                                                                                                                             
      1029 -      {activeLayout === "editorial" && (                                                                                             
      1030 -        <EditorialLayout featuredPairs={featuredPairs} allServices={allServices} />                                                  
      1031 -      )}                                                                                                                             
       913 +      {/* ── Global Identity Hero — always GIF_URL, never re-mounts on layout switch ──                                              
       914 +          WHY: Static hero gives the page a consistent brand anchor above the flicker zone.                                          
       915 +          Rendering it here (not inside a layout component) means it stays mounted and                                               
       916 +          does not flash/reload when the user switches between Cinematic, Grid, Editorial. */}                                       
       917 +      <section className="relative w-full h-[100svh] overflow-hidden">                                                               
       918 +        <img                                                                                                                         
       919 +          src={GIF_URL}                                                                                                              
       920 +          alt="Fades and Facials atmosphere"                                                                                         
       921 +          className="absolute inset-0 w-full h-full object-cover"                                                                    
       922 +          style={{ objectPosition: "center 15%" }}                                                                                   
       923 +        />                                                                                                                           
       924 +        {/* Cinematic vignette: dark at top → transparent → dark at bottom */}                                                       
       925 +        <div                                                                                                                         
       926 +          className="absolute inset-0 z-10"                                                                                          
       927 +          style={{                                                                                                                   
       928 +            background:                                                                                                              
       929 +              "linear-gradient(to bottom, rgba(11,19,43,0.55) 0%, rgba(11,19,43,0.1) 40%, rgba(11,19,43,0.75) 85%, rgba(11,19,       
           +43,0.95) 100%)",                                                                                                                     
       930 +          }}                                                                                                                         
       931 +        />                                                                                                                           
       932 +        <div className="relative z-20 flex flex-col items-center justify-end h-full text-center pb-40 px-6">                         
       933 +          <p                                                                                                                         
       934 +            className="uppercase tracking-[0.35em] text-xs mb-5"                                                                     
       935 +            style={{ color: "rgba(249,247,242,0.6)", fontFamily: "'Manrope', sans-serif" }}                                          
       936 +          >                                                                                                                          
       937 +            Luxury Grooming & Spa · Cumming, Georgia                                                                                 
       938 +          </p>                                                                                                                       
       939 +          <h1                                                                                                                        
       940 +            className="font-serif font-light tracking-[0.05em] mb-6 leading-none"                                                    
       941 +            style={{                                                                                                                 
       942 +              fontFamily: "'Bodoni Moda', serif",                                                                                    
       943 +              fontSize: "clamp(3rem, 10vw, 7rem)",                                                                                   
       944 +              color: "#F9F7F2",                                                                                                      
 ▐▛███▜▌   Claude Code v2.1.119
▝▜█████▛▘  Sonnet 4.6 · Claude Pro
  ▘▘ ▝▝    C:\Projects\fades-and-facials

✻ Conversation compacted (ctrl+o for history)

  ⎿  Referenced file app\page.tsx
  ⎿  Referenced file app\admin\services\page.tsx
  ⎿  Read lib\supabase.ts (306 lines)

  Read 2 files (ctrl+o to expand)    

● Bash(npx tsc --noEmit 2>&1 | head -50)
  ⎿  (No output)                                                                                                                                 

  Read 1 file (ctrl+o to expand)                                                                                                                 
                                                                                                                                                 
● TypeScript is clean. Let me verify the admin edits landed correctly.                                                                           
                                                                                                                                                 
  Searched for 3 patterns (ctrl+o to expand)  
                                   
● All edits are correctly in place. Let me also verify the SSOT guards in the admin page:                                                        
                           
  Searched for 1 pattern (ctrl+o to expand)                                                                                                      
                                                                                                                                                 
● All SSOT guards are correctly in place. TypeScript reports zero errors, both files match the full executed plan:                               
                                                                                                                                                 
  - app/page.tsx: Static GlobalHero (always GIF_URL) → FeaturedServicesSection with switch(activeLayout) → 3 stripped layout components receiving
   only allServices                                                                                                                              
  - app/admin/services/page.tsx: FeaturedSlotModal filters availableServices before building groupedServices, preventing duplicate slot            assignments; both >= 10 and >= 3 SSOT limit guards in place                                                                                    
                                                                                                                                                 
  The work from the previous session is complete and verified.

✻ Baked for 7m 2s        

※ recap: Restructuring the homepage with a global identity layer and fixing admin state management. All edits are done and TypeScript is clean —   next step is browser-testing the three layout flicker designs and mobile collapse behavior.                                                    
                                                                                                    s