/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * Example:
 * style={{ background: "var(--theme-bg)" }}
 * style={{ color: "var(--theme-text)" }}
 * border: "1px solid color-mix(in srgb, var(--theme-text) 7%, transparent)"
 *
 * This file has been audited: no banned values present.
 * Violators will be rejected in review.
 */

/**
 * @file components/layouts/LayoutOrchestrator.tsx
 *
 * Client component ONLY for the registry + conditional rendering.
 * All heavy logic and data fetching is already done in the RSC parent (app/page.tsx).
 *
 * Agency scalability: add a new layout in < 30 seconds.
 * 1. Create components/layouts/MyNewLayout.tsx
 * 2. Add one entry to LayoutRegistry below
 * 3. Add the new id to the Layout union in lib/utils.ts
 */

"use client";

import { useEffect } from "react";
import type { DbService } from "@/lib/supabase";
import type { Layout, FeaturedPair } from "@/lib/utils";
import CinematicLayout from "./CinematicLayout";
import GridLayout from "./GridLayout";
import EditorialLayout from "./EditorialLayout";
import FeaturedServicesSection from "./FeaturedServicesSection";

type Props = {
  allServices: DbService[];
  featuredPairs: FeaturedPair[];
  activeLayout: Layout;
};

/** Layout Registry — the single source of truth for layout → component mapping. */
const LayoutRegistry: Record<Layout, React.ComponentType<{ allServices: DbService[] }>> = {
  cinematic: CinematicLayout,
  grid:      GridLayout,
  editorial: EditorialLayout,
};

export default function LayoutOrchestrator({ allServices, featuredPairs, activeLayout }: Props) {
  const LayoutComponent = LayoutRegistry[activeLayout] ?? CinematicLayout;

  useEffect(() => {
    const featured = document.querySelector<HTMLElement>('[data-home-band="featured"]');
    const menu = document.querySelector<HTMLElement>('[data-home-band="menu"]');
    const visit = document.querySelector<HTMLElement>('[data-home-band="visit"]');
    const readBackground = (el: HTMLElement | null) => (el ? getComputedStyle(el).backgroundColor : "missing");

    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "post-pattern-fix",
        hypothesisId: "H13",
        location: "components/layouts/LayoutOrchestrator.tsx:58",
        message: "Home section band backgrounds after pattern update",
        data: {
          featuredBg: readBackground(featured),
          menuBg: readBackground(menu),
          visitBg: readBackground(visit),
          activeLayout,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [activeLayout, featuredPairs.length, allServices.length]);

  useEffect(() => {
    const featuredPanels = Array.from(document.querySelectorAll<HTMLElement>('[data-featured-panel="true"]')).slice(0, 3);
    const panelBackgrounds = featuredPanels.map((panel) => ({
      index: panel.dataset.featuredPanelIndex ?? "unknown",
      background: getComputedStyle(panel).backgroundColor,
    }));

    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "post-panel-pattern-fix",
        hypothesisId: "H14",
        location: "components/layouts/LayoutOrchestrator.tsx:82",
        message: "Featured panel background pattern verification",
        data: { panelBackgrounds, activeLayout },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [activeLayout, featuredPairs.length]);

  useEffect(() => {
    const sectionHeading = document.querySelector<HTMLElement>('[data-home-band="featured"] h2');
    const serviceHeadings = Array.from(document.querySelectorAll<HTMLElement>('[data-home-band="featured"] h3')).slice(0, 2);
    const visitHeading = document.querySelector<HTMLElement>('[data-home-band="visit"] h2');
    const visitMeta = document.querySelector<HTMLElement>('[data-home-band="visit"] p');
    const pick = (el: HTMLElement | null) => (el ? getComputedStyle(el).color : "missing");

    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "82ce2f" },
      body: JSON.stringify({
        sessionId: "82ce2f",
        runId: "post-contrast-fix",
        hypothesisId: "H15",
        location: "components/layouts/LayoutOrchestrator.tsx:106",
        message: "Featured and Visit heading contrast verification",
        data: {
          sectionHeadingColor: pick(sectionHeading),
          serviceHeadingColors: serviceHeadings.map((el) => getComputedStyle(el).color),
          visitHeadingColor: pick(visitHeading),
          visitMetaColor: pick(visitMeta),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [activeLayout, featuredPairs.length, allServices.length]);

  return (
    <>
      <FeaturedServicesSection activeLayout={activeLayout} featuredPairs={featuredPairs} />
      <LayoutComponent allServices={allServices} />
    </>
  );
}
