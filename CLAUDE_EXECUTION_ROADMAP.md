# CLAUDE EXECUTION ROADMAP — Performance & SEO Push (v2.1)

## Phase 0: Image & Media Optimization (Highest Impact)
- Convert all GIFs → MP4/WebM + use <video> with preload="none"
- Wrap every image with Next.js <Image> component + proper sizes/quality
- Add blur placeholders where possible

## Phase 1: JS & Main Thread
- Lazy load non-critical client components (HeroTextReveal, MagneticBookNow, etc.)
- Reduce Framer Motion usage where possible (use CSS for simple animations)

## Phase 2: Caching & Build Optimizations
- Update next.config.ts with image formats, headers, and compiler options
- Enable compression and immutable caching for static assets

## Phase 3: SEO Polish
- Add full metadata (title, description, og:image, etc.)
- Add LocalBusiness JSON-LD schema
- Ensure all images have meaningful alt text

Output only complete updated files with // WHY: comments.