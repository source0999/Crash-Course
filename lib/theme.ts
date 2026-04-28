// ─────────────────────────────────────────
// SECTION: Site theme ids
// WHAT: Valid `data-theme` values + localStorage helpers for palette switching.
// WHY: Single source for normalization (legacy DB rows) and client hydration guards.
// PHASE 4: `active_theme` in site_config stores these ids.
// ─────────────────────────────────────────

export const SITE_THEME_STORAGE_KEY = "ff-site-theme";

/** Palettes controlled by the admin swatch row + primary public experience. */
export const PALETTE_THEME_IDS = ["default", "palette-a", "palette-b", "palette-c"] as const;
export type PaletteThemeId = (typeof PALETTE_THEME_IDS)[number];

/** Extended themes still defined in globals.css for backwards compatibility. */
export const LEGACY_THEME_IDS = ["monochrome", "earth", "neon"] as const;

export const ALL_THEME_IDS = [
  ...PALETTE_THEME_IDS,
  ...LEGACY_THEME_IDS,
] as const;
export type SiteThemeId = (typeof ALL_THEME_IDS)[number];

export function isValidSiteThemeId(value: string): value is SiteThemeId {
  return (ALL_THEME_IDS as readonly string[]).includes(value);
}

/** Maps DB / old values to a valid `data-theme` id. */
export function normalizeThemeFromDb(value: string | null | undefined): SiteThemeId {
  if (!value) return "default";
  if (value === "luxury-dark") return "default";
  if (isValidSiteThemeId(value)) return value;
  return "default";
}
