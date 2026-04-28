"use client";

// ─────────────────────────────────────────
// SECTION: RouteChangeScrollToTop
// WHAT: Resets native + Lenis scroll state whenever pathname changes.
// WHY: App Router transitions can preserve scroll offset unless explicitly normalized.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteChangeScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("app:scroll-to-top"));
  }, [pathname]);

  return null;
}
