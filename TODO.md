# Fades & Facials 2.0 - Active Backlog & Bug Tracker

## 🐛 High Priority Bugs (Next Session)
- [ ] **Fix Draft Card Image Upload State:** - *Issue:* Selecting an image doesn't update the UI preview in the "Add Service" draft card.
  - *Fix:* Ensure `uploadServiceMedia` response is bound to `setDraftData(prev => ({ ...prev, image: url }))`. Add verbose toast error handling.
- [ ] **Category Combobox Implementation:** - *Issue:* Category input is a blind text field.
  - *Fix:* Fetch distinct categories from Supabase on mount. Implement a UI that allows selecting an existing category from a dropdown OR typing a new one.

## 🏗️ Technical Debt & Architecture
- [ ] **Enforce Admin Route Comments:** - *Issue:* `/admin/services` is lacking JSDoc and inline logic comments.
  - *Fix:* Run a documentation audit via Cursor Composer specifically on the admin routes.
- [ ] **Update `.cursorrules`:** - *Fix:* Add explicit instructions that all new frontend logic must include JSDoc, Error Boundaries, and `try/catch` documentation.

## 🎨 UI/UX Polish (Pending)
- [ ] Execute the "Moody Luxury" color overhaul (Bone/Antique White backgrounds).
- [ ] Change "Book Now" button color to muted Olive/Slate.
- [ ] Ensure Google Maps iframe uses a lighter/softer blue dark-mode filter.