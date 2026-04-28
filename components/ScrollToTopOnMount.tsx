"use client";

// ─────────────────────────────────────────
// SECTION: ScrollToTopOnMount
// WHAT: Disables native scroll restoration and resets viewport on first mount.
// WHY: iOS/Safari can restore stale offsets after refresh before Lenis takes over.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect } from "react";

export default function ScrollToTopOnMount() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
