"use client";

// ─────────────────────────────────────────
// SECTION: ThemePreferenceSync
// WHAT: Applies `ff-site-theme` from localStorage to `<html data-theme>` after mount.
// WHY: Lets the same browser instantly restore the last palette picked in admin
//   without waiting for a full navigation; public SSR still uses site_config.
// PHASE 4: Reads the same key written when saving `active_theme` from dashboard.
// ─────────────────────────────────────────

import { useEffect } from "react";
import { SITE_THEME_STORAGE_KEY, isValidSiteThemeId } from "@/lib/theme";

export default function ThemePreferenceSync() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SITE_THEME_STORAGE_KEY);
      if (stored && isValidSiteThemeId(stored)) {
        document.documentElement.setAttribute("data-theme", stored);
      }
    } catch {
      /* private mode / denied */
    }
  }, []);

  return null;
}
