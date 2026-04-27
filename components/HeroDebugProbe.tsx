"use client";

import { useEffect } from "react";

type HeroDebugProbeProps = {
  runId: "initial" | "post-fix";
};

export default function HeroDebugProbe({ runId }: HeroDebugProbeProps) {
  useEffect(() => {
    const heroContainer = document.querySelector("[data-hero-copy-container]") as HTMLElement | null;
    const heroHeading = document.querySelector("[data-hero-main-heading]") as HTMLElement | null;
    const heroSubheading = document.querySelector("[data-hero-subheading]") as HTMLElement | null;

    const containerRect = heroContainer?.getBoundingClientRect();
    const headingRect = heroHeading?.getBoundingClientRect();
    const headingStyles = heroHeading ? window.getComputedStyle(heroHeading) : null;

    const featuredSection = document.querySelector("section.px-4.md\\:px-6.py-16") as HTMLElement | null;
    const navPanel = document.querySelector("nav > div.px-5.md\\:px-8.py-3\\.5") as HTMLElement | null;
    const firstGridCardBody = document.querySelector(
      "section.px-4.md\\:px-5.py-20.max-w-7xl.mx-auto div.grid > div > div.p-6.md\\:p-8",
    ) as HTMLElement | null;
    const visitUsSection = document.querySelector("section.relative.z-20.px-6.py-24") as HTMLElement | null;
    const oldOverlinePresent = (heroSubheading?.textContent ?? "").includes("Luxury Grooming & Spa");

    const featuredStyles = featuredSection ? window.getComputedStyle(featuredSection) : null;
    const navStyles = navPanel ? window.getComputedStyle(navPanel) : null;
    const cardStyles = firstGridCardBody ? window.getComputedStyle(firstGridCardBody) : null;
    const visitUsStyles = visitUsSection ? window.getComputedStyle(visitUsSection) : null;

    const payload = {
      sessionId: "bfa565",
      runId,
      hypothesisId: "H1-H8",
      location: "components/HeroDebugProbe.tsx:26",
      message: "Hero typography/layout runtime probe",
      data: {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        hasHeroContainer: Boolean(heroContainer),
        hasHeroHeading: Boolean(heroHeading),
        containerRect: containerRect
          ? { x: containerRect.x, y: containerRect.y, width: containerRect.width, height: containerRect.height }
          : null,
        headingRect: headingRect
          ? { x: headingRect.x, y: headingRect.y, width: headingRect.width, height: headingRect.height }
          : null,
        headingCenterOffsetFromViewport: headingRect
          ? {
              x: Math.round((headingRect.x + headingRect.width / 2) - window.innerWidth / 2),
              y: Math.round((headingRect.y + headingRect.height / 2) - window.innerHeight / 2),
            }
          : null,
        headingText: heroHeading?.textContent?.trim() ?? null,
        subheadingText: heroSubheading?.textContent?.trim() ?? null,
        headingComputed: headingStyles
          ? {
              fontSize: headingStyles.fontSize,
              lineHeight: headingStyles.lineHeight,
              textAlign: headingStyles.textAlign,
              letterSpacing: headingStyles.letterSpacing,
              marginBottom: headingStyles.marginBottom,
            }
          : null,
        featuredSectionColors: featuredStyles
          ? {
              backgroundColor: featuredStyles.backgroundColor,
              color: featuredStyles.color,
            }
          : null,
        navPanelColors: navStyles
          ? {
              backgroundColor: navStyles.backgroundColor,
              borderColor: navStyles.borderColor,
              color: navStyles.color,
            }
          : null,
        gridCardBodyColors: cardStyles
          ? {
              backgroundColor: cardStyles.backgroundColor,
              color: cardStyles.color,
            }
          : null,
        visitUsColors: visitUsStyles
          ? {
              backgroundColor: visitUsStyles.backgroundColor,
              color: visitUsStyles.color,
            }
          : null,
        oldOverlinePresent,
        containerClass: heroContainer?.className ?? null,
      },
      timestamp: Date.now(),
    };

    // #region agent log hero_layout_probe_fetch
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"bfa565"},body:JSON.stringify(payload)}).catch(()=>{});
    // #endregion

    // #region agent log hero_layout_probe_console
    console.log("[agent-debug][HERO] runtime probe", payload);
    // #endregion
  }, [runId]);

  return null;
}
