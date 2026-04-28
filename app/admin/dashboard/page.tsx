"use client";

// ─────────────────────────────────────────
// SECTION: Admin Dashboard — Site Appearance Command Center
// WHAT: Protected control panel for layout, theme, and global hero media.
// WHY: Decouples homepage design controls from the public frontend — the barber
//   switches layouts, themes, and hero media here without touching code or DB directly.
// PHASE 4: No changes needed — reads/writes live site_config table.
// ─────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { uploadServiceMedia } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";
import {
  SITE_THEME_STORAGE_KEY,
  isValidSiteThemeId,
  normalizeThemeFromDb,
  type PaletteThemeId,
  type SiteThemeId,
} from "@/lib/theme";

// ── Module-level Supabase client (matches pattern in other admin pages) ──
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Layout = "cinematic" | "grid" | "editorial";

// ── Public palette ids — must match [data-theme] in app/globals.css @layer base ──
const PALETTE_THEMES: {
  id: PaletteThemeId;
  label: string;
  preview: [string, string, string, string, string];
}[] = [
  {
    id: "default",
    label: "Studio default",
    preview: ["#EAE8FF", "#D8D5DB", "#ADACB5", "#2D3142", "#B0D7FF"],
  },
  {
    id: "palette-a",
    label: "Rose & wine",
    preview: ["#FEF7F9", "#F9D0DC", "#F3A9C0", "#4C1929", "#E15B80"],
  },
  {
    id: "palette-b",
    label: "Coastal",
    preview: ["#F1FAEE", "#A8DADC", "#457B9D", "#1D3557", "#E63946"],
  },
  {
    id: "palette-c",
    label: "Sun & sea",
    preview: ["#FFF8E7", "#8ECAE6", "#219EBC", "#023047", "#FB8500"],
  },
];

const LAYOUT_OPTIONS: { id: Layout; icon: string; label: string; description: string }[] = [
  { id: "cinematic", icon: "◈", label: "Cinematic", description: "Alternating full-bleed panels" },
  { id: "grid",      icon: "⊞", label: "Grid",      description: "Portrait luxury cards"         },
  { id: "editorial", icon: "≡", label: "Editorial", description: "Typographic stack"             },
];

const SYSTEM_HERO_MEDIA = [
  "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif",
];

// WHY: Media library items are URLs only — no media_type field — so extension
// check is the correct branch. Mirrors the .mp4 arm of isVideoMedia in app/page.tsx.
function isVideoMedia(url: string): boolean {
  return /\.mp4(\?|$)/i.test(url);
}

