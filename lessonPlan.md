Architecture Plan — Gallery Ordering + Layout Presets
Two features, one page update + one public page update:
app/admin/gallery/page.tsx — add to existing page:

Drag to reorder — each card gets a drag handle. On drop, recalculates sort_order for all affected items and batch-updates Supabase. Uses native HTML5 drag-and-drop (no new packages — draggable, onDragStart, onDragOver, onDrop). iOS touch drag handled via onTouchStart/Move/End.
Layout preset picker — 3 buttons at top: Masonry / Grid / Fullwidth. Selecting one saves gallery_layout key to site_config table. Reads current value on load to show active preset.

app/gallery/page.tsx + app/gallery/GalleryGrid.tsx — update public side:

Page fetches gallery_layout from site_config alongside gallery items
Passes layout prop to GalleryGrid
GalleryGrid switches CSS based on layout:

masonry — current CSS columns (already built)
grid — equal aspect-square CSS grid
fullwidth — single column, wide images, cinematic



Files touched:

app/admin/gallery/page.tsx — add drag reorder + layout picker
app/gallery/GalleryGrid.tsx — add layout prop + conditional rendering
app/gallery/page.tsx — fetch gallery_layout from site_config, pass to grid

Files NOT touched: Navbar, globals.css, any auth files, services, middleware.

Here's the Cursor prompt:

We are adding two features to the gallery system: drag-to-reorder and layout presets.

## STEP 1 — Update app/admin/gallery/page.tsx

Add these two features to the existing admin gallery page. Do not remove any existing functionality (upload, delete, replace, toggle all stay).

### Feature 1: Layout Preset Picker

Add to the top of the component, after existing state declarations:
```typescript
const [layout, setLayout] = useState<'masonry' | 'grid' | 'fullwidth'>('masonry')
const [layoutSaving, setLayoutSaving] = useState(false)
```

Add a fetchLayout function and call it in the existing useEffect alongside fetchItems:
```typescript
async function fetchLayout() {
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'gallery_layout')
    .single()
  if (data?.value) setLayout(data.value as 'masonry' | 'grid' | 'fullwidth')
}
```

Add a saveLayout function:
```typescript
async function saveLayout(newLayout: 'masonry' | 'grid' | 'fullwidth') {
  setLayoutSaving(true)
  setLayout(newLayout)
  await supabase
    .from('site_config')
    .upsert({ key: 'gallery_layout', value: newLayout, updated_at: new Date().toISOString() })
  setLayoutSaving(false)
  setFeedback({ type: 'success', msg: `Layout set to ${newLayout}` })
}
```

Add this layout picker UI block between the header and the upload zone:
```tsx
{/* ── Layout Preset Picker ── */}
<div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
  <p className="text-white font-semibold mb-1">Gallery Layout</p>
  <p className="text-white/40 text-xs mb-4">Choose how your gallery looks to visitors</p>
  <div className="flex gap-3 flex-wrap">
    {([
      { key: 'masonry', label: '⬡ Masonry', desc: 'Pinterest style' },
      { key: 'grid', label: '⊞ Grid', desc: 'Equal squares' },
      { key: 'fullwidth', label: '▬ Fullwidth', desc: 'Cinematic rows' },
    ] as const).map((preset) => (
      <button
        key={preset.key}
        onClick={() => saveLayout(preset.key)}
        onTouchEnd={(e) => { e.preventDefault(); saveLayout(preset.key) }}
        disabled={layoutSaving}
        className={`flex-1 min-w-[100px] rounded-lg py-3 px-4 text-sm font-semibold touch-manipulation min-h-[44px] transition border ${
          layout === preset.key
            ? 'bg-brand-accent text-black border-brand-accent'
            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
        }`}
      >
        <div>{preset.label}</div>
        <div className={`text-xs font-normal mt-0.5 ${layout === preset.key ? 'text-black/60' : 'text-white/40'}`}>
          {preset.desc}
        </div>
      </button>
    ))}
  </div>
</div>
```

### Feature 2: Drag to Reorder

Add to state declarations:
```typescript
const [draggedId, setDraggedId] = useState<number | null>(null)
const [dragOverId, setDragOverId] = useState<number | null>(null)
```

