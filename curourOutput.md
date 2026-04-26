<span>
 why is this button big af still

<span>
 get rid of arrow

give text more brather room

make button smaller

chane font of website looks boring

Done — I applied all requested changes and tightened the button significantly.

Button fixes (BookNowPill)
Removed the arrow icon.
Made it smaller and less bulky:
px-3.5 py-1.5
text-[11px]
min-h-[40px]
Gave text more breathing room without making it huge:
tracking-[0.24em]
small inner pad on label (px-1)
Kept the pulse ring effect.
Font overhaul (site aesthetic)
I switched to a new premium pairing:

Serif: Bodoni Moda (--font-serif)
Sans: Manrope (--font-sans)
Updated:

app/layout.tsx font imports/config
Homepage inline font-family references in app/page.tsx from:
Cormorant Garamond → Bodoni Moda
Montserrat → Manrope
Note on font weights
Bodoni Moda does not support 300 in Next’s Google font package.
So I used the closest valid elegant range: 400, 500, 600, 700 (while Manrope keeps 300, 400, 500, 600).

Validation
Ran npx tsc --noEmit ✅ passes
the button is same color as site background for masp sections adn map section bakground is too dark. I also noticed you too out the featured services section put that back in

I’ll fix all three now: make the Book Now pill contrast against the map block, lighten the map section background, and restore the featured services section to the homepage flow.

You’re right — I’ll fix all three together: increase contrast between CTA and map area, lighten the map block, and restore a visible featured-services section in the homepage flow.

        style={{
          background: "#0B132B",
          color: "#F9F7F2",
          background: "#7E9A7E",
          color: "#0B132B",
          fontFamily: "'Manrope', sans-serif",
          className="absolute inset-0 rounded-full border animate-ping opacity-20"
          style={{ borderColor: "#0B132B" }}
          style={{ borderColor: "#7E9A7E" }}
        />
      className="relative z-20 px-6 py-24"
      style={{ background: "#0B132B", color: "#F9F7F2" }}
      style={{ background: "#14223D", color: "#F9F7F2" }}
    >
Fixed — all three points are now addressed in app/page.tsx.

What I changed
Book button contrast

Changed CTA background from Ink to Sage (#7E9A7E) with dark text.
Updated ping border to match Sage.
This makes it stand out against dark map areas.
Map block too dark

Lightened the map section background from #0B132B to #14223D.
Also updated the shared dark wrapper to #14223D for consistency.
Featured services restored

Added a new FeaturedServicesSection component.
It uses the existing SERVICES data (first 3 entries) and renders a clean card row.
Inserted it back into the home flow so it always appears below the active layout and above the map/footer block.
Validation
Ran npx tsc --noEmit ✅ passes.