export default function AdminDashboard() {
  const router = useRouter();

  const [userEmail, setUserEmail]           = useState<string | null>(null);
  const [activeLayout, setActiveLayout]     = useState<Layout>("cinematic");
  const [activeTheme, setActiveTheme]       = useState<SiteThemeId>("default");
  const [heroUrl, setHeroUrl]               = useState<string>("");
  const [mediaLibrary, setMediaLibrary]     = useState<string[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isSavingHero, setIsSavingHero]     = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [isSavingTheme, setIsSavingTheme]   = useState(false);
  const [isUploadingHero, setIsUploadingHero]   = useState(false);
  const [heroSaveSuccess, setHeroSaveSuccess]   = useState(false);
  const [layoutSaveSuccess, setLayoutSaveSuccess] = useState(false);
  const [themeSaveSuccess, setThemeSaveSuccess]   = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/admin"); return; }
      setUserEmail(session.user.email ?? null);

      // WHY: Single batch query for all keys — one round-trip, no waterfalls.
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", ["active_layout", "active_theme", "global_hero_url", "media_library"]);

      const get = (key: string) => data?.find((c) => c.key === key)?.value ?? null;

      const layout = get("active_layout");
      if (layout) setActiveLayout(layout as Layout);

      const fromDb = normalizeThemeFromDb(get("active_theme"));
      try {
        const stored = localStorage.getItem(SITE_THEME_STORAGE_KEY);
        if (stored && isValidSiteThemeId(stored)) {
          setActiveTheme(stored);
          document.documentElement.setAttribute("data-theme", stored);
        } else {
          setActiveTheme(fromDb);
        }
      } catch {
        setActiveTheme(fromDb);
      }

      const hero = get("global_hero_url");
      if (hero) setHeroUrl(hero);

      const lib = get("media_library");
      if (lib) {
        try { setMediaLibrary(JSON.parse(lib) as string[]); } catch { /* malformed JSON — skip */ }
      }

      setIsLoading(false);
    }
    init();
  }, []);

  // WHY: Keeps the admin's own visual preview in sync as themes are switched —
  // the server-rendered data-theme updates on next navigation; this bridges the gap.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  const combinedHeroMedia = Array.from(new Set([...SYSTEM_HERO_MEDIA, ...mediaLibrary]));

  async function handleSelectLayout(nextLayout: Layout) {
    if (isSavingLayout || activeLayout === nextLayout) return;
    setActiveLayout(nextLayout);
    setIsSavingLayout(true);
    setLayoutSaveSuccess(false);
    try {
      await supabase.from("site_config").upsert(
        { key: "active_layout", value: nextLayout, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      setLayoutSaveSuccess(true);
    } finally {
      setIsSavingLayout(false);
    }
  }

  async function handleSelectTheme(nextTheme: SiteThemeId) {
    if (isSavingTheme || activeTheme === nextTheme) return;
    setActiveTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem(SITE_THEME_STORAGE_KEY, nextTheme);
    } catch {
      /* ignore */
    }
    setIsSavingTheme(true);
    setThemeSaveSuccess(false);
    try {
      await supabase.from("site_config").upsert(
        { key: "active_theme", value: nextTheme, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      setThemeSaveSuccess(true);
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function handleSaveGlobalHero() {
    if (isSavingHero || !heroUrl) return;
    setIsSavingHero(true);
    setHeroSaveSuccess(false);
    try {
      await supabase.from("site_config").upsert(
        { key: "global_hero_url", value: heroUrl, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      setHeroSaveSuccess(true);
    } finally {
      setIsSavingHero(false);
    }
  }

  async function handleUploadHeroMedia(file: File) {
    if (isUploadingHero) return;
    setIsUploadingHero(true);
    try {
      const uploadedUrl = await uploadServiceMedia(file, supabase);
      const nextLibrary = Array.from(new Set([...mediaLibrary, uploadedUrl]));
      setMediaLibrary(nextLibrary);
      setHeroUrl(uploadedUrl);

      await supabase.from("site_config").upsert(
        { key: "media_library", value: JSON.stringify(nextLibrary), updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    } catch {
      // Keep UI stable; upload can be retried immediately.
    } finally {
      setIsUploadingHero(false);
    }
  }

  async function handleDeleteHeroMedia(mediaUrl: string) {
    const nextLibrary = mediaLibrary.filter((item) => item !== mediaUrl);
    setMediaLibrary(nextLibrary);
    if (heroUrl === mediaUrl) {
      setHeroUrl(SYSTEM_HERO_MEDIA[0] ?? "");
    }

    await supabase.from("site_config").upsert(
      { key: "media_library", value: JSON.stringify(nextLibrary), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  }

  // Prevent flash of un-fetched defaults while auth + data loads
  if (isLoading) return null;

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 bg-transparent text-theme-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header — Creative Studio identity ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            {/* WHY: Barber pole mini accent signals the brand inside the admin, not just the public site. */}
            <div
              aria-hidden="true"
              style={{
                width: "5px",
                height: "32px",
                borderRadius: "99px",
                overflow: "hidden",
                flexShrink: 0,
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 4px, color-mix(in srgb, var(--theme-text) 8%, transparent) 4px, color-mix(in srgb, var(--theme-text) 8%, transparent) 8px)",
                backgroundSize: "100% 40px",
                animation: "barber-pole 1.4s linear infinite",
              }}
            />
            <p
              className="text-[10px] tracking-[0.38em] uppercase"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Creative Studio
            </p>
          </div>
          <h1
            className="font-bold leading-tight"
            style={{
              color: "var(--theme-text)",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
            }}
          >
            Fades &amp; Facials
          </h1>
          {userEmail && (
            <p
              className="mt-2 text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 45%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              {userEmail}
            </p>
          )}
        </div>

        {/* ── Navigation Cards — elevated touch targets for iPhone use ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-14">
          <Link
            href="/admin/gallery"
            className="group rounded-2xl p-6 border border-theme-3 bg-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] touch-manipulation shadow-sm"
            style={{ minHeight: "88px", boxShadow: "0 2px 12px color-mix(in srgb, var(--theme-4) 6%, transparent)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <p
                className="font-semibold text-lg"
                style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
              >
                Gallery
              </p>
              <span style={{ color: "var(--theme-accent)", fontSize: "1.1rem" }}>◈</span>
            </div>
            <p
              className="text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 45%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Upload and manage media
            </p>
          </Link>
          <Link
            href="/admin/services"
            className="rounded-2xl p-6 border border-theme-3 bg-white transition touch-manipulation shadow-sm"
            style={{ minHeight: "44px", boxShadow: "0 2px 12px color-mix(in srgb, var(--theme-4) 6%, transparent)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <p
                className="font-semibold text-lg"
                style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
              >
                Services
              </p>
              <span style={{ color: "var(--theme-accent)", fontSize: "1.1rem" }}>≡</span>
            </div>
            <p
              className="text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 45%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Edit service listings
            </p>
          </Link>
        </div>

        {/* ── Site Appearance ── */}
        <div className="rounded-2xl p-6 md:p-8 border border-theme-3 bg-white shadow-sm">
          <div className="mb-10">
            <p
              className="text-[10px] tracking-[0.38em] uppercase mb-1"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Appearance
            </p>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
            >
              Site Appearance
            </h2>
            <p
              className="text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Layout and theme apply instantly. Global hero requires a separate save.
            </p>
          </div>

          {/* ── Layout Selector ── */}
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Layout
            </p>
            <div className="grid grid-cols-3 gap-3">
              {LAYOUT_OPTIONS.map((opt) => {
                const active = activeLayout === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { void handleSelectLayout(opt.id); }}
                    onTouchEnd={(e) => { e.preventDefault(); void handleSelectLayout(opt.id); }}
                    className="rounded-2xl p-4 md:p-5 text-left transition-all duration-200 touch-manipulation"
                    style={{
                      minHeight: "88px",
                      border: active
                        ? "1.5px solid var(--theme-accent)"
                        : "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
                      background: active
                        ? "color-mix(in srgb, var(--theme-accent) 10%, transparent)"
                        : "color-mix(in srgb, var(--theme-text) 4%, transparent)",
                    }}
                  >
                    <span
                      className="text-xl block mb-2 leading-none"
                      style={{ color: active ? "var(--theme-accent)" : "color-mix(in srgb, var(--theme-text) 25%, transparent)" }}
                    >
                      {opt.icon}
                    </span>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{
                        color: active ? "var(--theme-accent)" : "color-mix(in srgb, var(--theme-text) 80%, transparent)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {opt.label}
                    </p>
                    <p
                      className="text-xs leading-snug hidden sm:block"
                      style={{ color: "color-mix(in srgb, var(--theme-text) 30%, transparent)", fontFamily: "var(--font-sans)" }}
                    >
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
            <p
              className="mt-3 text-xs"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Preview: {LAYOUT_OPTIONS.find((opt) => opt.id === activeLayout)?.description}
              {isSavingLayout ? " · saving..." : layoutSaveSuccess ? " · saved" : ""}
            </p>
          </div>

          {/* ── Site theme — swatches set data-theme + localStorage + site_config ── */}
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Site theme
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PALETTE_THEMES.map((t) => {
                const active = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { void handleSelectTheme(t.id); }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      void handleSelectTheme(t.id);
                    }}
                    className="rounded-2xl p-3 text-left transition-all duration-200 touch-manipulation flex flex-col gap-2"
                    style={{
                      minHeight: "88px",
                      border: active
                        ? "1.5px solid var(--theme-accent)"
                        : "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
                      background: active
                        ? "color-mix(in srgb, var(--theme-accent) 10%, transparent)"
                        : "color-mix(in srgb, var(--theme-text) 4%, transparent)",
                    }}
                  >
                    <div className="flex h-8 w-full max-w-[140px] overflow-hidden rounded-md">
                      {t.preview.map((hex) => (
                        <span key={hex} className="min-w-0 flex-1 shrink" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <p
                      className="text-xs font-semibold leading-snug"
                      style={{
                        color: active ? "var(--theme-accent)" : "color-mix(in srgb, var(--theme-text) 85%, transparent)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {t.label}
                    </p>
                  </button>
                );
              })}
            </div>
            <p
              className="mt-3 text-xs"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Active: {PALETTE_THEMES.find((t) => t.id === activeTheme)?.label ?? activeTheme}
              {isSavingTheme ? " · saving…" : themeSaveSuccess ? " · saved to site" : ""}
              {" · "}
              Persists in this browser via localStorage, and for all visitors via site config.
            </p>
          </div>

          {/* ── Global Hero Picker ── */}
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Global Hero
            </p>
            {heroUrl && (
              <p
                className="text-xs font-mono mb-4 truncate"
                style={{ color: "color-mix(in srgb, var(--theme-text) 20%, transparent)" }}
                title={heroUrl}
              >
                {heroUrl}
              </p>
            )}

            {combinedHeroMedia.length === 0 ? (
              <div
                className="rounded-2xl py-10 text-center"
                style={{ border: "1px dashed color-mix(in srgb, var(--theme-text) 10%, transparent)" }}
              >
                <p
                  className="text-sm"
                  style={{ color: "color-mix(in srgb, var(--theme-text) 30%, transparent)", fontFamily: "var(--font-sans)" }}
                >
                  No hero media found.
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "color-mix(in srgb, var(--theme-text) 20%, transparent)", fontFamily: "var(--font-sans)" }}
                >
                  Upload media via the Services manager to populate this picker.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {combinedHeroMedia.map((url) => {
                  const selected = heroUrl === url;
                  const canRemove = !SYSTEM_HERO_MEDIA.includes(url);
                  return (
                    <div key={url} className="relative">
                      <button
                        onClick={() => setHeroUrl(url)}
                        onTouchEnd={(e) => { e.preventDefault(); setHeroUrl(url); }}
                        className="relative aspect-video rounded-xl overflow-hidden touch-manipulation block w-full"
                        style={{
                          outline: selected ? "2px solid var(--theme-accent)" : "2px solid transparent",
                          outlineOffset: "2px",
                        }}
                      >
                        {isVideoMedia(url) ? (
                          <video
                            src={url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        {/* Dim overlay on unselected thumbnails */}
                        {!selected && (
                          <div
                            className="absolute inset-0 transition-opacity hover:opacity-0"
                            style={{ background: "color-mix(in srgb, var(--theme-bg) 50%, transparent)" }}
                          />
                        )}
                        {/* Checkmark badge on selected thumbnail */}
                        {selected && (
                          <div
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "var(--theme-accent)" }}
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="var(--theme-bg)"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                      {canRemove && (
                        <button
                          onClick={() => { void handleDeleteHeroMedia(url); }}
                          onTouchEnd={(e) => { e.preventDefault(); void handleDeleteHeroMedia(url); }}
                          className="absolute left-1.5 top-1.5 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider touch-manipulation"
                          style={{
                            minHeight: "44px",
                            background: "color-mix(in srgb, var(--theme-bg) 82%, transparent)",
                            color: "var(--theme-text)",
                            border: "1px solid color-mix(in srgb, var(--theme-text) 24%, transparent)",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Global Hero Upload + Save ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label
              className="rounded-full px-6 py-3 text-sm uppercase tracking-widest font-medium transition-all duration-200 touch-manipulation cursor-pointer"
              onTouchEnd={(e) => { e.preventDefault(); }}
              style={{
                minHeight: "44px",
                background: "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                color: "var(--theme-text)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {isUploadingHero ? "Uploading..." : "Upload Hero Media"}
              <input
                type="file"
                accept="image/gif,video/mp4,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void handleUploadHeroMedia(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              onClick={() => { void handleSaveGlobalHero(); }}
              onTouchEnd={(e) => { e.preventDefault(); void handleSaveGlobalHero(); }}
              disabled={isSavingHero || !heroUrl}
              className="rounded-full px-8 py-3 text-sm uppercase tracking-widest font-medium transition-all duration-200 touch-manipulation"
              style={{
                minHeight: "44px",
                background: isSavingHero || !heroUrl
                  ? "color-mix(in srgb, var(--theme-accent) 30%, transparent)"
                  : "var(--theme-accent)",
                color: "var(--theme-bg)",
                cursor: isSavingHero || !heroUrl ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {isSavingHero ? "Saving…" : "Save Global Hero"}
            </button>
            {heroSaveSuccess && (
              <p
                className="text-sm"
                style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
              >
                Global hero updated successfully.
              </p>
            )}
          </div>
        </div>

        {/* ── Logout ── */}
        <div className="mt-10">
          <LogoutButton />
        </div>

      </div>
    </main>
  );
}