Add these drag handler functions:
```typescript
function handleDragStart(id: number) {
  setDraggedId(id)
}

function handleDragOver(e: React.DragEvent, id: number) {
  e.preventDefault()
  setDragOverId(id)
}

async function handleDrop(targetId: number) {
  if (draggedId === null || draggedId === targetId) {
    setDraggedId(null)
    setDragOverId(null)
    return
  }

  const oldIndex = items.findIndex(i => i.id === draggedId)
  const newIndex = items.findIndex(i => i.id === targetId)
  const reordered = [...items]
  const [moved] = reordered.splice(oldIndex, 1)
  reordered.splice(newIndex, 0, moved)

  // Optimistic update
  const withNewOrder = reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 }))
  setItems(withNewOrder)
  setDraggedId(null)
  setDragOverId(null)

  // Persist to Supabase
  const updates = withNewOrder.map(item =>
    supabase.from('gallery').update({ sort_order: item.sort_order }).eq('id', item.id)
  )
  const results = await Promise.all(updates)
  const anyError = results.find(r => r.error)
  if (anyError) {
    setFeedback({ type: 'error', msg: 'Failed to save order. Try again.' })
    fetchItems()
  }
}

function handleDragEnd() {
  setDraggedId(null)
  setDragOverId(null)
}
```

Update the grid container div to show a drag-hint label:
Find the existing grid div that starts with:
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
````
Add above it:
```tsx
<p className="text-white/30 text-xs mb-3 text-center tracking-wider">DRAG CARDS TO REORDER</p>
```
Update each item card div (the one with key={item.id}) to add drag props:
tsx<div
  key={item.id}
  draggable
  onDragStart={() => handleDragStart(item.id)}
  onDragOver={(e) => handleDragOver(e, item.id)}
  onDrop={() => handleDrop(item.id)}
  onDragEnd={handleDragEnd}
  className={`relative rounded-xl overflow-hidden border transition-all ${
    draggedId === item.id ? 'opacity-40 scale-95' : ''
  } ${
    dragOverId === item.id && draggedId !== item.id ? 'border-brand-accent' : 
    item.is_active ? 'border-white/10' : 'border-white/5 opacity-50'
  } bg-white/5 cursor-grab active:cursor-grabbing`}
>

STEP 2 — Update app/gallery/GalleryGrid.tsx
Add layout prop support. Replace the existing Props type and component signature:
typescripttype Props = {
  items: DbGalleryItem[]
  layout?: 'masonry' | 'grid' | 'fullwidth'
}

export default function GalleryGrid({ items, layout = 'masonry' }: Props) {
Replace the existing return statement's outer div with a layout-conditional wrapper:
tsxif (items.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
      <p className="text-2xl font-light text-white/40 tracking-widest uppercase">Coming Soon</p>
      <p className="mt-3 text-sm text-white/25 tracking-wider">The portfolio is being built. Check back soon.</p>
    </div>
  )
}

