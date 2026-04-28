"use client";

// ─────────────────────────────────────────
// SECTION: Admin Gallery Manager
// WHAT: Full CRUD interface for gallery media — upload, delete, replace, and toggle visibility.
// WHY: Lets the barber manage the public gallery without touching code or the database directly.
//   All colors use --theme-* variables so the page respects whichever theme is active.
// PHASE 4: No changes needed — already wired to live Supabase Storage and gallery table.
// ─────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DbGalleryItem } from "@/lib/supabase";

// ── Supabase client (browser) ──
function useSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function getPublicUrl(supabase: ReturnType<typeof createBrowserClient>, path: string) {
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return data.publicUrl;
}

function extractStoragePath(url: string): string {
  const marker = "/gallery/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : url;
}

// ── Sortable wrapper — applies dnd-kit transform and passes listeners/isDragging to children ──
type DndListeners = ReturnType<typeof useSortable>["listeners"];

function SortableItem({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: (listeners: DndListeners, isDragging: boolean) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
    >
      {children(listeners, isDragging)}
    </div>
  );
}

export default function AdminGalleryPage() {
  const supabase = useSupabase();
  const [items, setItems] = useState<DbGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [replacing, setReplacing] = useState<number | null>(null);
  const [layout, setLayout] = useState<"masonry" | "grid" | "fullwidth">("masonry");
  const [layoutSaving, setLayoutSaving] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ── PointerSensor: 5px distance for mouse/stylus ──
  // ── TouchSensor: 250ms hold + 5px tolerance — iOS Safari needs the delay to ──
  //    distinguish a drag intent from a page scroll before picking up the gesture. ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setFeedback({ type: "error", msg: "Failed to load gallery." });
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }

  async function fetchLayout() {
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "gallery_layout")
      .single();
    if (data?.value) setLayout(data.value as "masonry" | "grid" | "fullwidth");
  }

  async function saveLayout(newLayout: "masonry" | "grid" | "fullwidth") {
    setLayoutSaving(true);
    setLayout(newLayout);
    await supabase.from("site_config").upsert({
      key: "gallery_layout",
      value: newLayout,
      updated_at: new Date().toISOString(),
    });
    setLayoutSaving(false);
    setFeedback({ type: "success", msg: `Layout set to ${newLayout}` });
  }

  useEffect(() => {
    fetchItems();
    fetchLayout();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    const withNewOrder = reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(withNewOrder);

    const updates = withNewOrder.map((item) =>
      supabase.from("gallery").update({ sort_order: item.sort_order }).eq("id", item.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      setFeedback({ type: "error", msg: "Failed to save order. Try again." });
      fetchItems();
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setFeedback(null);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const fileType = file.type.startsWith("video") ? "video" : "image";

      const { error: storageError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file, { upsert: false });

      if (storageError) {
        setFeedback({ type: "error", msg: `Upload failed: ${storageError.message}` });
        continue;
      }

      const publicUrl = getPublicUrl(supabase, fileName);
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : 0;
      const { error: dbError } = await supabase.from("gallery").insert({
        file_url: publicUrl,
        file_type: fileType,
        sort_order: maxOrder + 1,
        is_active: true,
        title: null,
        category: null,
      });

      if (dbError) {
        setFeedback({
          type: "error",
          msg: `Saved to storage but DB insert failed: ${dbError.message}`,
        });
      }
    }

    setFeedback({ type: "success", msg: "Upload complete!" });
    setUploading(false);
    fetchItems();
  }

  async function handleToggle(item: DbGalleryItem) {
    const { error } = await supabase
      .from("gallery")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to update visibility." });
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)),
      );
    }
  }

  async function handleToggleBg(item: DbGalleryItem) {
    const nextShowBg = !item.show_bg;
    const { error } = await supabase
      .from("gallery")
      .update({ show_bg: nextShowBg })
      .eq("id", item.id);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to update background mode." });
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, show_bg: nextShowBg } : i)),
      );
    }
  }

  async function handleReplace(item: DbGalleryItem, files: FileList | null) {
    if (!files || files.length === 0) return;
    setReplacing(item.id);
    setFeedback(null);
    const file = files[0];
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileType = file.type.startsWith("video") ? "video" : "image";

    const { error: storageError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file, { upsert: false });

    if (storageError) {
      setFeedback({ type: "error", msg: `Replace failed: ${storageError.message}` });
      setReplacing(null);
      return;
    }

    const newUrl = getPublicUrl(supabase, fileName);

    const { error: dbError } = await supabase
      .from("gallery")
      .update({ file_url: newUrl, file_type: fileType })
      .eq("id", item.id);

    if (dbError) {
      setFeedback({
        type: "error",
        msg: `File uploaded but DB update failed: ${dbError.message}`,
      });
      setReplacing(null);
      return;
    }

    const oldPath = extractStoragePath(item.file_url);
    await supabase.storage.from("gallery").remove([oldPath]);

    setFeedback({ type: "success", msg: "Media replaced successfully!" });
    setReplacing(null);
    fetchItems();
  }

  async function handleDelete(item: DbGalleryItem) {
    const path = extractStoragePath(item.file_url);
    const { error: storageError } = await supabase.storage.from("gallery").remove([path]);
    if (storageError) {
      setFeedback({ type: "error", msg: `Storage delete failed: ${storageError.message}` });
      setConfirmDelete(null);
      return;
    }
    const { error: dbError } = await supabase.from("gallery").delete().eq("id", item.id);
    if (dbError) {
      setFeedback({ type: "error", msg: `File deleted but DB row failed: ${dbError.message}` });
    } else {
      setFeedback({ type: "success", msg: "Deleted successfully." });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    setConfirmDelete(null);
  }

  return (
    <main
      className="min-h-screen pt-28 pb-20 px-4 md:px-8"
      style={{ background: "var(--theme-bg)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p
              className="text-[10px] tracking-[0.38em] uppercase mb-1"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Creative Studio
            </p>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
            >
              Gallery Manager
            </h1>
          </div>
          <a
            href="/admin/dashboard"
            className="text-sm touch-manipulation min-h-[44px] flex items-center transition-opacity hover:opacity-70"
            style={{ color: "color-mix(in srgb, var(--theme-text) 50%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            ← Dashboard
          </a>
        </div>

        {/* ── Feedback banner ── */}
        {feedback && (
          <div
            className="mb-6 rounded-2xl px-5 py-3 text-sm font-medium"
            style={{
              background: feedback.type === "success"
                ? "color-mix(in srgb, var(--theme-accent) 12%, transparent)"
                : "color-mix(in srgb, #e05555 12%, transparent)",
              border: feedback.type === "success"
                ? "1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)"
                : "1px solid color-mix(in srgb, #e05555 30%, transparent)",
              color: feedback.type === "success" ? "var(--theme-accent)" : "#e05555",
              fontFamily: "var(--font-sans)",
            }}
          >
            {feedback.msg}
          </div>
        )}

        {/* ── Layout Preset Picker ── */}
        <div
          className="mb-8 rounded-2xl p-5"
          style={{
            border: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)",
            background: "var(--theme-surface)",
          }}
        >
          <p
            className="font-semibold mb-1"
            style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
          >
            Gallery Layout
          </p>
          <p
            className="text-xs mb-5"
            style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            Choose how your gallery looks to visitors
          </p>
          <div className="flex gap-3 flex-wrap">
            {([
              { key: "masonry",   label: "⬡ Masonry",   desc: "Pinterest style"  },
              { key: "grid",      label: "⊞ Grid",       desc: "Equal squares"    },
              { key: "fullwidth", label: "▬ Fullwidth",  desc: "Cinematic rows"   },
            ] as const).map((preset) => (
              <button
                key={preset.key}
                onClick={() => saveLayout(preset.key)}
                onTouchEnd={(e) => { e.preventDefault(); saveLayout(preset.key); }}
                disabled={layoutSaving}
                className="flex-1 min-w-[100px] rounded-xl py-3 px-4 text-sm font-semibold touch-manipulation min-h-[44px] transition-all duration-200"
                style={{
                  background: layout === preset.key
                    ? "var(--theme-accent)"
                    : "color-mix(in srgb, var(--theme-text) 5%, transparent)",
                  color: layout === preset.key
                    ? "var(--theme-bg)"
                    : "color-mix(in srgb, var(--theme-text) 70%, transparent)",
                  border: layout === preset.key
                    ? "1.5px solid var(--theme-accent)"
                    : "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div>{preset.label}</div>
                <div
                  className="text-xs font-normal mt-0.5"
                  style={{
                    color: layout === preset.key
                      ? "color-mix(in srgb, var(--theme-bg) 65%, transparent)"
                      : "color-mix(in srgb, var(--theme-text) 35%, transparent)",
                  }}
                >
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Upload zone ── */}
        <div
          onClick={() => uploadRef.current?.click()}
          onTouchEnd={(e) => { e.preventDefault(); uploadRef.current?.click(); }}
          className="mb-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-12 px-6 text-center touch-manipulation"
          style={{
            borderColor: "color-mix(in srgb, var(--theme-text) 18%, transparent)",
          }}
        >
          <p className="text-4xl mb-3">📷</p>
          <p
            className="font-semibold text-lg mb-1"
            style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
          >
            {uploading ? "Uploading..." : "Tap to Upload Photos or Videos"}
          </p>
          <p
            className="text-sm"
            style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            JPG, PNG, MP4, MOV supported. Multiple files OK.
          </p>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {/* ── Gallery grid ── */}
        {loading ? (
          <p
            className="text-center py-20"
            style={{ color: "color-mix(in srgb, var(--theme-text) 35%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            Loading gallery...
          </p>
        ) : items.length === 0 ? (
          <p
            className="text-center py-20"
            style={{ color: "color-mix(in srgb, var(--theme-text) 35%, transparent)", fontFamily: "var(--font-sans)" }}
          >
            No media yet. Upload your first photo or video above.
          </p>
        ) : (
          <>
            <p
              className="mb-4 text-xs uppercase tracking-[0.2em]"
              style={{ color: "color-mix(in srgb, var(--theme-text) 40%, transparent)", fontFamily: "var(--font-sans)" }}
            >
              Drag grip to reorder gallery
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      {(listeners, isDragging) => (
                        <div
                          className="relative rounded-2xl overflow-hidden transition-all"
                          style={{
                            border: item.is_active
                              ? "1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)"
                              : "1px solid color-mix(in srgb, var(--theme-text) 5%, transparent)",
                            background: "var(--theme-surface)",
                            opacity: item.is_active ? (isDragging ? 0.4 : 1) : 0.45,
                          }}
                        >
                          {/* WHY: Drag grip — touch-action:none stops iOS from stealing the gesture. */}
                          <div
                            {...listeners}
                            style={{
                              touchAction: "none",
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              zIndex: 10,
                              borderRadius: "8px",
                              padding: "8px",
                              background: "color-mix(in srgb, var(--theme-accent) 14%, transparent)",
                              border: "1px solid color-mix(in srgb, var(--theme-accent) 35%, transparent)",
                              color: "var(--theme-accent)",
                              cursor: "grab",
                              userSelect: "none",
                            }}
                            className="touch-manipulation"
                          >
                            ⠿
                          </div>

                          {/* Media preview */}
                          <div
                            className="aspect-square overflow-hidden"
                            style={{ background: item.show_bg ? "black" : "transparent" }}
                          >
                            {item.file_type === "video" ? (
                              <video
                                src={item.file_url}
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={item.file_url}
                                alt={item.title ?? "Gallery item"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Hidden badge */}
                          {!item.is_active && (
                            <div
                              className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full"
                              style={{
                                background: "color-mix(in srgb, var(--theme-bg) 80%, transparent)",
                                color: "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              Hidden
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="p-2 flex flex-col gap-2">
                            <button
                              onClick={() => handleToggleBg(item)}
                              onTouchEnd={(e) => { e.preventDefault(); handleToggleBg(item); }}
                              className="w-full rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150"
                              style={{
                                background: "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                                color: "color-mix(in srgb, var(--theme-text) 65%, transparent)",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {item.show_bg ? "BG: ON" : "BG: OFF"}
                            </button>

                            <button
                              onClick={() => handleToggle(item)}
                              onTouchEnd={(e) => { e.preventDefault(); handleToggle(item); }}
                              className="w-full rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150"
                              style={{
                                background: "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                                color: "color-mix(in srgb, var(--theme-text) 65%, transparent)",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {item.is_active ? "👁 Hide" : "✅ Show"}
                            </button>

                            <button
                              onClick={() => replaceRefs.current[item.id]?.click()}
                              onTouchEnd={(e) => { e.preventDefault(); replaceRefs.current[item.id]?.click(); }}
                              disabled={replacing === item.id}
                              className="w-full rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150 disabled:opacity-40"
                              style={{
                                background: "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                                color: "color-mix(in srgb, var(--theme-text) 65%, transparent)",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {replacing === item.id ? "Replacing..." : "🔄 Replace"}
                            </button>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              ref={(el) => { replaceRefs.current[item.id] = el; }}
                              onChange={(e) => handleReplace(item, e.target.files)}
                            />

                            {confirmDelete === item.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDelete(item)}
                                  onTouchEnd={(e) => { e.preventDefault(); handleDelete(item); }}
                                  className="flex-1 rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150"
                                  style={{
                                    background: "color-mix(in srgb, #e05555 80%, transparent)",
                                    color: "var(--color-alabaster)",
                                    fontFamily: "var(--font-sans)",
                                  }}
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  onTouchEnd={(e) => { e.preventDefault(); setConfirmDelete(null); }}
                                  className="flex-1 rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150"
                                  style={{
                                    background: "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                                    color: "color-mix(in srgb, var(--theme-text) 65%, transparent)",
                                    fontFamily: "var(--font-sans)",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(item.id)}
                                onTouchEnd={(e) => { e.preventDefault(); setConfirmDelete(item.id); }}
                                className="w-full rounded-xl py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition-all duration-150"
                                style={{
                                  background: "color-mix(in srgb, var(--theme-text) 5%, transparent)",
                                  color: "color-mix(in srgb, var(--theme-text) 40%, transparent)",
                                  fontFamily: "var(--font-sans)",
                                }}
                              >
                                🗑 Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </main>
  );
}
