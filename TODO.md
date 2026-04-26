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

## 🏛️ Path to SS+ (Architecture & Refactoring)
- [ ] **Implement a Global Service Layer (API Abstraction):** - *Issue:* UI components are tightly coupled to Supabase, making the app fragile, hard to test, and a nightmare to update if the database schema changes.
  - *Fix:* Create a `services/` directory. Move ALL direct `supabase.from()` calls out of React components and into dedicated asynchronous functions (e.g., `getServices()`, `updateDraftCard()`). Components should only call these service functions and handle the returned data.
- [ ] **Audit & Harden Supabase RLS Policies:** - *Issue:* Current RLS policies might be overly permissive or misunderstood, risking cross-user data leaks if an API endpoint is hit directly.
  - *Fix:* Review every table's RLS policy. Explicitly define what authenticated vs anon users can do. Write out the exact security boundaries in a `.md` file to prove the logic holds up.
- [ ] **Overhaul Global Error Handling:** - *Issue:* `try/catch` blocks are likely just logging to the console, leaving the user with a frozen UI if a database call fails.
  - *Fix:* Standardize an error response format from the Service Layer. Implement toast notifications for user-facing errors (e.g., "Failed to save draft. Please check your connection.") and ensure the UI gracefully degrades.
- [ ] **Sanitize and Re-Baseline _blueprints:** - *Issue:* The blueprints library might be encoding early-stage bad habits (like missing error states, inline data fetching, or hardcoded Tailwind spacing).
  - *Fix:* Do not add any more blueprints until you refactor the existing ones to use the new Service Layer and standardized error handling. Ensure all Tailwind uses consistent tokens, not arbitrary values.