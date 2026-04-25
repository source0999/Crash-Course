"use client";

// ─────────────────────────────────────────
// SECTION: Logout Button
// WHAT: Client component that calls Supabase signOut and redirects to login.
// WHY: signOut must run on the client — can't call it in a Server Component.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleLogout();
      }}
      className="rounded-lg border border-white/20 px-6 py-3 text-white/60 text-sm hover:text-white hover:border-white/40 transition touch-manipulation min-h-[44px]"
    >
      Sign Out
    </button>
  );
}
