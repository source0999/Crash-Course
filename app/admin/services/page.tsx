"use client";
// WHY: Force re-sync with DB and bypass Next.js caching to prevent ghost data.
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────
// SECTION: Admin Services Manager
// WHAT: Full CRUD for services — edit, reorder, add, delete, toggle, layout presets.
// WHY: Lets the barber manage service listings without touching code or the database.
// PHASE 4: No changes needed — already wired to live Supabase services table.
// ─────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  rectIntersection,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { uploadServiceMedia, type DbService } from "@/lib/supabase";

// ── Module-level Supabase client ──
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── Types ──
type EditingField = { id: number; field: "name" | "price" | "description" | "category" };
type Layout = "cards" | "list" | "minimal";
type DndListeners = ReturnType<typeof useSortable>["listeners"];
type DraftServiceData = {
  name: string;
  category: string;
  price: string;
  image: string | null;
};
type FeaturedPairing = { serviceId: number | null; mediaUrl: string | null };
type DbCategory = { id: number; name: string; sort_order?: number; created_at?: string };

const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const MAX_SERVICES_PER_CATEGORY = 5;
const LELE_GIF_URL = "/lele.gif";
const DEBUG_ENDPOINT = "http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413";
const DEBUG_SESSION_ID = "d1134d";

