"use client";

// ─────────────────────────────────────────
// SECTION: Admin Services Manager
// WHAT: Full CRUD for services — edit, reorder, add, delete, toggle, layout presets.
// WHY: Lets the barber manage service listings without touching code or the database.
// PHASE 4: No changes needed — already wired to live Supabase services table.
// ─────────────────────────────────────────

import { useEffect, useState, type ReactNode } from "react";
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
import type { DbService } from "@/lib/supabase";

// ── Module-level Supabase client ──
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── Types ──
type EditingField = { id: number; field: "name" | "price" | "description" | "category" };
type Layout = "cards" | "list" | "minimal";
type DndListeners = ReturnType<typeof useSortable>["listeners"];

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

export default function AdminServicesPage() {
  const [services, setServices] = useState<DbService[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [layout, setLayout] = useState<Layout>("cards");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editing, setEditing] = useState<EditingField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [layoutSaving, setLayoutSaving] = useState(false);

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
      await Promise.all([fetchServices(), fetchConfig()]);
    }
    init();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setFeedback({ type: "error", msg: "Failed to load services." });
    } else {
      setServices(data ?? []);
    }
    setLoading(false);
  }

  async function fetchConfig() {
    const [layoutRes, orderRes] = await Promise.all([
      supabase.from("site_config").select("value").eq("key", "services_layout").single(),
      supabase.from("site_config").select("value").eq("key", "category_order").single(),
    ]);
    if (layoutRes.data?.value) setLayout(layoutRes.data.value as Layout);
    if (orderRes.data?.value) {
      try {
        setCategoryOrder(JSON.parse(orderRes.data.value));
      } catch {}
    }
  }

  // ── Derive ordered categories ──
  const allCategories = [...new Set(services.map((s) => s.category))];
  const orderedCategories = [
    ...categoryOrder.filter((c) => allCategories.includes(c)),
    ...allCategories.filter((c) => !categoryOrder.includes(c)),
  ];

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

  async function handleDelete(id: number) {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to delete service." });
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: "success", msg: "Service deleted." });
    }
    setConfirmDelete(null);
  }

  async function handleDeleteCategory(cat: string) {
    const ids = servicesInCategory(cat).map((s) => s.id);
    const { error } = await supabase.from("services").delete().in("id", ids);
    if (error) {
      setFeedback({ type: "error", msg: "Failed to delete category." });
    } else {
      setServices((prev) => prev.filter((s) => s.category !== cat));
      setCategoryOrder((prev) => prev.filter((c) => c !== cat));
      await supabase.from("site_config").upsert({
        key: "category_order",
        value: JSON.stringify(categoryOrder.filter((c) => c !== cat)),
        updated_at: new Date().toISOString(),
      });
      setFeedback({ type: "success", msg: `Category "${cat}" deleted.` });
    }
    setConfirmDeleteCat(null);
  }

  async function handleAddService(cat: string) {
    const maxOrder =
      services.length > 0 ? Math.max(...services.map((s) => s.sort_order ?? 0)) : 0;
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: "New Service",
        category: cat,
        price: "$0",
        description: "",
        image: null,
        is_active: true,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (error) {
      setFeedback({ type: "error", msg: "Failed to add service." });
    } else {
      setServices((prev) => [...prev, data]);
      setFeedback({ type: "success", msg: "New service added — tap to edit." });
    }
  }

  async function handleAddCategory() {
    const newCat = "New Category";
    const maxOrder =
      services.length > 0 ? Math.max(...services.map((s) => s.sort_order ?? 0)) : 0;
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: "New Service",
        category: newCat,
        price: "$0",
        description: "",
        image: null,
        is_active: true,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (error) {
      setFeedback({ type: "error", msg: "Failed to add category." });
    } else {
      setServices((prev) => [...prev, data]);
      setCategoryOrder((prev) => [...prev, newCat]);
      await supabase.from("site_config").upsert({
        key: "category_order",
        value: JSON.stringify([...categoryOrder, newCat]),
        updated_at: new Date().toISOString(),
      });
      setFeedback({ type: "success", msg: "New category added — tap the name to rename it." });
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
      fetchServices();
    }
  }

  // ── Drag end: reorder categories ──
  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCategories.indexOf(active.id as string);
    const newIndex = orderedCategories.indexOf(over.id as string);
    const reordered = arrayMove(orderedCategories, oldIndex, newIndex);
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
      return (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
          }}
          className={`bg-white/10 border border-brand-accent rounded px-2 py-1 text-white focus:outline-none w-full ${className}`}
        />
      );
    }
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
        {value || <span className="text-white/30 italic">tap to edit</span>}
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
        } ${service.is_active ? "border-white/10" : "border-white/5 opacity-60"}`}
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

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => handleToggle(service)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleToggle(service);
            }}
            className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 hover:bg-white/20 text-white transition"
          >
            {service.is_active ? "👁 Hide Service" : "✅ Show Service"}
          </button>

          {confirmDelete === service.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(service.id)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDelete(service.id);
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
                className="flex-1 rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 text-white transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(service.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setConfirmDelete(service.id);
              }}
              className="w-full rounded-lg py-2 text-xs font-semibold touch-manipulation min-h-[44px] bg-white/10 hover:bg-red-500/40 text-white/60 hover:text-white transition"
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8">
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
          // ── Outer context: category ordering (vertical list, closestCenter) ──
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext items={orderedCategories} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-10">
                {orderedCategories.map((cat) => (
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
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleAddService(cat)}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                handleAddService(cat);
                              }}
                              className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white touch-manipulation min-h-[44px] transition"
                            >
                              + Add Service
                            </button>
                            {confirmDeleteCat === cat ? (
                              <>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  onTouchEnd={(e) => {
                                    e.preventDefault();
                                    handleDeleteCategory(cat);
                                  }}
                                  className="rounded-lg bg-red-500/80 px-4 py-2 text-xs font-semibold text-white touch-manipulation min-h-[44px] transition"
                                >
                                  Delete All
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteCat(null)}
                                  className="rounded-lg bg-white/10 px-4 py-2 text-xs text-white touch-manipulation min-h-[44px]"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteCat(cat)}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  setConfirmDeleteCat(cat);
                                }}
                                className="rounded-lg bg-white/5 hover:bg-red-500/30 px-4 py-2 text-xs text-white/40 hover:text-white touch-manipulation min-h-[44px] transition"
                              >
                                🗑 Category
                              </button>
                            )}
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
        )}
      </div>
    </main>
  );
}
