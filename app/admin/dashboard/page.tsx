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

// ── Module-level Supabase client (matches pattern in other admin pages) ──
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Layout = "cinematic" | "grid" | "editorial";

// ── Theme IDs must match the [data-theme] blocks in app/globals.css ──
const THEMES = [
  { id: "luxury-dark", label: "Luxury Dark" },
  { id: "monochrome",  label: "Monochrome"  },
  { id: "earth",       label: "Earth"       },
  { id: "neon",        label: "Neon"        },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

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
  const [activeTheme, setActiveTheme]       = useState<ThemeId>("luxury-dark");
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

      const theme = get("active_theme");
      if (theme) setActiveTheme(theme as ThemeId);

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

  async function handleSelectTheme(nextTheme: ThemeId) {
    if (isSavingTheme || activeTheme === nextTheme) return;
    setActiveTheme(nextTheme);
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
    <main
      className="min-h-screen pt-28 pb-20 px-6"
      style={{ background: "var(--theme-bg)", color: "var(--theme-text)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Admin Panel
          </p>
          <h1
            className="text-4xl font-bold"
            style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
          >
            Dashboard
          </h1>
          {userEmail && (
            <p
              className="mt-2 text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 50%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Signed in as <span style={{ color: "var(--theme-accent)" }}>{userEmail}</span>
            </p>
          )}
        </div>

        {/* ── Navigation Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-14">
          <Link
            href="/admin/gallery"
            className="rounded-xl p-6 transition touch-manipulation"
            style={{
              border: "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
              background: "color-mix(in srgb, var(--theme-text) 5%, transparent)",
              minHeight: "44px",
            }}
          >
            <p className="font-semibold text-lg" style={{ color: "var(--theme-text)" }}>Gallery</p>
            <p
              className="text-sm mt-1"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Upload and manage media
            </p>
          </Link>
          <Link
            href="/admin/services"
            className="rounded-xl p-6 transition touch-manipulation"
            style={{
              border: "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
              background: "color-mix(in srgb, var(--theme-text) 5%, transparent)",
              minHeight: "44px",
            }}
          >
            <p className="font-semibold text-lg" style={{ color: "var(--theme-text)" }}>Services</p>
            <p
              className="text-sm mt-1"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Edit service listings
            </p>
          </Link>
        </div>

        {/* ── Site Appearance ── */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            border: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)",
            background: "color-mix(in srgb, var(--theme-text) 2%, transparent)",
          }}
        >
          <div className="mb-8">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-1"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Appearance
            </p>
            <h2
              className="text-2xl font-semibold mb-1"
              style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
            >
              Site Appearance
            </h2>
            <p
              className="text-sm"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Layout and theme apply immediately. Global hero has a separate save action.
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

          {/* ── Theme Selector ── */}
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Theme
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEMES.map((t) => {
                const active = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { void handleSelectTheme(t.id); }}
                    onTouchEnd={(e) => { e.preventDefault(); void handleSelectTheme(t.id); }}
                    className="rounded-2xl p-4 text-left transition-all duration-200 touch-manipulation"
                    style={{
                      minHeight: "56px",
                      border: active
                        ? "1.5px solid var(--theme-accent)"
                        : "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
                      background: active
                        ? "color-mix(in srgb, var(--theme-accent) 10%, transparent)"
                        : "color-mix(in srgb, var(--theme-text) 4%, transparent)",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: active ? "var(--theme-accent)" : "color-mix(in srgb, var(--theme-text) 80%, transparent)",
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
              Active: {THEMES.find((t) => t.id === activeTheme)?.label}
              {isSavingTheme ? " · saving..." : themeSaveSuccess ? " · saved" : ""}
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
