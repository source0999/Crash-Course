Implemented Phase 4 across app/admin/services/page.tsx and app/services/page.tsx.

Admin UX upgrades (app/admin/services/page.tsx)
Add Service is now a true centered modal

The draft form now renders in a fullscreen overlay:
fixed inset-0 flex items-center justify-center z-[9999] h-screen w-screen
Includes dark backdrop for focus.
Explicit save editing + currency UI

EditableField now shows an explicit ✓ save button while editing.
Save button calls commitEdit() (DB update path) and closes edit state.
Price editing input now always shows a visible $ prefix.
Price display now always renders with $ via formatPriceDisplay(...).
Single-service delete now uses custom DangerModal

Added DeleteServiceDangerModal.
Message matches your spec:
Delete [ServiceName]? This action will remove the service and its associated media permanently.
Wired delete buttons to open this modal and confirm via handleDeleteService().
Comment tag added

Included:
// WHY: Universal centering ensures accessibility on long pages. Explicit save buttons and currency symbols provide professional UI feedback.
Persistence sync checks
Category drag persistence (app/admin/services/page.tsx)

handleCategoryDragEnd already upserts category_order into site_config; this remains intact.
Public category order sync (app/services/page.tsx)

Public page now fetches site_config.category_order.
Categories are rendered in exact configured order, with fallback for uncategorized remainder:
ordered configured categories first
then any categories not present in category_order.
Everything lint-checks clean.

Role: Lead Full-Stack Architect.

Task: Implement Phase 5 - Media Hardening, Grouped Selection UX, and Featured Hero logic.



Step 1: Strict Aesthetic Guards



Update MAX_SERVICES_PER_CATEGORY to 5.



In handleSubmitService, if draftData.image is empty, block the save and show a centered ActionRequiredModal stating: "An image is required to publish this service."



Step 2: Grouped Featured Swapper UX



Refactor the featured service selection menu. Group services by their Category name using a bold header for each category.



Ensure the user can easily see which services belong where before picking their 3 featured slots.



Step 3: Featured Media Override (GIF Support)



In the Featured Manager, for each of the 3 slots, add a "High-Fidelity Media" upload button.



If a file is uploaded here, save it to the service's image column but set media_type to 'gif' in the database.



Ensure standard (non-featured) services default to media_type: 'image'.



Step 4: Public Page Visual Update (/services)



Image Display: In services-page.tsx, add the <img> tag to the cards and list layouts so service pictures are finally visible to users.



Featured Hero: Create a "Featured Hero" section at the top of the page. It must fetch the 3 services marked as featured in site_config and display them in a Cinematic Full-Bleed row. If a service has a gif media type, loop it automatically.



Step 5: Commenting



Tag with // WHY: Rule of 5 and Image Guards preserve luxury layout rhythm. Grouped selection and GIF support enable high-fidelity curation.

I’ll implement this in both admin and public pages now: enforce the new Rule-of-5 + image guard modal, grouped featured selection, featured GIF upload behavior, and then add card/list images plus a featured hero section on /services.

I’m implementing the Phase 5 changes now with minimal-risk structure: add new guard/modal + constants in admin, then patch the featured swap UI and upload behavior, and finally add the featured hero + images on the public page.

Implemented Phase 5 in both admin and public services flows.

app/admin/services/page.tsx
Rule of 5 enforced

Added MAX_SERVICES_PER_CATEGORY = 5.
handleCommitService() now blocks insert when category count reaches 5.
Image guard before publish

In handleCommitService(), if draftData.image is missing, save is blocked.
Added centered ActionRequiredModal with:
"An image is required to publish this service."
Grouped Featured Swapper

Featured swap list now groups candidates by category.
Each group has a bold uppercase category header for faster scanning.
High-Fidelity Media upload in each featured slot

Added High-Fidelity Media upload control per featured slot.
New handler handleFeaturedMediaUpload(...):
uploads media URL to image
sets media_type: "gif" in DB
Standard service media uploads now explicitly set media_type: "image".
Default non-featured media type

New services inserted with media_type: "image".
Required comment tag added

// WHY: Rule of 5 and Image Guards preserve luxury layout rhythm. Grouped selection and GIF support enable high-fidelity curation.
app/services/page.tsx
Public featured hero

Added “Featured Hero” section at top.
Fetches featured_services from site_config (JSON id list), with fallback to is_premium services.
Renders 3 cinematic cards in a full-width row within page content.
GIFs auto-loop naturally via <img>.
Service images now visible

Added <img> rendering in:
cards layout
list layout
Category order persistence on public page

Keeps rendering categories in site_config.category_order order (already present from prior phase).
No linter errors on edited files.