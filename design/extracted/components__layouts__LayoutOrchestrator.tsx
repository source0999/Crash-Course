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

  return (
    <>
      <FeaturedServicesSection activeLayout={activeLayout} featuredPairs={featuredPairs} />
      <LayoutComponent allServices={allServices} />
    </>
  );
}