I found the coupling path in app/page.tsx and I’m now patching it in small safe chunks: first removing local layout state and adding a DB-driven appearance state, then I’ll wire the fetch/render flow.

export default function HomePage() {
  const [activeLayout, setActiveLayout] = useState<Layout>("cinematic");
  const [siteAppearance, setSiteAppearance] = useState<{
    activeLayout: Layout;
    globalHeroUrl: string;
  }>({
    activeLayout: "cinematic",
    globalHeroUrl: DEFAULT_GLOBAL_HERO_URL,
  });
  const [featuredPairs, setFeaturedPairs] = useState<FeaturedPair[]>([]);
      try {
        const [servicesRes, configRes] = await Promise.all([
        const [servicesRes, configRes, appearanceRes] = await Promise.all([
          supabase
            .single(),
          supabase
            .from("site_config")
            .select("key, value")
            .in("key", ["active_layout", "global_hero_url"]),
        ]);
              featuredConfigRaw: configRes.data?.value ?? null,
              activeLayoutConfig:
                appearanceRes.data?.find((row) => row.key === "active_layout")?.value ?? null,
              globalHeroConfig:
                appearanceRes.data?.find((row) => row.key === "global_hero_url")?.value ?? null,
              servicesCount: services.length,
        const activeLayoutFromDb = appearanceRes.data?.find((row) => row.key === "active_layout")?.value;
        const globalHeroFromDb = appearanceRes.data?.find((row) => row.key === "global_hero_url")?.value;
        setSiteAppearance({
          activeLayout:
            activeLayoutFromDb === "cinematic" ||
            activeLayoutFromDb === "grid" ||
            activeLayoutFromDb === "editorial"
              ? activeLayoutFromDb
I’ve finished the homepage decoupling patch; next I’m updating the dashboard so layout changes save immediately while global hero gets its own explicit save/upload controls.

I traced and split the coupling path, then shipped a targeted refactor in both app/admin/dashboard/page.tsx and app/page.tsx.

app/admin/dashboard/page.tsx

Split one combined save flow into two independent flows:
handleSelectLayout() now auto-saves active_layout immediately when a layout card is selected.
handleSaveGlobalHero() now saves only global_hero_url.
Added a dedicated Upload Hero Media control that appends uploaded media into media_library and selects it for hero.
Unified hero picker source as SYSTEM_HERO_MEDIA + media_library (deduped), so built-in and uploaded assets live together.
Added inline preview feedback text for currently selected layout description.
Kept debug instrumentation active and added logs for both layout autosave and hero-only save.
app/page.tsx

Removed local interactive layout switching behavior and moved homepage rendering to DB-driven appearance state.
Replaced static hero constant usage with site_config.global_hero_url fallback.
FeaturedServicesSection now uses DB active_layout from site_config.
Removed the floating layout switcher from public homepage so frontend behavior is now command-center controlled.
Hypotheses status from current evidence:

H4_layout_save_coupling: Likely confirmed by code path (single handleSaveAppearance wrote both layout and hero together).
H5_homepage_not_reactive_to_dashboard_layout: Likely confirmed by code path (homepage had local layout switching state not strictly DB-driven).
H3_dashboard_media_library_not_unified: Likely confirmed by code path (hero picker only used mediaLibrary entries; no guaranteed unified source).
Runtime log file debug-d1134d.log was not present before this run, so final confirmation is still pending reproduction.
everythng wroking but uploading new hero also make them removable

Nice catch. I’ll add per-item removal for uploaded hero media in the dashboard, persist the deletion to site_config.media_library, and keep system default media non-removable. Then I’ll have you run one quick verification pass.

Implemented in app/admin/dashboard/page.tsx: uploaded hero media is now removable from the dashboard picker.

What changed:

Added handleDeleteHeroMedia(mediaUrl):
Removes the URL from media_library.
Persists update to site_config.
If the removed media was currently selected as hero, it resets local selection to the default system hero.
Added a Remove action on each hero thumbnail only for uploaded media.
Kept system default hero media non-removable.
Added debug instrumentation log for removals (handleDeleteHeroMedia) and kept all existing logs active.
Note:

I attempted to clear debug-d1134d.log before this run, but it didn’t exist yet (so there was nothing to clear).
upload failed again

Understood — I’ll pull the runtime debug log first to pinpoint exactly why the hero upload path failed, then patch only the confirmed failure point.

I found a high-risk upload path and will instrument it now (entry + failure payload) without changing core logic yet, so we can confirm the exact runtime failure before applying the fix.

I instrumented the hero upload path with runtime logging and an inline error readout so we can prove the root cause from actual run data.

Current hypotheses (to test in parallel):

H1_wrong_upload_client_argument — upload call is using the wrong second argument type at runtime.
H2_storage_upload_rejected_by_bucket_or_rls — storage upload is failing due to RLS/bucket policy.
H3_post_upload_site_config_write_fails — file uploads but site_config.media_library upsert fails afterward.
H4_file_type_or_size_edge — specific file metadata causes rejection in upload pipeline.
I also attempted to clear debug-d1134d.log before this run; it didn’t exist yet, so we’re still clean for the next capture.

failed again undfeined reading from

Perfect, that error string is enough to target quickly. I’m pulling the debug logs now to confirm the exact undefined access and then I’ll patch only that line.

Root cause is now confirmed.

Confirmed (H1_wrong_upload_client_argument): handleUploadHeroMedia passed "gif" as the second arg to uploadServiceMedia, but that function expects a Supabase client.
Your runtime symptom “undefined reading from” matches exactly: internally it tries client.storage.from(...), and with a string client that throws undefined access.
I fixed it in app/admin/dashboard/page.tsx:

Changed uploadServiceMedia(file, "gif") → uploadServiceMedia(file, supabase)
No instrumentation was removed.

The issue has been fixed. Please clean up the instrumentation.

I’ll remove all debug instrumentation blocks we added for this investigation, keep the functional fixes intact, and run a quick lint check afterward.

Instrumentation cleanup is complete.

Removed:

All debug fetch(...) logging blocks and region markers from:
app/admin/dashboard/page.tsx
app/page.tsx
Temporary debug-only error state/UI:
heroUploadError state
“Upload failed: …” debug message
Kept intact:

The actual functional fixes:
Layout auto-save behavior
Separate global hero save flow
Hero upload/remove behavior
Correct upload call using uploadServiceMedia(file, supabase)
Validation:

Searched both files for debug endpoint/log markers: none remain.
Lint check passed with no errors.