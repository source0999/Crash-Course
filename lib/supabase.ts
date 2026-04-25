import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────
// SECTION: Supabase Client
// WHAT: Creates a single reusable Supabase client instance.
// WHY: One client shared across the app prevents multiple connections.
// PHASE 4: This client is already configured for admin auth —
//   the service role key will be added in a separate server-only client
//   when the admin dashboard is built.
// ─────────────────────────────────────────

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

// createClient throws if the URL is empty or not http(s) — use a dummy URL so
// import succeeds when env is unset (e.g. CI); queries fail and pages use fallback data.
const supabaseUrl =
  envUrl && /^https?:\/\//i.test(envUrl) ? envUrl : "https://invalid.invalid";

export const supabase = createClient(supabaseUrl, envKey);

export type DbService = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
};

// ─────────────────────────────────────────
// SECTION: Gallery Type
// WHAT: Mirrors the gallery table schema in Supabase.
// WHY: Provides type safety for all gallery data fetched from the database.
// PHASE 4: No changes needed — this IS the Phase 4 shape.
// ─────────────────────────────────────────
export type DbGalleryItem = {
  id: number;
  title: string | null;
  file_url: string;
  file_type: "image" | "video";
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};