// Masonry layout
if (layout === 'masonry') {
  return (
    <div
      style={{ columns: 'var(--gallery-cols)', columnGap: '12px' }}
      className="[--gallery-cols:2] md:[--gallery-cols:3] lg:[--gallery-cols:4]"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className="mb-3 break-inside-avoid overflow-hidden rounded-lg"
          style={{
            animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${index * 80}ms`,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          {item.file_type === 'video' ? (
            <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-auto block object-cover" />
          ) : (
            <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-auto block object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  )
}

// Grid layout
if (layout === 'grid') {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="aspect-square overflow-hidden rounded-lg bg-black"
          style={{
            animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${index * 80}ms`,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          {item.file_type === 'video' ? (
            <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  )
}

// Fullwidth layout
return (
  <div className="flex flex-col gap-4">
    {items.map((item, index) => (
      <div
        key={item.id}
        className="w-full overflow-hidden rounded-xl"
        style={{
          animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
          animationDelay: `${index * 80}ms`,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        {item.file_type === 'video' ? (
          <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-auto block max-h-[80vh] object-cover" />
        ) : (
          <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-auto block max-h-[80vh] object-cover" loading="lazy" />
        )}
      </div>
    ))}
  </div>
)

STEP 3 — Update app/gallery/page.tsx
Fetch gallery_layout from site_config alongside gallery items, pass to GalleryGrid.
Replace the entire file:
typescript// ─────────────────────────────────────────
// SECTION: Gallery Page
// WHAT: Async Server Component — fetches gallery items and layout preference from Supabase.
// WHY: Server-side fetch keeps credentials off the client and enables ISR caching.
// PHASE 4: No changes needed — already live Supabase data.
// ─────────────────────────────────────────

import { supabase, type DbGalleryItem } from '@/lib/supabase'
import GalleryGrid from './GalleryGrid'

export const revalidate = 60

export default async function GalleryPage() {
  let items: DbGalleryItem[] = []
  let layout: 'masonry' | 'grid' | 'fullwidth' = 'masonry'

  try {
    const [galleryResult, configResult] = await Promise.all([
      supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('site_config')
        .select('value')
        .eq('key', 'gallery_layout')
        .single()
    ])

    if (galleryResult.error) throw galleryResult.error
    items = galleryResult.data ?? []

    if (configResult.data?.value) {
      layout = configResult.data.value as 'masonry' | 'grid' | 'fullwidth'
    }
  } catch (err) {
    console.error('[Gallery] Fetch failed:', err)
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8 lg:px-12">
      <div className="mb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-3">Fades & Facials</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">The Work</h1>
      </div>
      <GalleryGrid items={items} layout={layout} />
    </main>
  )
}

VERIFICATION CHECKLIST

 Layout picker shows 3 buttons, active one is gold
 Selecting a layout saves to site_config and shows feedback banner
 Gallery cards are draggable, dragged card goes semi-transparent
 Drop target card gets gold border highlight
 After drop, order updates optimistically then persists to Supabase
 Public /gallery page receives layout prop and renders correct layout
 npx tsc --noEmit passes

Do not touch: Navbar, globals.css, middleware, auth files, services page, lib/supabase.ts.
Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
Mobile-first. No external CSS files. All styling via Tailwind classes.
You said: -i can pick betwen masnory, grid and fullwidth the style on hte uer side doesnt actually change tho-i can pick betwen masnory, grid and fullwidth the style on hte uer side doesnt actually change tho
-not sure how to check if it giets saved to ite setting on refresh i will se it on the default setting adn flash back into the one i cbhosse from previous sessioncant drag gallery cards8cards do not get bgger on hovering
cursor output:
Implemented both features in app/admin/gallery/page.tsx while keeping all existing CRUD behavior intact.
AddedLayout presets
 New state:
 layoutlayoutSavingNew functions:
 fetchLayout() reads site_config key gallery_layoutsaveLayout() upserts site_config and shows success feedbackCalled fetchLayout() alongside fetchItems() in the existing useEffect.Added the Layout Preset Picker UI block between header/feedback and upload zone.Drag-to-reorder
 New state:
 draggedIddragOverIdNew handlers:
 handleDragStarthandleDragOverhandleDrop (optimistic reorder + persist sort_order updates)handleDragEndEach gallery card is now draggable and wired to drag/drop handlers.Added a visible drag-hint label above the grid.Added drag-over highlight (ring-brand-accent) for better UX.
ValidationRan npx tsc --noEmit ✅ passes.
If you want, I can also wire the public /gallery page to read site_config.gallery_layout next so these presets immediately affect visitor layout.
-------------Show more11:08 AMClaude responded: Good progress — layout picker UI works, cards show.Good progress — layout picker UI works, cards show. Three bugs to fix:

Public gallery not reading site_config — Cursor didn't update GalleryGrid.tsx or gallery/page.tsx even though the prompt asked for it
Drag not working — likely a CSS conflict, overflow-hidden on the card wrapper blocks drag events on some browsers
Layout flashes on load — need to read from site_config before first render

All three fixed in one prompt:

Fix three bugs in the gallery system. Touch only the files specified.

## BUG 1 — Public gallery page not reflecting layout choice
The app/gallery/page.tsx and app/gallery/GalleryGrid.tsx were not updated. Fix both now.

Replace entire app/gallery/page.tsx:
```typescript
// ─────────────────────────────────────────
// SECTION: Gallery Page
// WHAT: Fetches gallery items AND layout preference from Supabase, passes both to GalleryGrid.
// WHY: Layout is barber-controlled via admin — public page must respect that choice.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { supabase, type DbGalleryItem } from '@/lib/supabase'
import GalleryGrid from './GalleryGrid'

export const revalidate = 30

export default async function GalleryPage() {
  let items: DbGalleryItem[] = []
  let layout: 'masonry' | 'grid' | 'fullwidth' = 'masonry'

  try {
    const [galleryResult, configResult] = await Promise.all([
      supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('site_config')
        .select('value')
        .eq('key', 'gallery_layout')
        .single()
    ])
    if (!galleryResult.error) items = galleryResult.data ?? []
    if (!configResult.error && configResult.data?.value) {
      layout = configResult.data.value as 'masonry' | 'grid' | 'fullwidth'
    }
  } catch (err) {
    console.error('[Gallery] Fetch failed:', err)
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8 lg:px-12">
      <div className="mb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-3">Fades & Facials</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">The Work</h1>
      </div>
      <GalleryGrid items={items} layout={layout} />
    </main>
  )
}
```

Replace entire app/gallery/GalleryGrid.tsx:
```typescript
'use client'

// ─────────────────────────────────────────
// SECTION: GalleryGrid
// WHAT: Renders gallery media in masonry, grid, or fullwidth layout with stagger animation.
// WHY: Layout is chosen by the barber in admin and passed from the server page.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { DbGalleryItem } from '@/lib/supabase'

type Props = {
  items: DbGalleryItem[]
  layout?: 'masonry' | 'grid' | 'fullwidth'
}

function MediaItem({ item, index }: { item: DbGalleryItem; index: number }) {
  const style = {
    animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
    animationDelay: `${index * 80}ms`,
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
  }
  const media = item.file_type === 'video'
    ? <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
    : <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-full object-cover" loading="lazy" />
  return { style, media }
}

export default function GalleryGrid({ items, layout = 'masonry' }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="text-2xl font-light text-white/40 tracking-widest uppercase">Coming Soon</p>
        <p className="mt-3 text-sm text-white/25 tracking-wider">The portfolio is being built. Check back soon.</p>
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="aspect-square overflow-hidden rounded-lg bg-black"
            style={{
              animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
              animationDelay: `${index * 80}ms`,
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {item.file_type === 'video'
              ? <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              : <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-full object-cover" loading="lazy" />
            }
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'fullwidth') {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full overflow-hidden rounded-xl"
            style={{
              animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
              animationDelay: `${index * 80}ms`,
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {item.file_type === 'video'
              ? <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-auto block" style={{ maxHeight: '80vh' }} />
              : <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-auto block" style={{ maxHeight: '80vh', objectFit: 'cover' }} loading="lazy" />
            }
          </div>
        ))}
      </div>
    )
  }

  // Default: masonry
  return (
    <div
      style={{ columns: 'var(--gallery-cols)', columnGap: '12px' }}
      className="[--gallery-cols:2] md:[--gallery-cols:3] lg:[--gallery-cols:4]"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className="mb-3 break-inside-avoid overflow-hidden rounded-lg"
          style={{
            animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${index * 80}ms`,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          {item.file_type === 'video'
            ? <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-auto block" />
            : <img src={item.file_url} alt={item.title ?? 'Gallery image'} className="w-full h-auto block" loading="lazy" />
          }
        </div>
      ))}
    </div>
  )
}
```

## BUG 2 — Drag not working on cards
In app/admin/gallery/page.tsx, find the grid item card div. The issue is overflow-hidden on the outer card clips drag ghost image and some browsers block drag on elements inside overflow-hidden containers.

Find this className on the card wrapper div:
className={`relative rounded-xl overflow-hidden border transition-all ${
Change overflow-hidden to overflow-visible and add a separate inner div for the media that has overflow-hidden:

Replace the card wrapper and media preview section with:
```tsx
<div
  key={item.id}
  draggable
  onDragStart={() => handleDragStart(item.id)}
  onDragOver={(e) => handleDragOver(e, item.id)}
  onDrop={() => handleDrop(item.id)}
  onDragEnd={handleDragEnd}
  className={`relative rounded-xl border transition-all select-none ${
    draggedId === item.id ? 'opacity-40 scale-95' : 'hover:scale-[1.02]'
  } ${
    dragOverId === item.id && draggedId !== item.id
      ? 'border-brand-accent shadow-lg shadow-brand-accent/20'
      : item.is_active ? 'border-white/10' : 'border-white/5 opacity-50'
  } bg-white/5 cursor-grab active:cursor-grabbing`}
>
  {/* Media preview — overflow-hidden scoped here only */}
  <div className="aspect-square overflow-hidden rounded-t-xl bg-black">
    {item.file_type === 'video' ? (
      <video src={item.file_url} muted loop playsInline className="w-full h-full object-cover" />
    ) : (
      <img src={item.file_url} alt={item.title ?? 'Gallery item'} className="w-full h-full object-cover" />
    )}
  </div>
```

## BUG 3 — Layout flashes to default on load before site_config loads
In app/admin/gallery/page.tsx, find the fetchLayout and fetchItems calls in useEffect. Make sure BOTH are called together and layout state is set before the loading spinner clears.

Find the useEffect that calls fetchItems and update it to:
```typescript
useEffect(() => {
  async function init() {
    await Promise.all([fetchItems(), fetchLayout()])
  }
  init()
}, [])
```

This ensures layout is loaded in parallel with items so there's no flash.

Do not touch: Navbar, globals.css, middleware, auth files, services page, lib/supabase.ts.
Run npx tsc --noEmit after.

Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
Mobile-first. No external CSS files. All styling via Tailwind classes.