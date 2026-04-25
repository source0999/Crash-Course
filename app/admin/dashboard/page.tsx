// ─────────────────────────────────────────
// SECTION: Admin Dashboard Hub
// WHAT: Protected landing page after login — shows session info and nav to admin sections.
// WHY: Central control panel for the barber to manage site content.
// PHASE 4: No changes needed — session check is live.
// ─────────────────────────────────────────
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-2">
            Admin Panel
          </p>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-white/50 text-sm">
            Signed in as <span className="text-brand-accent">{session.user.email}</span>
          </p>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/gallery"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition touch-manipulation min-h-[44px]"
          >
            <p className="text-white font-semibold text-lg">Gallery</p>
            <p className="text-white/40 text-sm mt-1">Upload and manage media</p>
          </Link>

          <Link
            href="/admin/services"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition touch-manipulation min-h-[44px]"
          >
            <p className="text-white font-semibold text-lg">Services</p>
            <p className="text-white/40 text-sm mt-1">Edit service listings</p>
          </Link>
        </div>

        {/* Logout */}
        <div className="mt-10">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