function sendDebugLog(payload: {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
}) {
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": DEBUG_SESSION_ID },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: payload.runId,
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

// WHY: Normalize casing to Title Case before any DB insert to prevent data
// fragmentation from case variants ("hot shave" vs "Hot Shave" would satisfy
// a case-insensitive unique constraint and show as duplicates in the public UI).
function toTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ── Reusable sortable wrapper — applies dnd-kit positioning, passes listeners to children ──
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

// ─────────────────────────────────────────
// SECTION: CategoryModal
// WHAT: Centered modal for creating a new service category.
// WHY: window.prompt cannot be styled and is blocked in some browser security
//      policies. This modal matches the admin dark theme and keeps error state
//      inline so the user can correct their input without losing focus.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
function CategoryModal({
  value,
  onChange,
  onSubmit,
  onCancel,
  error,
  isSaving,
  title,
  description,
  submitLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error: string | null;
  isSaving: boolean;
  title: string;
  description: string;
  submitLabel: string;
}) {
  return (
    // WHY: bg-black/70 instead of backdrop-blur — backdrop-filter breaks iOS
    // WebKit silently (CLAUDE.md Rule #1). A semi-opaque solid overlay achieves
    // the same visual depth without triggering the Safari compositing bug.
    // WHY: Viewport centering prevents lost modals on scroll. Edit/Purge buttons prep for CRU architecture (No Category Deletions).
    <div className="fixed inset-0 z-[90000] flex h-screen w-screen items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1e2e] p-8 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-brand-accent">Services Manager</p>
        <h2 className="mb-1 text-xl font-bold text-white">{title}</h2>
        <p className="mb-6 text-sm text-white/40">{description}</p>

        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isSaving) onSubmit();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="e.g. Fades, Beard Trims, Facials"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 min-h-[44px] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent"
        />

        {/* Inline error — stays visible inside the modal so the user never loses
            their typed value. This is why we don't use the global feedback toast
            for category creation errors. */}
        {error && (
          <p className="mt-4 text-center text-sm font-semibold text-red-400">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSubmit}
            onTouchEnd={(e) => { e.preventDefault(); onSubmit(); }}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-brand-accent px-4 py-3 min-h-[44px] text-sm font-semibold text-black touch-manipulation transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <button
            onClick={onCancel}
            onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}
            disabled={isSaving}
            className="rounded-lg bg-white/10 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-white/20 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PurgeServicesModal({
  categoryName,
  onConfirm,
  onCancel,
  isPurging,
}: {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPurging: boolean;
}) {
  return (
    // WHY: Viewport centering prevents lost modals on scroll. Edit/Purge buttons prep for CRU architecture (No Category Deletions).
    <div className="fixed inset-0 z-[90000] flex h-screen w-screen items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f1e2e] p-8 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-brand-accent">Services Manager</p>
        <h2 className="mb-2 text-xl font-bold text-white">Purge Services</h2>
        <p className="mb-6 text-sm text-white/50">
          Are you sure you want to delete ALL services in <span className="font-semibold text-white">{categoryName}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            onTouchEnd={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={isPurging}
            className="flex-1 rounded-lg bg-red-500/80 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPurging ? "Purging..." : "Yes, Purge Services"}
          </button>
          <button
            onClick={onCancel}
            onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}
            disabled={isPurging}
            className="rounded-lg bg-white/10 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-white/20 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteServiceDangerModal({
  serviceName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  serviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    // WHY: Z-index escalation prevents hidden error states. Price masking sanitizes DB inputs. Explicit upload buttons enable high-fidelity hero media.
    <div className="fixed inset-0 z-[100000] flex h-screen w-screen items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-red-400/30 bg-[#0f1e2e] p-8 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-red-300">Danger Zone</p>
        <h2 className="mb-2 text-xl font-bold text-white">Delete Service</h2>
        <p className="mb-6 text-sm text-white/50">
          Delete <span className="font-semibold text-white">{serviceName}</span>? This action will remove the service and its associated media permanently.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            onTouchEnd={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-500/85 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Service"}
          </button>
          <button
            onClick={onCancel}
            onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}
            disabled={isDeleting}
            className="rounded-lg bg-white/10 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-white/20 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionRequiredModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    // WHY: Z-index escalation prevents hidden error states. Price masking sanitizes DB inputs. Explicit upload buttons enable high-fidelity hero media.
    <div className="fixed inset-0 z-[100000] flex h-screen w-screen items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-amber-400/35 bg-[#0f1e2e] p-8 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-amber-300">Action Required</p>
        <p className="mb-6 text-base font-semibold text-white">{message}</p>
        <button
          onClick={onClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="rounded-lg bg-brand-accent px-4 py-3 min-h-[44px] text-sm font-semibold text-black touch-manipulation transition hover:opacity-90"
        >
          Understood
        </button>
      </div>
    </div>
  );
}

function FeaturedSlotModal({
  slotNumber,
  selectedServiceId,
  selectedMediaUrl,
  services,
  featuredPairings,
  mediaLibrary,
  isSaving,
  isUploadingMedia,
  onSelectService,
  onSelectMedia,
  onUploadMedia,
  onSave,
  onCancel,
}: {
  slotNumber: number;
  selectedServiceId: number | null;
  selectedMediaUrl: string | null;
  services: DbService[];
  featuredPairings: FeaturedPairing[];
  mediaLibrary: string[];
  isSaving: boolean;
  isUploadingMedia: boolean;
  onSelectService: (serviceId: number | null) => void;
  onSelectMedia: (mediaUrl: string | null) => void;
  onUploadMedia: (file: File) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  // WHY: Filter before grouping so services already assigned to a different slot
  // never appear in the dropdown — prevents React key collisions at the source
  // rather than catching them reactively at save time.
  const availableServices = services.filter(
    (s) => !featuredPairings.some((p, idx) => p.serviceId === s.id && idx !== slotNumber - 1),
  );
  const groupedServices = availableServices.reduce<Record<string, DbService[]>>((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});
  const canSave = selectedServiceId !== null && Boolean(selectedMediaUrl);

  return (
    // WHY: Strict z-index hierarchy ensures errors are visible. Duplicate guards prevent React key collisions. Dynamic wiring fully integrates the DB-first cinematic media.
    // WHY: 5MB limit allows high-fidelity MP4s. Transactional modals prevent 'half-assigned' slots. Dnd-kit integration allows homepage reordering.
    <div className="fixed inset-0 z-[95000] flex h-screen w-screen items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0f1e2e] p-6 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-brand-accent">Featured Slot</p>
        <h2 className="mb-4 text-xl font-bold text-white">Assign / Edit Slot {slotNumber}</h2>

        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-white/50">Service</p>
            <select
              value={selectedServiceId ?? ""}
              onChange={(e) => onSelectService(Number(e.target.value) || null)}
              className="w-full rounded-lg border border-white/20 bg-[#0b1624] px-3 py-2 min-h-[44px] text-sm text-white focus:outline-none focus:border-brand-accent"
            >
              <option value="">Select Service</option>
              {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
                <optgroup key={`modal-${slotNumber}-${categoryName}`} label={categoryName}>
                  {categoryServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-white/50">Cinematic Media</p>
            <select
              value={selectedMediaUrl ?? ""}
              onChange={(e) => onSelectMedia(e.target.value || null)}
              className="w-full rounded-lg border border-purple-400/30 bg-[#0b1624] px-3 py-2 min-h-[44px] text-sm text-white focus:outline-none focus:border-purple-300"
            >
              <option value="">Select from Preload Library</option>
              {mediaLibrary.map((mediaUrl) => (
                <option key={`modal-media-${mediaUrl}`} value={mediaUrl}>
                  {mediaUrl.split("/").pop()}
                </option>
              ))}
            </select>
          </div>

          <label className={`block ${isUploadingMedia ? "pointer-events-none" : "cursor-pointer"}`}>
            <span
              className={`w-full inline-flex items-center justify-center rounded-lg border border-purple-400/40 px-3 py-2 min-h-[44px] text-xs font-semibold touch-manipulation transition ${
                isUploadingMedia
                  ? "bg-purple-500/10 text-purple-200/60"
                  : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              }`}
            >
              {isUploadingMedia ? "Uploading..." : "Upload GIF/Video"}
            </span>
            <input
              type="file"
              accept="image/gif,video/mp4"
              className="sr-only"
              disabled={isUploadingMedia}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onUploadMedia(file);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        {!canSave && (
          <p className="mt-3 text-xs text-amber-300/90">
            Please select both a service and cinematic media to save.
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onSave}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (canSave) onSave();
            }}
            disabled={!selectedServiceId || !selectedMediaUrl || isSaving}
            className="flex-1 rounded-lg bg-brand-accent px-4 py-3 min-h-[44px] text-sm font-semibold text-black touch-manipulation transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Assignment"}
          </button>
          <button
            onClick={onCancel}
            onTouchEnd={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={isSaving}
            className="rounded-lg bg-white/10 px-4 py-3 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-white/20 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const debugRunIdRef = useRef(`pre-fix-${Date.now()}`);
  const [services, setServices] = useState<DbService[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [layout, setLayout] = useState<Layout>("cards");
  const [loading, setLoading] = useState(true);
  // WHY: Separate from `loading` so subsequent fetchData() calls (post-mutation)
  // don't trigger the full-page skeleton — only the empty-state guard checks this.
  const [isFetching, setIsFetching] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editing, setEditing] = useState<EditingField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [uploadingServiceId, setUploadingServiceId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draftData, setDraftData] = useState<DraftServiceData>({
    name: "",
    category: "",
    price: "",
    image: null,
  });
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingDraftMedia, setIsUploadingDraftMedia] = useState(false);
  const [uploadedPhotoByService, setUploadedPhotoByService] = useState<Record<number, string>>({});
  const [featuredPairings, setFeaturedPairings] = useState<FeaturedPairing[]>([
    { serviceId: null, mediaUrl: null },
    { serviceId: null, mediaUrl: null },
    { serviceId: null, mediaUrl: null },
  ]);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [isUploadingLibraryMedia, setIsUploadingLibraryMedia] = useState(false);
  const [editingFeaturedSlotIndex, setEditingFeaturedSlotIndex] = useState<number | null>(null);
  const [modalSelectedServiceId, setModalSelectedServiceId] = useState<number | null>(null);
  const [modalSelectedMediaUrl, setModalSelectedMediaUrl] = useState<string | null>(null);
  const [isSavingFeaturedAssignment, setIsSavingFeaturedAssignment] = useState(false);
  const [isUploadingFeaturedModalMedia, setIsUploadingFeaturedModalMedia] = useState(false);
  // Tracks which newly-promoted featured service still needs a GIF/Video upload.
  // Cleared when that service successfully uploads media.
  const [pendingGifUploadId, setPendingGifUploadId] = useState<number | null>(null);

  // ── Category modal state ──
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "rename">("create");
  const [renameSourceCategory, setRenameSourceCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [purgeServicesTarget, setPurgeServicesTarget] = useState<string | null>(null);
  const [isPurgingServices, setIsPurgingServices] = useState(false);
  const [serviceDeleteTarget, setServiceDeleteTarget] = useState<DbService | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [actionRequiredMessage, setActionRequiredMessage] = useState<string | null>(null);
  // WHY: useRef closes the race window that isSavingCategory state cannot.
  // State updates are async — a second tap fires before React re-renders the
  // disabled button. The ref is synchronous: it reads and writes in the same
  // call stack tick, so the second invocation sees the lock immediately.
  const categorySubmitRef = useRef(false);

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

  useEffect(() => {
    async function init() {
      await Promise.all([fetchData(), fetchConfig()]);
    }
    init();
  }, []);

  // WHY: Two distinct queries keep each table's error surface isolated — a
  // categories fetch failure does not silently wipe the services list, and vice versa.
  async function fetchData() {
    setLoading(true);
    setIsFetching(true);
    const [servicesRes, categoriesRes] = await Promise.all([
      supabase.from("services").select("*").order("sort_order", { ascending: true }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    ]);

    if (servicesRes.error) {
      setFeedback({ type: "error", msg: `Failed to load services: ${servicesRes.error.message}` });
    } else {
      setServices(servicesRes.data ?? []);
      const uploadedPhotos = (servicesRes.data ?? []).reduce<Record<number, string>>(
        (acc, service) => {
          if (service.image && service.image !== LELE_GIF_URL) acc[service.id] = service.image;
          return acc;
        },
        {},
      );
      setUploadedPhotoByService(uploadedPhotos);
    }

    if (categoriesRes.error) {
      setFeedback({ type: "error", msg: `Failed to load categories: ${categoriesRes.error.message}` });
    } else {
      setCategories(categoriesRes.data ?? []);
    }

    setLoading(false);
    setIsFetching(false);
  }

  async function fetchConfig() {
    const [layoutRes, orderRes, featuredRes, mediaLibraryRes] = await Promise.all([
      supabase.from("site_config").select("value").eq("key", "services_layout").single(),
      supabase.from("site_config").select("value").eq("key", "category_order").single(),
      supabase.from("site_config").select("value").eq("key", "featured_services").single(),
      supabase.from("site_config").select("value").eq("key", "media_library").single(),
    ]);
    if (layoutRes.data?.value) setLayout(layoutRes.data.value as Layout);
    if (orderRes.data?.value) {
      try {
        const parsedOrder = JSON.parse(orderRes.data.value) as string[];
        // WHY: Implemented Set() deduplication to auto-heal polluted categoryOrder arrays and resolve React duplicate key mapping errors.
        const dedupedOrder = [...new Set(parsedOrder)];
        // #region agent log
        sendDebugLog({
          runId: debugRunIdRef.current,
          hypothesisId: "H1_site_config_contains_duplicates",
          location: "app/admin/services/page.tsx:fetchConfig",
          message: "Fetched category_order from site_config",
          data: {
            parsedOrder,
            dedupedOrder,
            uniqueCount: new Set(dedupedOrder).size,
            totalCount: parsedOrder.length,
          },
        });
        // #endregion
        setCategoryOrder(dedupedOrder);
      } catch {}
    }
    if (!featuredRes.data?.value) {
      // WHY: Prevent stale UI state from showing 'Ghost' selections after a DB purge.
      setFeaturedPairings([
        { serviceId: null, mediaUrl: null },
        { serviceId: null, mediaUrl: null },
        { serviceId: null, mediaUrl: null },
      ]);
    } else {
      try {
        const parsedFeatured = JSON.parse(featuredRes.data.value) as
          | Array<number | null>
          | FeaturedPairing[];
        const normalized: FeaturedPairing[] = [0, 1, 2].map((index) => {
          const row = parsedFeatured[index];
          if (typeof row === "number" || row === null) {
            return { serviceId: row ?? null, mediaUrl: null };
          }
          return {
            serviceId: row?.serviceId ?? null,
            mediaUrl: row?.mediaUrl ?? null,
          };
        });
        setFeaturedPairings(normalized);
      } catch {
        setFeaturedPairings([
          { serviceId: null, mediaUrl: null },
          { serviceId: null, mediaUrl: null },
          { serviceId: null, mediaUrl: null },
        ]);
      }
    }
    if (!mediaLibraryRes.data?.value) {
      setMediaLibrary([]);
    } else {
      try {
        const parsedLibrary = JSON.parse(mediaLibraryRes.data.value) as string[];
        setMediaLibrary(parsedLibrary.filter(Boolean));
      } catch {
        setMediaLibrary([]);
      }
    }
  }

  // ── Derive ordered category name list for dnd-kit and the service dropdown ──
  // WHY: orderedCategories stays string[] because dnd-kit SortableContext uses
  // it as UniqueIdentifier[], and the draft form <select> binds to string values.
  // The canonical source of truth is the `categories` table — categoryOrder from
  // site_config only controls display order, not existence.
  const categoryNames = categories.map((c) => c.name);
  const orderedCategories = [
    ...categoryOrder.filter((c) => categoryNames.includes(c)),
    ...categoryNames.filter((c) => !categoryOrder.includes(c)),
  ];
  // WHY: Implemented Set() deduplication to auto-heal polluted categoryOrder arrays and resolve React duplicate key mapping errors.
  const dedupedOrderedCategories = [...new Set(orderedCategories)];

  useEffect(() => {
    const duplicateOrderedCategories = dedupedOrderedCategories.filter(
      (cat, index, arr) => arr.indexOf(cat) !== index,
    );
    // #region agent log
    sendDebugLog({
      runId: debugRunIdRef.current,
      hypothesisId: "H4_render_uses_duplicate_keys",
      location: "app/admin/services/page.tsx:orderedCategories-useEffect",
      message: "Derived orderedCategories and duplicate-key risk",
      data: {
        categoryOrder,
        categoryNames,
          orderedCategories: dedupedOrderedCategories,
        duplicateOrderedCategories,
      },
    });
    // #endregion
  }, [categoryOrder, categoryNames, dedupedOrderedCategories]);
  const featuredIds = new Set(
    featuredPairings
      .map((pairing) => pairing.serviceId)
      .filter((id): id is number => id !== null),
  );
  const featuredSlots: Array<DbService | null> = featuredPairings.map(
    (pairing) => services.find((service) => service.id === pairing.serviceId) ?? null,
  );

  function servicesInCategory(cat: string) {
    return services.filter((s) => s.category === cat);
  }

  async function saveLayout(newLayout: Layout) {
    setLayoutSaving(true);
    setLayout(newLayout);
    await supabase.from("site_config").upsert({
      key: "services_layout",
      value: newLayout,
      updated_at: new Date().toISOString(),
    });
    setLayoutSaving(false);
    setFeedback({ type: "success", msg: `Layout set to ${newLayout}` });
  }

  function startEdit(id: number, field: EditingField["field"], current: string | number) {
    setEditing({ id, field });
    setEditValue(String(current));
  }

  async function commitEdit() {
    if (!editing) return;
    const { id, field } = editing;
    const valueToSave =
      field === "price" ? parseFloat(editValue.replace(/[^0-9.]/g, "")) : editValue;
    const { error } = await supabase
      .from("services")
      .update({ [field]: valueToSave })
      .eq("id", id);
    if (error) {
      setFeedback({ type: "error", msg: `Failed to update ${field}.` });
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: valueToSave } : s)),
      );
      if (field === "category") {
        setCategoryOrder((prev) => (prev.includes(editValue) ? prev : [...prev, editValue]));
      }
    }
    setEditing(null);
    setEditValue("");
  }

  async function handleToggle(service: DbService) {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to update visibility." });
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s)),
      );
    }
  }

  async function upsertFeaturedPairings(nextPairings: FeaturedPairing[]) {
    const { error } = await supabase.from("site_config").upsert({
      key: "featured_services",
      value: JSON.stringify(nextPairings),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }


  async function handleMediaUpload(service: DbService, file: File) {
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", msg: "Please upload an image file." });
      return;
    }

    if (!featuredIds.has(service.id) && file.type === "image/gif") {
      setFeedback({
        type: "error",
        msg: "GIF media is allowed only for featured services.",
      });
      return;
    }

    if (file.size > MAX_MEDIA_BYTES) {
      setFeedback({ type: "error", msg: "File must be less than 5MB" });
      return;
    }

    setUploadingServiceId(service.id);
    try {
      // Pass the auth-aware browser client so bucket RLS sees auth.uid()
      const publicUrl = await uploadServiceMedia(file, supabase);
      const { error } = await supabase
        .from("services")
        .update({ image: publicUrl, media_type: "image" })
        .eq("id", service.id);

      if (error) {
        throw new Error(
          JSON.stringify({
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          }),
        );
      }

      setUploadedPhotoByService((prev) => ({ ...prev, [service.id]: publicUrl }));
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, image: publicUrl, media_type: "image" as const } : s,
        ),
      );
      // Clear the "needs GIF/Video" prompt once the service uploads any media
      if (pendingGifUploadId === service.id) setPendingGifUploadId(null);
      setFeedback({ type: "success", msg: "Service media uploaded." });
    } catch (err) {
      console.error("[service-media:handleMediaUpload]", {
        serviceId: service.id,
        error: err instanceof Error ? err.message : String(err),
      });
      const message = err instanceof Error ? err.message : "Failed to upload media.";
      if (message.includes("404") || message.includes("Bucket not found")) {
        setFeedback({
          type: "error",
          msg: "Upload failed: 'service-media' bucket not found — check Supabase Storage.",
        });
      } else if (message.includes("403") || message.includes("policy")) {
        setFeedback({
          type: "error",
          msg: "Upload failed: bucket policy denied the request — ensure you are logged in.",
        });
      } else {
        setFeedback({ type: "error", msg: `Upload failed: ${message}` });
      }
    } finally {
      setUploadingServiceId(null);
    }
  }

  async function handleFeaturedMediaUpload(file: File) {
    const isGif = file.type === "image/gif";
    const isMp4 = file.type === "video/mp4";
    if (!isGif && !isMp4) {
      setFeedback({ type: "error", msg: "Please upload a GIF or MP4 file." });
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setFeedback({ type: "error", msg: "File must be less than 5MB" });
      return;
    }

    setIsUploadingFeaturedModalMedia(true);
    try {
      // WHY: Preload Library decouples cinematic media from standard service data, allowing the barber to swap high-end visuals independently of the service list.
      // WHY: 5MB limit allows high-fidelity MP4s. Transactional modals prevent 'half-assigned' slots. Dnd-kit integration allows homepage reordering.
      const publicUrl = await uploadServiceMedia(file, supabase);
      const nextLibrary = [...new Set([...mediaLibrary, publicUrl])];
      const { error } = await supabase.from("site_config").upsert({
        key: "media_library",
        value: JSON.stringify(nextLibrary),
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      setModalSelectedMediaUrl(publicUrl);
      await fetchConfig();
      setFeedback({ type: "success", msg: "Cinematic media uploaded to library." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload high-fidelity media.";
      setFeedback({ type: "error", msg: message });
    } finally {
      setIsUploadingFeaturedModalMedia(false);
    }
  }

  async function handleUploadLibraryMedia(file: File) {
    const isGif = file.type === "image/gif";
    const isMp4 = file.type === "video/mp4";
    if (!isGif && !isMp4) {
      setFeedback({ type: "error", msg: "Please upload a GIF or MP4 file." });
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setFeedback({ type: "error", msg: "File must be less than 5MB" });
      return;
    }

    setIsUploadingLibraryMedia(true);
    try {
      // WHY: Preload Library decouples cinematic media from standard service data, allowing the barber to swap high-end visuals independently of the service list.
      const publicUrl = await uploadServiceMedia(file, supabase);
      const nextLibrary = [...new Set([...mediaLibrary, publicUrl])];
      const { error } = await supabase.from("site_config").upsert({
        key: "media_library",
        value: JSON.stringify(nextLibrary),
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      await fetchConfig();
      setFeedback({ type: "success", msg: "Added media to preload library." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload preload media.";
      setFeedback({ type: "error", msg: message });
    } finally {
      setIsUploadingLibraryMedia(false);
    }
  }

  async function handleDeleteLibraryMedia(mediaUrl: string) {
    try {
      const nextLibrary = mediaLibrary.filter((item) => item !== mediaUrl);
      const { error } = await supabase.from("site_config").upsert({
        key: "media_library",
        value: JSON.stringify(nextLibrary),
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);

      const nextPairings = featuredPairings.map((pairing) =>
        pairing.mediaUrl === mediaUrl ? { ...pairing, mediaUrl: null } : pairing,
      );
      await upsertFeaturedPairings(nextPairings);
      await fetchConfig();
      setFeedback({ type: "success", msg: "Removed media from preload library." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete preload media.";
      setFeedback({ type: "error", msg: message });
    }
  }

  function handleOpenFeaturedSlotModal(slotIndex: number) {
    const pairing = featuredPairings[slotIndex];
    setEditingFeaturedSlotIndex(slotIndex);
    setModalSelectedServiceId(pairing?.serviceId ?? null);
    setModalSelectedMediaUrl(pairing?.mediaUrl ?? null);
  }

  function handleCloseFeaturedSlotModal() {
    setEditingFeaturedSlotIndex(null);
    setModalSelectedServiceId(null);
    setModalSelectedMediaUrl(null);
  }

  async function handleSaveFeaturedSlotAssignment() {
    if (editingFeaturedSlotIndex === null) return;
    if (modalSelectedServiceId === null || !modalSelectedMediaUrl) return;
    setIsSavingFeaturedAssignment(true);
    try {
      const nextPairings = [...featuredPairings];
      const existingIndex = nextPairings.findIndex(
        (pairing, index) =>
          pairing.serviceId === modalSelectedServiceId && index !== editingFeaturedSlotIndex,
      );
      if (existingIndex !== -1) {
        // WHY: Strict z-index hierarchy ensures errors are visible. Duplicate guards prevent React key collisions. Dynamic wiring fully integrates the DB-first cinematic media.
        setFeedback({ type: "error", msg: "This service is already featured in another slot." });
        return;
      }
      nextPairings[editingFeaturedSlotIndex] = {
        serviceId: modalSelectedServiceId,
        mediaUrl: modalSelectedMediaUrl,
      };
      // WHY: DB-First mutation flow ensures the UI never shows selections that don't exist in Supabase.
      // WHY: 5MB limit allows high-fidelity MP4s. Transactional modals prevent 'half-assigned' slots. Dnd-kit integration allows homepage reordering.
      await upsertFeaturedPairings(nextPairings);
      await fetchConfig();
      handleCloseFeaturedSlotModal();
      setFeedback({ type: "success", msg: "Featured slot saved." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save featured assignment.";
      setFeedback({ type: "error", msg: message });
    } finally {
      setIsSavingFeaturedAssignment(false);
    }
  }

  async function handleFeaturedDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const toSlotIndex = (id: UniqueIdentifier) =>
      Number(String(id).replace("featured-slot-", ""));
    const oldIndex = toSlotIndex(active.id);
    const newIndex = toSlotIndex(over.id);
    if (!Number.isFinite(oldIndex) || !Number.isFinite(newIndex)) return;

    const reordered = arrayMove(featuredPairings, oldIndex, newIndex);
    try {
      // WHY: 5MB limit allows high-fidelity MP4s. Transactional modals prevent 'half-assigned' slots. Dnd-kit integration allows homepage reordering.
      await upsertFeaturedPairings(reordered);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reorder featured slots.";
      setFeedback({ type: "error", msg: message });
    }
  }

  async function handleToggleCinematicMode(service: DbService) {
    const isCurrentlyCinematic = service.image === LELE_GIF_URL;
    const fallbackPhoto = uploadedPhotoByService[service.id] ?? null;
    const nextImage = isCurrentlyCinematic ? fallbackPhoto : LELE_GIF_URL;

    const { error } = await supabase
      .from("services")
      .update({ image: nextImage })
      .eq("id", service.id);

    if (error) {
      setFeedback({ type: "error", msg: "Failed to update cinematic mode." });
      return;
    }

    if (!isCurrentlyCinematic && service.image && service.image !== LELE_GIF_URL) {
      setUploadedPhotoByService((prev) => ({ ...prev, [service.id]: service.image as string }));
    }

    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, image: nextImage } : s)),
    );
    setFeedback({
      type: "success",
      msg: isCurrentlyCinematic ? "Using uploaded media." : "Cinematic mode enabled.",
    });
  }

  function handleOpenDeleteServiceModal(service: DbService) {
    setServiceDeleteTarget(service);
  }

  async function handleDeleteService() {
    if (!serviceDeleteTarget) return;
    setIsDeletingService(true);
    const { error } = await supabase.from("services").delete().eq("id", serviceDeleteTarget.id);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to delete service." });
    } else {
      setServices((prev) => prev.filter((s) => s.id !== serviceDeleteTarget.id));
      setFeedback({ type: "success", msg: "Service deleted." });
    }
    setIsDeletingService(false);
    setServiceDeleteTarget(null);
  }

  async function handleDeleteCategory(cat: string) {
    const categoryRecord = categories.find((c) => c.name === cat);
    if (!categoryRecord) {
      setFeedback({ type: "error", msg: "Category not found in local state — refresh and try again." });
      return;
    }

    try {
      // Delete child services first — categories table has no FK cascade, so order matters.
      const serviceIds = servicesInCategory(cat).map((s) => s.id);
      if (serviceIds.length > 0) {
        const { error: servicesError } = await supabase
          .from("services")
          .delete()
          .in("id", serviceIds);
        if (servicesError) throw new Error(`Failed to delete services: ${servicesError.message}`);
      }

      // Delete the category record by ID — safer than name if names were ever mutated.
      const { error: catError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryRecord.id);
      if (catError) throw new Error(`Failed to delete category: ${catError.message}`);

      // WHY: Local state updated only after BOTH DB deletes confirm. Partial
      // success (services gone, category row still present) would leave a ghost
      // empty category in the panel until the next full fetch.
      const updatedOrder = categoryOrder.filter((c) => c !== cat);
      setServices((prev) => prev.filter((s) => s.category !== cat));
      setCategories((prev) => prev.filter((c) => c.id !== categoryRecord.id));
      setCategoryOrder(updatedOrder);
      await supabase.from("site_config").upsert({
        key: "category_order",
        value: JSON.stringify(updatedOrder),
        updated_at: new Date().toISOString(),
      });
      setFeedback({ type: "success", msg: `Category "${cat}" deleted.` });
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to delete category.",
      });
    }
  }

  async function handleAddService(cat: string) {
    setIsCreating(true);
    setDraftData({
      name: "",
      category: cat,
      price: "",
      image: null,
    });
  }

  function handleCancelDraft() {
    setIsCreating(false);
    setIsSavingDraft(false);
    setIsUploadingDraftMedia(false);
    setDraftData({ name: "", category: "", price: "", image: null });
  }

  function formatPriceDisplay(value: string | number | null | undefined): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "$0";
    const sanitized = raw.startsWith("$") ? raw.slice(1) : raw;
    return `$${sanitized}`;
  }

  async function handleDraftMediaUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", msg: "Please upload an image file." });
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setFeedback({ type: "error", msg: "File must be less than 5MB" });
      return;
    }

    setIsUploadingDraftMedia(true);
    try {
      // Pass the auth-aware browser client so bucket RLS sees auth.uid()
      const publicUrl = await uploadServiceMedia(file, supabase);
      setDraftData((prev) => ({ ...prev, image: publicUrl }));
      setFeedback({ type: "success", msg: "Draft media uploaded." });
    } catch (err) {
      console.error("[service-media:handleDraftMediaUpload]", {
        error: err instanceof Error ? err.message : String(err),
      });
      const message = err instanceof Error ? err.message : "Failed to upload media.";
      setFeedback({
        type: "error",
        msg: `Upload failed: ${message}`,
      });
    } finally {
      setIsUploadingDraftMedia(false);
    }
  }

  // WHY: Enforce strict limits (3 Categories, 10 Services) via pre-flight DB
  // checks to prevent UI/DB state mismatch. Local services state is updated
  // ONLY after the DB insert confirms success — no optimistic updates.
  async function handleCommitService() {
    // WHY: Normalize casing to Title Case and handle case-insensitive duplicates
    // to prevent data fragmentation — "hot shave" and "Hot Shave" would collide
    // on a case-insensitive unique index but appear as separate rows otherwise.
    const trimmedName = toTitleCase(draftData.name.trim());
    const trimmedCategory = draftData.category.trim();
    const parsedPrice = Number(draftData.price);
    const isPriceValid = Number.isFinite(parsedPrice) && parsedPrice >= 0;

    if (!trimmedName || !trimmedCategory || !isPriceValid) {
      setFeedback({
        type: "error",
        msg: "Name, category, and a valid numeric price are required.",
      });
      return;
    }

    if (!draftData.image) {
      // WHY: Rule of 5 and Image Guards preserve luxury layout rhythm. Grouped selection and GIF support enable high-fidelity curation.
      setActionRequiredMessage("An image is required to publish this service.");
      return;
    }

    setIsSavingDraft(true);

    try {
      // Pre-flight: enforce the hard limit of 5 services per category.
      const { count, error: countError } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("category", trimmedCategory);

      if (countError) throw new Error(countError.message);

      // WHY: Implemented strict SSOT pattern. UI state only updates via fetchData() post-mutation to prevent React duplicate key explosions.
      if ((count ?? 0) >= MAX_SERVICES_PER_CATEGORY) {
        setFeedback({ type: "error", msg: "Limit Reached" });
        return;
      }

      const maxOrder =
        services.length > 0 ? Math.max(...services.map((s) => s.sort_order ?? 0)) : 0;

      const { data, error } = await supabase
        .from("services")
        .insert({
          name: trimmedName,
          category: trimmedCategory,
          price: parsedPrice,
          description: "",
          image: draftData.image,
          media_type: "image",
          is_premium: false,
          is_active: true,
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // WHY: Clear the name field so the admin can type a new one without
          // manually selecting and deleting — then re-fetch so the existing
          // service is visible on screen if it was somehow missing from local state.
          setDraftData((prev) => ({ ...prev, name: "" }));
          setFeedback({ type: "error", msg: "Service already exists." });
          await fetchData();
          return;
        }
        throw new Error(error.message);
      }

      // WHY: handleCancelDraft resets form state before fetchData re-populates
      // the services list. Calling fetchData() here (not setServices) ensures
      // the new row's real DB id and timestamps are reflected in local state.
      handleCancelDraft();
      setFeedback({ type: "success", msg: "Service created." });
      await fetchData();
    } catch (err) {
      console.error("[services:handleCommitService]", err);
      const message = err instanceof Error ? err.message : "Failed to create service.";
      setFeedback({ type: "error", msg: message });
    } finally {
      setIsSavingDraft(false);
    }
  }

  function handleAddCategory() {
    // WHY: Opening the modal is a pure UI action — no async needed here.
    // All DB work is deferred to handleSubmitCategory so the user can
    // type their name before any network call is made.
    setCategoryModalMode("create");
    setRenameSourceCategory(null);
    setIsAddingCategory(true);
    setNewCategoryName("");
    setCategoryModalError(null);
  }

  function handleOpenRenameCategory(cat: string) {
    // WHY: Cascading Rename ensures referential integrity between categories and services. Purge Services resets category content without breaking the Rule of 3 layout.
    setCategoryModalMode("rename");
    setRenameSourceCategory(cat);
    setIsAddingCategory(true);
    setNewCategoryName(cat);
    setCategoryModalError(null);
  }

  function handleOpenPurgeServices(cat: string) {
    // WHY: Cascading Rename ensures referential integrity between categories and services. Purge Services resets category content without breaking the Rule of 3 layout.
    setPurgeServicesTarget(cat);
  }

  function handleCancelCategoryModal() {
    setIsAddingCategory(false);
    setCategoryModalMode("create");
    setRenameSourceCategory(null);
    setNewCategoryName("");
    setCategoryModalError(null);
  }

  async function handleRenameCategory(oldName: string, newName: string) {
    if (categorySubmitRef.current) return;
    categorySubmitRef.current = true;
    setIsSavingCategory(true);

    try {
      // WHY: Cascading Rename ensures referential integrity between categories and services. Purge Services resets category content without breaking the Rule of 3 layout.
      const normalizedNewName = toTitleCase(newName.trim());
      if (!normalizedNewName) {
        setCategoryModalError("Category name cannot be empty.");
        return;
      }

      const isSameName = oldName.toLowerCase() === normalizedNewName.toLowerCase();
      if (isSameName) {
        handleCancelCategoryModal();
        return;
      }

      const duplicateNameExists = categories.some(
        (category) =>
          category.name.toLowerCase() === normalizedNewName.toLowerCase() &&
          category.name.toLowerCase() !== oldName.toLowerCase(),
      );
      if (duplicateNameExists) {
        setFeedback({ type: "error", msg: "Name already exists" });
        return;
      }

      const categoryRecord = categories.find((category) => category.name === oldName);
      if (!categoryRecord) {
        throw new Error("Original category not found.");
      }

      const { error: categoryError } = await supabase
        .from("categories")
        .update({ name: normalizedNewName })
        .eq("id", categoryRecord.id);
      if (categoryError) throw new Error(categoryError.message);

      const { error: servicesError } = await supabase
        .from("services")
        .update({ category: normalizedNewName })
        .eq("category", oldName);
      if (servicesError) throw new Error(servicesError.message);

      const updatedOrder = categoryOrder.map((name) =>
        name.toLowerCase() === oldName.toLowerCase() ? normalizedNewName : name,
      );
      const { error: orderError } = await supabase.from("site_config").upsert({
        key: "category_order",
        value: JSON.stringify([...new Set(updatedOrder)]),
        updated_at: new Date().toISOString(),
      });
      if (orderError) throw new Error(orderError.message);

      handleCancelCategoryModal();
      await fetchData();
      await fetchConfig();
      setFeedback({ type: "success", msg: `Category renamed to "${normalizedNewName}".` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to rename category.";
      setCategoryModalError(message);
    } finally {
      setIsSavingCategory(false);
      categorySubmitRef.current = false;
    }
  }

  async function handlePurgeServices(categoryName: string) {
    setIsPurgingServices(true);
    try {
      // WHY: Cascading Rename ensures referential integrity between categories and services. Purge Services resets category content without breaking the Rule of 3 layout.
      const { error } = await supabase.from("services").delete().eq("category", categoryName);
      if (error) throw new Error(error.message);
      setPurgeServicesTarget(null);
      await fetchData();
      await fetchConfig();
      setFeedback({ type: "success", msg: `All services in "${categoryName}" were purged.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to purge services.";
      setFeedback({ type: "error", msg: message });
    } finally {
      setIsPurgingServices(false);
    }
  }

  async function handleSubmitCategoryModal() {
    if (categoryModalMode === "rename" && renameSourceCategory) {
      await handleRenameCategory(renameSourceCategory, newCategoryName);
      return;
    }
    await handleSubmitCategory();
  }

  // WHY: Enforce strict limits (3 Categories, 10 Services) via pre-flight DB
  // checks to prevent UI/DB state mismatch. Sequential state update prevents
  // frontend ghosting during DB latency — the ref lock fires synchronously so
  // a second tap is rejected before any state or network call runs. Local state
  // is updated ONLY after the DB confirms success.
  async function handleSubmitCategory() {
    if (categorySubmitRef.current) return;
    categorySubmitRef.current = true;
    setIsSavingCategory(true);

    try {
      // WHY: Normalize casing to Title Case and handle case-insensitive duplicates
      // to prevent data fragmentation — "beard care" and "Beard Care" would be
      // distinct rows under a binary collation but identical to the public UI.
      const trimmedName = toTitleCase(newCategoryName.trim());

      if (!trimmedName) {
        setCategoryModalError("Category name cannot be empty.");
        return;
      }

      // WHY: Local case-insensitive check runs before any DB round-trip to catch
      // the most common duplicate (same session) without network cost.
      if (dedupedOrderedCategories.some((c) => c.toLowerCase() === trimmedName.toLowerCase())) {
        setCategoryModalError(`"${trimmedName}" already exists.`);
        return;
      }
      // #region agent log
      sendDebugLog({
        runId: debugRunIdRef.current,
        hypothesisId: "H2_local_append_reintroduces_duplicates",
        location: "app/admin/services/page.tsx:handleSubmitCategory-before-insert",
        message: "Category submit before insert",
        data: {
          trimmedName,
          categoryOrder,
          orderedCategories: dedupedOrderedCategories,
          existingCaseInsensitiveMatch: dedupedOrderedCategories.some(
            (c) => c.toLowerCase() === trimmedName.toLowerCase(),
          ),
        },
      });
      // #endregion

      // Pre-flight: enforce the hard limit of 3 categories.
      // count: 'exact' + head: true returns only the count, no row data.
      const { count, error: countError } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      if (countError) throw new Error(countError.message);

      // WHY: Implemented strict SSOT pattern. UI state only updates via fetchData() post-mutation to prevent React duplicate key explosions.
      if ((count ?? 0) >= 3) {
        setCategoryModalError("Limit Reached");
        return;
      }

      const nextSortOrder = (count ?? 0) + 1;
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: trimmedName, sort_order: nextSortOrder })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // WHY: A concurrent session beat us between the local check and the insert.
          // Close the modal and re-fetch — if the category exists in DB but is invisible
          // in local state, fetchData() will surface it so the admin sees it immediately.
          setIsAddingCategory(false);
          setNewCategoryName("");
          setCategoryModalError(null);
          setFeedback({ type: "error", msg: "Category already exists." });
          await fetchData();
          return;
        }
        throw new Error(error.message);
      }

      // WHY: Persist category_order to site_config before closing the modal so the
      // new order is durable in DB before the UI re-renders. setCategoryOrder is
      // intentionally deferred until after fetchData() — strict SSOT means no data
      // state updates before the DB round-trip confirms the insert.
      // WHY: Implemented Set() deduplication to auto-heal polluted categoryOrder arrays and resolve React duplicate key mapping errors.
      const updatedOrder = [...new Set([...categoryOrder, trimmedName])];
      // #region agent log
      sendDebugLog({
        runId: debugRunIdRef.current,
        hypothesisId: "H2_local_append_reintroduces_duplicates",
        location: "app/admin/services/page.tsx:handleSubmitCategory-updatedOrder",
        message: "Computed updatedOrder before site_config upsert",
        data: {
          categoryOrder,
          trimmedName,
          updatedOrder,
          uniqueCount: new Set(updatedOrder).size,
          totalCount: updatedOrder.length,
        },
      });
      // #endregion
      await supabase.from("site_config").upsert({
        key: "category_order",
        value: JSON.stringify(updatedOrder),
        updated_at: new Date().toISOString(),
      });

      setIsAddingCategory(false);
      setNewCategoryName("");
      setCategoryModalError(null);
      await fetchData();
      await fetchConfig();
      // #region agent log
      sendDebugLog({
        runId: debugRunIdRef.current,
        hypothesisId: "H3_fetch_then_local_set_conflict",
        location: "app/admin/services/page.tsx:handleSubmitCategory-after-fetchData",
        message: "Set categoryOrder after fetchData call",
        data: {
          updatedOrderAfterInsert: updatedOrder,
          postFetchConfigCategoryOrderApplied: true,
        },
      });
      // #endregion
      setFeedback({ type: "success", msg: `Category "${trimmedName}" created.` });
    } catch (err) {
      console.error("[categories:handleSubmitCategory]", err);
      const message = err instanceof Error ? err.message : "Failed to create category.";
      setCategoryModalError(message);
    } finally {
      setIsSavingCategory(false);
      categorySubmitRef.current = false;
    }
  }

  // ── Drag end: reorder services within a category ──
  async function handleServiceDragEnd(event: DragEndEvent, cat: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const catServices = servicesInCategory(cat);
    const oldIndex = catServices.findIndex((s) => s.id === active.id);
    const newIndex = catServices.findIndex((s) => s.id === over.id);
    const reorderedCat = arrayMove(catServices, oldIndex, newIndex);

    const newServices = [
      ...services.filter((s) => s.category !== cat),
      ...reorderedCat,
    ].map((s, i) => ({ ...s, sort_order: i + 1 }));

    setServices(newServices);

    const updates = newServices.map((s) =>
      supabase.from("services").update({ sort_order: s.sort_order }).eq("id", s.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      setFeedback({ type: "error", msg: "Failed to sync order to database." });
      // WHY: fetchData re-fetches both tables so the UI doesn't drift if the
      // partial sort_order update left services and categories out of sync.
      fetchData();
    }
  }

  // ── Drag end: reorder categories ──
  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dedupedOrderedCategories.indexOf(active.id as string);
    const newIndex = dedupedOrderedCategories.indexOf(over.id as string);
    const reordered = arrayMove(dedupedOrderedCategories, oldIndex, newIndex);
    setCategoryOrder(reordered);

    await supabase.from("site_config").upsert({
      key: "category_order",
      value: JSON.stringify(reordered),
      updated_at: new Date().toISOString(),
    });
  }

  // ── Editable field ──
  function EditableField({
    serviceId,
    field,
    value,
    className,
  }: {
    serviceId: number;
    field: EditingField["field"];
    value: string | number;
    className?: string;
  }) {
    const isActive = editing?.id === serviceId && editing?.field === field;
    if (isActive) {
      const isPriceField = field === "price";
      return (
        // WHY: Universal centering ensures accessibility on long pages. Explicit save buttons and currency symbols provide professional UI feedback.
        <div className="flex w-full items-center gap-2">
          <div className="relative w-full">
            {isPriceField && (
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-brand-accent">
                $
              </span>
            )}
            <input
              autoFocus
              value={editValue}
              onChange={(e) => {
                if (isPriceField) {
                  // WHY: Z-index escalation prevents hidden error states. Price masking sanitizes DB inputs. Explicit upload buttons enable high-fidelity hero media.
                  const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                  setEditValue(numericValue);
                  return;
                }
                setEditValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
              }}
              className={`bg-white/10 border border-brand-accent rounded px-2 py-1 text-white focus:outline-none w-full ${isPriceField ? "pl-6" : ""} ${className}`}
            />
          </div>
          <button
            onClick={commitEdit}
            onTouchEnd={(e) => {
              e.preventDefault();
              commitEdit();
            }}
            className="rounded-md border border-green-400/40 bg-green-500/20 px-2 py-1 min-h-[44px] min-w-[44px] text-xs font-semibold text-green-200 touch-manipulation transition hover:bg-green-500/30"
            aria-label="Save field"
            title="Save"
          >
            ✓
          </button>
        </div>
      );
    }
    const displayValue =
      field === "price" ? formatPriceDisplay(value) : value || <span className="text-white/30 italic">tap to edit</span>;
    return (
      <span
        onClick={() => startEdit(serviceId, field, value)}
        onTouchEnd={(e) => {
          e.preventDefault();
          startEdit(serviceId, field, value);
        }}
        className={`cursor-pointer hover:text-brand-accent transition touch-manipulation ${className}`}
        title="Tap to edit"
      >
        {displayValue}
      </span>
    );
  }

  // ── Service card ──
  function ServiceCard({
    service,
    dragListeners,
    isDragging,
  }: {
    service: DbService;
    dragListeners: DndListeners;
    isDragging: boolean;
  }) {
    return (
      <div
        className={`rounded-xl border bg-white/5 p-4 transition-all select-none ${
          isDragging ? "opacity-40" : "hover:scale-[1.02]"
        } ${service.is_active !== false ? "border-white/10" : "border-white/5 opacity-60"}`}
      >
        {/* Drag handle — touch-action:none prevents iOS scroll from stealing the gesture */}
        <div className="mb-3 flex items-center gap-2 text-xs select-none">
          <span
            {...dragListeners}
            style={{ touchAction: "none" }}
            className="rounded-md border border-cyan-400/40 bg-cyan-500/10 p-2 text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:text-cyan-200 cursor-grab active:cursor-grabbing touch-manipulation"
          >
            ⠿
          </span>
          <span className="text-cyan-300/80">drag to reorder</span>
        </div>

        {/* Name */}
        <div className="mb-1 flex items-center gap-2 text-white font-semibold text-base">
          <span className="text-amber-300 transition-colors hover:text-amber-200">✎</span>
          <EditableField serviceId={service.id} field="name" value={service.name} />
        </div>

        {/* Price */}
        <div className="mb-2 flex items-center gap-2 text-brand-accent font-bold text-sm">
          <span className="text-amber-300 transition-colors hover:text-amber-200">✎</span>
          <EditableField serviceId={service.id} field="price" value={service.price} />
        </div>

        {/* Description */}
        <div className="text-white/50 text-xs mb-3">
          <EditableField
            serviceId={service.id}
            field="description"
            value={service.description ?? ""}
          />
        </div>

        {/* Media Upload + live preview */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-white/70 text-xs uppercase tracking-widest">Media Upload</span>
            <label
              className={`cursor-pointer ${uploadingServiceId === service.id ? "pointer-events-none" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center rounded-lg border border-brand-accent/40 px-3 py-2 text-xs font-semibold min-h-[44px] transition ${
                  uploadingServiceId === service.id
                    ? "bg-brand-accent/10 text-brand-accent/60"
                    : "bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25"
                }`}
              >
                {uploadingServiceId === service.id ? "Uploading..." : "Upload Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploadingServiceId === service.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  handleMediaUpload(service, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {featuredIds.has(service.id) ? (
            <button
              onClick={() => handleToggleCinematicMode(service)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleToggleCinematicMode(service);
              }}
              className={`mb-2 w-full rounded-lg px-3 py-2 text-xs font-semibold min-h-[44px] touch-manipulation transition ${
                service.image === LELE_GIF_URL
                  ? "bg-purple-500/25 text-purple-200 border border-purple-400/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              {service.image === LELE_GIF_URL
                ? "Cinematic Mode (GIF): On"
                : "Cinematic Mode (GIF): Off"}
            </button>
          ) : (
            <div className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-h-[44px] text-xs text-white/40 flex items-center">
              Cinematic Mode locked (only featured slots).
            </div>
          )}

          {service.image ? (
            <img
              src={service.image}
              alt={`${service.name} preview`}
              className="h-20 w-full rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="h-20 w-full rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-white/30 text-xs uppercase tracking-widest">
              No Image
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="w-full rounded-lg py-2 px-3 text-xs font-semibold min-h-[44px] flex items-center bg-white/5 border border-white/10 text-white/50">
            Featured state managed in top slots.
          </div>
          <button
            onClick={() => handleToggle(service)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleToggle(service);
            }}
            className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 hover:bg-white/20 text-white transition"
          >
            {service.is_active !== false ? "👁 Hide Service" : "✅ Show Service"}
          </button>

          <button
            onClick={() => handleOpenDeleteServiceModal(service)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleOpenDeleteServiceModal(service);
            }}
            className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 hover:bg-red-500/40 text-white/60 hover:text-white transition"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8">
      {isAddingCategory && (
        <CategoryModal
          value={newCategoryName}
          onChange={setNewCategoryName}
          onSubmit={handleSubmitCategoryModal}
          onCancel={handleCancelCategoryModal}
          error={categoryModalError}
          isSaving={isSavingCategory}
          title={categoryModalMode === "rename" ? "Rename Category" : "New Category"}
          description={
            categoryModalMode === "rename"
              ? "Update the category name. Services in this category will be renamed together."
              : "Creates a new group in the Services Manager. You can rename it after."
          }
          submitLabel={categoryModalMode === "rename" ? "Save Rename" : "Create Category"}
        />
      )}
      {purgeServicesTarget && (
        <PurgeServicesModal
          categoryName={purgeServicesTarget}
          onConfirm={() => handlePurgeServices(purgeServicesTarget)}
          onCancel={() => setPurgeServicesTarget(null)}
          isPurging={isPurgingServices}
        />
      )}
      {serviceDeleteTarget && (
        <DeleteServiceDangerModal
          serviceName={serviceDeleteTarget.name}
          onConfirm={handleDeleteService}
          onCancel={() => setServiceDeleteTarget(null)}
          isDeleting={isDeletingService}
        />
      )}
      {actionRequiredMessage && (
        <ActionRequiredModal
          message={actionRequiredMessage}
          onClose={() => setActionRequiredMessage(null)}
        />
      )}
      {editingFeaturedSlotIndex !== null && (
        <FeaturedSlotModal
          slotNumber={editingFeaturedSlotIndex + 1}
          selectedServiceId={modalSelectedServiceId}
          selectedMediaUrl={modalSelectedMediaUrl}
          services={services}
          featuredPairings={featuredPairings}
          mediaLibrary={mediaLibrary}
          isSaving={isSavingFeaturedAssignment}
          isUploadingMedia={isUploadingFeaturedModalMedia}
          onSelectService={setModalSelectedServiceId}
          onSelectMedia={setModalSelectedMediaUrl}
          onUploadMedia={handleFeaturedMediaUpload}
          onSave={handleSaveFeaturedSlotAssignment}
          onCancel={handleCloseFeaturedSlotModal}
        />
      )}
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-1">Admin</p>
            <h1 className="text-3xl font-bold text-white">Services Manager</h1>
          </div>
          <a href="/admin/dashboard" className="text-white/40 text-sm hover:text-white transition">
            ← Back to Dashboard
          </a>
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          // WHY: Viewport centering prevents lost modals on scroll. Edit/Purge buttons prep for CRU architecture (No Category Deletions).
          // WHY: Z-index escalation prevents hidden error states. Price masking sanitizes DB inputs. Explicit upload buttons enable high-fidelity hero media.
          <div className="fixed inset-0 z-[100000] flex h-screen w-screen items-center justify-center pointer-events-none px-4">
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium shadow-xl pointer-events-auto ${
                feedback.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {feedback.msg}
            </div>
          </div>
        )}

        {/* ── Cinematic Preload Library ── */}
        <div className="mb-8 rounded-xl border border-purple-300/30 bg-purple-500/10 p-5">
          <p className="text-purple-200 font-semibold mb-1">Cinematic Preload Library</p>
          <p className="text-purple-100/70 text-xs mb-4">
            Upload reusable GIF/Video media and assign it independently to featured slots.
          </p>
          <label
            className={`inline-block cursor-pointer ${
              isUploadingLibraryMedia ? "pointer-events-none" : ""
            }`}
          >
            <span
              className={`inline-flex items-center justify-center rounded-lg border border-purple-400/40 px-4 py-2 min-h-[44px] text-xs font-semibold touch-manipulation transition ${
                isUploadingLibraryMedia
                  ? "bg-purple-500/10 text-purple-200/60"
                  : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              }`}
            >
              {isUploadingLibraryMedia ? "Uploading..." : "Upload to Library"}
            </span>
            <input
              type="file"
              accept="image/gif,video/mp4"
              className="sr-only"
              disabled={isUploadingLibraryMedia}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleUploadLibraryMedia(file);
                e.currentTarget.value = "";
              }}
            />
          </label>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mediaLibrary.length > 0 ? (
              mediaLibrary.map((mediaUrl) => {
                const isVideo = /\.mp4(\?|$)/i.test(mediaUrl);
                return (
                  <div
                    key={mediaUrl}
                    className="rounded-lg border border-white/15 bg-white/5 p-3"
                  >
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        className="h-24 w-full rounded-lg border border-white/10 object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Library cinematic preview"
                        className="h-24 w-full rounded-lg border border-white/10 object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleDeleteLibraryMedia(mediaUrl)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleDeleteLibraryMedia(mediaUrl);
                      }}
                      className="mt-2 w-full rounded-lg bg-red-500/70 px-3 py-2 min-h-[44px] text-xs font-semibold text-white touch-manipulation transition hover:bg-red-500"
                    >
                      Delete from Library
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-white/40">No cinematic preloads uploaded yet.</p>
            )}
          </div>
        </div>

        {/* ── Featured Slot Manager ── */}
        <div className="mb-8 rounded-xl border border-amber-300/30 bg-amber-500/10 p-5">
          <p className="text-amber-200 font-semibold mb-1">Featured Layout (Exactly 3)</p>
          <p className="text-amber-100/70 text-xs mb-4">
            Assign exactly three featured services. Only these can use Cinematic GIF mode.
          </p>
          {/* WHY: 5MB limit allows high-fidelity MP4s. Transactional modals prevent 'half-assigned' slots. Dnd-kit integration allows homepage reordering. */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFeaturedDragEnd}>
            <SortableContext
              items={[0, 1, 2].map((index) => `featured-slot-${index}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {featuredSlots.map((slotService, slotIndex) => (
                  <SortableItem key={`featured-slot-${slotIndex}`} id={`featured-slot-${slotIndex}`}>
                    {(slotListeners, isSlotDragging) => (
                      <div
                        className={`rounded-lg border border-white/15 bg-white/5 p-3 ${
                          isSlotDragging ? "opacity-40" : ""
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs uppercase tracking-widest text-white/50">
                            Slot {slotIndex + 1}
                          </p>
                          <span
                            {...slotListeners}
                            style={{ touchAction: "none" }}
                            className="rounded-md border border-white/15 bg-white/8 px-2 py-1 text-xs text-white/60 cursor-grab active:cursor-grabbing touch-manipulation"
                          >
                            ⠿
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {slotService ? slotService.name : "Empty"}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {slotService
                            ? `Status: Slot ${slotIndex + 1}: ${slotService.name}`
                            : `Status: Slot ${slotIndex + 1}: Empty`}
                        </p>

                        {featuredPairings[slotIndex]?.mediaUrl ? (
                          /\.mp4(\?|$)/i.test(featuredPairings[slotIndex]?.mediaUrl ?? "") ? (
                            <video
                              src={featuredPairings[slotIndex]?.mediaUrl ?? ""}
                              className="mt-2 h-24 w-full rounded-lg border border-white/10 object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img
                              src={featuredPairings[slotIndex]?.mediaUrl ?? ""}
                              alt={`Slot ${slotIndex + 1} cinematic preview`}
                              className="mt-2 h-24 w-full rounded-lg border border-white/10 object-cover"
                            />
                          )
                        ) : (
                          <div className="mt-2 h-24 w-full rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/35 text-xs uppercase tracking-widest">
                            No Cinematic Media
                          </div>
                        )}

                        <button
                          onClick={() => handleOpenFeaturedSlotModal(slotIndex)}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            handleOpenFeaturedSlotModal(slotIndex);
                          }}
                          className="mt-3 w-full rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 min-h-[44px] text-xs font-semibold text-white touch-manipulation transition"
                        >
                          Assign / Edit Slot
                        </button>
                      </div>
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {featuredIds.size < 3 && (
          <div className="mb-8 rounded-lg border border-amber-300/40 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-100">
            Action Required: 3 Featured Services must be assigned to go live.
          </div>
        )}

        {/* ── Layout Preset Picker ── */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-white font-semibold mb-1">Public Services Layout</p>
          <p className="text-white/40 text-xs mb-4">
            Choose how visitors see your services page at /services
          </p>
          <div className="flex gap-3 flex-wrap">
            {([
              { key: "cards", label: "⊞ Cards", desc: "Grid with details" },
              { key: "list", label: "≡ List", desc: "Compact rows" },
              { key: "minimal", label: "— Minimal", desc: "Name + price only" },
            ] as const).map((preset) => (
              <button
                key={preset.key}
                onClick={() => saveLayout(preset.key)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  saveLayout(preset.key);
                }}
                disabled={layoutSaving}
                className={`flex-1 min-w-[100px] rounded-lg py-3 px-4 text-sm font-semibold touch-manipulation min-h-[44px] transition border ${
                  layout === preset.key
                    ? "bg-brand-accent text-black border-brand-accent"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                <div>{preset.label}</div>
                <div
                  className={`text-xs font-normal mt-0.5 ${
                    layout === preset.key ? "text-black/60" : "text-white/40"
                  }`}
                >
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Add Category button ── */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleAddCategory}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}
            className="rounded-lg bg-brand-accent px-5 py-2 text-sm font-semibold text-black touch-manipulation min-h-[44px] hover:opacity-90 transition"
          >
            + Add Category
          </button>
        </div>

        {/* ── Categories + Services ── */}
        {loading ? (
          <p className="text-white/40 text-center py-20">Loading services...</p>
        ) : (
          <>
            {dedupedOrderedCategories.length === 0 && !isFetching && (
              <p className="mb-8 rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-white/70">
                No categories found. Add your first one above.
              </p>
            )}
            {isCreating && (
              // WHY: Universal centering ensures accessibility on long pages. Explicit save buttons and currency symbols provide professional UI feedback.
              <div className="fixed inset-0 z-[90000] flex h-screen w-screen items-center justify-center bg-black/70 px-4">
                <div className="w-full max-w-4xl rounded-2xl border border-brand-accent/40 bg-[#0f1e2e] p-4 shadow-2xl">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={draftData.name}
                    onChange={(e) => setDraftData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Service Name"
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 min-h-[44px] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent"
                  />
                  {/*
                   * <select> requires an opaque bg — bg-white/10 lets the OS
                   * option list bleed through on Safari/Chrome. #0f1e2e matches
                   * the page background so the dropdown looks native and dark.
                   */}
                  <select
                    value={draftData.category}
                    onChange={(e) => setDraftData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-[#0f1e2e] px-3 py-2 min-h-[44px] text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="" disabled>Select a category</option>
                    {dedupedOrderedCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={draftData.price}
                    onChange={(e) => {
                      // WHY: Z-index escalation prevents hidden error states. Price masking sanitizes DB inputs. Explicit upload buttons enable high-fidelity hero media.
                      const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                      setDraftData((prev) => ({ ...prev, price: numericValue }));
                    }}
                    placeholder="Price"
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 min-h-[44px] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-white/70 text-xs uppercase tracking-widest">Upload Media</span>
                    <label
                      className={`cursor-pointer ${isUploadingDraftMedia ? "pointer-events-none" : ""}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center rounded-lg border border-brand-accent/40 px-3 py-2 text-xs font-semibold min-h-[44px] transition ${
                          isUploadingDraftMedia
                            ? "bg-brand-accent/10 text-brand-accent/60"
                            : "bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25"
                        }`}
                      >
                        {isUploadingDraftMedia ? "Uploading..." : "Upload Photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={isUploadingDraftMedia}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          handleDraftMediaUpload(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {draftData.image ? (
                    <img
                      src={draftData.image}
                      alt="Draft service preview"
                      className="h-24 w-full rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-24 w-full rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-white/30 text-xs uppercase tracking-widest">
                      No Media Uploaded
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleCommitService}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleCommitService();
                    }}
                    // WHY: !draftData.category keeps the button disabled while the
                    // placeholder "Select a category" option is still showing —
                    // the DB insert requires a non-empty category string.
                    disabled={isSavingDraft || !draftData.category}
                    className="rounded-lg bg-brand-accent px-4 py-2 min-h-[44px] text-sm font-semibold text-black touch-manipulation transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingDraft ? "Saving..." : "Save Service"}
                  </button>
                  <button
                    onClick={handleCancelDraft}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleCancelDraft();
                    }}
                    disabled={isSavingDraft}
                    className="rounded-lg bg-white/10 px-4 py-2 min-h-[44px] text-sm font-semibold text-white touch-manipulation transition hover:bg-white/20 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              </div>
            )}

            {/* ── Outer context: category ordering (vertical list, closestCenter) ── */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext items={dedupedOrderedCategories} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-10">
                  {dedupedOrderedCategories.map((cat) => (
                    <SortableItem key={cat} id={cat}>
                      {(catListeners, isCatDragging) => (
                        // ── Category container — relative so the grip badge can be pinned ──
                        <div
                          className={`relative rounded-2xl border transition-all pt-12 px-5 pb-5 ${
                            isCatDragging ? "opacity-40" : ""
                          } border-white/10 bg-white/3`}
                        >
                        {/*
                         * Category drag handle — pinned to top-left, visually separate
                         * from the per-service ⠿ grips below. touch-action:none is
                         * required so iOS Safari doesn't intercept the touchstart as scroll.
                         */}
                        <span
                          {...catListeners}
                          style={{ touchAction: "none" }}
                          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-white/40 hover:text-white hover:bg-white/15 cursor-grab active:cursor-grabbing select-none text-xs transition touch-manipulation"
                        >
                          ⠿ <span className="hidden sm:inline">move category</span>
                        </span>

                        {/* Category header — title + action buttons */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                          <h2 className="text-xl font-bold text-white">
                            <EditableField
                              serviceId={-1}
                              field="category"
                              value={cat}
                              className="text-xl font-bold"
                            />
                          </h2>
                          {/* WHY: Viewport centering prevents lost modals on scroll. Edit/Purge buttons prep for CRU architecture (No Category Deletions). */}
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              onClick={() => handleAddService(cat)}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                handleAddService(cat);
                              }}
                              disabled={isCreating}
                              className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white touch-manipulation min-h-[44px] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreating ? "Draft Open" : "+ Add Service"}
                            </button>
                            <button
                              onClick={() => handleOpenRenameCategory(cat)}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                handleOpenRenameCategory(cat);
                              }}
                              className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white touch-manipulation min-h-[44px] transition"
                            >
                              ✏️ Rename
                            </button>
                            <button
                              onClick={() => handleOpenPurgeServices(cat)}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                handleOpenPurgeServices(cat);
                              }}
                              className="rounded-lg bg-white/5 hover:bg-red-500/30 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white touch-manipulation min-h-[44px] transition"
                            >
                              🗑️ Purge Services
                            </button>
                          </div>
                        </div>

                        {/*
                         * Inner context: service ordering within this category.
                         * Uses rectIntersection (not closestCenter) so the two nested
                         * contexts use distinct hit-testing strategies and don't compete
                         * for the same dragged item.
                         */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={rectIntersection}
                          onDragEnd={(e) => handleServiceDragEnd(e, cat)}
                        >
                          <SortableContext
                            items={servicesInCategory(cat).map((s) => s.id)}
                            strategy={rectSortingStrategy}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {servicesInCategory(cat).map((s) => (
                                <SortableItem key={s.id} id={s.id}>
                                  {(svcListeners, isSvcDragging) => (
                                    <ServiceCard
                                      service={s}
                                      dragListeners={svcListeners}
                                      isDragging={isSvcDragging}
                                    />
                                  )}
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
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
