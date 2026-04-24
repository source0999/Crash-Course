// ─────────────────────────────────────────
// SECTION: Service Data Contract
// WHAT: Defines the shared TypeScript shape for every service record.
// WHY: Keeps homepage previews and the full services page consistent with one typed model.
// PHASE 4: Replace static typing source with generated types from Supabase queries if preferred.
// ─────────────────────────────────────────
export type Service = {
  id: number;
  category: "Cuts" | "Beard Care" | "Hair Care";
  name: string;
  price: number;
  description: string;
  image: string; // path to gif or jpg in /public/images/
};

// ─────────────────────────────────────────
// SECTION: All Services Source of Truth
// WHAT: Exposes the complete service catalog used by multiple routes.
// WHY: Centralizing this list makes migration to database-backed reads straightforward.
// PHASE 4: Replace this exported array with API/database calls that return the same Service shape.
// ─────────────────────────────────────────
export const allServices: Service[] = [
  { id: 1, category: "Cuts", name: "Fade Cut", price: 42, description: "Clean, precise fades tailored to your style.", image: "/images/services/fade.gif" },
  { id: 2, category: "Cuts", name: "Specialty Fade Cut", price: 42, description: "Advanced fade techniques for a signature look.", image: "/images/services/fade.gif" },
  { id: 3, category: "Cuts", name: "Children's Fade", price: 32, description: "Kid-friendly cuts with the same precision.", image: "/images/services/fade.gif" },
  { id: 4, category: "Beard Care", name: "Beard Care", price: 35, description: "Shape and condition your beard to perfection.", image: "/images/services/facial.gif" },
  { id: 5, category: "Beard Care", name: "Fade and Shave", price: 60, description: "Full fade paired with a clean straight razor shave.", image: "/images/services/fade.gif" },
  { id: 6, category: "Beard Care", name: "Hot Shave", price: 35, description: "Classic hot towel straight razor shave.", image: "/images/lele2.gif"},
  { id: 7, category: "Hair Care", name: "Shampoo", price: 12, description: "Deep cleanse and scalp treatment.", image: "/images/services/fade.gif" },
  { id: 8, category: "Hair Care", name: "Line Up", price: 26, description: "Sharp, defined edges for a clean finish.", image: "/images/services/barbergif1.gif" },
  { id: 9, category: "Hair Care", name: "Enhancement", price: 12, description: "Color and texture enhancements.", image: "/images/services/fade.gif" },
  { id: 10, category: "Hair Care", name: "Bald Fade", price: 40, description: "Seamless fade down to skin.", image: "/images/services/fade.gif" },
];

// NOTE: This array is the single source of truth for all service data.
// When the admin dashboard and database are implemented in Phase 4,
// replace this file with API calls to fetch services from Supabase.
// The Service type above maps directly to the database schema.
