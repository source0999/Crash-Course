"use client";

// ─────────────────────────────────────────
// SECTION: Admin Gallery Manager
// WHAT: Full CRUD interface for gallery media — upload, delete, replace, and toggle visibility.
// WHY: Lets the barber manage the public gallery without touching code or the database directly.
// PHASE 4: No changes needed — already wired to live Supabase Storage and gallery table.
// ─────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { DbGalleryItem } from "@/lib/supabase";

// ── Supabase client (browser) ──
function useSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── Helper: get public URL from storage path ──
function getPublicUrl(supabase: ReturnType<typeof createBrowserClient>, path: string) {
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return data.publicUrl;
}

// ── Helper: extract storage path from full URL ──
function extractStoragePath(url: string): string {
  // URL format: .../storage/v1/object/public/gallery/FILENAME
  const marker = "/gallery/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : url;
}

export default function AdminGalleryPage() {
  const supabase = useSupabase();
  const [items, setItems] = useState<DbGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [replacing, setReplacing] = useState<number | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ── Feedback auto-clear ──
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  // ── Fetch all gallery items (admin sees all, including hidden) ──
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

  useEffect(() => {
    fetchItems();
  }, []);

  // ── Upload new media ──
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setFeedback(null);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const fileType = file.type.startsWith("video") ? "video" : "image";

      // Upload to Storage
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file, { upsert: false });

      if (storageError) {
        setFeedback({ type: "error", msg: `Upload failed: ${storageError.message}` });
        continue;
      }

      const publicUrl = getPublicUrl(supabase, fileName);

      // Insert row into gallery table
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

  // ── Toggle visibility ──
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

  // ── Replace media (swap file, keep row) ──
  async function handleReplace(item: DbGalleryItem, files: FileList | null) {
    if (!files || files.length === 0) return;
    setReplacing(item.id);
    setFeedback(null);
    const file = files[0];
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileType = file.type.startsWith("video") ? "video" : "image";

    // Upload new file
    const { error: storageError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file, { upsert: false });

    if (storageError) {
      setFeedback({ type: "error", msg: `Replace failed: ${storageError.message}` });
      setReplacing(null);
      return;
    }

    const newUrl = getPublicUrl(supabase, fileName);

    // Update DB row with new URL and type
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

    // Delete old file from storage
    const oldPath = extractStoragePath(item.file_url);
    await supabase.storage.from("gallery").remove([oldPath]);

    setFeedback({ type: "success", msg: "Media replaced successfully!" });
    setReplacing(null);
    fetchItems();
  }

  // ── Delete ──
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
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-1">
              Admin
            </p>
            <h1 className="text-3xl font-bold text-white">Gallery Manager</h1>
          </div>
          <a
            href="/admin/dashboard"
            className="text-white/40 text-sm hover:text-white transition"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* ── Feedback banner ── */}
        {feedback && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* ── Upload zone ── */}
        <div
          onClick={() => uploadRef.current?.click()}
          onTouchEnd={(e) => {
            e.preventDefault();
            uploadRef.current?.click();
          }}
          className="mb-10 rounded-2xl border-2 border-dashed border-white/20 hover:border-brand-accent transition cursor-pointer flex flex-col items-center justify-center py-12 px-6 text-center touch-manipulation"
        >
          <p className="text-4xl mb-3">📷</p>
          <p className="text-white font-semibold text-lg">
            {uploading ? "Uploading..." : "Tap to Upload Photos or Videos"}
          </p>
          <p className="text-white/40 text-sm mt-1">
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
          <p className="text-white/40 text-center py-20">Loading gallery...</p>
        ) : items.length === 0 ? (
          <p className="text-white/40 text-center py-20">
            No media yet. Upload your first photo or video above.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-xl overflow-hidden border ${
                  item.is_active ? "border-white/10" : "border-white/5 opacity-50"
                } bg-white/5`}
              >
                {/* Media preview */}
                <div className="aspect-square overflow-hidden bg-black">
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
                  <div className="absolute top-2 left-2 bg-black/70 text-white/60 text-xs px-2 py-1 rounded-full">
                    Hidden
                  </div>
                )}

                {/* Action buttons */}
                <div className="p-2 flex flex-col gap-2">
                  {/* Toggle visibility */}
                  <button
                    onClick={() => handleToggle(item)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleToggle(item);
                    }}
                    className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition bg-white/10 hover:bg-white/20 text-white"
                  >
                    {item.is_active ? "👁 Hide from Gallery" : "✅ Show in Gallery"}
                  </button>

                  {/* Replace */}
                  <button
                    onClick={() => replaceRefs.current[item.id]?.click()}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      replaceRefs.current[item.id]?.click();
                    }}
                    disabled={replacing === item.id}
                    className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition bg-white/10 hover:bg-white/20 text-white disabled:opacity-40"
                  >
                    {replacing === item.id ? "Replacing..." : "🔄 Replace Photo"}
                  </button>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    ref={(el) => {
                      replaceRefs.current[item.id] = el;
                    }}
                    onChange={(e) => handleReplace(item, e.target.files)}
                  />

                  {/* Delete with confirm */}
                  {confirmDelete === item.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(item)}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleDelete(item);
                        }}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-red-500/80 hover:bg-red-500 text-white transition"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          setConfirmDelete(null);
                        }}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 hover:bg-white/20 text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(item.id)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        setConfirmDelete(item.id);
                      }}
                      className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] transition bg-white/10 hover:bg-red-500/40 text-white/60 hover:text-white"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}